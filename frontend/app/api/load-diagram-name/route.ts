import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/api/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url!);
    const userEmail = searchParams.get("email");
    const diagramname = searchParams.get("name");

    if (!userEmail || !diagramname) {
      return NextResponse.json(
        { error: "Email and diagram name are required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection("diagrams");

    const diagrams = await collection
      .find(
        { userEmail, project_name: diagramname },
        {
          projection: {
            _id: 1,
            project_name: 1,
            nodes: 1,
            edges: 1,
            elasticIP_association: 1,
            createdAt: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(diagrams);
  } catch (err) {
    console.error("Error fetching diagrams:", err);
    return NextResponse.json(
      { error: "Failed to load diagrams" },
      { status: 500 }
    );
  }
}
