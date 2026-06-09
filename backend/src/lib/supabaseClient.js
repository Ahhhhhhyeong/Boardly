// backend/src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Load Supabase URL and service role key from environment variables.
// Service role key is used on the server side for full access.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
