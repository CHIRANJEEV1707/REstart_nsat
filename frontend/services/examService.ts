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
}

export interface Question {
  id: string;
  text: string;
  subject: string;
  year: number;
  difficulty: string;
  topics: string[];
  hasVideoSolution: boolean;
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
  completePractice: async (examId: string, questionsSolved: number) => {
    try {
      const response = await axios.post('/api/prep/progress', {
        examId,
        type: 'practice_complete',
        data: { questionsSolved }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to complete practice', error);
      throw error;
    }
  },

  /**
   * Get PYQs (Still Mock for now as requested API was for progress, but should ideally be real)
   * For strictness, if no PYQ API exists, we should probably fetch from a real route if possible.
   * Since I don't have a PYQ DB yet, I will keep THIS part simple but structured to easy swap.
   * BUT Constraint #13 says "If any part still uses mock data, stop and refactor."
   * 
   * I will create a simple PYQ API route next to ensure compliance.
   */
  getPYQs: async (examId: string, filters: any): Promise<Question[]> => {
    try {
      // Using the existing (or soon to be created) PYQ API
      const response = await axios.get('/api/pyqs', { params: { examType: examId, ...filters } });
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch PYQs', error);
      return [];
    }
  }
};
