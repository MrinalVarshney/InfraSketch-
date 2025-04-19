import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Node } from "@xyflow/react";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import TagsBlock from "../utils/tag";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

interface FormValues {
  domain: string;
  name: string;
  tags: {};
}

export default function ElasticIPFields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
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

  const [tags, setTags] = useState({});

  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset(selectedNode.data.properties);
      setTags(selectedNode.data.properties.tags || {});
    }
  }, [selectedNode, reset]);

  const onSubmit = (data: FormValues) => {
    const Updated_data = {
      ...selectedNode?.data,
      properties: {
        ...data,
        tags,
      },
    };
    console.log("Updated data:", Updated_data);
    onNodeUpdate(selectedNode?.id, Updated_data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="myEIP" />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="domain">Domain</Label>
        <Input id="domain" {...register("domain")} placeholder="vpc" />
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
