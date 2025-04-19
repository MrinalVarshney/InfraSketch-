import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Node } from "@xyflow/react";
import { useForm } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import TagsBlock from "../utils/tag";
import { useState, useEffect } from "react";
import { Select } from "@/components/ui/select";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

interface FormValues {
  name: string;
  protocol: "HTTP" | "HTTPS" | "TCP" | "TLS" | "UDP" | "TCP_UDP";
  port: number;
  health_check: {
    path?: string;
    protocol?: "HTTP" | "HTTPS" | "TCP";
    port?: number;
    matcher?: string;
    interval?: number;
    timeout?: number;
    healthy_threshold?: number;
    unhealthy_threshold?: number;
  };
  target_type: "instance";
  refs: {
    vpc: string;
    targets: [];
  };
  tags: {};
}

export default function TargetGroupFields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const { register, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: selectedNode?.data?.properties || {
      port: 80,
      protocol: "HTTP",
      health_check: {
        path: "/",
        protocol: "HTTP",
        matcher: "200",
        interval: 30,
        timeout: 5,
        healthy_threshold: 5,
        unhealthy_threshold: 2,
      },
      target_type: "instance",
    },
  });

  const [tags, setTags] = useState({});

  const onSubmit = (data: FormValues) => {
    const updatedData = {
      ...selectedNode?.data,
      properties: {
        ...selectedNode?.data?.properties,
        ...data,
        tags: tags,
      },
    };
    onNodeUpdate(selectedNode?.id, updatedData);
  };

  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset(selectedNode.data.properties);
      setTags(selectedNode.data.properties.tags || {});
    }
  }, [selectedNode, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="my-target-group" />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="port">Port</Label>
        <Input
          id="port"
          type="number"
          {...register("port", { valueAsNumber: true })}
          placeholder="80"
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="protocol">Protocol</Label>
        <Select {...register("protocol")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Protocol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HTTP">HTTP</SelectItem>
            <SelectItem value="HTTPS">HTTPS</SelectItem>
            <SelectItem value="TCP">TCP</SelectItem>
            <SelectItem value="TLS">TLS</SelectItem>
            <SelectItem value="UDP">UDP</SelectItem>
            <SelectItem value="TCP_UDP">TCP_UDP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Health Check</Label>
        <div className="space-y-2 border p-3 rounded">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="health_check.path">Path</Label>
            <Input
              id="health_check.path"
              {...register("health_check.path")}
              placeholder="/"
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="health_check.port">Port</Label>
            <Input
              id="health_check.port"
              type="number"
              {...register("health_check.port", { valueAsNumber: true })}
              placeholder="80"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="health_check.interval">Interval (seconds)</Label>
            <Input
              id="health_check.interval"
              type="number"
              {...register("health_check.interval", { valueAsNumber: true })}
              placeholder="30"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="health_check.timeout">Timeout (seconds)</Label>
            <Input
              id="health_check.timeout"
              type="number"
              {...register("health_check.timeout", { valueAsNumber: true })}
              placeholder="5"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="health_check.healthy_threshold">
              Healthy Threshold
            </Label>
            <Input
              id="health_check.healthy_threshold"
              type="number"
              {...register("health_check.healthy_threshold", {
                valueAsNumber: true,
              })}
              placeholder="5"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="health_check.unhealthy_threshold">
              Unhealthy Threshold
            </Label>
            <Input
              id="health_check.unhealthy_threshold"
              type="number"
              {...register("health_check.unhealthy_threshold", {
                valueAsNumber: true,
              })}
              placeholder="2"
            />
          </div>
        </div>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="target_type">Target Type</Label>
        <Select {...register("target_type")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Target Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="instance">Instance</SelectItem>
            <SelectItem value="ip">IP</SelectItem>
            <SelectItem value="lambda">Lambda</SelectItem>
          </SelectContent>
        </Select>
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
