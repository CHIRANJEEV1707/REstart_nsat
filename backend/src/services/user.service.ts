import userRepository, { UserRepository } from '../repositories/user.repository';
import logger from '../utils/logger';

/**
 * User Service
 * Contains business logic for user operations
 */
export class UserService {
    private repository: UserRepository;

    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    /**
     * Get user by ID
     */
    async getUserById(id: string) {
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
        } catch (error) {
            logger.error(`Error fetching user ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email: string) {
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
        } catch (error) {
            logger.error(`Error fetching user by email ${email}:`, error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateUserProfile(userId: string, updates: any) {
        try {
            const user = await this.repository.updateProfile(userId, updates);

            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }

            logger.info(`User profile updated: ${userId}`);

            return {
                success: true,
                data: user,
            };
        } catch (error) {
            logger.error(`Error updating user profile ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Update onboarding status
     */
    async updateOnboarding(userId: string, step: number, data: any) {
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

            logger.info(`User onboarding updated: ${userId}, step: ${step}`);

            return {
                success: true,
                data: user,
            };
        } catch (error) {
            logger.error(`Error updating onboarding for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Add saved college
     */
    async addSavedCollege(userId: string, collegeId: string, collegeType: 'indian' | 'international') {
        try {
            const user = await this.repository.addSavedCollege(userId, collegeId, collegeType);

            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }

            logger.info(`College ${collegeId} saved for user ${userId}`);

            return {
                success: true,
                message: 'College saved successfully',
                data: user,
            };
        } catch (error) {
            logger.error(`Error saving college for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Remove saved college
     */
    async removeSavedCollege(userId: string, collegeId: string, collegeType: 'indian' | 'international') {
        try {
            const user = await this.repository.removeSavedCollege(userId, collegeId, collegeType);

            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }

            logger.info(`College ${collegeId} removed from saved for user ${userId}`);

            return {
                success: true,
                message: 'College removed from saved list',
                data: user,
            };
        } catch (error) {
            logger.error(`Error removing saved college for user ${userId}:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export default new UserService(userRepository);
