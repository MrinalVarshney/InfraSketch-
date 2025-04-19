import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Node, useReactFlow } from "@xyflow/react";
import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";
import { TrashIcon } from "@heroicons/react/solid";
import TagsBlock from "../utils/tag";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

interface FormValues {
  name: string;
  refs: {};
  tags: {};
  routes: {
    cidr_block: string;
    refs: {
      internet_gateway?: string;
    };
  }[];
}

interface GateWayProps {
  name?: string;
  type: string;
  id: string;
  rawLabel?: string;
}

export default function RouteTableFields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: selectedNode
      ? {
          ...(selectedNode.data.properties || {}),
        }
      : {},
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "routes",
  });

  const [tags, setTags] = useState({});
  const [availableGateWays, setAvailableGateWays] = useState<GateWayProps[]>(
    []
  );

  const { getNode } = useReactFlow();

  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset(selectedNode.data.properties);
      setTags(selectedNode.data.properties.tags || {});
    }
  }, [selectedNode, reset]);

  useEffect(() => {
    if (selectedNode?.data.connections) {
      const connectedGatewayNodes: Node[] = selectedNode.data.connections
        .map((connectionId: string) => getNode(connectionId))
        .filter(
          (node): node is Node =>
            node !== undefined && node.data?.label === "InternetGateway"
        );

      const connectedGateways = connectedGatewayNodes.map((node) => ({
        name: node.data.properties?.name || "",
        type: node.data.label || "",
        id: node.id,
        rawLabel: node.data.rawLabel || "",
      }));

      setAvailableGateWays(connectedGateways);
    } else {
      setAvailableGateWays([]);
    }
  }, [selectedNode?.data.connections, getNode]);

  const onSubmit = (values: FormValues) => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, {
        ...selectedNode.data,
        properties: {
          ...values,
          tags,
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="route-table" />
      </div>

      <div className="grid w-full items-center gap-2">
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-2 border p-3 rounded">
            <div className="grid gap-1.5">
              <Label>CIDR Block</Label>
              <Input
                {...register(`routes.${index}.cidr_block`)}
                placeholder="e.g. 0.0.0.0/0"
              />
            </div>

            <div className="grid gap-1.5 mt-2">
              <Label>Gateway</Label>
              <select
                {...register(`routes.${index}.selectedGatewayId`)}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedGw = availableGateWays.find(
                    (gw) => gw.id === selectedId
                  );
                  if (selectedGw) {
                    // Set type of the selected gateway as rawLabel
                    setValue(
                      `routes.${index}.refs.${selectedGw.rawLabel}`,
                      selectedGw.id
                    );
                  }
                }}
                className="border px-2 py-1 rounded w-full"
              >
                <option value="">Select Gateway</option>
                {availableGateWays.map((gw) => (
                  <option key={gw.id} value={gw.id}>
                    {gw.name || gw.id}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500 text-sm mt-2 flex items-center gap-1 hover:underline"
            >
              <TrashIcon className="h-4 w-4" />
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          append({
            cidr_block: "",
            refs: { internet_gateway: "" },
          })
        }
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Add CIDR Block
      </button>

      <TagsBlock tags={tags} setTags={setTags} />

      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Configuration
      </button>
    </form>
  );
}
