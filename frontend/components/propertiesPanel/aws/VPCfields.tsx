// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Node } from "@xyflow/react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { Switch } from "@/components/ui/switch";
// import { Textarea } from "@/components/ui/textarea";
// import TagsBlock from "../utils/tag";
// import { useState, useEffect } from "react";
// import { TrashIcon } from "@heroicons/react/solid";

// interface PropertiesPanelProps {
//   selectedNode: Node | null;
//   onNodeUpdate: (nodeId: string, data: any) => void;
// }

// interface FormValues {
//   name: string;
//   cidr_block: [{ value: string }];
//   enable_dns_hostnames: boolean;
//   enable_dns_support: boolean;
// }

// export default function VPCfields({
//   selectedNode,
//   onNodeUpdate,
// }: PropertiesPanelProps) {
//   const provider = selectedNode?.data.provider;
//   const { register, handleSubmit, reset, control } = useForm<FormValues>({
//     defaultValues: selectedNode?.data?.properties || {},
//   });

//   const [tags, setTags] = useState([]);
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "cidr_block",
//   });
//   const onSubmit = (data: FormValues) => {
//     const Updated_data = {
//       ...selectedNode?.data,
//       properties: {
//         ...selectedNode?.data?.properties,
//         ...data,
//         tags: tags,
//       },
//     };

//     onNodeUpdate(selectedNode?.id, Updated_data);
//   };

//   useEffect(() => {
//     if (selectedNode?.data.properties) {
//       reset(selectedNode.data.properties);
//       setTags(selectedNode.data.properties.tags || []);
//     }
//   }, [selectedNode, reset]);
//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       <div className="grid w-full items-center gap-1.5">
//         <Label htmlFor="name">Name</Label>
//         <Input id="name" {...register("name")} placeholder="myEIP" />
//       </div>
//       <div className="flex items-center space-x-2">
//         <input
//           type="checkbox"
//           id="enable_dns_support"
//           {...register("enable_dns_support")}
//           className="h-4 w-4 text-blue-600 border-gray-300 rounded"
//         />
//         <label htmlFor="enable_dns_support" className="text-sm">
//           Enable DNS Support
//         </label>
//       </div>

//       <div className="flex items-center space-x-2">
//         <input
//           type="checkbox"
//           id="enable_dns_hostnames"
//           {...register("enable_dns_hostnames")}
//           className="h-4 w-4 text-blue-600 border-gray-300 rounded"
//         />
//         <label htmlFor="enable_dns_hostnames" className="text-sm">
//           Enable DNS Hostnames
//         </label>
//       </div>
//       <div className="grid w-full items-center gap-1.5">
//         <Label htmlFor="cidr_block">CIDR Block</Label>
//         <div className="space-y-2 border p-3 rounded">
//           {fields.map((item, index) => (
//             <div
//               key={index}
//               className="flex gap-3 space-y-2 border p-3 rounded"
//             >
//               <div className="grid gap-1.5 w-full">
//                 <Input
//                   {...register(`routes.cidr_blocks.${index}.value`)}
//                   placeholder="e.g. 0.0.0.0/0"
//                 />
//               </div>
//               <button
//                 type="button"
//                 onClick={() => remove(index)}
//                 className="text-red-500 text-sm hover:underline"
//               >
//                 <TrashIcon className="h-5 w-5" />
//               </button>
//             </div>
//           ))}
//         </div>
//         <button
//           type="button"
//           onClick={() => append({ value: "" })}
//           className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//         >
//           Add CIDR Block
//         </button>
//       </div>
//       <TagsBlock tags={tags} setTags={setTags} />
//       <button
//         type="submit"
//         className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//       >
//         Save Configuration
//       </button>
//     </form>
//   );
// }

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Node } from "@xyflow/react";
import { useForm, useFieldArray } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import TagsBlock from "../utils/tag";
import { useState, useEffect } from "react";
import { TrashIcon } from "@heroicons/react/solid";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

interface FormValues {
  name: string;
  cidr_block: string;
  enable_dns_hostnames: boolean;
  enable_dns_support: boolean;
}

export default function VPCfields({
  selectedNode,
  onNodeUpdate,
}: PropertiesPanelProps) {
  const provider = selectedNode?.data.provider;
  const { register, handleSubmit, reset, control } = useForm<FormValues>({
    defaultValues: selectedNode?.data?.properties || {},
  });

  const [tags, setTags] = useState({});
  const { fields, append, remove } = useFieldArray({
    control,
    name: "cidr_block",
  });
  const onSubmit = (data: FormValues) => {
    const Updated_data = {
      ...selectedNode?.data,
      properties: {
        ...selectedNode?.data?.properties,
        ...data,
        tags: tags,
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
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="myEIP" />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="enable_dns_support"
          {...register("enable_dns_support")}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="enable_dns_support" className="text-sm">
          Enable DNS Support
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="enable_dns_hostnames"
          {...register("enable_dns_hostnames")}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="enable_dns_hostnames" className="text-sm">
          Enable DNS Hostnames
        </label>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="cidr_block">CIDR Block</Label>
        <div className="space-y-2 border p-3 rounded">
          <div className="grid gap-1.5 w-full">
            <Input {...register(`cidr_block`)} placeholder="e.g. 0.0.0.0/0" />
          </div>
        </div>
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
