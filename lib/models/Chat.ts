import mongoose, { Schema, models } from "mongoose";

export interface IChat {
  _id: string;
  title: string;
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    title: { type: String, required: true, default: "New Chat" },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Chat = models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
export default Chat;
