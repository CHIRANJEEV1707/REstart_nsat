"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = __importDefault(require("../repositories/user.repository"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * User Service
 * Contains business logic for user operations
 */
class UserService {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Get user by ID
     */
    async getUserById(id) {
        try {
            const user = await this.repository.findById(id);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }
            return {
                success: true,
                data: user,
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching user ${id}:`, error);
            throw error;
        }
    }
    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        try {
            const user = await this.repository.findByEmail(email);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }
            return {
                success: true,
                data: user,
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching user by email ${email}:`, error);
            throw error;
        }
    }
    /**
     * Update user profile
     */
    async updateUserProfile(userId, updates) {
        try {
            const user = await this.repository.updateProfile(userId, updates);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }
            logger_1.default.info(`User profile updated: ${userId}`);
            return {
                success: true,
                data: user,
            };
        }
        catch (error) {
            logger_1.default.error(`Error updating user profile ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Update onboarding status
     */
    async updateOnboarding(userId, step, data) {
        try {
            const completed = step >= 3; // Assuming 3 steps total
            // Update user with onboarding data
            const user = await this.repository.updateById(userId, {
                ...data,
                onboardingStep: step,
                onboardingCompleted: completed,
            });
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }
            logger_1.default.info(`User onboarding updated: ${userId}, step: ${step}`);
            return {
                success: true,
                data: user,
            };
        }
        catch (error) {
            logger_1.default.error(`Error updating onboarding for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Add saved college
     */
    async addSavedCollege(userId, collegeId, collegeType) {
        try {
            const user = await this.repository.addSavedCollege(userId, collegeId, collegeType);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }
            logger_1.default.info(`College ${collegeId} saved for user ${userId}`);
            return {
                success: true,
                message: 'College saved successfully',
                data: user,
            };
        }
        catch (error) {
            logger_1.default.error(`Error saving college for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Remove saved college
     */
    async removeSavedCollege(userId, collegeId, collegeType) {
        try {
            const user = await this.repository.removeSavedCollege(userId, collegeId, collegeType);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }
            logger_1.default.info(`College ${collegeId} removed from saved for user ${userId}`);
            return {
                success: true,
                message: 'College removed from saved list',
                data: user,
            };
        }
        catch (error) {
            logger_1.default.error(`Error removing saved college for user ${userId}:`, error);
            throw error;
        }
    }
}
exports.UserService = UserService;
// Export singleton instance
exports.default = new UserService(user_repository_1.default);
