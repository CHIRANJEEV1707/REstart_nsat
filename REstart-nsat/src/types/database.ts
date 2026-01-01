export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bundles: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          price: number
          duration_days: number
          exam_type: string
          image_url: string | null
          is_active: boolean
          features: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          price: number
          duration_days: number
          exam_type: string
          image_url?: string | null
          is_active?: boolean
          features?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          price?: number
          duration_days?: number
          exam_type?: string
          image_url?: string | null
          is_active?: boolean
          features?: string[]
        }
      }
      subjects: {
        Row: {
          id: string
          created_at: string
          bundle_id: string
          title: string
          description: string
          order_index: number
        }
        Insert: {
          id?: string
          created_at?: string
          bundle_id: string
          title: string
          description: string
          order_index: number
        }
        Update: {
          id?: string
          created_at?: string
          bundle_id?: string
          title?: string
          description?: string
          order_index?: number
        }
      }
      modules: {
        Row: {
          id: string
          created_at: string
          subject_id: string
          title: string
          description: string
          content_type: 'pdf' | 'video' | 'text'
          content_url: string | null
          order_index: number
          duration_minutes: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          subject_id: string
          title: string
          description: string
          content_type: 'pdf' | 'video' | 'text'
          content_url?: string | null
          order_index: number
          duration_minutes?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          subject_id?: string
          title?: string
          description?: string
          content_type?: 'pdf' | 'video' | 'text'
          content_url?: string | null
          order_index?: number
          duration_minutes?: number | null
        }
      }
      tests: {
        Row: {
          id: string
          created_at: string
          bundle_id: string
          title: string
          description: string
          duration_minutes: number
          total_marks: number
          passing_marks: number
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          bundle_id: string
          title: string
          description: string
          duration_minutes: number
          total_marks: number
          passing_marks: number
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          bundle_id?: string
          title?: string
          description?: string
          duration_minutes?: number
          total_marks?: number
          passing_marks?: number
          is_active?: boolean
        }
      }
      questions: {
        Row: {
          id: string
          created_at: string
          test_id: string
          question_text: string
          question_type: 'mcq' | 'multiple_answer' | 'numerical'
          options: Json | null
          correct_answer: string
          marks: number
          explanation: string | null
          order_index: number
        }
        Insert: {
          id?: string
          created_at?: string
          test_id: string
          question_text: string
          question_type: 'mcq' | 'multiple_answer' | 'numerical'
          options?: Json | null
          correct_answer: string
          marks: number
          explanation?: string | null
          order_index: number
        }
        Update: {
          id?: string
          created_at?: string
          test_id?: string
          question_text?: string
          question_type?: 'mcq' | 'multiple_answer' | 'numerical'
          options?: Json | null
          correct_answer?: string
          marks?: number
          explanation?: string | null
          order_index?: number
        }
      }
      purchases: {
        Row: {
          id: string
          created_at: string
          user_id: string
          bundle_id: string
          amount_paid: number
          razorpay_order_id: string
          razorpay_payment_id: string | null
          status: 'pending' | 'completed' | 'failed'
          expires_at: string
          coupon_code: string | null
          discount_amount: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          bundle_id: string
          amount_paid: number
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          status?: 'pending' | 'completed' | 'failed'
          expires_at: string
          coupon_code?: string | null
          discount_amount?: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          bundle_id?: string
          amount_paid?: number
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          status?: 'pending' | 'completed' | 'failed'
          expires_at?: string
          coupon_code?: string | null
          discount_amount?: number
        }
      }
      test_attempts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          test_id: string
          started_at: string
          submitted_at: string | null
          score: number | null
          total_marks: number
          time_taken_seconds: number | null
          answers: Json
          status: 'in_progress' | 'submitted'
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          test_id: string
          started_at?: string
          submitted_at?: string | null
          score?: number | null
          total_marks: number
          time_taken_seconds?: number | null
          answers: Json
          status?: 'in_progress' | 'submitted'
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          test_id?: string
          started_at?: string
          submitted_at?: string | null
          score?: number | null
          total_marks?: number
          time_taken_seconds?: number | null
          answers?: Json
          status?: 'in_progress' | 'submitted'
        }
      }
      progress: {
        Row: {
          id: string
          created_at: string
          user_id: string
          module_id: string
          completed: boolean
          completed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          module_id: string
          completed?: boolean
          completed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          module_id?: string
          completed?: boolean
          completed_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          title: string
          message: string
          type: 'announcement' | 'test_added' | 'discount' | 'update'
          is_active: boolean
          target_users: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          message: string
          type: 'announcement' | 'test_added' | 'discount' | 'update'
          is_active?: boolean
          target_users?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          message?: string
          type?: 'announcement' | 'test_added' | 'discount' | 'update'
          is_active?: boolean
          target_users?: string[] | null
        }
      }
      coupons: {
        Row: {
          id: string
          created_at: string
          code: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_purchase_amount: number
          max_discount_amount: number | null
          valid_from: string
          valid_until: string
          usage_limit: number | null
          used_count: number
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          code: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_purchase_amount: number
          max_discount_amount?: number | null
          valid_from: string
          valid_until: string
          usage_limit?: number | null
          used_count?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          code?: string
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          min_purchase_amount?: number
          max_discount_amount?: number | null
          valid_from?: string
          valid_until?: string
          usage_limit?: number | null
          used_count?: number
          is_active?: boolean
        }
      }
    }
  }
}
