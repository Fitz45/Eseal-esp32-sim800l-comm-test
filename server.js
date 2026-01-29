import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import gpsRoutes from "./routes/gps.js";
import sealRoutes from "./routes/seals.js";
import authRoutes from "./routes/auth.js";
import tamperRoutes from "./routes/tamper.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/gps", gpsRoutes);
app.use("/api/seals", sealRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tamper", tamperRoutes);

app.get("/", (req, res) => {
  res.send("E-SEAL backend running");
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running on port 3000")
);
