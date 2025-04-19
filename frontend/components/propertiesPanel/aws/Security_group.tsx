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

interface s_rule {
  protocol: string;
  from_port: number;
  to_port: number;
  cidr_blocks: string[];
  description: string;
}

interface FormValues {
  name: string;
  description: string;
  tags: {};
  refs: {
    vpc: string;
  };
  ingree: s_rule[];
  egress: s_rule[];
}

export default function SecurityGroupFields({
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

  // security groups
  const {
    fields: ingress_fields,
    append: ingress_append,
    remove: ingress_remove,
  } = useFieldArray({
    control,
    name: "ingress",
  });

  const {
    fields: egress_fields,
    append: egress_append,
    remove: egress_remove,
  } = useFieldArray({
    control,
    name: "egress",
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Security Group */}
      {/* <div className="space-y-2 border p-3 rounded"> */}
      {/* <h3 className="text-md font-semibold pt-2">Security Group</h3> */}

      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="eth0" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="e.g. security group for eth0"
        />
      </div>

      {/* Ingress Rules */}
      <div className="space-y-2 border p-3 rounded">
        <h3 className="text-md font-semibold pt-2">Ingress Rules</h3>
        {ingress_fields.map((field, index) => {
          return (
            <div key={field.id} className="space-y-2 border p-3 rounded">
              <div className="grid gap-1.5">
                <Label>Protocol</Label>
                <Input
                  {...register(`ingress.${index}.protocol`)}
                  placeholder="tcp"
                />
              </div>

              <div className="grid gap-1.5">
                <Label>to_Port</Label>
                <Input
                  type="number"
                  {...register(`ingress.${index}.to_port`, {
                    valueAsNumber: true,
                  })}
                  placeholder="22"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>from_Port</Label>
                <Input
                  type="number"
                  {...register(`ingress.${index}.from_port`, {
                    valueAsNumber: true,
                  })}
                  placeholder="22"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>CIDR Blocks</Label>
                <div className="space-y-2 border p-3 rounded">
                  <Controller
                    name={`ingress[${index}].cidr_blocks`}
                    control={control}
                    render={({ field }) => {
                      const cidrBlocks = field.value || []; // Use empty array as fallback
                      return (
                        <>
                          {cidrBlocks.map((cidr, i) => (
                            <div
                              key={i}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="text"
                                value={cidr}
                                onChange={(e) => {
                                  const newCidrs = [...cidrBlocks];
                                  newCidrs[i] = e.target.value;
                                  field.onChange(newCidrs);
                                }}
                                placeholder="e.g. 0.0.0.0/0"
                                className="p-1 w-40 border border-gray-300 rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newCidrs = cidrBlocks.filter(
                                    (_, idx) => idx !== i
                                  );
                                  field.onChange(newCidrs);
                                }}
                                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-700"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => field.onChange([...cidrBlocks, ""])} // Add empty CIDR block
                            className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg"
                          >
                            Add CIDR Block
                          </button>
                        </>
                      );
                    }}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Description</Label>
                <Textarea
                  {...register(`ingress.${index}.description`)}
                  placeholder="SSH access"
                />
              </div>

              <button
                type="button"
                onClick={() => ingress_remove(index)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove ingress rule
              </button>
            </div>
          );
        })}
        {/* Add ingress rule Button */}
        <button
          type="button"
          onClick={() =>
            ingress_append({
              protocol: "",
              from_port: 0,
              to_port: 0,
              cidr_blocks: [],
              description: "",
            })
          }
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add ingress rule
        </button>
      </div>
      {/* Egress Rules */}
      <div className="space-y-2 border p-3 rounded">
        <h3 className="text-md font-semibold pt-2">Egress Rules</h3>
        {egress_fields.map((field, index) => (
          <div key={field.id} className="space-y-2 border p-3 rounded">
            <div className="grid gap-1.5">
              <Label>Protocol</Label>
              <Input
                {...register(`egress.${index}.protocol`)}
                placeholder="tcp"
              />
            </div>

            <div className="grid gap-1.5">
              <Label>to_Port</Label>
              <Input
                type="number"
                {...register(`egress.${index}.to_port`, {
                  valueAsNumber: true,
                })}
                placeholder="22"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>from_Port</Label>
              <Input
                type="number"
                {...register(`egress.${index}.from_port`, {
                  valueAsNumber: true,
                })}
                placeholder="22"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>CIDR Blocks</Label>
              <div className="space-y-2 border p-3 rounded">
                <Controller
                  name={`egress[${index}].cidr_blocks`}
                  control={control}
                  render={({ field }) => {
                    const cidrBlocks = field.value || []; // Use empty array as fallback
                    return (
                      <>
                        {cidrBlocks.map((cidr, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={cidr}
                              onChange={(e) => {
                                const newCidrs = [...cidrBlocks];
                                newCidrs[i] = e.target.value;
                                field.onChange(newCidrs);
                              }}
                              placeholder="e.g. 0.0.0.0/0"
                              className="p-1 w-40 border border-gray-300 rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newCidrs = cidrBlocks.filter(
                                  (_, idx) => idx !== i
                                );
                                field.onChange(newCidrs);
                              }}
                              className="bg-red-500 text-white p-1 rounded-full hover:bg-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => field.onChange([...cidrBlocks, ""])} // Add empty CIDR block
                          className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg"
                        >
                          Add CIDR Block
                        </button>
                      </>
                    );
                  }}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Description</Label>
              <Textarea
                {...register(`egress.${index}.description`)}
                placeholder="SSH access"
              />
            </div>

            <button
              type="button"
              onClick={() => egress_remove(index)}
              className="text-red-500 text-sm hover:underline"
            >
              Remove egress rule
            </button>
          </div>
        ))}
        {/* Add ingress rule Button */}
        <button
          type="button"
          onClick={() =>
            egress_append({
              protocol: "",
              from_port: 0,
              to_port: 0,
              cidr_blocks: [],
              description: "",
            })
          }
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add egress rule
        </button>
        {/* </div> */}
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
