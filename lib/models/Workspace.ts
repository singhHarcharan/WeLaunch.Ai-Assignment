import mongoose, { Schema, models } from "mongoose";

export interface IWorkspace {
  _id: string;
  name: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

const Workspace = models.Workspace || mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);
export default Workspace;
