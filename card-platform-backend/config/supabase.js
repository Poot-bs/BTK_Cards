const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Warning: Supabase credentials not configured. Image uploads will fail.');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

module.exports = { supabase };
