import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Node } from "@xyflow/react";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

interface FormValues {
  metadata: {
    name: string;
    labels: {
      app: string;
    };
  };
  data: Record<string, string>;
}

export default function ConfigMapFields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const { register, handleSubmit, reset, watch, setValue, getValues } =
    useForm<FormValues>({
      defaultValues: selectedNode?.data.properties || {
        metadata: { name: "", labels: { app: "" } },
        data: {},
      },
    });

  const data = watch("data");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset(selectedNode.data.properties);
    }
  }, [selectedNode, reset]);

  const onSubmit = (values: FormValues) => {
    if (!selectedNode) return;

    const updatedNode = {
      ...selectedNode.data,
      properties: values,
    };

    onNodeUpdate(selectedNode.id, updatedNode);
  };

  const handleAddKeyValue = () => {
    if (!newKey || !newValue) return;

    const currentData = getValues("data");
    setValue("data", {
      ...currentData,
      [newKey]: newValue,
    });

    setNewKey("");
    setNewValue("");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ConfigMap Name */}
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="name">ConfigMap Name</Label>
        <Input
          id="name"
          {...register("metadata.name")}
          placeholder="mongo-express-config"
        />
      </div>

      {/* ConfigMap Labels */}
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="label">Labels (app)</Label>
        <Input
          id="label"
          {...register("metadata.labels.app")}
          placeholder="mongo-express"
        />
      </div>

      {/* Existing ConfigMap Data */}
      <div>
        <h3 className="text-md font-semibold pt-2">ConfigMap Data</h3>
        {Object.entries(data || {}).map(([key], index) => (
          <div key={key} className="grid gap-1.5">
            <Label>{key}</Label>
            <Input
              {...register(`data.${key}` as const)}
              placeholder="value"
              defaultValue={data[key]}
            />
          </div>
        ))}
      </div>

      {/* Add New Key-Value */}
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="New Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
        />
        <Input
          placeholder="New Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="text-blue-600 text-sm hover:underline"
        onClick={handleAddKeyValue}
      >
        Add Key-Value
      </button>

      {/* Save Button */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 block w-full"
      >
        Save
      </button>
    </form>
  );
}
