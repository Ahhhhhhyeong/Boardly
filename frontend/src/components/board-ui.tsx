import {
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
  GripVertical,
  BarChart3,
  Clock,
  Flag,
  Calendar,
  ChevronRight,
  Circle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, Column } from "../types/boardTypes";

export const BOARD_COLORS = [
  "#5b68f4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
];

export function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isOverdue(deadline: string) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export function priorityBadgeClass(p: Card["priority"]) {
  switch (p) {
    case "high":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "medium":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "low":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  }
}

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    pct === 100
      ? "bg-emerald-500"
      : pct >= 60
        ? "bg-blue-500"
        : pct >= 30
          ? "bg-amber-500"
          : "bg-red-400";

  return (
    <div className="w-full bg-muted rounded-full h-1.5">
      <div
        className={`${color} h-1.5 rounded-full transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function BoardFormDialog({
  title,
  form,
  setForm,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  title: string;
  form: { title: string; description: string; color: string };
  setForm: (f: { title: string; description: string; color: string }) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>Fill in the details for your board</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="board-title">Title</Label>
          <Input
            id="board-title"
            placeholder="e.g., Product Roadmap"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="board-desc">Description (optional)</Label>
          <Textarea
            id="board-desc"
            placeholder="What is this board for?"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Color</Label>
          <div className="flex gap-2 flex-wrap">
            {BOARD_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`size-7 rounded-full border-2 transition-all ${form.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c }}
                onClick={() => setForm({ ...form, color: c })}
              />
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={!form.title.trim()}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </>
  );
}

interface CardFormState {
  title: string;
  description: string;
  priority: Card["priority"];
  progress: number;
  startDate: string;
  deadline: string;
}

export const EMPTY_CARD_FORM: CardFormState = {
  title: "",
  description: "",
  priority: "medium",
  progress: 0,
  startDate: "",
  deadline: "",
};

export function CardDialog({
  open,
  onClose,
  title,
  subtitle,
  form,
  setForm,
  onSubmit,
  submitLabel,
  columns,
  selectedColumnId,
  onColumnChange,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  form: CardFormState;
  setForm: (f: CardFormState) => void;
  onSubmit: () => void;
  submitLabel: string;
  columns?: Column[];
  selectedColumnId?: string;
  onColumnChange?: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="card-title">Title *</Label>
            <Input
              id="card-title"
              placeholder="Card title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-desc">Description</Label>
            <Textarea
              id="card-desc"
              placeholder="Add details, context, or notes..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="card-priority">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v: Card["priority"]) => setForm({ ...form, priority: v })}
              >
                <SelectTrigger id="card-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {columns && onColumnChange && (
              <div className="space-y-1.5">
                <Label htmlFor="card-column">Column</Label>
                <Select value={selectedColumnId} onValueChange={onColumnChange}>
                  <SelectTrigger id="card-column">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-progress">Progress — {form.progress}%</Label>
            <input
              id="card-progress"
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
              className="w-full accent-primary"
            />
            <ProgressBar value={form.progress} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="card-start">Start Date</Label>
              <Input
                id="card-start"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="card-deadline">Deadline</Label>
              <Input
                id="card-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!form.title.trim()}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ColumnFormFields({
  form,
  setForm,
}: {
  form: { title: string; color: string };
  setForm: (f: { title: string; color: string }) => void;
}) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-1.5">
        <Label htmlFor="col-title">Title</Label>
        <Input
          id="col-title"
          placeholder="e.g., Testing"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap">
          {BOARD_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`size-7 rounded-full border-2 transition-all ${form.color === c ? "border-foreground scale-110" : "border-transparent"}`}
              style={{ backgroundColor: c }}
              onClick={() => setForm({ ...form, color: c })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CardTile({
  card,
  onEdit,
  onDelete,
  onDragStart,
}: {
  card: Card;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: () => void;
}) {
  const overdue = isOverdue(card.deadline) && card.progress < 100;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group bg-background border border-border rounded-lg p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium leading-snug flex-1 line-clamp-2">{card.title}</p>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="ghost" size="icon" className="size-6" onClick={onEdit}>
            <Edit2 className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>

      {card.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{card.description}</p>
      )}

      {card.progress > 0 && (
        <div className="mb-2.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <BarChart3 className="size-3" />
              Progress
            </span>
            <span
              className={
                card.progress === 100
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : ""
              }
            >
              {card.progress}%
            </span>
          </div>
          <ProgressBar value={card.progress} />
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
        <Badge className={`text-[10px] px-1.5 py-0 ${priorityBadgeClass(card.priority)}`}>
          <Flag className="size-2.5 mr-1" />
          {card.priority}
        </Badge>

        {card.deadline && (
          <span
            className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              overdue
                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Clock className="size-2.5" />
            {formatDate(card.deadline)}
          </span>
        )}

        {card.startDate && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="size-2.5" />
            {formatDate(card.startDate)}
          </span>
        )}

        <GripVertical className="size-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100" />
      </div>
    </div>
  );
}
