import { UIMessage, createUIMessageStreamResponse } from "ai";
import mongoose from "mongoose";
import { toUIMessageStream, toBaseMessages } from "@ai-sdk/langchain";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { agent } from "@/lib/ai/agent";
import Message from "@/lib/models/Message";
import Chat from "@/lib/models/Chat";

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, chatId } = (await req.json()) as {
    messages: UIMessage[];
    chatId: string;
  };

  if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
    return new Response("Invalid chatId", { status: 400 });
  }

  await connectDB();

  const chat = await Chat.findOne({ _id: chatId, userId: session.user.id });
  if (!chat) {
    return new Response("Chat not found", { status: 404 });
  }

  // Save user message
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === "user") {
    const textPart = lastMessage.parts?.find((p) => p.type === "text");
    const content = textPart && "text" in textPart ? textPart.text : "";

    if (content) {
      await Message.create({ chatId, role: "user", content });

      const msgCount = await Message.countDocuments({ chatId, role: "user" });
      if (msgCount === 1) {
        await Chat.findByIdAndUpdate(chatId, { title: content.slice(0, 80) });
      }
    }
  }

  const langchainMessages = await toBaseMessages(messages);

  const stream = await agent.stream(
    { messages: langchainMessages },
    { streamMode: ["values", "messages"] }
  );

  const uiStream = toUIMessageStream(stream, {
    onFinal: async (completion: string) => {
      try {
        await connectDB();
        if (completion) {
          await Message.create({
            chatId,
            role: "assistant",
            content: completion,
          });
        }
      } catch (e) {
        console.error("Error saving messages:", e);
      }
    },
  });

  return createUIMessageStreamResponse({ stream: uiStream });
}
