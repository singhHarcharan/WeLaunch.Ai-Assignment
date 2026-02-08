"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Plus,
  MessageSquare,
  LogOut,
  ChevronDown,
  Loader2,
  PanelLeftClose,
  PanelLeft,
  Pencil,
  Trash2,
  FolderOpen,
  Settings,
  User,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { RenameWorkspaceDialog } from "@/components/rename-workspace-dialog";
import type { WorkspaceType, ChatType } from "@/types/chat";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType | null>(null);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [showRenameWs, setShowRenameWs] = useState(false);
  const [showNoWorkspace, setShowNoWorkspace] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [resolvedThreadId, setResolvedThreadId] = useState<string | null>(null);
  const resolvingRef = useRef<string | null>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (activeWorkspace) {
      fetchChats(activeWorkspace._id);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    function handleOptimisticTitle(e: Event) {
      const detail = (e as CustomEvent<{ chatId: string; title: string }>).detail;
      if (!detail?.chatId || !detail?.title) return;
      setChats((prev) =>
        prev.map((c) => (c._id === detail.chatId ? { ...c, title: detail.title } : c))
      );
    }

    window.addEventListener("chat-title-optimistic", handleOptimisticTitle);
    return () => {
      window.removeEventListener("chat-title-optimistic", handleOptimisticTitle);
    };
  }, []);

  useEffect(() => {
    if (workspaces.length === 0) return;
    const selectedId = searchParams.get("workspaceId");
    if (!selectedId) return;
    const selected = workspaces.find((ws) => ws._id === selectedId);
    if (selected && selected._id !== activeWorkspace?._id) {
      setActiveWorkspace(selected);
    }
  }, [searchParams, workspaces, activeWorkspace]);

  useEffect(() => {
    const threadId = params?.threadId as string | undefined;
    if (!threadId || workspaces.length === 0) return;
    if (resolvedThreadId === threadId) return;
    if (resolvingRef.current === threadId) return;
    resolvingRef.current = threadId;

    let cancelled = false;
    async function resolveWorkspaceFromThread() {
      for (const ws of workspaces) {
        try {
          const res = await fetch(`/api/chats?workspaceId=${ws._id}`);
          if (!res.ok) continue;
          const data = await res.json();
          const match = data.find((c: ChatType) => c._id === threadId);
          if (match) {
            if (!cancelled) {
              setActiveWorkspace(ws);
              setResolvedThreadId(threadId || null);
            }
            resolvingRef.current = null;
            return;
          }
        } catch {
          // ignore and continue
        }
      }
      if (!cancelled) {
        setResolvedThreadId(threadId || null);
      }
      resolvingRef.current = null;
    }

    resolveWorkspaceFromThread();
    return () => {
      cancelled = true;
    };
  }, [params, workspaces, resolvedThreadId]);

  async function fetchWorkspaces() {
    const res = await fetch("/api/workspaces");
    const data = await res.json();
    setWorkspaces(data);
    const selectedId = searchParams.get("workspaceId");
    const threadId = params?.threadId as string | undefined;
    if (selectedId) {
      const selected = data.find((ws: WorkspaceType) => ws._id === selectedId);
      if (selected) {
        setActiveWorkspace(selected);
      } else if (data.length > 0 && !activeWorkspace && !threadId) {
        setActiveWorkspace(data[0]);
      }
    } else if (data.length > 0 && !activeWorkspace && !threadId) {
      setActiveWorkspace(data[0]);
    }
    setLoading(false);
  }

  async function fetchChats(workspaceId: string) {
    const res = await fetch(`/api/chats?workspaceId=${workspaceId}`);
    const data = await res.json();
    setChats(data);
  }

  async function createChat() {
    if (!activeWorkspace) {
      setShowNoWorkspace(true);
      return;
    }
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: activeWorkspace._id }),
    });
    const chat = await res.json();
    setChats((prev) => [chat, ...prev]);
    router.push(`/chat/${chat._id}?workspaceId=${activeWorkspace._id}`);
  }

  async function deleteChat(chatId: string) {
    await fetch(`/api/chats?chatId=${chatId}`, { method: "DELETE" });
    setChats((prev) => prev.filter((c) => c._id !== chatId));
    if (params?.threadId === chatId) {
      router.push("/chat");
    }
  }

  async function renameChat(chatId: string, title: string) {
    if (!title.trim()) return;
    await fetch(`/api/chats`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, title: title.trim() }),
    });
    setChats((prev) =>
      prev.map((c) => (c._id === chatId ? { ...c, title: title.trim() } : c))
    );
    setEditingChatId(null);
  }

  function handleWorkspaceCreated(ws: WorkspaceType) {
    setWorkspaces((prev) => [ws, ...prev]);
    setActiveWorkspace(ws);
    setChats([]);
  }

  function handleWorkspaceRenamed(updated: WorkspaceType) {
    setWorkspaces((prev) =>
      prev.map((ws) => (ws._id === updated._id ? updated : ws))
    );
    if (activeWorkspace?._id === updated._id) {
      setActiveWorkspace(updated);
    }
  }

  async function handleWorkspaceDelete() {
    if (!activeWorkspace) return;
    const ok = window.confirm(
      `Delete workspace \"${activeWorkspace.name}\"? This will remove all chats in it.`
    );
    if (!ok) return;

    const res = await fetch(`/api/workspaces?workspaceId=${activeWorkspace._id}`, {
      method: "DELETE",
    });
    if (!res.ok) return;

    setWorkspaces((prev) => prev.filter((ws) => ws._id !== activeWorkspace._id));
    setChats([]);
    const remaining = workspaces.filter((ws) => ws._id !== activeWorkspace._id);
    if (remaining.length > 0) {
      const nextWs = remaining[0];
      setActiveWorkspace(nextWs);
      router.push(`/chat?workspaceId=${nextWs._id}`);
    } else {
      setActiveWorkspace(null);
      router.push("/chat");
    }
  }

  if (collapsed) {
    return (
      <div className="flex h-full w-[50px] flex-col items-center border-r border-border/50 bg-sidebar/90 backdrop-blur-xl py-3 gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={onToggle}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={createChat}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full w-[260px] items-center justify-center border-r border-border/50 bg-sidebar">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeThreadId = params?.threadId as string | undefined;

  return (
    <div className="flex h-full w-[260px] flex-col border-r border-border/50 bg-sidebar/90 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={onToggle}
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={() => router.push("/chat")}
            title="Home"
          >
            <Home className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 px-2 text-sidebar-foreground/80 hover:text-sidebar-foreground"
            onClick={createChat}
            title="New chat"
          >
            <Pencil className="h-4 w-4" />
            <span className="text-xs font-medium">New Chat</span>
          </Button>
        </div>
      </div>

      {/* Workspace Selector */}
      <div className="px-3 pb-2">
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <button className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
              <FolderOpen className="h-4 w-4 text-sidebar-foreground/60" />
              <span className="flex-1 truncate text-left">
                {activeWorkspace?.name || "Select workspace"}
              </span>
              <ChevronDown className="h-3 w-3 text-sidebar-foreground/40" />
            </button>
        </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[232px]">
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws._id}
                onClick={() => {
                  setActiveWorkspace(ws);
                  router.push(`/chat?workspaceId=${ws._id}`);
                }}
                className={activeWorkspace?._id === ws._id ? "bg-accent" : ""}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                {ws.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowRenameWs(true)}
              disabled={!activeWorkspace}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Rename Workspace
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleWorkspaceDelete}
              disabled={!activeWorkspace}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Workspace
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowCreateWs(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 py-1">
          {chats.map((chat, i) => (
            <div
              key={`${chat._id ?? "chat"}-${i}`}
              className={`group relative flex items-center rounded-lg transition-colors ${
                activeThreadId === chat._id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              {editingChatId === chat._id ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => renameChat(chat._id, editTitle)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") renameChat(chat._id, editTitle);
                    if (e.key === "Escape") setEditingChatId(null);
                  }}
                  className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() =>
                    router.push(
                      activeWorkspace
                        ? `/chat/${chat._id}?workspaceId=${activeWorkspace._id}`
                        : `/chat/${chat._id}`
                    )
                  }
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 pr-12 text-sm"
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  <span className="truncate max-w-[150px] sm:max-w-[160px]">{chat.title}</span>
                </button>
              )}
              {editingChatId !== chat._id && (
                <div className="absolute right-1 flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingChatId(chat._id);
                      setEditTitle(chat.title);
                    }}
                    className="rounded p-1 hover:bg-sidebar-accent cursor-pointer"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat._id);
                    }}
                    className="rounded p-1 hover:bg-destructive/20 hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
          {chats.length === 0 && (
            <p className="px-3 py-8 text-center text-xs text-sidebar-foreground/40">
              No chats yet. Start a new conversation.
            </p>
          )}
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t border-border/50 p-2">
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-3.5 w-3.5" />
            </div>
              <span className="flex-1 truncate text-left text-xs font-medium">
                {session?.user?.name || session?.user?.email || "User"}
              </span>
              <Settings className="h-3.5 w-3.5 opacity-40" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[232px]">
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CreateWorkspaceDialog
        open={showCreateWs}
        onOpenChange={setShowCreateWs}
        onCreated={handleWorkspaceCreated}
      />
      <RenameWorkspaceDialog
        open={showRenameWs}
        onOpenChange={setShowRenameWs}
        workspace={activeWorkspace}
        onRenamed={handleWorkspaceRenamed}
      />
      <Dialog open={showNoWorkspace} onOpenChange={setShowNoWorkspace}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a workspace first</DialogTitle>
            <DialogDescription>
              Chats live inside workspaces. Create one to start a new chat.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowNoWorkspace(false)}
            >
              Not now
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setShowNoWorkspace(false);
                setShowCreateWs(true);
              }}
            >
              Create Workspace
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
