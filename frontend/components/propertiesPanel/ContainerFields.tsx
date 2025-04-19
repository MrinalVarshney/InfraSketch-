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
  containerImage: string;
  clusterName: string;
  launchType: "EC2" | "FARGATE";
  taskDefinition: string;
  desiredCount: number;
  networkMode: "bridge" | "awsvpc" | "host" | "none";
}

export default function ContainerFields({
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
          placeholder={provider === "aws" ? "t3.small" : "e2-micro"}
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="containerImage">Container Image</Label>
        <Input
          id="containerImage"
          {...register("containerImage")}
          placeholder="nginx:latest"
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
              message: "CPU cannot be negative",
            },
          })}
          placeholder="1"
        />
        {errors.cpu && (
          <p className="text-sm text-red-500">{errors.cpu.message}</p>
        )}
      </div>

      {/* ECS Fields */}

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="clusterName">Cluster Name</Label>
        <Input
          id="clusterName"
          {...register("clusterName")}
          placeholder="my-ecs-cluster"
        />
      </div>

      <div className="grid w-full items-center gap-1.5 text-white">
        <Label htmlFor="launchType">Launch Type</Label>
        <select
          id="launchType"
          {...register("launchType")}
          defaultValue="EC2"
          className="border rounded px-2 py-1 bg-black text-white"
        >
          <option value="EC2">EC2</option>
          <option value="FARGATE">FARGATE</option>
        </select>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="taskDefinition">Task Definition</Label>
        <Input
          id="taskDefinition"
          {...register("taskDefinition")}
          placeholder="my-task:1"
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="desiredCount">Desired Count</Label>
        <Input
          id="desiredCount"
          type="number"
          min={0}
          {...register("desiredCount", {
            valueAsNumber: true,
            min: {
              value: 0,
              message: "Desired count cannot be negative",
            },
          })}
          placeholder="1"
        />
        {errors.desiredCount && (
          <p className="text-sm text-red-500">{errors.desiredCount.message}</p>
        )}
      </div>

      <div className="grid w-full items-center gap-1.5 bg-black text-white">
        <Label htmlFor="networkMode">Network Mode</Label>
        <select
          id="networkMode"
          {...register("networkMode")}
          defaultValue="bridge"
          className="border rounded px-2 py-1 bg-black text-white"
        >
          <option value="bridge">bridge</option>
          <option value="awsvpc">awsvpc</option>
          <option value="host">host</option>
          <option value="none">none</option>
        </select>
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
