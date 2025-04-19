import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Node } from "@xyflow/react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import TagsBlock from "../utils/tag";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

interface FormValues {
  name: string;
  vpcId: string;
  region: string;
}

export default function InternetGatewayFields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: selectedNode?.data.properties || {},
  });

  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset(selectedNode.data.properties);
      setTags(selectedNode.data.properties.tags || {});
    }
  }, [selectedNode, reset]);

  const [tags, setTags] = useState({});

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
        <Label htmlFor="name">Internet Gateway Name</Label>
        <Input id="name" {...register("name")} placeholder="igw-main" />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="region">Region</Label>
        <select
          id="region"
          {...register("region")}
          className="border px-2 py-1 rounded w-full"
        >
          <option value="">Select a region</option>
          <option value="us-east-1">US East (N. Virginia)</option>
          <option value="us-west-1">US West (N. California)</option>
          <option value="us-west-2">US West (Oregon)</option>
          <option value="eu-central-1">EU (Frankfurt)</option>
          <option value="eu-west-1">EU (Ireland)</option>
          <option value="ap-south-1">Asia Pacific (Mumbai)</option>
          <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
        </select>
      </div>

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
