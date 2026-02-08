"use client";

import { useEffect, useState } from "react";
import { Plus, FolderOpen, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { WorkspaceType } from "@/types/chat";

export default function ChatHomePage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch("/api/workspaces")
      .then((r) => r.json())
      .then((data) => {
        setWorkspaces(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6">
        <Sparkles className="h-7 w-7 text-primary" />
      </div>
      <h1 className="text-2xl font-semibold mb-1">Welcome to AI Chat</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Select a chat from the sidebar or create a new workspace
      </p>

      {workspaces.length === 0 ? (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Create your first workspace to get started
          </p>
          <Button onClick={() => setShowCreate(true)} size="lg" className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Create Workspace
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-2xl">
          {workspaces.map((ws) => (
            <div
              key={ws._id}
              className="rounded-xl border border-border/60 bg-card p-4 text-card-foreground transition-all hover:border-border hover:shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{ws.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Created {new Date(ws.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <CreateWorkspaceDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={(ws) => setWorkspaces((prev) => [ws, ...prev])}
      />
    </div>
  );
}
