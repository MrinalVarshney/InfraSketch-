import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Node, useReactFlow } from "@xyflow/react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import TagsBlock from "../utils/tag";
import { useState, useEffect } from "react";
import { set } from "lodash";
import { TrashIcon } from "@heroicons/react/solid";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

interface FormValues {
  name: string;
  instance_type: string;
  ami: string;
  region: string;
  tags: {};
  refs: {
    vpc?: string;
    subnet?: string;
    securityGroup?: string;
  };
}

export default function ComputeFields({
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
    const Updated_data = {
      ...selectedNode?.data,
      properties: {
        ...data, // this includes everything from form except `tags`
        tags, // add tags from state separately
      },
    };
    console.log("Updated data:", Updated_data);
    onNodeUpdate(selectedNode?.id, Updated_data);
  };
  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset(selectedNode.data.properties);
      setTags(selectedNode.data.properties.tags || {});
    }
  }, [selectedNode, reset]);

  // for the OS selection
  const awsOptions = [
    { label: "Amazon Linux", value: "ami-0f1dcc636b69a6438" },
    { label: "Ubuntu 24.04", value: "ami-0e35ddab05955cf57" },
    // { label: "Windows Server 2019", value: "ami-061392db613a6357b" },
  ];

  const gcpOptions = [
    { label: "Ubuntu 20.04", value: "ubuntu-2004-lts" },
    { label: "Debian 11", value: "debian-11" },
    { label: "CentOS 7", value: "centos-7" },
  ];

  const azureOptions = [
    { label: "Ubuntu 18.04", value: "Canonical:UbuntuServer:18.04-LTS:latest" },
    {
      label: "Windows Server 2019",
      value: "MicrosoftWindowsServer:WindowsServer:2019-Datacenter:latest",
    },
  ];

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
        <Input id="name" {...register("name")} placeholder="eth0" />
      </div>
      <div>
        <Label htmlFor="instance_type">Instance Type</Label>
        <select
          id="instance_type"
          {...register("instance_type")}
          className="flex h-10 w-full bg-transparent rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          {provider === "aws" ? (
            <>
              <option value="t2.micro">t2.micro</option>
              <option value="t2.small">t2.small</option>
              <option value="t2.medium">t2.medium</option>
              <option value="t3.micro">t3.micro</option>
              <option value="t3.small">t3.small</option>
              <option value="t3.medium">t3.medium</option>
            </>
          ) : provider === "gcp" ? (
            <>
              <option value="n1-standard-1">n1-standard-1</option>
              <option value="n1-standard-2">n1-standard-2</option>
              <option value="n2-standard-2">n2-standard-2</option>
              <option value="n2-standard-4">n2-standard-4</option>
            </>
          ) : provider === "azure" ? (
            <>
              <option value="B1s">B1s</option>
              <option value="B2s">B2s</option>
              <option value="D2s_v3">D2s_v3</option>
              <option value="D4s_v3">D4s_v3</option>
            </>
          ) : (
            <option value="">Select a provider</option>
          )}
        </select>
      </div>

      <div>
        <Label htmlFor="ami">AMI</Label>
        <select
          id="ami"
          {...register("ami")}
          className="flex h-10 w-full bg-transparent rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          {provider === "aws" &&
            awsOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}

          {provider === "gcp" &&
            gcpOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}

          {provider === "azure" &&
            azureOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}

          {!["aws", "gcp", "azure"].includes(provider) && (
            <option value="">Select an OS</option>
          )}
        </select>
      </div>
      {/* <div>
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
      </div> */}

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
