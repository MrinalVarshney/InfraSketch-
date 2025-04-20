// components/CircleNode.tsx
import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

const CircleNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div
      style={{
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: "#74b9ff",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #0984e3",
      }}
    >
      {data.label}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

export default CircleNode;
