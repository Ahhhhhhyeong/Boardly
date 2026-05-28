const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

router.post("/signup", async (req, res) => {
    const { email, password, name } = req.body;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name },
        },
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data);
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

    return res.json(data);
});

router.post("/signout", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Missing authorization token" });
    }

    const { error } = await supabase.auth.admin.signOut(token);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.status(204).send();
});

router.get("/me", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Missing authorization token" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
        return res.status(401).json({ error: error.message });
    }

    return res.json(data);
});


module.exports = router;
