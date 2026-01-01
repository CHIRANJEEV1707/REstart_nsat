import { Database } from './database'

export type Bundle = Database['public']['Tables']['bundles']['Row']
export type Subject = Database['public']['Tables']['subjects']['Row']
export type Module = Database['public']['Tables']['modules']['Row']
export type Test = Database['public']['Tables']['tests']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type Purchase = Database['public']['Tables']['purchases']['Row']
export type TestAttempt = Database['public']['Tables']['test_attempts']['Row']
export type Progress = Database['public']['Tables']['progress']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Coupon = Database['public']['Tables']['coupons']['Row']

export interface TestAnswer {
  questionId: string
  answer: string | string[]
  isCorrect?: boolean
  marksAwarded?: number
}

export interface TestResult {
  attemptId: string
  testId: string
  score: number
  totalMarks: number
  percentage: number
  timeTaken: number
  answers: TestAnswer[]
  questions: Question[]
}

export interface BundleWithSubjects extends Bundle {
  subjects: SubjectWithModules[]
}

export interface SubjectWithModules extends Subject {
  modules: Module[]
}

export interface DashboardStats {
  enrolledBundles: number
  completedModules: number
  testsAttempted: number
  averageScore: number
}
