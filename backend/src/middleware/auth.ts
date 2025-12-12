import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        // @ts-ignore
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        // @ts-ignore
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        // @ts-ignore
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
};
