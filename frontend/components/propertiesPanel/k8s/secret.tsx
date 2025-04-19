import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Node } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

interface SecretFormValues {
  metadata: {
    name: string;
    labels: Record<string, string>;
  };
  secret_type: string;
  data: Record<string, string>;
}

export default function SecretFields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SecretFormValues>({
    defaultValues: selectedNode?.data.properties || {},
  });

  const data = watch("data") || {};
  const secretType = watch("secret_type");

  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset(selectedNode.data.properties);
    }
  }, [selectedNode, reset]);

  const addKeyValue = () => {
    const key = getValues("data.newKey")?.trim();
    const value = getValues("data.newValue");

    if (key && value) {
      const encodedValue = btoa(value);
      setValue("data", {
        ...data,
        [key]: encodedValue,
      });
      setValue("data.newKey", "");
      setValue("data.newValue", "");
    }
  };

  const deleteKey = (keyToDelete: string) => {
    const updatedData = { ...data };
    delete updatedData[keyToDelete];
    setValue("data", updatedData);
  };

  const decodeBase64 = (value: string) => {
    try {
      return atob(value);
    } catch {
      return "[invalid base64]";
    }
  };

  const onSubmit = (values: SecretFormValues) => {
    if (!selectedNode) return;

    const cleanedData: Record<string, string> = {};
    Object.entries(values.data || {}).forEach(([k, v]) => {
      if (k !== "newKey" && k !== "newValue") {
        cleanedData[k] = v;
      }
    });

    const updatedData = {
      ...selectedNode.data,
      provider: "kubernetes",
      type: "secret",
      id: values.metadata.name,
      properties: {
        ...values,
        data: cleanedData,
      },
    };

    onNodeUpdate(selectedNode.id, updatedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Secret Name */}
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="name">Secret Name</Label>
        <Input
          id="name"
          {...register("metadata.name", { required: true })}
          placeholder="db-secret"
        />
      </div>

      {/* Labels */}
      <div className="grid w-full items-center gap-1.5">
        <Label>Label (app)</Label>
        <Input
          {...register("metadata.labels.app")}
          placeholder="mongo-express"
        />
      </div>

      {/* Secret Type */}
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="secret_type">Secret Type</Label>
        <Select
          onValueChange={(value) => setValue("secret_type", value)}
          defaultValue={secretType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select secret type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Opaque">Opaque</SelectItem>
            <SelectItem value="kubernetes.io/tls">TLS</SelectItem>
            <SelectItem value="kubernetes.io/dockerconfigjson">
              Docker Config
            </SelectItem>
            <SelectItem value="kubernetes.io/basic-auth">Basic Auth</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Secret Data Fields */}
      <h3 className="text-md font-semibold pt-2">Secret Data</h3>
      {Object.entries(data)
        .filter(([key]) => key !== "newKey" && key !== "newValue")
        .map(([key, value]) => (
          <div key={key} className="grid gap-1.5 relative group">
            <Label htmlFor={`data.${key}`}>{key}</Label>
            <Input id={`data.${key}`} value={decodeBase64(value)} disabled />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteKey(key)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}

      {/* Add New Key-Value */}
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="New Key" {...register("data.newKey")} />
        <Input placeholder="New Value (plain)" {...register("data.newValue")} />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addKeyValue}>
        Add Key-Value
      </Button>

      {/* Save Button */}
      <Button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 block w-full"
      >
        Save
      </Button>
    </form>
  );
}
