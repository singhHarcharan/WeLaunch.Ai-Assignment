import mongoose, { Schema, models } from "mongoose";

export interface IMessage {
  _id: string;
  chatId: mongoose.Types.ObjectId;
  role: "user" | "assistant" | "tool";
  content: string;
  toolName?: string;
  toolResult?: unknown;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    role: { type: String, enum: ["user", "assistant", "tool"], required: true },
    content: { type: String, default: "" },
    toolName: { type: String },
    toolResult: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

MessageSchema.index({ chatId: 1, createdAt: 1 });

const Message = models.Message || mongoose.model<IMessage>("Message", MessageSchema);
export default Message;
