import { NextRequest, NextResponse } from "next/server";
import { DiagramModel } from "@/app/model/diagram";
import mongoose from "mongoose";
import { connectMongoDB } from "@/app/lib/mongoose";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userEmail,
      project_name: diagramName,
      nodes,
      edges,
      elasticIP_association,
    } = body;

    await connectMongoDB();

    const newDiagram = await DiagramModel.create({
      userEmail,
      project_name: diagramName,
      nodes,
      edges,
      elasticIP_association,
    });

    return NextResponse.json({ insertedId: newDiagram._id }, { status: 201 });
  } catch (err) {
    console.error("Error saving diagram:", err);
    return NextResponse.json(
      { error: "Failed to save diagram" },
      { status: 500 }
    );
  }
}
