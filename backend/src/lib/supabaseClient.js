const { createClient } = require("@supabase/supabase-js");

function getSupabaseUrl() {
  return (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
}

function getSupabaseKey() {
  return process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || "";
}

function createSupabaseClient(accessToken) {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseKey();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: "implicit",
      persistSession: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

module.exports = {
  createSupabaseClient,
};
