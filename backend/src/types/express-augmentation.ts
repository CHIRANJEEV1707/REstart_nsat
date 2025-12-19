// Type augmentation for Express Request to include user property
import { IUser } from '../models/User';

declare module 'express-serve-static-core' {
    interface Request {
        user?: IUser;
    }
}
