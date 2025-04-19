// ./aws/SubnetFields.tsx
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
  cidr_block: string;
  availability_zone: string;
  tags?: {};
  public: boolean;
  map_public_ip_on_launch?: boolean;
}

export default function SubnetFields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: selectedNode?.data.properties || {},
  });

  const [tags, setTags] = useState({});

  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset(selectedNode.data.properties);
      setTags(selectedNode.data.properties.tags || {});
    }
  }, [selectedNode, reset]);

  const onSubmit = (values: FormValues) => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, {
        ...selectedNode.data,
        properties: { ...values, tags },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="name">Subnet Name</Label>
        <Input
          id="name"
          {...register("name", { required: true })}
          placeholder="my-subnet"
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="cidr_block">CIDR Block</Label>
        <Input
          id="cidr_block"
          {...register("cidr_block", { required: true })}
          placeholder="10.0.1.0/24"
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="availability_zone">Availability Zone</Label>
        <Input
          id="availability_zone"
          {...register("availability_zone", { required: true })}
          placeholder="us-east-1a"
        />
      </div>
      <TagsBlock tags={tags} setTags={setTags} />

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="public">Public Subnet</Label>
        <input
          id="public"
          type="checkbox"
          {...register("public")}
          className="h-4 w-4"
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="public">Map Public IP on Launch</Label>
        <input
          id="public"
          type="checkbox"
          {...register("map_public_ip_on_launch")}
          className="h-4 w-4"
        />
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
