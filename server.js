import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import QRCode from "qrcode";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI);

// Schema
const Repair = mongoose.model("Repair", {
  trackingId: String,
  customerName: String,
  phone: String,
  device: String,
  issue: String,
  status: String,
  price: Number,
  createdAt: { type: Date, default: Date.now }
});

// إضافة جهاز
app.post("/api/add", async (req, res) => {
  if (req.headers.password !== process.env.ADMIN_PASSWORD)
    return res.sendStatus(403);

  const trackingId = Math.random().toString(36).substring(2, 8).toUpperCase();

  const repair = new Repair({
    ...req.body,
    trackingId,
    status: "تم الاستلام"
  });

  await repair.save();

  const link = `${process.env.BASE_URL}/track.html?id=${trackingId}`;
  const qr = await QRCode.toDataURL(link);

  res.json({ trackingId, link, qr });
});

// تتبع
app.get("/api/track/:id", async (req, res) => {
  const repair = await Repair.findOne({ trackingId: req.params.id });
  res.json(repair);
});

// تحديث
app.put("/api/update/:id", async (req, res) => {
  if (req.headers.password !== process.env.ADMIN_PASSWORD)
    return res.sendStatus(403);

  await Repair.updateOne(
    { trackingId: req.params.id },
    req.body
  );

  res.send("تم التحديث");
});

app.listen(process.env.PORT, () => console.log("🔥 Server Running"));