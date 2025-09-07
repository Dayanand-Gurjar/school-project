import { supabase } from '../services/supabase.service.js';

export async function getEvents(req, res) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });
  if (error) return res.status(500).json({ success:false, error: error.message });
  return res.json({ success: true, data });
}

export async function createEvent(req, res) {
  const { title, description, event_date, image_url } = req.body;
  const { data, error } = await supabase
    .from('events')
    .insert([{ title, description, event_date, image_url }])
    .select();
  if (error) return res.status(500).json({ success:false, error: error.message });
  return res.status(201).json({ success:true, data });
}
