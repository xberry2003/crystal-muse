import { Router } from "express";
import {
  streamChat,
  testGemini,
  testReviewCrystal,
} from "../controllers/chatController";

const router = Router();

router.get("/test-gemini", testGemini);
router.get("/test-review-crystal", testReviewCrystal);
router.post("/stream", streamChat);

export default router;