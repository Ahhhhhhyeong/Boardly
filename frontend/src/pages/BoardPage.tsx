import { useState } from "react";
import {
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
  ArrowLeft,
  Moon,
  Sun,
  LogOut,
  Circle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Board, Card, Column } from "../types/boardTypes";
import {
  CardDialog,
  CardTile,
  ColumnFormFields,
  EMPTY_CARD_FORM,
} from "../components/board-ui";

interface BoardPageProps {
  board: Board;
  columns: Column[];
  cards: Card[];
  onBack: () => void;
  onAddColumn: (c: Column) => void;
  onUpdateColumn: (c: Column) => void;
  onDeleteColumn: (id: string) => void;
  onAddCard: (c: Card) => void;
  onUpdateCard: (c: Card) => void;
  onDeleteCard: (id: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  uid: () => string;
}

export function BoardPage({
  board,
  columns,
  cards,
  onBack,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  isDark,
  onToggleTheme,
  onLogout,
  uid,
}: BoardPageProps) {
  const boardColumns = columns.filter((c) => c.boardId === board.id).sort((a, b) => a.order - b.order);
  const boardCards = cards.filter((c) => c.boardId === board.id);

  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [isAddColOpen, setIsAddColOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<Column | null>(null);
  const [colForm, setColForm] = useState({ title: "", color: "#6b7280" });
  const [addCardColId, setAddCardColId] = useState<string | null>(null);
  const [addCardForm, setAddCardForm] = useState(EMPTY_CARD_FORM);
  const [addCardSelectedCol, setAddCardSelectedCol] = useState<string>("");
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [editCardForm, setEditCardForm] = useState(EMPTY_CARD_FORM);

  function getColCards(colId: string) {
    return boardCards.filter((c) => c.columnId === colId).sort((a, b) => a.order - b.order);
  }

  function handleAddCol() {
    if (!colForm.title.trim()) return;
    onAddColumn({
      id: uid(),
      boardId: board.id,
      title: colForm.title.trim(),
      color: colForm.color,
      order: boardColumns.length,
    });
    setColForm({ title: "", color: "#6b7280" });
    setIsAddColOpen(false);
  }

  function handleUpdateCol() {
    if (!editingCol || !colForm.title.trim()) return;
    onUpdateColumn({ ...editingCol, title: colForm.title.trim(), color: colForm.color });
    setEditingCol(null);
    setColForm({ title: "", color: "#6b7280" });
  }

  function openEditCol(col: Column) {
    setEditingCol(col);
    setColForm({ title: col.title, color: col.color });
  }

  function openAddCard(colId: string) {
    setAddCardColId(colId);
    setAddCardSelectedCol(colId);
    setAddCardForm(EMPTY_CARD_FORM);
  }

  function handleAddCard() {
    if (!addCardForm.title.trim()) return;
    const colId = addCardSelectedCol || addCardColId || boardColumns[0]?.id;
    if (!colId) return;
    onAddCard({
      id: uid(),
      columnId: colId,
      boardId: board.id,
      title: addCardForm.title.trim(),
      description: addCardForm.description,
      priority: addCardForm.priority,
      progress: addCardForm.progress,
      startDate: addCardForm.startDate,
      deadline: addCardForm.deadline,
      order: boardCards.filter((c) => c.columnId === colId).length,
      createdAt: new Date().toISOString(),
    });
    setAddCardColId(null);
    setAddCardForm(EMPTY_CARD_FORM);
  }

  function openEditCard(card: Card) {
    setEditingCard(card);
    setEditCardForm({
      title: card.title,
      description: card.description,
      priority: card.priority,
      progress: card.progress,
      startDate: card.startDate,
      deadline: card.deadline,
    });
  }

  function handleUpdateCard() {
    if (!editingCard || !editCardForm.title.trim()) return;
    onUpdateCard({
      ...editingCard,
      title: editCardForm.title.trim(),
      description: editCardForm.description,
      priority: editCardForm.priority,
      progress: editCardForm.progress,
      startDate: editCardForm.startDate,
      deadline: editCardForm.deadline,
    });
    setEditingCard(null);
    setEditCardForm(EMPTY_CARD_FORM);
  }

  function handleDrop(e: React.DragEvent, colId: string) {
    e.preventDefault();
    if (!draggedCard) return;
    onUpdateCard({ ...draggedCard, columnId: colId });
    setDraggedCard(null);
    setDragOverCol(null);
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm shrink-0">
        <div className="px-6 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: board.color }} />
            <h1 className="text-lg font-bold truncate">{board.title}</h1>
            {board.description && (
              <span className="text-muted-foreground text-sm hidden sm:block truncate">— {board.description}</span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddColOpen(true)} className="hidden sm:flex">
              <Plus className="size-4 mr-1.5" />
              Column
            </Button>
            <Button variant="ghost" size="icon" onClick={onToggleTheme} className="rounded-full">
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout} className="rounded-full text-muted-foreground">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="h-full p-6">
          <div className="flex gap-5 h-full" style={{ minWidth: "fit-content" }}>
            {boardColumns.map((col) => {
              const colCards = getColCards(col.id);
              return (
                <div
                  key={col.id}
                  className={`flex flex-col w-72 bg-card rounded-xl border border-border shadow-sm transition-all ${dragOverCol === col.id ? "ring-2 ring-primary ring-offset-2" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverCol(col.id);
                  }}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="px-4 pt-4 pb-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                        <h3 className="font-semibold text-sm truncate">{col.title}</h3>
                        <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 shrink-0">
                          {colCards.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => openAddCard(col.id)}>
                          <Plus className="size-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7">
                              <MoreVertical className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Dialog
                              open={editingCol?.id === col.id}
                              onOpenChange={(v) => {
                                if (!v) {
                                  setEditingCol(null);
                                  setColForm({ title: "", color: "#6b7280" });
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openEditCol(col); }}>
                                  <Edit2 className="size-4 mr-2" />
                                  Edit Column
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Column</DialogTitle>
                                </DialogHeader>
                                <ColumnFormFields form={colForm} setForm={setColForm} />
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditingCol(null);
                                      setColForm({ title: "", color: "#6b7280" });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={handleUpdateCol} disabled={!colForm.title.trim()}>
                                    Update
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDeleteColumn(col.id)}
                            >
                              <Trash2 className="size-4 mr-2" />
                              Delete Column
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                    {colCards.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Circle className="size-6 mb-1.5 opacity-25" />
                        <p className="text-xs">Drop cards here</p>
                      </div>
                    ) : (
                      colCards.map((card) => (
                        <CardTile
                          key={card.id}
                          card={card}
                          onEdit={() => openEditCard(card)}
                          onDelete={() => onDeleteCard(card.id)}
                          onDragStart={() => setDraggedCard(card)}
                        />
                      ))
                    )}
                  </div>

                  <div className="p-3 pt-0">
                    <button
                      className="w-full flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-2 px-2 rounded-lg hover:bg-accent transition-colors"
                      onClick={() => openAddCard(col.id)}
                    >
                      <Plus className="size-3.5" />
                      Add card
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="shrink-0 flex items-start pt-0">
              <button
                className="w-64 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground bg-card/50 hover:bg-card border border-dashed border-border rounded-xl px-4 py-3.5 transition-all"
                onClick={() => setIsAddColOpen(true)}
              >
                <Plus className="size-4" />
                Add column
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isAddColOpen} onOpenChange={setIsAddColOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Column</DialogTitle>
            <DialogDescription>Create a new stage in your workflow</DialogDescription>
          </DialogHeader>
          <ColumnFormFields form={colForm} setForm={setColForm} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddColOpen(false);
                setColForm({ title: "", color: "#6b7280" });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCol} disabled={!colForm.title.trim()}>
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CardDialog
        open={addCardColId !== null}
        onClose={() => {
          setAddCardColId(null);
          setAddCardForm(EMPTY_CARD_FORM);
        }}
        title="Add Card"
        subtitle={`Adding to ${boardColumns.find((c) => c.id === addCardColId)?.title ?? ""}`}
        form={addCardForm}
        setForm={setAddCardForm}
        onSubmit={handleAddCard}
        submitLabel="Add Card"
        columns={boardColumns}
        selectedColumnId={addCardSelectedCol}
        onColumnChange={setAddCardSelectedCol}
      />

      <CardDialog
        open={editingCard !== null}
        onClose={() => {
          setEditingCard(null);
          setEditCardForm(EMPTY_CARD_FORM);
        }}
        title="Edit Card"
        form={editCardForm}
        setForm={setEditCardForm}
        onSubmit={handleUpdateCard}
        submitLabel="Update Card"
      />
    </div>
  );
}
