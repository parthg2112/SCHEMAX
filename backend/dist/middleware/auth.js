import { auth } from '../lib/auth';
// Middleware to extract user from better-auth session
export const authMiddleware = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });
        if (!session || !session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Attach user to request
        req.user = {
            id: session.user.id,
        };
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
};
