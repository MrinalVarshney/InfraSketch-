import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { Node } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

type Protocol = "TCP" | "UDP" | "SCTP";

interface Port {
  name?: string;
  protocol?: Protocol;
  port: number;
  targetPort?: number | string;
  nodePort?: number;
}

interface FormValues {
  id: string;
  provider: string;
  type: string;
  metadata: {
    name: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
  spec: {
    type?: "ClusterIP" | "NodePort" | "LoadBalancer";
    selector: Record<string, string>;
    ports: Port[];
    clusterIP?: string;
    externalIPs?: string[];
  };
}

export default function KubernetesServiceFields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      type: "service",
      metadata: { name: "" },
      spec: {
        type: "ClusterIP",
        selector: { app: "" },
        ports: [],
      },
      ...(selectedNode?.data.properties || {}),
    },
  });

  const {
    fields: portFields,
    append: appendPort,
    remove: removePort,
  } = useFieldArray({
    control,
    name: "spec.ports",
  });

  const { getNode } = useReactFlow();
  const [availablePorts, setAvailablePorts] = useState<number[]>([]);
  const serviceType = watch("spec.type");

  // Get available ports from connected deployment
  useEffect(() => {
    if (selectedNode?.data.connections) {
      const connectedDeploymentNodes = selectedNode.data.connections
        .map((connectionId: string) => getNode(connectionId))
        .filter(
          (node): node is Node =>
            node !== undefined && node.data?.label === "Deployment"
        );

      const deploymentNode = connectedDeploymentNodes[0];
      const deploymentContainers =
        deploymentNode?.data?.properties?.spec?.template?.spec?.containers ||
        [];

      const containerPorts = deploymentContainers.flatMap(
        (container: any) =>
          container.ports?.map((port: any) => port.containerPort) || []
      );

      const uniquePorts = Array.from(new Set(containerPorts)).filter(
        (port): port is number => port !== undefined
      );

      setAvailablePorts(uniquePorts);
    }
  }, [selectedNode?.data.connections, getNode]);

  // Reset form when selected node changes
  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset({
        type: "service",
        metadata: { name: "" },
        spec: {
          type: "ClusterIP",
          selector: { app: "" },
          ports: [],
        },
        ...selectedNode.data.properties,
      });
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

  console.log("available ports", availablePorts);

  const handleAddPort = () => {
    appendPort({
      port: 80,
      protocol: "TCP",
      targetPort: availablePorts.length > 0 ? availablePorts[0] : 80,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-1.5">
        <Label>Metadata Name</Label>
        <Input
          {...register("metadata.name", { required: true })}
          placeholder="my-service"
        />
        {errors.metadata?.name && (
          <span className="text-red-500 text-sm">Name is required</span>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label>Selector (e.g. app=nginx)</Label>
        <Input
          disabled={true}
          {...register("spec.selector.app", { required: true })}
          placeholder="nginx"
        />
        {errors.spec?.selector?.app && (
          <span className="text-red-500 text-sm">Selector is required</span>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="spec.type">Service Type</Label>
        <Controller
          name="spec.type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ClusterIP">ClusterIP</SelectItem>
                <SelectItem value="NodePort">NodePort</SelectItem>
                <SelectItem value="LoadBalancer">LoadBalancer</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <h3 className="text-md font-semibold pt-2">Ports</h3>
      {portFields.map((field, index) => (
        <div key={field.id} className="space-y-2 border p-3 rounded">
          <div className="grid gap-1.5">
            <Label>Port Name</Label>
            <Input
              {...register(`spec.ports.${index}.name`)}
              placeholder="http"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Protocol</Label>
            <Controller
              name={`spec.ports.${index}.protocol`}
              control={control}
              defaultValue="TCP"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Protocol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TCP">TCP</SelectItem>
                    <SelectItem value="UDP">UDP</SelectItem>
                    <SelectItem value="SCTP">SCTP</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Port</Label>
            <Input
              type="number"
              {...register(`spec.ports.${index}.port`, {
                valueAsNumber: true,
                required: true,
                min: 1,
                max: 65535,
              })}
              placeholder="80"
            />
            {errors.spec?.ports?.[index]?.port && (
              <span className="text-red-500 text-sm">
                Valid port number is required (1-65535)
              </span>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label>Target Port</Label>
            {availablePorts.length > 0 ? (
              <Controller
                name={`spec.ports.${index}.targetPort`}
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(
                        isNaN(Number(value)) ? value : Number(value)
                      );
                      setValue(
                        `spec.ports.${index}.targetPort`,
                        isNaN(Number(value)) ? value : Number(value)
                      );
                    }}
                    value={field.value?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Target Port" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePorts.map((port) => (
                        <SelectItem key={port} value={port.toString()}>
                          {port}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <Input
                type="number"
                {...register(`spec.ports.${index}.targetPort`, {
                  valueAsNumber: true,
                  required: true,
                  min: 1,
                  max: 65535,
                })}
                placeholder="80"
              />
            )}
            {/* {errors.spec?.ports?.[index]?.targetPort && (
              <span className="text-red-500 text-sm">
                Valid target port is required
              </span>
            )} */}
          </div>

          {serviceType === "NodePort" && (
            <div className="grid gap-1.5">
              <Label>Node Port</Label>
              <Input
                type="number"
                {...register(`spec.ports.${index}.nodePort`, {
                  valueAsNumber: true,
                  min: 30000,
                  max: 32767,
                })}
                placeholder="30000-32767"
              />
              {errors.spec?.ports?.[index]?.nodePort && (
                <span className="text-red-500 text-sm">
                  NodePort must be between 30000-32767
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => removePort(index)}
            className="text-red-500 text-sm hover:underline"
          >
            Remove Port
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddPort}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Add Port
      </button>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 block w-full"
      >
        Save
      </button>
    </form>
  );
}
