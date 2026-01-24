router.post('/update', async (req, res) => {
  const { seal_code, status, lat, lng } = req.body;

  const { data: seal } = await supabase
    .from('seals')
    .select('id')
    .eq('seal_code', seal_code)
    .single();

  await supabase.from('gps_logs').insert([{
    seal_id: seal.id,
    latitude: lat,
    longitude: lng,
  }]);

  await supabase.from('seals')
    .update({ status })
    .eq('id', seal.id);

  res.json({ message: 'Data received' });
});
router.get('/gps/:seal_id', async (req, res) => {
  const { seal_id } = req.params;

  const { data } = await supabase
    .from('gps_logs')
    .select('*')
    .eq('seal_id', seal_id)
    .order('timestamp', { ascending: false });

  res.json(data);
});
