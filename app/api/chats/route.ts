import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Chat from "@/lib/models/Chat";
import Message from "@/lib/models/Message";
import Workspace from "@/lib/models/Workspace";

export async function GET(req: NextRequest) {
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

  const chats = await Chat.find({ workspaceId }).sort({ createdAt: -1 });
  return NextResponse.json(chats);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId, title } = await req.json();
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  await connectDB();

  const workspace = await Workspace.findOne({ _id: workspaceId, userId: session.user.id });
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const chat = await Chat.create({
    title: title || "New Chat",
    workspaceId,
    userId: session.user.id,
  });

  return NextResponse.json(chat, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chatId = req.nextUrl.searchParams.get("chatId");
  if (!chatId) {
    return NextResponse.json({ error: "chatId required" }, { status: 400 });
  }

  await connectDB();

  const chat = await Chat.findOne({ _id: chatId, userId: session.user.id });
  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  await Message.deleteMany({ chatId });
  await Chat.findByIdAndDelete(chatId);

  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId, title } = await req.json();
  if (!chatId || !title) {
    return NextResponse.json({ error: "chatId and title required" }, { status: 400 });
  }

  await connectDB();

  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, userId: session.user.id },
    { title },
    { new: true }
  );

  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  return NextResponse.json(chat);
}
