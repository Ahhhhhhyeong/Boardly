const { createSupabaseClient } = require("../lib/supabaseClient");

function parseCookies(header) {
  return String(header || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) return cookies;
      const key = decodeURIComponent(part.slice(0, separatorIndex));
      const value = decodeURIComponent(part.slice(separatorIndex + 1));
      cookies[key] = value;
      return cookies;
    }, {});
}

/**
 * Auth middleware validates the Bearer token or session cookie.
 * Attaches req.user (Supabase User object) and req.token to the request.
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const cookies = parseCookies(req.headers.cookie);
  const token = authHeader.replace("Bearer ", "").trim() || cookies.boardly_session;

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const supabase = createSupabaseClient(token);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = data.user;
  req.token = token;
  req.supabase = supabase;
  next();
}

module.exports = { authMiddleware };
