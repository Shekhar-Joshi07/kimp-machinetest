import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Assignment from "@/lib/models/Assignment";

export async function PATCH(request) {
  try {
    await connectDB();
    const { roleId, permissionId, value } = await request.json();

    if (!roleId || !permissionId || typeof value !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const assignment = await Assignment.findOneAndUpdate(
      { roleId, permissionId },
      { granted: value },
      { upsert: true, new: true }
    );

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Toggle assignment error:", error);
    return NextResponse.json(
      { error: "Failed to toggle", details: error.message },
      { status: 500 }
    );
  }
}
