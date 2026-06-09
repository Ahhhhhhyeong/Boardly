const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabaseClient');

// Create a new column
router.post('/', async (req, res) => {
  const { board_id, title, color, order } = req.body;
  const { data, error } = await supabase
    .from('columns')
    .insert({ board_id, title, color, order })
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Get all columns for a board (or all columns, filtered by RLS)
router.get('/board/:boardId', async (req, res) => {
  const { boardId } = req.params;
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Update column (title, color, order)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, color, order } = req.body;
  const { data, error } = await supabase
    .from('columns')
    .update({ title, color, order })
    .eq('id', id)
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Delete column
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('columns').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

module.exports = router;
