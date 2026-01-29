import express from "express";
import supabase from "../supabase.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  const { seal_code } = req.body;

  if (!seal_code) {
    return res.status(400).json({ error: "seal_code required" });
  }

  const { data, error } = await supabase
    .from("seals")
    .insert({
      seal_code,
      status: "LOCKED",
      tampered: false
    })
    .select("id")
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({
    success: true,
    seal_id: data.id
  });
});

export default router;
