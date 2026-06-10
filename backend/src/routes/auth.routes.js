const express = require("express");
const { createSupabaseClient } = require("../lib/supabaseClient");

const router = express.Router();

const supabase = createSupabaseClient();

function sessionCookie(accessToken, maxAgeSeconds) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `boardly_session=${encodeURIComponent(accessToken)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

function clearSessionCookie() {
    return "boardly_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0";
}

function getEmailRedirectTo() {
    return process.env.AUTH_REDIRECT_URL || `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/callback`;
}

function mapUser(user) {
    return {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.name || user.user_metadata?.full_name || "",
        avatarUrl: user.user_metadata?.avatar_url,
        createdAt: user.created_at,
    };
}

function getToken(req) {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.replace("Bearer ", "").trim();
    if (bearerToken) return bearerToken;

    const cookie = String(req.headers.cookie || "")
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("boardly_session="));

    return cookie ? decodeURIComponent(cookie.slice("boardly_session=".length)) : "";
}

router.post("/signup", async (req, res) => {
    const { email, password, name } = req.body;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name },
            emailRedirectTo: getEmailRedirectTo(),
        },
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    if (data.session?.access_token) {
        res.setHeader("Set-Cookie", sessionCookie(data.session.access_token, data.session.expires_in || 3600));
    }

    return res.status(201).json({
        user: data.user ? mapUser(data.user) : null,
    });
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return res.status(401).json({ error: error.message });
    }

    if (data.session?.access_token) {
        res.setHeader("Set-Cookie", sessionCookie(data.session.access_token, data.session.expires_in || 3600));
    }

    return res.json({
        user: mapUser(data.user),
    });
});

router.post("/session", async (req, res) => {
    const { accessToken, expiresIn, code } = req.body;

    if (code && !accessToken) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data?.session?.access_token || !data?.user) {
            return res.status(401).json({ error: error?.message || "Invalid confirmation code" });
        }

        res.setHeader("Set-Cookie", sessionCookie(data.session.access_token, data.session.expires_in || 3600));

        return res.json({
            user: mapUser(data.user),
        });
    }

    if (!accessToken) {
        return res.status(400).json({ error: "Missing access token" });
    }

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data?.user) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }

    res.setHeader("Set-Cookie", sessionCookie(accessToken, expiresIn || 3600));

    return res.json({
        user: mapUser(data.user),
    });
});

router.post("/signout", async (req, res) => {
    const token = getToken(req);

    if (!token) {
        res.setHeader("Set-Cookie", clearSessionCookie());
        return res.status(204).send();
    }

    res.setHeader("Set-Cookie", clearSessionCookie());
    return res.status(204).send();
});

router.get("/me", async (req, res) => {
    const token = getToken(req);

    if (!token) {
        return res.status(401).json({ error: "Missing authorization token" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
        return res.status(401).json({ error: error.message });
    }

    return res.json({
        user: mapUser(data.user),
    });
});


module.exports = router;
