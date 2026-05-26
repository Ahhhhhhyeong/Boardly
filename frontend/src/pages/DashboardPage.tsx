import { useState } from "react";
import {
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
  LayoutDashboard,
  Calendar,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  Layers,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Board, Card } from "../types/boardTypes";
import { User } from "../types/userType";
import {
  BoardFormDialog,
  ProgressBar,
  formatDate,
} from "../components/board-ui";

interface DashboardPageProps {
  user: User;
  boards: Board[];
  cards: Card[];
  onSelectBoard: (b: Board) => void;
  onCreateBoard: (b: Board) => void;
  onUpdateBoard: (b: Board) => void;
  onDeleteBoard: (id: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  uid: () => string;
  boardColors: string[];
}

export function DashboardPage({
  user,
  boards,
  cards,
  onSelectBoard,
  onCreateBoard,
  onUpdateBoard,
  onDeleteBoard,
  isDark,
  onToggleTheme,
  onLogout,
  uid,
  boardColors,
}: DashboardPageProps) {
  const EMPTY_BOARD_FORM = { title: "", description: "", color: boardColors[0] };
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [form, setForm] = useState(EMPTY_BOARD_FORM);

  function handleCreate() {
    if (!form.title.trim()) return;
    const b: Board = {
      id: uid(),
      userId: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      color: form.color,
      createdAt: new Date().toISOString(),
    };
    onCreateBoard(b);
    setForm(EMPTY_BOARD_FORM);
    setIsCreateOpen(false);
  }

  function handleUpdate() {
    if (!editingBoard || !form.title.trim()) return;
    onUpdateBoard({
      ...editingBoard,
      title: form.title.trim(),
      description: form.description.trim(),
      color: form.color,
    });
    setEditingBoard(null);
    setForm(EMPTY_BOARD_FORM);
  }

  function openEdit(b: Board) {
    setEditingBoard(b);
    setForm({ title: b.title, description: b.description, color: b.color });
  }

  function cardCount(boardId: string) {
    return cards.filter((c) => c.boardId === boardId).length;
  }

  function doneCount(boardId: string) {
    return cards.filter((c) => c.boardId === boardId && c.progress === 100).length;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center">
              <Layers className="size-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Boardly</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Hi, <span className="font-medium text-foreground">{user.name}</span>
            </span>
            <Button variant="ghost" size="icon" onClick={onToggleTheme} className="rounded-full">
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout} className="rounded-full text-muted-foreground">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">My Boards</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {boards.length === 0
                ? "Create your first board to get started"
                : `${boards.length} board${boards.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                New Board
              </Button>
            </DialogTrigger>
            <DialogContent>
              <BoardFormDialog
                title="Create Board"
                form={form}
                setForm={setForm}
                onSubmit={handleCreate}
                onCancel={() => {
                  setIsCreateOpen(false);
                  setForm(EMPTY_BOARD_FORM);
                }}
                submitLabel="Create Board"
              />
            </DialogContent>
          </Dialog>
        </div>

        {boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-20 rounded-2xl bg-accent flex items-center justify-center mb-4">
              <LayoutDashboard className="size-9 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No boards yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Boards help you organize tasks into workflows. Click "New Board" to create your first one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board) => {
              const total = cardCount(board.id);
              const done = doneCount(board.id);
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div
                  key={board.id}
                  className="group bg-card border border-border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onSelectBoard(board)}
                >
                  <div className="h-2" style={{ backgroundColor: board.color }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-base leading-snug line-clamp-2 flex-1">{board.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <Dialog
                            open={editingBoard?.id === board.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setEditingBoard(null);
                                setForm(EMPTY_BOARD_FORM);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  openEdit(board);
                                }}
                              >
                                <Edit2 className="size-4 mr-2" />
                                Edit Board
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                              <BoardFormDialog
                                title="Edit Board"
                                form={form}
                                setForm={setForm}
                                onSubmit={handleUpdate}
                                onCancel={() => {
                                  setEditingBoard(null);
                                  setForm(EMPTY_BOARD_FORM);
                                }}
                                submitLabel="Update Board"
                              />
                            </DialogContent>
                          </Dialog>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDeleteBoard(board.id)}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete Board
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {board.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{board.description}</p>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {total} card{total !== 1 ? "s" : ""}
                        </span>
                        <span>{pct}% done</span>
                      </div>
                      <ProgressBar value={pct} />
                    </div>

                    <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      <span>{formatDate(board.createdAt)}</span>
                      <ChevronRight className="size-3.5 ml-auto text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
