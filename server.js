import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Make sure installed via npm

import gpsRoutes from "./routes/gps.js";
import sealRoutes from "./routes/seals.js";
import authRoutes from "./routes/auth.js";
import tamperRoutes from "./routes/tamper.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 0️⃣ Temporary GET route to verify /esp32/test exists
app.get("/esp32/test", (req, res) => {
 res.status(200).json({ ok: true });
});

// 1️⃣ Create HTTPS endpoint for ESP32 (POST)
app.post("/esp32/test", (req, res) => {
  console.log("📡 DATA FROM ESP32 (HTTPS endpoint):", req.body);
  res.json({
    success: true,
    message: "ESP32 + SIM800L connected successfully ✅"
  });
});

// 2️⃣ Proxy endpoint for ESP32 HTTP devices
app.post("/esp32/proxy", async (req, res) => {
  try {
    console.log("📡 DATA FROM ESP32 (HTTP proxy):", req.body);

    // Forward data to HTTPS endpoint
    const response = await fetch(
      "https://eseal-esp32-sim800l-comm-test.onrender.com/esp32/test",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();

    res.json({
      success: true,
      message: "Data forwarded to backend ✅",
      backendResponse: data
    });
  } catch (err) {
    console.error("❌ Error forwarding data:", err.message, req.body);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Normal API routes
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
