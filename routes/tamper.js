import express from "express";
import supabase from "../supabase.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { seal_code } = req.body;

  const { error } = await supabase
    .from("seals")
    .update({ tampered: true })
    .eq("seal_code", seal_code);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

export default router;
