import express from "express";
import supabase from "../supabase.js";

const router = express.Router();

router.get("/gps", async (req, res) => {
  const { data, error } = await supabase
    .from("gps_data")
    .select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export default router;
