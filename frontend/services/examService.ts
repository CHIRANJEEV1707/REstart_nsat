import axios from 'axios';

// --- Types ---

export interface UserProgressData {
  user: string;
  examId: string;
  streak: {
    current: number;
    max: number;
    lastPracticeDate: string;
  };
  latestScore: {
    score: number;
    total: number;
    percentile: number;
    date: string;
  } | null;
  lastSession?: {
    score: number;
    totalScore: number;
    timeTaken: number;
    date: string;
    answers: {
      questionId: string;
      selectedOptionId: string;
      isCorrect: boolean;
    }[];
  } | null;
}

export interface Question {
  id: string;
  text: string;
  subject: string;
  year: number;
  difficulty: string;
  topics: string[];
  hasVideoSolution: boolean;
  explanation?: string;
  options?: { id: string; text: string }[];
  correctAnswer?: string;
}

export interface College {
  _id: string;
  name: string;
  location: { state: string; city: string };
  type: string;
  fees: number;
  exams_required: string[];
  badges: string[];
  trendingScore: number;
  // Add other fields as needed
}

export interface ExamDetails {
  _id: string;
  name: string;
  code: string;
  description: string;
  dates: {
    registration_start: string;
    registration_end: string;
    exam_date_start: string;
    exam_date_end: string;
  };
  eligibility: string;
  website: string;
}

// --- Service ---

export const ExamService = {

  /**
   * Get user progress from Real Backend
   */
  getUserProgress: async (examId: string): Promise<UserProgressData | null> => {
    try {
      const response = await axios.get(`/api/prep/progress?examId=${examId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch progress', error);
      return null;
    }
  },

  /**
   * Update Score via API
   */
  updateScore: async (examId: string, score: number, total: number) => {
    try {
      const response = await axios.post('/api/prep/progress', {
        examId,
        type: 'score_update',
        data: { score, total }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to update score', error);
      throw error;
    }
  },

  /**
   * Complete Practice Session via API
   */
  completePractice: async (examId: string, questionsSolved: number, timeTaken?: number, answers?: Record<string, string>, totalQuestions?: number) => {
    try {
      const response = await axios.post('/api/prep/progress', {
        examId,
        type: 'practice_complete',
        data: { questionsSolved, timeTaken, answers, totalQuestions }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to complete practice', error);
      throw error;
    }
  },

  /**
   * Get PYQs with filters
   */
  getPYQs: async (examId: string, filters: any): Promise<Question[]> => {
    try {
      const response = await axios.get('/api/pyqs/questions', { params: { examType: examId, ...filters } });
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch PYQs', error);
      return [];
    }
  },

  getQuestionsByIds: async (ids: string[]): Promise<Question[]> => {
    try {
      const response = await axios.get('/api/pyqs/questions', { params: { ids: ids.join(',') } });
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch questions by IDs', error);
      return [];
    }
  },

  /**
   * Get Quick Practice Questions (Random 5)
   */
  getQuickPracticeQuestions: async (examId: string): Promise<Question[]> => {
    try {
      const response = await axios.get('/api/prep/quick-practice', { params: { examType: examId } });
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch quick practice questions', error);
      return [];
    }
  },

  /**
   * Get Exam Details
   */
  getExamDetails: async (slug: string): Promise<ExamDetails | null> => {
    try {
      const response = await axios.get(`/api/exams/${slug}`);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch exam details', error);
      return null;
    }
  },

  /**
   * Get Eligible Colleges
   */
  getEligibleColleges: async (examType: string): Promise<College[]> => {
    try {
      const response = await axios.get('/api/colleges', { params: { examType } });
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch eligible colleges', error);
      return [];
    }
  }
};
