import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Workspace from "@/lib/models/Workspace";
import Chat from "@/lib/models/Chat";
import Message from "@/lib/models/Message";

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

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId, name } = await req.json();
  if (!workspaceId || !name?.trim()) {
    return NextResponse.json({ error: "workspaceId and name required" }, { status: 400 });
  }

  await connectDB();

  const workspace = await Workspace.findOneAndUpdate(
    { _id: workspaceId, userId: session.user.id },
    { name: name.trim() },
    { new: true }
  );

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  return NextResponse.json(workspace);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  await connectDB();

  const workspace = await Workspace.findOne({ _id: workspaceId, userId: session.user.id });
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const chats = await Chat.find({ workspaceId, userId: session.user.id }).select("_id");
  const chatIds = chats.map((c) => c._id);

  if (chatIds.length > 0) {
    await Message.deleteMany({ chatId: { $in: chatIds } });
    await Chat.deleteMany({ _id: { $in: chatIds } });
  }

  await Workspace.findByIdAndDelete(workspaceId);
  return NextResponse.json({ success: true });
}
