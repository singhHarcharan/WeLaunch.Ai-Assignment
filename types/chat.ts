export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  toolName?: string;
  toolResult?: ToolResult;
  createdAt: string;
}

export interface ToolResult {
  toolName: string;
  result: unknown;
}

export interface WorkspaceType {
  _id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface ChatType {
  _id: string;
  title: string;
  workspaceId: string;
  userId: string;
  createdAt: string;
}
