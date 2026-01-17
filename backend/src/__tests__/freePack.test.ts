import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server'; // Assuming app is exported from server.ts
import User from '../models/User';
import FreePackClaim from '../models/FreePackClaim';
import jwt from 'jsonwebtoken';

describe('Free Pack Routes', () => {
    let token: string;
    let userId: string;

    beforeAll(async () => {
        // Connect to a test DB if not already connected (server.ts might handle it)
        // For now assume server.ts connects or we are using existing connection

        // Create a dummy user
        const user = await User.create({
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            role: 'student'
        });
        userId = user._id.toString();

        // Generate token
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '30d'
        });
    });

    afterAll(async () => {
        await User.deleteMany({ email: /test.*@example.com/ });
        await FreePackClaim.deleteMany({ userId });
        // Close connection if we opened it, but usually app keeps it open.
        // We might need to manually close mongoose connection to exit jest.
        await mongoose.connection.close();
    });

    it('GET /api/free-pack/status - should return none initially', async () => {
        const res = await request(app)
            .get('/api/free-pack/status')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessLevel).toBe('none');
    });

    it('POST /api/free-pack/claim - should claim successfully', async () => {
        const res = await request(app)
            .post('/api/free-pack/claim')
            .set('Authorization', `Bearer ${token}`)
            .send({ source: 'test' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.userId).toBe(userId);
    });

    it('GET /api/free-pack/status - should return free after claim', async () => {
        const res = await request(app)
            .get('/api/free-pack/status')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessLevel).toBe('free');
    });

    it('POST /api/free-pack/claim - should handle duplicate claim', async () => {
        const res = await request(app)
            .post('/api/free-pack/claim')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200); // Or whatever the duplicate logic returns (checked code: returns 200 with alreadyClaimed: true)
        expect(res.body.alreadyClaimed).toBe(true);
    });
});
