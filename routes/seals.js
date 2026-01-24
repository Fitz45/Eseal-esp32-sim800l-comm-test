router.post('/add', async (req, res) => {
  const { seal_code, user_id } = req.body;

  const { data, error } = await supabase
    .from('seals')
    .insert([{ seal_code, assigned_to: user_id }]);

  if (error) return res.status(400).json(error);
  res.json({ message: 'Seal added successfully' });
});
router.delete('/:seal_id', async (req, res) => {
  const { seal_id } = req.params;

  await supabase.from('seals').delete().eq('id', seal_id);
  res.json({ message: 'Seal removed' });
});
router.get('/status/:user_id', async (req, res) => {
  const { user_id } = req.params;

  const { data } = await supabase
    .from('seals')
    .select('*')
    .eq('assigned_to', user_id);

  res.json(data);
});
