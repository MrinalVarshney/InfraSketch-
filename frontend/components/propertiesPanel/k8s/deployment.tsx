import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { Node } from "@xyflow/react";
import { resolveServiceToDeployment } from "@/components/dependencyResolver";
import { useReactFlow } from "@xyflow/react";
import { PlusCircle, Trash2 } from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

interface Container {
  name: string;
  image: string;
  ports: [
    {
      containerPort: number;
    }
  ];
  cpu?: string;
  memory?: string;
  env?: {
    name: string;
    value?: string;
    valueFrom?: {
      secretKeyRef?: {
        name: string;
        key: string;
      };
      configMapKeyRef?: {
        name: string;
        key: string;
      };
    };
  }[];
}

interface FormValues {
  id: string;
  metadata: {
    name: string;
    labels: Record<string, string>;
  };
  spec: {
    replicas: number;
    selector: {
      matchLabels: Record<string, string>;
    };
    template: {
      metadata: {
        labels: Record<string, string>;
      };
      spec: {
        containers: Container[];
      };
    };
  };
}

interface EnvVarModalState {
  isOpen: boolean;
  containerIndex: number | null;
  envIndex: number | null;
  initialEnv?: {
    name?: string;
    value?: string;
    valueFrom?: {
      secretKeyRef?: {
        name: string;
        key: string;
      };
      configMapKeyRef?: {
        name: string;
        key: string;
      };
    };
  };
}

export default function KubernetesDeploymentFields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const { getNodes, getNode } = useReactFlow();
  const [availableSecrets, setAvailableSecrets] = useState<Node[]>([]);
  const [availableConfigMaps, setAvailableConfigMaps] = useState<Node[]>([]);
  const [envVarModal, setEnvVarModal] = useState<EnvVarModalState>({
    isOpen: false,
    containerIndex: null,
    envIndex: null,
    initialEnv: undefined,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: selectedNode?.data.properties,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "spec.template.spec.containers",
  });

  // Find connected secret nodes in the graph
  useEffect(() => {
    if (selectedNode?.data.connections) {
      const connectedSecretNodes: Node[] = selectedNode.data.connections
        .map((connectionId: string) => getNode(connectionId))
        .filter(
          (node): node is Node =>
            node !== undefined && node.data?.label === "Secret"
        );
      setAvailableSecrets(connectedSecretNodes);

      const connectedConfigNodes: Node[] = selectedNode.data.connections
        .map((connectionId: string) => getNode(connectionId))
        .filter(
          (node): node is Node =>
            node !== undefined && node.data?.label === "ConfigMap"
        );
      setAvailableConfigMaps(connectedConfigNodes);
    } else {
      setAvailableSecrets([]);
      setAvailableConfigMaps([]);
    }
  }, [selectedNode?.data.connections, getNode]);

  // Update form when selected node changes
  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset(selectedNode.data.properties);
    }
  }, [selectedNode, reset]);

  const onSubmit = (values: FormValues) => {
    if (!selectedNode) return;

    const connections = selectedNode.data?.connections || [];

    const updatedData = {
      ...selectedNode.data,
      properties: values,
      connections: connections,
    };

    onNodeUpdate(selectedNode.id, updatedData);

    // Resolve connected services
    if (Array.isArray(connections) && connections.length) {
      connections.forEach((connectionId: string) => {
        const targetNode = getNode(connectionId);
        if (targetNode?.type === "service") {
          resolveServiceToDeployment(
            targetNode,
            {
              ...selectedNode,
              data: updatedData,
            },
            onNodeUpdate
          );
        }
      });
    }
  };

  const openEnvVarModal = (containerIndex: number, envIndex: number | null) => {
    const currentEnv = watch(
      `spec.template.spec.containers.${containerIndex}.env.${envIndex}`
    );
    setEnvVarModal({
      isOpen: true,
      containerIndex,
      envIndex,
      initialEnv: currentEnv,
    });
  };

  const closeEnvVarModal = () => {
    setEnvVarModal({
      isOpen: false,
      containerIndex: null,
      envIndex: null,
      initialEnv: undefined,
    });
  };
  const handleSaveEnvVar = (
    containerIndex: number,
    envIndex: number | null,
    name: string,
    value?: string,
    secretName?: string,
    secretKey?: string,
    configMapName?: string,
    configMapKey?: string
  ) => {
    console.log("Saving env vars");
    console.log(configMapName, configMapKey);
    const containers = [...watch(`spec.template.spec.containers`)];
    if (envIndex !== null) {
      const currentEnv = containers[containerIndex].env![envIndex];
      if (secretName && secretKey) {
        containers[containerIndex].env![envIndex] = {
          name,
          valueFrom: { secretKeyRef: { name: secretName, key: secretKey } },
        };
        delete containers[containerIndex].env![envIndex].value;
        delete containers[containerIndex].env![envIndex].valueFrom
          ?.configMapKeyRef;
      } else if (configMapName && configMapKey) {
        containers[containerIndex].env![envIndex] = {
          name,
          valueFrom: {
            configMapKeyRef: { name: configMapName, key: configMapKey },
          },
        };
        delete containers[containerIndex].env![envIndex].value;
        delete containers[containerIndex].env![envIndex].valueFrom
          ?.secretKeyRef;
      } else if (value !== undefined) {
        containers[containerIndex].env![envIndex] = { name, value };
        delete containers[containerIndex].env![envIndex].valueFrom;
      } else {
        // If no value or source is selected during edit, retain the existing name
        containers[containerIndex].env![envIndex] = { ...currentEnv, name };
        delete containers[containerIndex].env![envIndex].value;
        delete containers[containerIndex].env![envIndex].valueFrom;
      }
    } else {
      const newEnv: {
        name: string;
        value?: string;
        valueFrom?: {
          secretKeyRef?: { name: string; key: string };
          configMapKeyRef?: { name: string; key: string };
        };
      } = { name };
      if (secretName && secretKey) {
        newEnv.valueFrom = {
          secretKeyRef: { name: secretName, key: secretKey },
        };
      } else if (configMapName && configMapKey) {
        newEnv.valueFrom = {
          configMapKeyRef: { name: configMapName, key: configMapKey },
        };
      } else if (value !== undefined) {
        newEnv.value = value;
      }
      if (!containers[containerIndex].env) {
        containers[containerIndex].env = [];
      }
      containers[containerIndex].env!.push(newEnv);
    }
    setValue(`spec.template.spec.containers`, containers);
    closeEnvVarModal();
  };
  const addEnvVar = (containerIndex: number) => {
    openEnvVarModal(containerIndex, null);
  };

  const removeEnvVar = (containerIndex: number, envIndex: number) => {
    const containers = [...watch(`spec.template.spec.containers`)];
    containers[containerIndex].env?.splice(envIndex, 1);
    setValue(`spec.template.spec.containers`, containers);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Deployment Name */}
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="name">Deployment Name</Label>
        <Input
          id="name"
          {...register("metadata.name")}
          placeholder="nginx-deployment"
        />
      </div>

      {/* Deployment Labels */}
      <div className="grid w-full items-center gap-1.5">
        <Label>Deployment Labels</Label>
        <Input {...register("metadata.labels.app")} placeholder="nginx" />
      </div>

      {/* Replicas */}
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="replicas">Replicas</Label>
        <Input
          id="replicas"
          type="number"
          {...register("spec.replicas", {
            valueAsNumber: true,
            min: 1,
          })}
          placeholder="3"
        />
      </div>

      {/* Match Labels (Deployment Selector) */}
      <div className="grid w-full items-center gap-1.5">
        <Label>Match Labels (Deployment Selector)</Label>
        <Input
          {...register("spec.selector.matchLabels.app")}
          placeholder="nginx"
        />
      </div>

      {/* Pod Template Labels */}
      <div className="grid w-full items-center gap-1.5">
        <Label>Template Labels (Pod Labels)</Label>
        <Input
          {...register("spec.template.metadata.labels.app")}
          placeholder="nginx"
        />
      </div>

      {/* Containers */}
      <h3 className="text-md font-semibold pt-2">Containers</h3>
      {fields.map((field, containerIndex) => (
        <div key={field.id} className="space-y-2 border p-3 rounded">
          <div className="grid gap-1.5">
            <Label>Container Name</Label>

            <Input
              {...register(
                `spec.template.spec.containers.${containerIndex}.name`
              )}
              placeholder="nginx-container"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Image</Label>

            <Input
              {...register(
                `spec.template.spec.containers.${containerIndex}.image`
              )}
              placeholder="nginx:latest"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Container Port</Label>

            <Input
              type="number"
              {...register(
                `spec.template.spec.containers.${containerIndex}.ports[0].containerPort`,

                { valueAsNumber: true }
              )}
              placeholder="80"
            />
          </div>

          {/* Environment Variables */}
          <div className="mt-4">
            <Label>Environment Variables</Label>
            {watch(`spec.template.spec.containers.${containerIndex}.env`)?.map(
              (env, envIndex) => (
                <div
                  key={envIndex}
                  className="grid grid-cols-12 gap-2 items-center mb-2"
                >
                  <div className="col-span-5">
                    <Input value={env.name} readOnly />
                  </div>
                  <div className="col-span-5 text-sm text-muted-foreground">
                    {env.valueFrom?.secretKeyRef
                      ? `From Secret: ${env.valueFrom.secretKeyRef.name} (${env.valueFrom.secretKeyRef.key})`
                      : env.value
                      ? `Value: ${env.value}`
                      : env.valueFrom?.configMapKeyRef
                      ? `From ConfigMap: ${env.valueFrom.configMapKeyRef.name} (${env.valueFrom.configMapKeyRef.key})`
                      : "Not set"}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEnvVarModal(containerIndex, envIndex)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEnvVar(containerIndex, envIndex)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => addEnvVar(containerIndex)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Environment Variable
            </Button>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => remove(containerIndex)}
            className="mt-2"
          >
            Remove Container
          </Button>
        </div>
      ))}

      {/* Add Container Button */}
      <Button
        type="button"
        onClick={() =>
          append({ name: "", image: "", containerPort: undefined, env: [] })
        }
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Container
      </Button>

      {/* Save Button */}
      <Button type="submit" className="w-full mt-4">
        Save Deployment
      </Button>

      {/* Environment Variable Modal */}
      <Dialog open={envVarModal.isOpen} onOpenChange={closeEnvVarModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {envVarModal.envIndex !== null
                ? "Edit Environment Variable"
                : "Add Environment Variable"}
            </DialogTitle>
            <DialogDescription>
              Configure the environment variable details.
            </DialogDescription>
          </DialogHeader>
          <EnvVarForm
            availableSecrets={availableSecrets}
            availableConfigMaps={availableConfigMaps}
            initialEnv={envVarModal.initialEnv}
            onSave={(
              name,
              value,
              secretName,
              secretKey,
              configMapName,
              configMapKey
            ) => {
              if (
                envVarModal.containerIndex !== null &&
                envVarModal.envIndex !== null
              ) {
                handleSaveEnvVar(
                  envVarModal.containerIndex,
                  envVarModal.envIndex,
                  name,
                  value,
                  secretName,
                  secretKey,
                  configMapName,
                  configMapKey
                );
              } else if (envVarModal.containerIndex !== null) {
                handleSaveEnvVar(
                  envVarModal.containerIndex,
                  null,
                  name,
                  value,
                  secretName,
                  secretKey,
                  configMapName,
                  configMapKey
                );
              }
            }}
            onClose={closeEnvVarModal}
          />
        </DialogContent>
      </Dialog>
    </form>
  );
}

interface EnvVarFormProps {
  availableSecrets: Node[];
  availableConfigMaps: Node[];
  initialEnv?: {
    name?: string;
    value?: string;
    valueFrom?: {
      secretKeyRef?: {
        name: string;
        key: string;
      };
      configKeyRef?: {
        name: string;
        key: string;
      };
    };
  };
  onSave: (
    name: string,
    value?: string,
    secretName?: string,
    secretKey?: string,
    configMapName?: string,
    configMapKey?: string
  ) => void;
  onClose: () => void;
}
const EnvVarForm: React.FC<EnvVarFormProps> = ({
  availableSecrets,
  availableConfigMaps,
  initialEnv,
  onSave,
  onClose,
}) => {
  const [sourceType, setSourceType] = useState<
    "value" | "secret" | "configMap"
  >(
    initialEnv?.valueFrom?.secretKeyRef
      ? "secret"
      : initialEnv?.valueFrom?.configMapKeyRef
      ? "configMap"
      : "value"
  );
  const [name, setName] = useState(initialEnv?.name || "");
  const [value, setValue] = useState(initialEnv?.value || "");
  const [secretName, setSecretName] = useState(
    initialEnv?.valueFrom?.secretKeyRef?.name || ""
  );
  const [secretKey, setSecretKey] = useState(
    initialEnv?.valueFrom?.secretKeyRef?.key || ""
  );
  const [configMapName, setConfigMapName] = useState(
    initialEnv?.valueFrom?.configMapKeyRef?.name || ""
  );
  const [configMapKey, setConfigMapKey] = useState(
    initialEnv?.valueFrom?.configMapKeyRef?.key || ""
  );

  useEffect(() => {
    setSourceType(
      initialEnv?.valueFrom?.secretKeyRef
        ? "secret"
        : initialEnv?.valueFrom?.configMapKeyRef
        ? "configMap"
        : "value"
    );
    setName(initialEnv?.name || "");
    setValue(initialEnv?.value || "");
    setSecretName(initialEnv?.valueFrom?.secretKeyRef?.name || "");
    setSecretKey(initialEnv?.valueFrom?.secretKeyRef?.key || "");
    setConfigMapName(initialEnv?.valueFrom?.configMapKeyRef?.name || "");
    setConfigMapKey(initialEnv?.valueFrom?.configMapKeyRef?.key || "");
  }, [initialEnv]);

  return (
    <div className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="env-name">Key Name</Label>
        <Input
          id="env-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Environment Variable Name"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Label htmlFor="value-source">Value Source</Label>
        <Select value={sourceType} onValueChange={setSourceType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="value">Value</SelectItem>
            <SelectItem value="secret">Secret</SelectItem>
            <SelectItem value="configMap">ConfigMap</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sourceType === "value" && (
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="env-value">Value</Label>
          <Input
            id="env-value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Environment Variable Value"
          />
        </div>
      )}

      {sourceType === "secret" && (
        <div className="space-y-2">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="secret-name">Secret Service Name</Label>
            <Select value={secretName} onValueChange={setSecretName}>
              <SelectTrigger>
                <SelectValue placeholder="Select a Secret Service" />
              </SelectTrigger>
              <SelectContent>
                {availableSecrets.map((secret) => {
                  const name = secret.data.properties?.metadata?.name;
                  if (!name) return null;

                  console.log("Sms", secret); // this will still log as expected

                  return (
                    <SelectItem key={secret.id} value={name}>
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {secretName && (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="secret-key">Secret Key</Label>
              <Select value={secretKey} onValueChange={setSecretKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Key" />
                </SelectTrigger>
                <SelectContent>
                  {availableSecrets.find(
                    (secret) =>
                      secret.data?.properties?.metadata?.name === secretName
                  )?.data?.properties?.data &&
                    Object.keys(
                      availableSecrets.find(
                        (secret) =>
                          secret.data?.properties?.metadata?.name === secretName
                      )?.data?.properties?.data || {}
                    ).map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {sourceType === "configMap" && (
        <div className="space-y-2">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="configmap-name">ConfigMap Name</Label>
            <Select value={configMapName} onValueChange={setConfigMapName}>
              <SelectTrigger>
                <SelectValue placeholder="Select a ConfigMap" />
              </SelectTrigger>
              <SelectContent>
                {availableConfigMaps.map((configMap) => {
                  const name = configMap.data.properties?.metadata?.name;
                  if (!name) return null;

                  return (
                    <SelectItem key={configMap.id} value={name}>
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {configMapName && (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="configmap-key">ConfigMap Key</Label>
              <Select value={configMapKey} onValueChange={setConfigMapKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Key" />
                </SelectTrigger>
                <SelectContent>
                  {availableConfigMaps.find(
                    (configMap) =>
                      configMap.data?.properties?.metadata?.name ===
                      configMapName
                  )?.data?.properties?.data &&
                    Object.keys(
                      availableConfigMaps.find(
                        (configMap) =>
                          configMap.data?.properties?.metadata?.name ===
                          configMapName
                      )?.data?.properties?.data || {}
                    ).map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => {
            onSave(
              name,
              sourceType === "value" ? value : undefined,
              sourceType === "secret" ? secretName : undefined,
              sourceType === "secret" ? secretKey : undefined,
              sourceType === "configMap" ? configMapName : undefined,
              sourceType === "configMap" ? configMapKey : undefined
            );
          }}
        >
          Save
        </Button>
      </DialogFooter>
    </div>
  );
};
