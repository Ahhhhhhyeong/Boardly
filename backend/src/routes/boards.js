const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabaseClient');

// Create a new board
router.post('/', async (req, res) => {
  const { title, user_id } = req.body;
  const { data, error } = await supabase.from('boards').insert({ title, user_id }).single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Get all boards for a user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase.from('boards').select('*').eq('user_id', userId);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Update board title
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const { data, error } = await supabase.from('boards').update({ title }).eq('id', id).single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Delete board
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('boards').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

module.exports = router;
