import { Node } from "@xyflow/react";

export interface ServiceNodeData {
  label: string;
  type: string;
  provider: string;
  properties: Record<string, any>;
  [key: string]: unknown; // Add index signature to make it compatible with Record<string, unknown>
}

export interface ServiceNode extends Node<ServiceNodeData> {
  // Use generic parameter to specify the data type instead of overriding it
}
