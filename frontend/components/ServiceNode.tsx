"use client";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { Cloud, Database, Server, Box, CircuitBoard } from "lucide-react";
import { ServiceType } from "@/types/service";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ServiceNodeProps {
  data: {
    label: string;
    type: ServiceType;
    provider: string;
    rawLabel?: string;
    serviceName?: string;
  };
  selected: boolean;
  id: string;
}

const providerIcons = {
  aws: Cloud,
  gcp: Cloud,
  azure: Cloud,
  docker: Box,
  kubernetes: CircuitBoard,
};

const serviceIcons = {
  compute: Server,
  storage: Database,
  database: Database,
  network: Cloud,
  container: Box,
  kubernetes: CircuitBoard,
};

export default function ServiceNode({ data, selected, id }: ServiceNodeProps) {
  const ProviderIcon =
    providerIcons[data.provider as keyof typeof providerIcons] || Cloud;
  const ServiceIcon =
    serviceIcons[data.type as keyof typeof serviceIcons] || Server;

  return (
    <div
      className={cn(
        "service-node border",
        `${data.provider}`,
        selected && "ring-2 ring-primary"
      )}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        // position: "absolute",
        minWidth: 100,
        minHeight: 80,
      }}
    >
      <NodeResizer
        minWidth={100}
        minHeight={80}
        isVisible={selected}
        lineClassName="border-primary/30"
        handleClassName="bg-background border-primary"
      />
      <div className="service-node-header">
        <ProviderIcon
          size={14}
          className={cn(
            data.provider === "aws" && "text-[hsl(var(--aws))]",
            data.provider === "gcp" && "text-[hsl(var(--gcp))]",
            data.provider === "azure" && "text-[hsl(var(--azure))]",
            data.provider === "docker" && "text-[hsl(var(--docker))]",
            data.provider === "kubernetes" && "text-[hsl(var(--kubernetes))]"
          )}
        />
        <span className="text-xs font-medium">{data.label}</span>
      </div>
      <div className="service-node-content flex flex-col items-center">
        <ServiceIcon size={24} className="mb-2" />
        <span className="text-xs font-medium">{data.serviceName}</span>
        <span className="text-xs">{data.type}</span>
      </div>
      <Handle type="target" position={Position.Top} id="1" />
      <Handle type="source" position={Position.Top} id="2" />
      <Handle type="source" position={Position.Bottom} id="3" />
      <Handle type="source" position={Position.Left} id="4" />
      <Handle type="source" position={Position.Right} id="5" />

      <Handle type="target" position={Position.Bottom} id="6" />
      <Handle type="source" position={Position.Top} id="7" />
      <Handle type="source" position={Position.Bottom} id="8" />
      <Handle type="source" position={Position.Left} id="9" />
      <Handle type="source" position={Position.Right} id="10" />

      <Handle type="target" position={Position.Left} id="11" />
      <Handle type="source" position={Position.Top} id="12" />
      <Handle type="source" position={Position.Bottom} id="13" />
      <Handle type="source" position={Position.Left} id="14" />
      <Handle type="source" position={Position.Right} id="15" />

      <Handle type="target" position={Position.Right} id="16" />
      <Handle type="source" position={Position.Top} id="17" />
      <Handle type="source" position={Position.Bottom} id="18" />
      <Handle type="source" position={Position.Left} id="19" />
      <Handle type="source" position={Position.Right} id="20" />
    </div>
  );
}
