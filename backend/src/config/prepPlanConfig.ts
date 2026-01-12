/**
 * Prep Plan Configuration
 * Defines subjects and topics for exam preparation plans
 */

export interface SubjectTopics {
    [subject: string]: string[];
}

export interface PrepPlanConfig {
    subjects: string[];
    topicsPerWeek: {
        [subject: string]: (weekNumber: number) => string[];
    };
}

/**
 * Default prep plan configuration for JEE/NEET style exams
 */
export const defaultPrepConfig: PrepPlanConfig = {
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    topicsPerWeek: {
        Physics: (week: number) => [
            `Mechanics - Week ${week}`,
            `Thermodynamics - Week ${week}`,
        ],
        Chemistry: (week: number) => [
            `Organic Chemistry - Week ${week}`,
            `Inorganic Chemistry - Week ${week}`,
        ],
        Mathematics: (week: number) => [
            `Algebra - Week ${week}`,
            `Calculus - Week ${week}`,
        ],
    },
};

/**
 * Generate weekly plan based on configuration
 */
export const generateWeeklyPlan = (
    durationWeeks: number,
    config: PrepPlanConfig = defaultPrepConfig
) => {
    const weeks = [];

    for (let i = 1; i <= durationWeeks; i++) {
        const weekSubjects: SubjectTopics = {};

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
