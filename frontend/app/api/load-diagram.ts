import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { DiagramModel } from "@/app/model/diagram";
import { connectMongoDB } from "../lib/mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end();

  const { id } = req.query;

  try {
    await connectMongoDB();

    const diagram = await DiagramModel.findById(id).lean();

    if (!diagram) {
      return res.status(404).json({ error: "Diagram not found" });
    }

    return res.status(200).json(diagram);
  } catch (error) {
    console.error("Error loading diagram:", error);
    return res.status(500).json({ error: "Error loading diagram" });
  }
}
