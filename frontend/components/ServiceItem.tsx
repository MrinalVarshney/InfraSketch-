"use client";
import { cn } from "@/lib/utils";
import { ServiceType } from "@/types/service";
import {
  Server,
  Database,
  Cloud,
  Box,
  CircuitBoard,
  Laptop,
} from "lucide-react";
import { useState } from "react";

interface ServiceItemProps {
  label: string;
  type: ServiceType;
  provider: string;
  rawLabel?: string;
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string
  ) => void;
}

const serviceIcons = {
  compute: Server,
  storage: Database,
  database: Database,
  network: Cloud,
  container: Box,
  kubernetes: CircuitBoard,
};

export default function ServiceItem({
  label,
  type,
  provider,
  rawLabel,
  onDragStart,
}: ServiceItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const Icon = serviceIcons[type as keyof typeof serviceIcons] || Laptop;

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    onDragStart(event, JSON.stringify({ label, type, provider, rawLabel }));

    // Create a drag image
    const dragImage = document.createElement("div");
    dragImage.classList.add("service-drag-preview");
    dragImage.innerHTML = `<div class="flex items-center gap-2 p-2 bg-card rounded-md shadow-md border"><span>${label}</span></div>`;
    document.body.appendChild(dragImage);
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";

    // Set the drag image
    if (event.dataTransfer.setDragImage) {
      event.dataTransfer.setDragImage(dragImage, 20, 20);
    }

    // Clean up the drag image after a delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={cn(
        "service-item flex items-center gap-2 px-3 py-2 rounded-md cursor-grab",
        "border transition-all duration-150",
        "hover:bg-accent/50 hover:border-accent",
        isDragging ? "opacity-50 border-primary" : "border-transparent"
      )}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      draggable
    >
      <Icon
        size={16}
        className={cn(
          provider === "aws" && "text-[hsl(var(--aws))]",
          provider === "gcp" && "text-[hsl(var(--gcp))]",
          provider === "azure" && "text-[hsl(var(--azure))]",
          provider === "docker" && "text-[hsl(var(--docker))]",
          provider === "kubernetes" && "text-[hsl(var(--kubernetes))]"
        )}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
