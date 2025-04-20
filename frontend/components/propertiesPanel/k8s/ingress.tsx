import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
  nodes: Node[];
}

interface ServicePort {
  port: number;
  targetPort?: number | string;
  name?: string;
}

interface AvailableService {
  name: string;
  ports: ServicePort[];
}

interface PathBackend {
  service: {
    name: string;
    port: number;
  };
}

interface PathRule {
  path: string;
  pathType: "Prefix" | "Exact" | "ImplementationSpecific";
  backend: PathBackend;
}

interface HttpRule {
  host?: string;
  http: {
    paths: PathRule[];
  };
}

interface TlsRule {
  hosts: string[];
  secretName?: string;
}

interface FormValues {
  provider: "kubernetes";
  type: "ingress";
  id: string;
  metadata: {
    name: string;
    annotations?: {
      [key: string]: string;
      "kubernetes.io/ingress.class"?: string;
      "nginx.ingress.kubernetes.io/rewrite-target"?: string;
    };
  };
  spec: {
    ingressClassName?: string;
    tls?: TlsRule[];
    rules: HttpRule[];
  };
}

const RuleItem = ({
  control,
  ruleIndex,
  onRemove,
  onEdit,
  validServices,
  getServicePorts,
  errors,
  setValue,
  watch,
}: {
  control: any;
  ruleIndex: number;
  onRemove: () => void;
  onEdit: () => void;
  validServices: AvailableService[];
  getServicePorts: (name: string) => ServicePort[];
  errors: any;
  setValue: any;
  watch: any;
}) => {
  const {
    fields: pathFields,
    append: appendPath,
    remove: removePath,
  } = useFieldArray({
    control,
    name: `spec.rules.${ruleIndex}.http.paths`,
  });

  return (
    <div className="border p-4 rounded space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Rule {ruleIndex + 1}</h4>
        <div className="space-x-2">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onRemove}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label>Host</Label>
        <Controller
          name={`spec.rules.${ruleIndex}.host`}
          control={control}
          render={({ field }) => <Input {...field} placeholder="example.com" />}
        />
        {errors.spec?.rules?.[ruleIndex]?.host && (
          <span className="text-red-500 text-sm">
            {errors.spec.rules[ruleIndex].host.message}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h5 className="text-sm font-medium">Paths</h5>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              appendPath({
                path: "/",
                pathType: "Prefix",
                backend: {
                  service: { name: "", port: { number: 80 } },
                },
              })
            }
          >
            Add Path
          </Button>
        </div>

        {pathFields.map((path, pathIndex) => {
          const serviceName = watch(
            `spec.rules.${ruleIndex}.http.paths.${pathIndex}.backend.service.name`
          );
          const ports = getServicePorts(serviceName);

          return (
            <div key={path.id} className="border p-3 rounded space-y-3">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => removePath(pathIndex)}
                >
                  Remove Path
                </Button>
              </div>

              <div className="grid gap-1.5">
                <Label>Path</Label>
                <Controller
                  name={`spec.rules.${ruleIndex}.http.paths.${pathIndex}.path`}
                  control={control}
                  rules={{
                    required: "Path is required",
                    pattern: {
                      value: /^\/.*$/,
                      message: "Must start with /",
                    },
                  }}
                  render={({ field }) => (
                    <Input {...field} placeholder="/api" />
                  )}
                />
                {errors.spec?.rules?.[ruleIndex]?.http?.paths?.[pathIndex]
                  ?.path && (
                  <span className="text-red-500 text-sm">
                    {
                      errors.spec.rules[ruleIndex].http.paths[pathIndex].path
                        .message
                    }
                  </span>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label>Path Type</Label>
                <Controller
                  name={`spec.rules.${ruleIndex}.http.paths.${pathIndex}.pathType`}
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Prefix">Prefix</SelectItem>
                        <SelectItem value="Exact">Exact</SelectItem>
                        <SelectItem value="ImplementationSpecific">
                          Implementation Specific
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Service</Label>
                <Controller
                  name={`spec.rules.${ruleIndex}.http.paths.${pathIndex}.backend.service.name`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue(
                          `spec.rules.${ruleIndex}.http.paths.${pathIndex}.backend.service.port`,
                          undefined
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {validServices.map((service) => (
                          <SelectItem key={service.name} value={service.name}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Service Port</Label>
                <Controller
                  name={`spec.rules.${ruleIndex}.http.paths.${pathIndex}.backend.service.port`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select port" />
                      </SelectTrigger>
                      <SelectContent>
                        {ports.map((port) => (
                          <SelectItem
                            key={port.port}
                            value={port.port.toString()}
                          >
                            {port.name || port.port}
                            {port.targetPort && ` → ${port.targetPort}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function KubernetesIngressFields({
  selectedNode,
  onNodeUpdate,
  nodes,
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
      provider: "kubernetes",
      type: "ingress",
      id: "",
      metadata: { name: "" },
      spec: { rules: [] },
    },
  });

  const { getNode } = useReactFlow();
  const [availableServices, setAvailableServices] = useState<
    AvailableService[]
  >([]);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [currentRule, setCurrentRule] = useState<HttpRule | null>(null);

  const {
    fields: ruleFields,
    append: appendRule,
    remove: removeRule,
    update: updateRule,
  } = useFieldArray({
    control,
    name: "spec.rules",
  });

  const {
    fields: tlsFields,
    append: appendTls,
    remove: removeTls,
  } = useFieldArray({
    control,
    name: "spec.tls",
  });

  useEffect(() => {
    if (selectedNode?.data.connections) {
      const connectedServiceNodes = selectedNode.data.connections
        .map((connectionId: string) => getNode(connectionId))
        .filter((node) => node?.data?.label === "Service")
        .map((node) => ({
          name: node.data?.properties?.metadata?.name || "",
          ports: node.data?.properties?.spec?.ports || [],
        }))
        .filter((service) => service.name.trim() !== "");

      setAvailableServices(connectedServiceNodes);
    }
  }, [selectedNode?.data.connections, getNode]);

  useEffect(() => {
    if (selectedNode?.data.properties) {
      reset({
        provider: "kubernetes",
        type: "ingress",
        id: "",
        ...selectedNode.data.properties,
      });
    }
  }, [selectedNode, reset]);

  const onSubmit = (values: FormValues) => {
    // console.log("Form submitted", values);
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, {
        ...selectedNode.data,
        properties: values,
      });
    }
  };

  const ingressClass = watch(
    "metadata.annotations.kubernetes.io/ingress.class"
  );
  const validServices = availableServices.filter(
    (service) => service.name && service.name.trim() !== ""
  );

  const getServicePorts = (serviceName: string) => {
    return availableServices.find((s) => s.name === serviceName)?.ports || [];
  };

  const handleOpenRuleModal = (ruleIndex?: number) => {
    if (typeof ruleIndex === "number") {
      setEditingRuleIndex(ruleIndex);
      setCurrentRule(ruleFields[ruleIndex]);
    } else {
      setEditingRuleIndex(null);
      setCurrentRule({
        http: {
          paths: [
            {
              path: "/",
              pathType: "Prefix",
              backend: { service: { name: "", port: { number: 80 } } },
            },
          ],
        },
      });
    }
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = () => {
    if (currentRule) {
      if (typeof editingRuleIndex === "number") {
        updateRule(editingRuleIndex, currentRule);
      } else {
        appendRule(currentRule);
      }
    }
    setIsRuleModalOpen(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-1.5">
        <Label>Name</Label>
        <Input
          {...register("metadata.name", {
            required: "Name is required",
            pattern: {
              value: /^[a-z0-9-]+$/,
              message: "Lowercase alphanumeric with hyphens only",
            },
            maxLength: { value: 63, message: "Max 63 characters" },
          })}
          placeholder="my-ingress"
        />
        {errors.metadata?.name && (
          <span className="text-red-500 text-sm">
            {errors.metadata.name.message}
          </span>
        )}
      </div>

      {/* <div className="grid gap-1.5">
        <Label>Ingress Class</Label>
        <Controller
          name="metadata.annotations.kubernetes.io/ingress.class"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select ingress class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nginx">NGINX</SelectItem>
                <SelectItem value="traefik">Traefik</SelectItem>
                <SelectItem value="alb">ALB</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div> */}

      {/* {ingressClass === "nginx" && (
        <div className="grid gap-1.5">
          <Label>Rewrite Target</Label>
          <Input
            {...register(
              "metadata.annotations.nginx.ingress.kubernetes.io/rewrite-target",
              { required: "Required for NGINX ingress" }
            )}
            placeholder="/$1"
          />
          {errors.metadata?.annotations?.[
            "nginx.ingress.kubernetes.io/rewrite-target"
          ] && (
            <span className="text-red-500 text-sm">
              {
                errors.metadata.annotations[
                  "nginx.ingress.kubernetes.io/rewrite-target"
                ].message
              }
            </span>
          )}
        </div>
      )} */}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">TLS Configurations</h3>
          <Button
            type="button"
            onClick={() => appendTls({ hosts: [], secretName: "" })}
            variant="secondary"
          >
            Add TLS
          </Button>
        </div>

        {tlsFields.map((tls, index) => (
          <div key={tls.id} className="border p-4 rounded space-y-3">
            <div className="grid gap-1.5">
              <Label>Secret Name</Label>
              <Input
                {...register(`spec.tls.${index}.secretName`, {
                  pattern: {
                    value: /^[a-z0-9-]+$/,
                    message: "Must be lowercase alphanumeric with hyphens",
                  },
                })}
                placeholder="tls-secret"
              />
              {errors.spec?.tls?.[index]?.secretName && (
                <span className="text-red-500 text-sm">
                  {errors.spec.tls[index].secretName.message}
                </span>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label>Hosts</Label>
              <Controller
                name={`spec.tls.${index}.hosts`}
                control={control}
                rules={{
                  validate: (value) =>
                    (value && value.length > 0) ||
                    "At least one host is required",
                }}
                render={({ field }) => (
                  <Input
                    value={field.value?.join(", ") || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(",")
                          .map((host) => host.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="example.com, api.example.com"
                  />
                )}
              />
              {errors.spec?.tls?.[index]?.hosts && (
                <span className="text-red-500 text-sm">
                  {errors.spec.tls[index].hosts.message}
                </span>
              )}
            </div>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeTls(index)}
            >
              Remove TLS
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Routing Rules</h3>
          <Button onClick={() => handleOpenRuleModal()}>Add Rule</Button>
        </div>

        {ruleFields.map((rule, ruleIndex) => (
          <RuleItem
            key={rule.id}
            control={control}
            ruleIndex={ruleIndex}
            onRemove={() => removeRule(ruleIndex)}
            onEdit={() => handleOpenRuleModal(ruleIndex)}
            validServices={validServices}
            getServicePorts={getServicePorts}
            errors={errors}
            setValue={setValue}
            watch={watch}
          />
        ))}
      </div>

      <Dialog open={isRuleModalOpen} onOpenChange={setIsRuleModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingRuleIndex !== null ? "Edit Rule" : "Create New Rule"}
            </DialogTitle>
          </DialogHeader>

          {currentRule && (
            <div className="space-y-4">
              <div className="grid gap-1.5">
                <Label>Host</Label>
                <Input
                  value={currentRule.host || ""}
                  onChange={(e) =>
                    setCurrentRule({ ...currentRule, host: e.target.value })
                  }
                  placeholder="example.com"
                />
              </div>

              {currentRule.http.paths.map((path, pathIndex) => (
                <div key={pathIndex} className="border p-3 rounded space-y-3">
                  <div className="grid gap-1.5">
                    <Label>Path</Label>
                    <Input
                      value={path.path}
                      onChange={(e) => {
                        const newPaths = [...currentRule.http.paths];
                        newPaths[pathIndex].path = e.target.value;
                        setCurrentRule({
                          ...currentRule,
                          http: { paths: newPaths },
                        });
                      }}
                      placeholder="/api"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label>Path Type</Label>
                    <Select
                      value={path.pathType}
                      onValueChange={(value) => {
                        const newPaths = [...currentRule.http.paths];
                        newPaths[pathIndex].pathType =
                          value as typeof path.pathType;
                        setCurrentRule({
                          ...currentRule,
                          http: { paths: newPaths },
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Prefix">Prefix</SelectItem>
                        <SelectItem value="Exact">Exact</SelectItem>
                        <SelectItem value="ImplementationSpecific">
                          Implementation Specific
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-1.5">
                    <Label>Service</Label>
                    <Select
                      value={path.backend.service.name}
                      onValueChange={(value) => {
                        const newPaths = [...currentRule.http.paths];
                        newPaths[pathIndex].backend.service.name = value;
                        newPaths[pathIndex].backend.service.port = 80;
                        setCurrentRule({
                          ...currentRule,
                          http: { paths: newPaths },
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {validServices.map((service) => (
                          <SelectItem key={service.name} value={service.name}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-1.5">
                    <Label>Service Port</Label>
                    <Select
                      value={path.backend.service.port.toString()}
                      onValueChange={(value) => {
                        const newPaths = [...currentRule.http.paths];
                        newPaths[pathIndex].backend.service.port =
                          Number(value);
                        setCurrentRule({
                          ...currentRule,
                          http: { paths: newPaths },
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select port" />
                      </SelectTrigger>
                      <SelectContent>
                        {getServicePorts(path.backend.service.name).map(
                          (port) => (
                            <SelectItem
                              key={port.port}
                              value={port.port.toString()}
                            >
                              {port.name || port.port}
                              {port.targetPort && ` → ${port.targetPort}`}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsRuleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRule}>
              {editingRuleIndex !== null ? "Save Changes" : "Create Rule"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button type="submit" className="w-full">
        Save Configuration
      </Button>
    </form>
  );
}
