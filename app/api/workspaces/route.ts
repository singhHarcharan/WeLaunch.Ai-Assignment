import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Workspace from "@/lib/models/Workspace";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const workspaces = await Workspace.find({ userId: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(workspaces);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  await connectDB();
  const workspace = await Workspace.create({ name: name.trim(), userId: session.user.id });
  return NextResponse.json(workspace, { status: 201 });
}
