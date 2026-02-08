import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Message from "@/lib/models/Message";
import Chat from "@/lib/models/Chat";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chatId = req.nextUrl.searchParams.get("chatId");
  if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
    return NextResponse.json({ error: "Invalid chatId" }, { status: 400 });
  }

  await connectDB();

  const chat = await Chat.findOne({ _id: chatId, userId: session.user.id });
  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
  return NextResponse.json(messages);
}
