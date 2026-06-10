const express = require("express");
const router = express.Router();

function mapColumn(row) {
  return {
    id: row.id,
    boardId: row.board_id,
    title: row.title,
    color: row.color,
    order: row.order,
  };
}

router.get("/", async (req, res) => {
  const { data, error } = await req.supabase
    .from("columns")
    .select("*")
    .order("order", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data.map(mapColumn));
});

router.post("/", async (req, res) => {
  const { boardId, title, color = "#6b7280", order = 0 } = req.body;
  const { data, error } = await req.supabase
    .from("columns")
    .insert({ board_id: boardId, title, color, order })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json(mapColumn(data));
});

router.get("/board/:boardId", async (req, res) => {
  const { boardId } = req.params;
  const { data, error } = await req.supabase
    .from("columns")
    .select("*")
    .eq("board_id", boardId)
    .order("order", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data.map(mapColumn));
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, color = "#6b7280", order = 0 } = req.body;
  const { data, error } = await req.supabase
    .from("columns")
    .update({ title, color, order })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.json(mapColumn(data));
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await req.supabase.from("columns").delete().eq("id", id);

  if (error) return res.status(400).json({ error: error.message });
  return res.status(204).send();
});

module.exports = router;
