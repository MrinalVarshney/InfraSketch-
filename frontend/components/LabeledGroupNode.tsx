import { memo } from "react";

import { NodeProps } from "@xyflow/react";
import { GroupNode } from "@/components/labeled-group-node";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { cn } from "@/lib/utils";

const LabeledGroupNode = memo(({ selected, data }: NodeProps) => {
  return (
    <div
      // className={cn(
      //   "service-node border",
      //   `${data.provider}`,
      //   selected && "ring-2 ring-primary"
      // )}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        // position: "absolute",
        minWidth: 100,
        minHeight: 80,
        padding: 0,
      }}
    >
      <NodeResizer
        minWidth={100}
        minHeight={80}
        isVisible={selected}
        lineClassName="border-primary/30"
        handleClassName="bg-background border-primary"
      />
      <GroupNode selected={selected} label="Label" data={data} />;
    </div>
  );
});

export default LabeledGroupNode;
