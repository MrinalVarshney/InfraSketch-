import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Node, useReactFlow } from "@xyflow/react";
import {
  useForm,
  useFieldArray,
  useWatch,
  useFormContext,
  Controller,
} from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import TagsBlock from "../utils/tag";
import { useState, useEffect } from "react";
import { TrashIcon } from "@heroicons/react/solid";
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

interface DefaultAction {
  type: "forward" | "redirect" | "fixed-response";
  target_group_arn?: string;
  // Add more properties for redirect and fixed-response if needed
}

interface Rule {
  path_pattern?: string;
  target_group_name?: string;
  // Add more rule properties as needed
}

interface Listener {
  id: string; // Add an ID for each listener
  port: number;
  protocol: "HTTP" | "HTTPS" | "TCP" | "TLS" | "UDP" | "TCP_UDP";
  certificate_arn?: string;
  default_action: DefaultAction[];
  rules?: Rule[];
}

interface FormValues {
  name: string;
  load_balancer_type: "application" | "network" | "gateway";
  internal: boolean;
  enable_deletion_protection: boolean;
  refs: {
    security_groups: { value: string }[];
    subnets: { value: string }[];
    listeners: Listener[];
  };
}

export default function LoadBalancerFields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const { register, handleSubmit, reset, control, watch, setValue } =
    useForm<FormValues>({
      defaultValues: selectedNode?.data?.properties || {
        load_balancer_type: "application",
        internal: false,
        enable_deletion_protection: false,
        refs: {
          subnets: [{ value: "" }],
          security_groups: [{ value: "" }],
          listeners: [
            {
              id: crypto.randomUUID(), // Generate a unique ID for the initial listener
              port: 80,
              protocol: "HTTP",
              default_action: [{ type: "forward", target_group_name: "" }],
              rules: [],
            },
          ],
        },
      },
    });
  const { getNode } = useReactFlow();
  const [availableTargetGroups, setAvailableTargetGroups] = useState<
    {
      name: string;
      arn: string;
      id: string;
    }[]
  >([]);
  const [tags, setTags] = useState<{ [key: string]: string }>({});

  const {
    fields: listenerFields,
    append: appendListener,
    remove: removeListener,
  } = useFieldArray({
    control,
    name: "refs.listeners",
  });

  useEffect(() => {
    if (selectedNode?.data.connections) {
      const connectedTargetGroupNodes: Node[] = selectedNode.data.connections
        .map((connectionId: string) => getNode(connectionId))
        .filter(
          (node): node is Node =>
            node !== undefined && node.data?.label === "TargetGroup"
        );

      const connectedTargetGroups = connectedTargetGroupNodes.map((node) => ({
        name: node.data.properties?.name || "",
        id: node.data.id,
      }));

      setAvailableTargetGroups(connectedTargetGroups);
    } else {
      setAvailableTargetGroups([]);
    }
  }, [selectedNode?.data.connections, getNode]);
  console.log(availableTargetGroups);
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
        <Input id="name" {...register("name")} placeholder="my-load-balancer" />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="load_balancer_type">Load Balancer Type</Label>
        <Controller
          name="load_balancer_type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="application">Application</SelectItem>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="gateway">Gateway</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="internal" {...register("internal")} />
        <Label htmlFor="internal">Internal</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enable_deletion_protection"
          {...register("enable_deletion_protection")}
        />
        <Label htmlFor="enable_deletion_protection">
          Enable Deletion Protection
        </Label>
      </div>

      <Label>Listeners</Label>
      <div className="space-y-2 border p-3 rounded">
        {listenerFields.map((listener, listenerIndex) => (
          <div key={listener.id} className="space-y-2 border p-3 rounded">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">
                Listener {listenerIndex + 1}
              </h3>
              <button
                type="button"
                onClick={() => removeListener(listenerIndex)}
                className="text-red-500 hover:underline text-xs"
              >
                Remove
              </button>
            </div>

            {/* Port Input */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor={`refs.listeners.${listenerIndex}.port`}>
                Port
              </Label>
              <Input
                id={`refs.listeners.${listenerIndex}.port`}
                type="number"
                {...register(`refs.listeners.${listenerIndex}.port`, {
                  valueAsNumber: true,
                })}
                placeholder="80"
              />
            </div>

            {/* Protocol Input */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor={`refs.listeners.${listenerIndex}.protocol`}>
                Protocol
              </Label>
              <Controller
                name={`refs.listeners.${listenerIndex}.protocol`}
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
                )}
              />
            </div>

            {/* Default Action */}
            <div>
              <Label>Default Action</Label>
              <div className="space-y-2 border p-3 rounded">
                {listener.default_action?.map((action, actionIndex) => (
                  <div key={actionIndex} className="space-y-2">
                    <h4 className="text-xs font-semibold">
                      Action {actionIndex + 1}
                    </h4>
                    <div className="grid w-full items-center gap-1.5">
                      <Label
                        htmlFor={`refs.listeners.${listenerIndex}.default_action.${actionIndex}.type`}
                      >
                        Type
                      </Label>
                      <Controller
                        name={`refs.listeners.${listenerIndex}.default_action.${actionIndex}.type`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Action Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="forward">Forward</SelectItem>
                              <SelectItem value="redirect">Redirect</SelectItem>
                              <SelectItem value="fixed-response">
                                Fixed Response
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {watch(
                      `refs.listeners.${listenerIndex}.default_action.${actionIndex}.type`
                    ) === "forward" && (
                      <div className="grid w-full items-center gap-1.5">
                        <Label
                          htmlFor={`refs.listeners.${listenerIndex}.default_action.${actionIndex}.target_group_arn`}
                        >
                          Target Group
                        </Label>
                        <Controller
                          name={`refs.listeners.${listenerIndex}.default_action.${actionIndex}.target_group_arn`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Target Group" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTargetGroups?.map((tg) => {
                                  if (!tg.arn) return null;
                                  return (
                                    <SelectItem key={tg.id} value={tg.arn}>
                                      {tg.name}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    )}
                    {/* Add more fields for redirect and fixed-response if needed */}
                  </div>
                ))}
                {/* Consider adding a button to add more default actions if needed */}
              </div>
            </div>

            {/* Rules */}
            <div>
              <Label>Rules</Label>
              <div className="space-y-2 border p-3 rounded">
                <Controller
                  name={`refs.listeners.${listenerIndex}.rules`}
                  control={control}
                  render={({ field }) => {
                    const rules = field.value || [];

                    const handleRuleChange = (
                      index: number,
                      key: "path_pattern" | "target_group_arn",
                      value: string
                    ) => {
                      const updated = [...rules];
                      updated[index] = {
                        ...updated[index],
                        [key]: value,
                      };
                      field.onChange(updated);
                    };

                    const handleAddRule = () => {
                      field.onChange([
                        ...rules,
                        { path_pattern: "", target_group_arn: "" },
                      ]);
                    };

                    const handleRemoveRule = (index: number) => {
                      const updated = rules.filter((_, i) => i !== index);
                      field.onChange(updated);
                    };

                    return (
                      <>
                        {rules.map((rule, ruleIndex) => (
                          <div
                            key={ruleIndex}
                            className="grid grid-cols-1 md:grid-cols-2 gap-3 border p-3 rounded-md mb-2"
                          >
                            <div>
                              <Label
                                htmlFor={`refs.listeners.${listenerIndex}.rules.${ruleIndex}.path_pattern`}
                              >
                                Path Pattern
                              </Label>
                              <Input
                                id={`refs.listeners.${listenerIndex}.rules.${ruleIndex}.path_pattern`}
                                value={rule.path_pattern}
                                onChange={(e) =>
                                  handleRuleChange(
                                    ruleIndex,
                                    "path_pattern",
                                    e.target.value
                                  )
                                }
                                placeholder="/api/*"
                              />
                            </div>

                            <div>
                              <Label
                                htmlFor={`refs.listeners.${listenerIndex}.rules.${ruleIndex}.target_group_arn`}
                              >
                                Target Group
                              </Label>
                              <Controller
                                name={`refs.listeners.${listenerIndex}.rules.${ruleIndex}.target_group_arn`}
                                control={control}
                                render={({ field: ruleField }) => (
                                  <Select
                                    onValueChange={ruleField.onChange}
                                    value={ruleField.value}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select Target Group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableTargetGroups?.map((tg) => {
                                        if (!tg.arn) return null;
                                        return (
                                          <SelectItem
                                            key={tg.id}
                                            value={tg.arn}
                                          >
                                            {tg.name}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            </div>

                            <div className="col-span-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveRule(ruleIndex)}
                                className="text-red-500 text-sm hover:underline"
                              >
                                Remove Rule
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={handleAddRule}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                        >
                          Add Rule
                        </button>
                      </>
                    );
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            appendListener({
              id: crypto.randomUUID(), // Generate a unique ID for new listeners
              port: 80,
              protocol: "HTTP",
              default_action: [{ type: "forward", target_group_name: "" }],
              rules: [],
            })
          }
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
        >
          Add Listener
        </button>
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
