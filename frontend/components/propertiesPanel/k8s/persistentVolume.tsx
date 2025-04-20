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
import { HardDrive } from "lucide-react";
import { values } from "lodash";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

interface FormValues {
  provider: "kubernetes";
  id: string;
  metadata: {
    name: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
  spec: {
    capacity: {
      storage: string;
    };
    accessModes: string;
    persistentVolumeReclaimPolicy?: "Retain" | "Delete" | "Recycle";
    storageClassName?: string;
    volumeMode?: "Filesystem" | "Block";
    hostPath?: {
      path: string;
    };
    nodeAffinity?: {
      required?: {
        nodeSelectorTerms: {
          matchExpressions: {
            key: string;
            operator: "In" | "NotIn" | "Exists" | "DoesNotExist" | "Gt" | "Lt";
            values?: string[];
          }[];
        }[];
      };
    };
    type?: "local" | "cloud" | string;
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

interface CapacityOption {
  value: string;
  label: string;
}

const capacityOptions: CapacityOption[] = [
  { value: "1Gi", label: "1 GiB" },
  { value: "5Gi", label: "5 GiB" },
  { value: "10Gi", label: "10 GiB" },
  { value: "50Gi", label: "50 GiB" },
  { value: "100Gi", label: "100 GiB" },
];

export default function KubernetesPersistentVolumeFields({
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
      id: "",
      metadata: {
        name: "",
      },
      spec: {
        capacity: {
          storage: "1Gi",
        },
        accessModes: "ReadWriteOnce",
        type: "local",
      },
      ...(selectedNode?.data.properties || {}),
    },
  });

  const { getNode } = useReactFlow();

  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset({
        ...selectedNode.data.properties,
        spec: {
          ...selectedNode.data.properties.spec,
          type: selectedNode.data.properties.spec.type || "local",
        },
      });
    }
  }, [selectedNode, reset]);

  const onSubmit = (values: FormValues) => {
    console.log("Values", values);
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, {
        ...selectedNode.data,
        properties: values,
      });
    }

    if (selectedNode?.data.connections) {
      const connectedPvcNode = selectedNode.data.connections
        .map((connectionId: string) => getNode(connectionId))
        .find(
          (node): node is Node =>
            node !== undefined && node.data?.label === "PersistentVolumeClaim"
        );
      if (connectedPvcNode) {
        const pvStorageClass = watch("spec.storageClassName" || "");
        const pvLabels = watch("metadata.name");

        let baseSpec = Object.fromEntries(
          Object.entries(connectedPvcNode?.data.properties?.spec || {}).filter(
            ([key, value]) => {
              return key !== "storageClassName" && key !== "selector";
            }
          )
        );
        if (pvStorageClass !== "") {
          console.log("Setting storage class name:", pvStorageClass);
          baseSpec = { ...baseSpec, storageClassName: pvStorageClass };
        } else if (pvLabels) {
          baseSpec = {
            ...baseSpec,
            selector: { matchLabels: { app: pvLabels } },
          };
        }
        onNodeUpdate(connectedPvcNode.id, {
          ...connectedPvcNode.data,
          properties: {
            ...connectedPvcNode.data.properties,
            spec: baseSpec,
          },
        });
        console.log("Updated PVC spec", baseSpec);
      }
    }
  };

  //   console.log("Values", watch("spec"));

  const pvType = watch("spec.type");
  console.log("isLocalPV", pvType === "local", pvType);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="metadata.name">Name</Label>
        <Input
          id="metadata.name"
          {...register("metadata.name", { required: "Name is required" })}
          placeholder="my-pv"
        />
        {errors.metadata?.name && (
          <span className="text-red-500 text-sm">
            {errors.metadata.name.message}
          </span>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="spec.type">PV Type</Label>
        <Controller
          name="spec.type"
          control={control}
          defaultValue="local"
          render={({ field }) => (
            <Select
              id="spec.type"
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select PV Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local</SelectItem>
                {/* Add other PV types if you intend to support them */}
                {/* <SelectItem value="cloud">Cloud</SelectItem> */}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Capacity, Access Mode, Reclaim Policy, Storage Class, Volume Mode */}
      <div className="grid gap-1.5">
        <Label htmlFor="spec.capacity.storage">Capacity</Label>
        <Controller
          name="spec.capacity.storage"
          control={control}
          defaultValue="1Gi"
          rules={{ required: "Storage capacity is required" }}
          render={({ field }) => (
            <Select
              id="spec.capacity.storage"
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Capacity" />
              </SelectTrigger>
              <SelectContent>
                {capacityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {watch("spec.capacity.storage") === "custom" && (
          <Input
            className="mt-2"
            {...register("spec.capacity.storage", {
              required: "Storage capacity is required",
              pattern: {
                value: /^[0-9]+(Ei|Pi|Ti|Gi|Mi|Ki)$/,
                message: "Invalid storage size format (e.g., 1Gi, 100Mi)",
              },
            })}
            placeholder="Enter custom size (e.g., 500Mi)"
          />
        )}
        {errors.spec?.capacity?.storage && (
          <span className="text-red-500 text-sm">
            {errors.spec.capacity.storage.message}
          </span>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="spec.accessModes">Access Mode</Label>
        <Controller
          name="spec.accessModes"
          control={control}
          defaultValue={"ReadWriteOnce"}
          render={({ field }) => (
            <Select
              id="spec.accessModes"
              onValueChange={(value) => field.onChange(value)}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Access Mode" />
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
            Please select an access mode.
          </span>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="spec.persistentVolumeReclaimPolicy">
          Reclaim Policy
        </Label>
        <Controller
          name="spec.persistentVolumeReclaimPolicy"
          control={control}
          defaultValue="Retain"
          render={({ field }) => (
            <Select
              id="spec.persistentVolumeReclaimPolicy"
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Reclaim Policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Retain">Retain</SelectItem>
                <SelectItem value="Delete">Delete</SelectItem>
                <SelectItem value="Recycle">Recycle</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.spec?.persistentVolumeReclaimPolicy && (
          <span className="text-red-500 text-sm">
            {errors.spec.persistentVolumeReclaimPolicy.message}
          </span>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="spec.storageClassName">
          Storage Class Name (Optional)
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

      <div className="grid gap-1.5">
        <Label htmlFor="spec.volumeMode">Volume Mode (Optional)</Label>
        <Controller
          name="spec.volumeMode"
          control={control}
          render={({ field }) => (
            <Select
              id="spec.volumeMode"
              onValueChange={field.onChange}
              value={field.value || "Filesystem"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Volume Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Filesystem">Filesystem</SelectItem>
                <SelectItem value="Block">Block</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.spec?.volumeMode && (
          <span className="text-red-500 text-sm">
            {errors.spec.volumeMode.message}
          </span>
        )}
      </div>

      {/* Local PV Specific Options */}
      {pvType === "local" && (
        <>
          <h3 className="text-md font-semibold pt-2">Local PV Configuration</h3>
          <div className="grid gap-1.5">
            <Label htmlFor="spec.local.path">Path on Node</Label>
            <Input
              id="spec.hostPath.path"
              {...register("spec.hostPath.path", {
                required: "Path is required for local PV",
              })}
              placeholder="/data/my-volume"
            />
            {errors.spec?.hostPath?.path && (
              <span className="text-red-500 text-sm">
                {errors.spec.hostPath.path.message}
              </span>
            )}
          </div>
        </>
      )}

      <Button type="submit" className="w-full">
        Save Persistent Volume
      </Button>
    </form>
  );
}
