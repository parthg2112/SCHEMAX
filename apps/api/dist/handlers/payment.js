import { prisma } from '../lib/db';
// Payment handler to create Cashfree order
export const createPaymentOrderHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { amount, plan } = req.body;
        if (!amount || !plan) {
            return res.status(400).json({ error: 'Amount and plan are required' });
        }
        // TODO: Integrate with Cashfree API
        // For now, return a mock order
        const orderId = `order_${Date.now()}`;
        res.json({
            orderId,
            amount,
            plan,
            status: 'pending',
            // In production, include Cashfree session token here
        });
    }
    catch (error) {
        console.error('Payment order creation error:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
};
// Webhook handler for Cashfree payment confirmation
export const paymentWebhookHandler = async (req, res) => {
    try {
        // TODO: Verify Cashfree webhook signature
        const { orderId, orderStatus, customerId } = req.body;
        if (orderStatus === 'PAID') {
            // Update user subscription
            await prisma.user.update({
                where: { id: customerId },
                data: {
                    subscriptionTier: 'pro',
                    messagesUsedToday: 0,
                    messageResetDate: new Date(),
                    subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                },
            });
            console.log(`User ${customerId} upgraded to Pro`);
        }
        res.status(200).json({ status: 'ok' });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};
