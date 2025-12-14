import { Router } from "express";
import { createPaymentOrderHandler, paymentWebhookHandler } from "../handlers/payment";
import { authMiddleware } from "../middleware/auth";
const router = Router();
router.post("/create-order", authMiddleware, createPaymentOrderHandler);
router.post("/webhook", paymentWebhookHandler); // No auth for webhook
export default router;
