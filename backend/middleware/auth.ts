import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';

// Middleware to extract user from better-auth session
export const authMiddleware = async (
    req: Request & { user?: { id: string } },
    res: Response,
    next: NextFunction
) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers as any,
        });

        if (!session || !session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Attach user to request
        req.user = {
            id: session.user.id,
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
};
