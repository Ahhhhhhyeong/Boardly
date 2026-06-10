const express = require("express");
const router = express.Router();

const DEFAULT_COLUMNS = [
  { title: "To Do", color: "#6b7280" },
  { title: "In Progress", color: "#f59e0b" },
  { title: "Review", color: "#8b5cf6" },
  { title: "Done", color: "#10b981" },
];

function mapBoard(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    color: row.color,
    createdAt: row.created_at,
  };
}

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
    .from("boards")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data.map(mapBoard));
});

router.post("/", async (req, res) => {
  const { title, description = "", color = "#6b7280" } = req.body;
  const { data: board, error } = await req.supabase
    .from("boards")
    .insert({
      user_id: req.user.id,
      title,
      description,
      color,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const columnRows = DEFAULT_COLUMNS.map((column, index) => ({
    board_id: board.id,
    title: column.title,
    color: column.color,
    order: index,
  }));

  const { data: columns, error: columnsError } = await req.supabase
    .from("columns")
    .insert(columnRows)
    .select();

  if (columnsError) return res.status(400).json({ error: columnsError.message });

  return res.status(201).json({
    board: mapBoard(board),
    columns: columns.map(mapColumn),
  });
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description = "", color = "#6b7280" } = req.body;
  const { data, error } = await req.supabase
    .from("boards")
    .update({ title, description, color })
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.json(mapBoard(data));
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await req.supabase.from("boards").delete().eq("id", id).eq("user_id", req.user.id);

  if (error) return res.status(400).json({ error: error.message });
  return res.status(204).send();
});

module.exports = router;
