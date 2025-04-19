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
  engine: string;
  engineVersion: string;
  storageSize: number;
  region: string;
}

export default function DatabaseFields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const provider = selectedNode?.data.provider;

  const {
    register,
    handleSubmit,
    reset,
    watch,
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
          placeholder={provider === "aws" ? "db.t3.micro" : "db-n1-standard-1"}
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="engine">Database Engine</Label>
        <Input
          id="engine"
          {...register("engine")}
          placeholder="PostgreSQL, MySQL, etc."
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="engineVersion">Engine Version</Label>
        <Input
          id="engineVersion"
          {...register("engineVersion")}
          placeholder="13"
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
              message: "Memory cannot be negative",
            },
          })}
          placeholder="4"
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
              message: "CPU cannot be negative",
            },
          })}
          placeholder="2"
        />
        {errors.cpu && (
          <p className="text-sm text-red-500">{errors.cpu.message}</p>
        )}
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="storageSize">Storage Size (GB)</Label>
        <Input
          id="storageSize"
          type="number"
          min={0}
          {...register("storageSize", {
            valueAsNumber: true,
            min: {
              value: 0,
              message: "Storage size cannot be negative",
            },
          })}
          placeholder="100"
        />
        {errors.storageSize && (
          <p className="text-sm text-red-500">{errors.storageSize.message}</p>
        )}
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="region">Region</Label>
        <Input id="region" {...register("region")} placeholder="us-east-1" />
      </div>

      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Configuration
      </button>
    </form>
  );
}
