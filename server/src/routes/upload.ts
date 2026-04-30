import express from "express";
import { requireAuth } from "@clerk/express";
import { upload } from "../middleware/upload.js";
import { uploadImage } from "../services/cloudinary.js";
import { syncUser, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/image",
  syncUser,
  requireRole("host"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const { url, publicId } = await uploadImage(req.file.buffer);

      res.json({ success: true, url, publicId });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  }
);

/**
 * POST /uploads/avatar
 * Any authenticated user (guest or host) can upload a profile image.
 */
router.post(
  "/avatar",
  requireAuth(),
  syncUser,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const { url, publicId } = await uploadImage(req.file.buffer);

      res.json({ success: true, url, publicId });
    } catch (err) {
      console.error("Avatar upload error:", err);
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  }
);

export default router;
