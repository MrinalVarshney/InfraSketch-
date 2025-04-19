"use client";
import { useState, useEffect, useRef } from "react";
import { NodeResizer } from "@xyflow/react";
import TextareaAutosize from "react-textarea-autosize";

interface TextNodeProps {
  data: {
    text: string;
  };
  selected: boolean;
  id: string;
  isConnectable: boolean;
}

export default function TextNode({ data, selected, id }: TextNodeProps) {
  const [text, setText] = useState(data.text || "Text Node");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (selected && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selected]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // This would typically update the node data in the parent component
    // but for now we're just updating the local state
  };

  return (
    <div className={`text-node ${selected ? "selected" : ""}`}>
      <NodeResizer
        minWidth={50}
        minHeight={30}
        isVisible={selected}
        lineClassName="border-primary/30"
        handleClassName="bg-background border-primary"
      />
      <TextareaAutosize
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        className="text-node-input"
        placeholder="Enter text..."
        minRows={1}
      />
    </div>
  );
}
