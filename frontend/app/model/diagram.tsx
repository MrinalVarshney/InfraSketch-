import mongoose, { Schema, Document, models, model } from "mongoose";

export interface NodeData {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: any;
  parentNode?: string;
  draggable?: boolean;
  style?: Record<string, any>;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  label?: string;
  style?: Record<string, any>;
  data?: any;
}

export interface ElasticIPAssociation {
  provider: string;
  type: string;
  id: string;
  refs: {
    instance: string;
    eip: string;
  };
  depends_on: Array<{
    type: string;
    id: string;
  }>;
}

export interface DiagramDocument extends Document {
  userEmail: string;
  project_name: string;
  nodes: NodeData[];
  edges: EdgeData[];
  elasticIP_association: ElasticIPAssociation[];
  createdAt: Date;
}

const NodeSchema = new Schema<NodeData>(
  {
    id: String,
    type: String,
    position: {
      x: Number,
      y: Number,
    },
    data: Schema.Types.Mixed,
    parentNode: String,
    draggable: Boolean,
    style: Schema.Types.Mixed,
  },
  { _id: false }
);

const EdgeSchema = new Schema<EdgeData>(
  {
    id: String,
    source: String,
    target: String,
    sourceHandle: String,
    targetHandle: String,
    type: String,
    animated: Boolean,
    label: String,
    style: Schema.Types.Mixed,
    data: Schema.Types.Mixed,
  },
  { _id: false }
);

const ElasticIPAssociationSchema = new Schema<ElasticIPAssociation>(
  {
    provider: String,
    type: String,
    id: String,
    refs: {
      instance: String,
      eip: String,
    },
    depends_on: [
      {
        type: {
          type: String,
        },
        id: String,
      },
    ],
  },
  { _id: false }
);

const DiagramSchema = new Schema<DiagramDocument>({
  userEmail: { type: String, required: true },
  project_name: { type: String, required: true },
  nodes: [NodeSchema],
  edges: [EdgeSchema],
  elasticIP_association: [ElasticIPAssociationSchema],
  createdAt: { type: Date, default: Date.now },
});

// ✅ Export the actual Mongoose model
export const DiagramModel =
  models.Diagram || model<DiagramDocument>("Diagram", DiagramSchema);
