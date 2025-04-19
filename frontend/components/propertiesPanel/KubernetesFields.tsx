import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Node } from "@xyflow/react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

interface FormValues {
  instanceType: string;
  memory: number;
  cpu: number;
  replicas: number;
  namespace: string;
  image: string;
  memoryRequest: number;
  cpuRequest: number;
  memoryLimit: number;
  cpuLimit: number;
  nodeSelector: string;
}

export default function KubernetesFields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const provider = selectedNode?.data.provider;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: selectedNode
      ? {
          ...(selectedNode.data.properties || {}),
        }
      : {},
  });

  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset(selectedNode.data.properties);
    }
  }, [selectedNode, reset]);

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
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="instanceType">Instance Type</Label>
        <Input
          id="instanceType"
          {...register("instanceType")}
          placeholder={provider === "aws" ? "t2.micro" : "n1-standard-1"}
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="memory">Memory (GB)</Label>
        <Input
          id="memory"
          type="number"
          min={0}
          {...register("memory", {
            valueAsNumber: true,
            min: {
              value: 0,
              message: "Memory must be non-negative",
            },
          })}
          placeholder="2"
        />
        {errors.memory && (
          <p className="text-sm text-red-500">{errors.memory.message}</p>
        )}
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="cpu">CPU (vCPU)</Label>
        <Input
          id="cpu"
          type="number"
          min={0}
          {...register("cpu", {
            valueAsNumber: true,
            min: {
              value: 0,
              message: "CPU must be non-negative",
            },
          })}
          placeholder="1"
        />
        {errors.cpu && (
          <p className="text-sm text-red-500">{errors.cpu.message}</p>
        )}
      </div>

      {/* New Kubernetes Options */}
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="replicas">Replicas</Label>
        <Input
          id="replicas"
          type="number"
          min={1}
          {...register("replicas", {
            valueAsNumber: true,
            min: {
              value: 1,
              message: "At least 1 replica required",
            },
          })}
          placeholder="1"
        />
        {errors.replicas && (
          <p className="text-sm text-red-500">{errors.replicas.message}</p>
        )}
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="namespace">Namespace</Label>
        <Input
          id="namespace"
          {...register("namespace")}
          placeholder="default"
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          {...register("image")}
          placeholder="nginx:latest"
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="memoryRequest">Memory Request (GB)</Label>
        <Input
          id="memoryRequest"
          type="number"
          min={0}
          {...register("memoryRequest", {
            valueAsNumber: true,
            min: {
              value: 0,
              message: "Memory request must be non-negative",
            },
          })}
          placeholder="1"
        />
        {errors.memoryRequest && (
          <p className="text-sm text-red-500">{errors.memoryRequest.message}</p>
        )}
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="cpuRequest">CPU Request (vCPU)</Label>
        <Input
          id="cpuRequest"
          type="number"
          min={0}
          {...register("cpuRequest", {
            valueAsNumber: true,
            min: {
              value: 0,
              message: "CPU request must be non-negative",
            },
          })}
          placeholder="0.5"
        />
        {errors.cpuRequest && (
          <p className="text-sm text-red-500">{errors.cpuRequest.message}</p>
        )}
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="memoryLimit">Memory Limit (GB)</Label>
        <Input
          id="memoryLimit"
          type="number"
          min={0}
          {...register("memoryLimit", {
            valueAsNumber: true,
            min: {
              value: 0,
              message: "Memory limit must be non-negative",
            },
          })}
          placeholder="2"
        />
        {errors.memoryLimit && (
          <p className="text-sm text-red-500">{errors.memoryLimit.message}</p>
        )}
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="cpuLimit">CPU Limit (vCPU)</Label>
        <Input
          id="cpuLimit"
          type="number"
          min={0}
          {...register("cpuLimit", {
            valueAsNumber: true,
            min: {
              value: 0,
              message: "CPU limit must be non-negative",
            },
          })}
          placeholder="1"
        />
        {errors.cpuLimit && (
          <p className="text-sm text-red-500">{errors.cpuLimit.message}</p>
        )}
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="nodeSelector">Node Selector</Label>
        <Input
          id="nodeSelector"
          {...register("nodeSelector")}
          placeholder="key: value"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save
      </button>
    </form>
  );
}
