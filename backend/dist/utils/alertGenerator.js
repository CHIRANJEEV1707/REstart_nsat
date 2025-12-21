"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAlerts = void 0;
const generateAlerts = (user, upcomingExams) => {
    const alerts = [];
    const today = new Date();
    // Alert for profile completion
    if (!user.target_degree || !user.target_exams || user.target_exams.length === 0) {
        alerts.push({
            id: 'profile-1',
            type: 'info',
            message: 'Complete your profile to get better recommendations.',
            date: today
        });
    }
    // Alerts for upcoming deadlines
    upcomingExams.forEach((exam) => {
        if (exam.dates?.registration_end) {
            const daysLeft = Math.ceil((new Date(exam.dates.registration_end).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 15 && daysLeft > 0) {
                alerts.push({
                    id: `exam-${exam._id}`,
                    type: 'warning',
                    message: `${exam.name} registration closes in ${daysLeft} days!`,
                    date: new Date()
                });
            }
        }
    });
    if (alerts.length === 0) {
        alerts.push({ id: 'default', type: 'success', message: 'You are all caught up! No critical alerts.', date: today });
    }
    return alerts;
};
exports.generateAlerts = generateAlerts;
