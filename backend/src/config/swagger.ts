import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'REstart API Documentation',
            version: '1.0.0',
            description: 'API documentation for REstart - College Discovery and Recommendation Platform',
            contact: {
                name: 'REstart Team',
            },
        },
        servers: [
            {
                url: 'http://localhost:5001',
                description: 'Development server',
            },
            {
                url: 'https://api.restart.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token',
                    description: 'JWT token stored in HTTP-only cookie',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                        stack: {
                            type: 'string',
                            description: 'Stack trace (development only)',
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            example: '507f1f77bcf86cd799439011',
                        },
                        name: {
                            type: 'string',
                            example: 'John Doe',
                        },
                        email: {
                            type: 'string',
                            example: 'john@example.com',
                        },
                        role: {
                            type: 'string',
                            enum: ['student', 'admin'],
                            example: 'student',
                        },
                        onboardingCompleted: {
                            type: 'boolean',
                            example: true,
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication endpoints',
            },
            {
                name: 'Colleges',
                description: 'College discovery and search endpoints',
            },
            {
                name: 'User',
                description: 'User profile and preferences endpoints',
            },
            {
                name: 'Dashboard',
                description: 'Dashboard data endpoints',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
