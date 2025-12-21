"use strict";
/**
 * Prep Plan Configuration
 * Defines subjects and topics for exam preparation plans
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWeeklyPlan = exports.defaultPrepConfig = void 0;
/**
 * Default prep plan configuration for JEE/NEET style exams
 */
exports.defaultPrepConfig = {
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    topicsPerWeek: {
        Physics: (week) => [
            `Mechanics - Week ${week}`,
            `Thermodynamics - Week ${week}`,
        ],
        Chemistry: (week) => [
            `Organic Chemistry - Week ${week}`,
            `Inorganic Chemistry - Week ${week}`,
        ],
        Mathematics: (week) => [
            `Algebra - Week ${week}`,
            `Calculus - Week ${week}`,
        ],
    },
};
/**
 * Generate weekly plan based on configuration
 */
const generateWeeklyPlan = (durationWeeks, config = exports.defaultPrepConfig) => {
    const weeks = [];
    for (let i = 1; i <= durationWeeks; i++) {
        const weekSubjects = {};
        config.subjects.forEach((subject) => {
            const topicGenerator = config.topicsPerWeek[subject];
            weekSubjects[subject] = topicGenerator ? topicGenerator(i) : [];
        });
        weeks.push({
            weekNumber: i,
            subjects: weekSubjects,
            completed: false,
        });
    }
    return weeks;
};
exports.generateWeeklyPlan = generateWeeklyPlan;
