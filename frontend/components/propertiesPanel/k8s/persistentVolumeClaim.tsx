import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { Node, useReactFlow } from "@xyflow/react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

interface FormValues {
  provider: "kubernetes";
  id: string;
  metadata: {
    name: string;
    namespace?: string;
  };
  spec: {
    storageClassName?: string;
    accessModes: string[];
    resources: {
      requests: {
        storage: string;
      };
    };
    selector?: {
      matchLabels?: Record<string, string>;
    };
  };
}

interface AccessModeOption {
  value: string;
  label: string;
}

const accessModeOptions: AccessModeOption[] = [
  { value: "ReadWriteOnce", label: "ReadWriteOnce (RWO)" },
  { value: "ReadOnlyMany", label: "ReadOnlyMany (ROX)" },
  { value: "ReadWriteMany", label: "ReadWriteMany (RWX)" },
  { value: "ReadWriteOncePod", label: "ReadWriteOncePod (RWOP)" },
];

export default function KubernetesPersistentVolumeClaimFields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      provider: "kubernetes",
      type: "persistentvolumeclaim",
      id: "",
      metadata: {
        name: "",
        namespace: "default",
      },
      spec: {
        accessModes: ["ReadWriteOnce"],
        resources: {
          requests: {
            storage: "10Gi",
          },
        },
      },
      ...(selectedNode?.data.properties || {}),
    },
  });

  const [availablePV, setAvailablePV] = useState<Node | undefined>();
  const { getNode } = useReactFlow();

  useEffect(() => {
    if (selectedNode?.data.connections) {
      const connectedPvNode = selectedNode.data.connections
        .map((connectionId: string) => getNode(connectionId))
        .find(
          (node): node is Node =>
            node !== undefined && node.data?.label === "PersistentVolume"
        );
      setAvailablePV(connectedPvNode);
    } else {
      setAvailablePV(undefined);
    }
  }, [selectedNode?.data.connections, getNode]);

  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset(selectedNode.data.properties);
    }
  }, [selectedNode, reset, availablePV]);

  console.log("selectedNode", selectedNode);

  const formDefaultValues = {
    provider: "kubernetes",
    id: "",
    metadata: {
      name: "",
      namespace: "default",
    },
    spec: {
      accessModes: "ReadWriteOnce",
      resources: {
        requests: {
          storage: "10Gi",
        },
      },
    },
  };

  const onSubmit = (values: FormValues) => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, {
        ...selectedNode.data,
        properties: values,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="metadata.name">Name</Label>
        <Input
          id="metadata.name"
          {...register("metadata.name", { required: "Name is required" })}
          placeholder="my-pvc"
        />
        {errors.metadata?.name && (
          <span className="text-red-500 text-sm">
            {errors.metadata.name.message}
          </span>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="metadata.namespace">Namespace (Optional)</Label>
        <Input
          id="metadata.namespace"
          {...register("metadata.namespace")}
          placeholder="default"
        />
        {errors.metadata?.namespace && (
          <span className="text-red-500 text-sm">
            {errors.metadata.message}
          </span>
        )}
      </div>

      {availablePV ? (
        <div className="rounded-md border p-4 bg-blue-50">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-blue-700"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-blue-700">
              This PVC is connected to the PersistentVolume:{" "}
              <span className="font-semibold">
                {availablePV.data?.properties?.metadata?.name || availablePV.id}
              </span>
              .{" "}
              {availablePV.data?.properties?.spec?.storageClassName
                ? `The connected PV was provisioned by the StorageClass: ${availablePV.data.properties.spec.storageClassName}.`
                : "The connected PV appears to be manually provisioned."}{" "}
              This PVC will attempt to bind based on the existing configuration
              of the connected PV.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-1.5">
          <Label htmlFor="spec.storageClassName">
            Storage Class Name (Optional - Choose for automatic PV provisioning)
          </Label>
          <Input
            id="spec.storageClassName"
            {...register("spec.storageClassName")}
            placeholder="my-storage-class"
          />
          {errors.spec?.storageClassName && (
            <span className="text-red-500 text-sm">
              {errors.spec.storageClassName.message}
            </span>
          )}
        </div>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="spec.accessModes">Access Modes</Label>
        <Controller
          name="spec.accessModes"
          control={control}
          defaultValue={["ReadWriteOnce"]}
          render={({ field }) => (
            <Select
              id="spec.accessModes"
              onValueChange={field.onChange}
              value={field.value}
              multiple
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Access Modes" />
              </SelectTrigger>
              <SelectContent>
                {accessModeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.spec?.accessModes && (
          <span className="text-red-500 text-sm">
            Please select at least one access mode.
          </span>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="spec.resources.requests.storage">
          Storage Request (e.g., 1Gi, 100Mi)
        </Label>
        <Input
          id="spec.resources.requests.storage"
          {...register("spec.resources.requests.storage", {
            required: "Storage request is required",
          })}
          placeholder="10Gi"
        />
        {errors.spec?.resources?.requests?.storage && (
          <span className="text-red-500 text-sm">
            {errors.spec.resources.requests.storage.message}
          </span>
        )}
      </div>

      {/* Selector for Static Provisioning - Only show if NO connected PV */}
      {!availablePV && (
        <>
          <h4 className="text-md font-semibold pt-2">
            Selector (Optional - Use to bind to a specific existing PV)
          </h4>
          <div className="border p-3 rounded">
            <div className="grid gap-1.5">
              <Label htmlFor="spec.selector.matchLabels.app">App Label</Label>
              <Input
                id="spec.selector.matchLabels.app"
                {...register("spec.selector.matchLabels.app")}
                placeholder="e.g., mongodb"
              />
              {errors.spec?.selector?.matchLabels?.app && (
                <span className="text-red-500 text-sm">
                  {errors.spec.selector.matchLabels.app.message}
                </span>
              )}
            </div>
            {/* Add more label selectors here if needed */}
          </div>
        </>
      )}

      <Button type="submit" className="w-full">
        Save Persistent Volume Claim
      </Button>
    </form>
  );
}
