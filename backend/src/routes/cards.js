const express = require("express");

const router = express.Router();

function mapCard(row) {
  return {
    id: row.id,
    columnId: row.column_id,
    boardId: row.board_id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    progress: row.progress,
    startDate: row.start_date || "",
    deadline: row.deadline || "",
    order: row.order,
    createdAt: row.created_at,
  };
}

function toDateOrNull(value) {
  return value || null;
}

router.get("/", async (req, res) => {
  const { data, error } = await req.supabase
    .from("cards")
    .select("*")
    .order("order", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data.map(mapCard));
});

router.get("/board/:boardId", async (req, res) => {
  const { boardId } = req.params;
  const { data, error } = await req.supabase
    .from("cards")
    .select("*")
    .eq("board_id", boardId)
    .order("order", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data.map(mapCard));
});

router.post("/", async (req, res) => {
  const {
    boardId,
    columnId,
    title,
    description = "",
    priority = "medium",
    progress = 0,
    startDate = "",
    deadline = "",
    order = 0,
  } = req.body;

  const { data, error } = await req.supabase
    .from("cards")
    .insert({
      board_id: boardId,
      column_id: columnId,
      title,
      description,
      priority,
      progress,
      start_date: toDateOrNull(startDate),
      deadline: toDateOrNull(deadline),
      order,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json(mapCard(data));
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    boardId,
    columnId,
    title,
    description = "",
    priority = "medium",
    progress = 0,
    startDate = "",
    deadline = "",
    order = 0,
  } = req.body;

  const { data, error } = await req.supabase
    .from("cards")
    .update({
      board_id: boardId,
      column_id: columnId,
      title,
      description,
      priority,
      progress,
      start_date: toDateOrNull(startDate),
      deadline: toDateOrNull(deadline),
      order,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.json(mapCard(data));
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await req.supabase.from("cards").delete().eq("id", id);

  if (error) return res.status(400).json({ error: error.message });
  return res.status(204).send();
});

module.exports = router;
