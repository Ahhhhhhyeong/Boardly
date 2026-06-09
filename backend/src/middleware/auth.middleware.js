const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL?.replace("/rest/v1/", "") || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Auth middleware — validates the Bearer token in the Authorization header.
 * Attaches req.user (Supabase User object) and req.token to the request.
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = data.user;
  req.token = token;
  next();
}

module.exports = { authMiddleware, supabase };
