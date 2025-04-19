import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Node } from "@xyflow/react";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import TagsBlock from "../utils/tag";
interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

/*
 id: "",
            bucket: "",
            region: "",
            acl: "private",
            versioning: {
              enabled: false,
            },
            tags: [],
*/
interface FormValues {
  bucket: string;
  region: string;
  acl: string;
  versioning: {
    enabled: boolean;
  };
  tags: {};
}

export default function StorageFields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const provider = selectedNode?.data.provider;
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: selectedNode?.data.properties || {},
  });

  const [tags, setTags] = useState({});

  const onSubmit = (data: FormValues) => {
    console.log("data", data);
    const Updated_data = {
      ...selectedNode?.data,
      properties: {
        ...data, // this includes everything from form except `tags`
        tags, // add tags from state separately
      },
    };

    onNodeUpdate(selectedNode?.id, Updated_data);
  };
  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset(selectedNode.data.properties);
      setTags(selectedNode.data.properties.tags || {});
    }
  }, [selectedNode, reset]);

  // for the region selection
  const awsRegions = [
    { value: "us-east-1", label: "US East (N. Virginia)" },
    { value: "us-west-1", label: "US West (N. California)" },
    { value: "eu-central-1", label: "EU (Frankfurt)" },
    // ...more
  ];

  const gcpRegions = [
    { value: "us-central1", label: "US Central" },
    { value: "europe-west1", label: "Europe West" },
    { value: "asia-east1", label: "Asia East" },
    // ...more
  ];

  const azureRegions = [
    { value: "eastus", label: "East US" },
    { value: "westeurope", label: "West Europe" },
    { value: "southeastasia", label: "Southeast Asia" },
    // ...more
  ];
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("bucket")} placeholder="bucket01" />
      </div>
      <div>
        <Label htmlFor="region">Region</Label>
        <select
          id="region"
          {...register("region")}
          className="flex h-10 w-full bg-transparent rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          <option value="">Select a Region (Optional)</option>

          {provider === "aws" &&
            awsRegions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}

          {provider === "gcp" &&
            gcpRegions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}

          {provider === "azure" &&
            azureRegions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
        </select>
      </div>
      <div>
        <Label htmlFor="acl">ACL</Label>
        <select
          id="acl"
          {...register("acl")}
          className="flex h-10 w-full bg-transparent rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          <option value="private">private</option>
          <option value="public-read">public-read</option>
          <option value="public-write">public-write</option>
        </select>
      </div>
      <div>
        <Label htmlFor="versioning">Versioning</Label>
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="versioning.enabled"
            render={({ field: { value, onChange } }) => (
              <Switch
                id="versioning"
                checked={value}
                onCheckedChange={onChange}
              />
            )}
          />
          <Label htmlFor="versioning">Enable Versioning</Label>
        </div>
      </div>

      <TagsBlock tags={tags} setTags={setTags} />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 block w-full"
      >
        Save
      </button>
    </form>
  );
}
