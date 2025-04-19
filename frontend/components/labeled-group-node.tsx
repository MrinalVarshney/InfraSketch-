"use client";
import React, { forwardRef, HTMLAttributes, ReactNode } from "react";
import { NodeProps, Panel, PanelPosition } from "@xyflow/react";
import { BaseNode } from "@/components/base-node";
import { cn } from "@/lib/utils";
import { Cloud, Database, Server, Box, CircuitBoard } from "lucide-react";
import { Handle, Position } from "@xyflow/react";
import { ServiceType } from "@/types/service";

interface ServiceNodeProps {
  data: {
    label: string;
    type: ServiceType;
    provider: string;
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

/* GROUP NODE Label ------------------------------------------------------- */

interface GroupNodeLabelProps {
  data: {
    label: string;
    type: ServiceType;
    provider: string;
  };
  selected: boolean;
  className?: string;
}

export const GroupNodeLabel = forwardRef<HTMLDivElement, GroupNodeLabelProps>(
  ({ data, selected, className, ...props }, ref) => {
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
          // position: "relative",
          minWidth: 100,
          minHeight: 80,
        }}
      >
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
);

GroupNodeLabel.displayName = "GroupNodeLabel";

export type GroupNodeProps = Partial<NodeProps> & {
  label?: ReactNode;
  position?: PanelPosition;
};

/* GROUP NODE -------------------------------------------------------------- */

export const GroupNode = forwardRef<HTMLDivElement, GroupNodeProps>(
  ({ selected, label, position, ...props }, ref) => {
    const getLabelClassName = (position?: PanelPosition) => {
      switch (position) {
        case "top-left":
          return "rounded-br-sm";
        case "top-center":
          return "rounded-b-sm";
        case "top-right":
          return "rounded-bl-sm";
        case "bottom-left":
          return "rounded-tr-sm";
        case "bottom-right":
          return "rounded-tl-sm";
        case "bottom-center":
          return "rounded-t-sm";
        default:
          return "rounded-br-sm";
      }
    };

    return (
      <BaseNode
        ref={ref}
        selected={selected}
        className="h-full overflow-hidden rounded-sm bg-white  p-0"
        {...props}
      >
        <Panel
          className={cn("m-0 p-0")}
          style={{
            width: "100%",
            height: "100%",
            // position: "relative",
            minWidth: 100,
            minHeight: 80,
            margin: 0,
          }}
          // position={position}
        >
          {label && (
            <GroupNodeLabel
              className={getLabelClassName(position)}
              data={
                props.data as {
                  label: string;
                  type: ServiceType;
                  provider: string;
                }
              }
              selected={selected || false}
            />
          )}
        </Panel>
      </BaseNode>
    );
  }
);

GroupNode.displayName = "GroupNode";
