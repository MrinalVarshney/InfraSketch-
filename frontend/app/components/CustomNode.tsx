// components/CustomNode.tsx
import { NodeProps, Handle, Position } from "reactflow";

export default function CustomNode({ id, data }: NodeProps) {
  return (
    <div style={{ padding: 10, border: "1px solid #888", borderRadius: 5 }}>
      <div>{data.label}</div>
      <button
        onClick={data.onDelete}
        style={{
          marginTop: 5,
          background: "#f44",
          color: "#fff",
          border: "none",
          padding: "4px 8px",
          borderRadius: 4,
        }}
      >
        Delete
      </button>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
