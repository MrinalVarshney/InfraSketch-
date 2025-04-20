// to make the rhombus node
// components/CircleNode.tsx
import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

const CircleNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div
      style={{
        width: 100,
        height: 100,
        background: "#74b9ff",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #0984e3",
        transform: "rotate(45deg)",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
        position: "relative",
        textAlign: "center",
        fontSize: "16px",
        fontWeight: "bold",
        padding: "10px",
        cursor: "pointer",
        userSelect: "none",
        transition: "background 0.3s, transform 0.3s",
      }}
    >
      {data.label}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

export default CircleNode;
