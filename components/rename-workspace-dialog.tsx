"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { WorkspaceType } from "@/types/chat";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: WorkspaceType | null;
  onRenamed: (ws: WorkspaceType) => void;
}

export function RenameWorkspaceDialog({ open, onOpenChange, workspace, onRenamed }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(workspace?.name || "");
  }, [workspace]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workspace || !name.trim()) return;

    setLoading(true);
    const res = await fetch("/api/workspaces", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspace._id, name: name.trim() }),
    });
    const ws = await res.json();
    setLoading(false);
    if (!res.ok) return;

    onOpenChange(false);
    onRenamed(ws);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Workspace name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
