// components/ResizableNode.js
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { useCallback, useRef, useState } from "react";

export default function ResizableNode({ data, selected, id }) {
  const nodeRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 150, height: 100 });

  const onResize = useCallback(
    (e) => {
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = dimensions.width;
      const startHeight = dimensions.height;

      const onMouseMove = (e) => {
        const newWidth = Math.max(100, startWidth + (e.clientX - startX));
        const newHeight = Math.max(60, startHeight + (e.clientY - startY));
        setDimensions({ width: newWidth, height: newHeight });
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [dimensions]
  );

  return (
    <>
      <NodeResizer
        minWidth={100}
        minHeight={80}
        isVisible={selected}
        lineClassName="border-primary/30"
        handleClassName="bg-background border-primary"
      />
      <div
        ref={nodeRef}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          border: "2px solid #333",
          borderRadius: 8,
          backgroundColor: "#fff",
          position: "relative",
          padding: 8,
        }}
      >
        <Handle type="target" position={Position.Top} />
        <div>{data.label || "Resizable Service Node"}</div>
        <Handle type="source" position={Position.Bottom} />

        {/* Resize handle */}
        <div
          onMouseDown={onResize}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 12,
            height: 12,
            background: "#666",
            cursor: "nwse-resize",
          }}
        />
      </div>
    </>
  );
}
