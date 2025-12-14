import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db.js';

// Rate limit constants
const FREE_TIER_DAILY_LIMIT = 5;
const PRO_TIER_DAILY_LIMIT = 20;

export const rateLimitMiddleware = async (
    req: Request & { user?: { id: string } },
    res: Response,
    next: NextFunction
) => {
    try {
        // Get user ID from session (better-auth should provide this)
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Fetch user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                subscriptionTier: true,
                messagesUsedToday: true,
                messageResetDate: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if we need to reset the daily count
        const now = new Date();
        const resetDate = new Date(user.messageResetDate);
        const hoursSinceReset = (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceReset >= 24) {
            // Reset the count for a new day
            await prisma.user.update({
                where: { id: userId },
                data: {
                    messagesUsedToday: 0,
                    messageResetDate: now,
                },
            });

            // Allow the request to proceed
            next();
            return;
        }

        // Check rate limit
        const limit = user.subscriptionTier === 'pro' ? PRO_TIER_DAILY_LIMIT : FREE_TIER_DAILY_LIMIT;

        if (user.messagesUsedToday >= limit) {
            return res.status(429).json({
                error: 'Daily message limit exceeded',
                limit,
                used: user.messagesUsedToday,
                tier: user.subscriptionTier,
                resetIn: Math.ceil(24 - hoursSinceReset) + ' hours',
            });
        }

        // Increment message count
        await prisma.user.update({
            where: { id: userId },
            data: {
                messagesUsedToday: user.messagesUsedToday + 1,
            },
        });

        // Attach usage info to response
        res.locals.messageUsage = {
            used: user.messagesUsedToday + 1,
            limit,
            remaining: limit - (user.messagesUsedToday + 1),
            tier: user.subscriptionTier,
        };

        // Add usage header for frontend
        res.setHeader('X-Message-Usage', JSON.stringify(res.locals.messageUsage));

        next();
    } catch (error) {
        console.error('Rate limit middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
