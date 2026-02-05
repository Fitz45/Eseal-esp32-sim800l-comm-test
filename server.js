import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import gpsRoutes from "./routes/gps.js";
import sealRoutes from "./routes/seals.js";
import authRoutes from "./routes/auth.js";
import tamperRoutes from "./routes/tamper.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

/* ===============================
   ESP32 / SIM800L ROUTES
   =============================== */

// Simple test (browser / curl)
app.get("/esp32/test", (req, res) => {
  res.status(200).json({ ok: true });
});

// HTTPS test endpoint (PC, Postman)
app.post("/esp32/test", (req, res) => {
  console.log("📡 DATA FROM ESP32 (HTTPS):", req.body);
  res.json({
    success: true,
    message: "ESP32 backend reachable ✅"
  });
});

// 🔑 CRITICAL: HTTP endpoint for SIM800L
app.post("/esp32/proxy", (req, res) => {
  console.log("📡 DATA FROM ESP32 (SIM800L HTTP):", req.body);

  // TODO (later):
  // save to Supabase here

  res.status(200).json({
    success: true,
    message: "ESP32 data received OK"
  });
});

/* ===============================
   NORMAL API ROUTES
   =============================== */

app.use("/api/gps", gpsRoutes);
app.use("/api/seals", sealRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tamper", tamperRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("E-SEAL backend running");
});

// Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
