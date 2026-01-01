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
      admin_profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'super_admin' | 'content_manager' | 'support' | 'finance'
          permissions: Json
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['admin_profiles']['Insert']>
      }
      bundles: {
        Row: {
          id: string
          name: string
          slug: string
          exam_type: string
          description: string | null
          short_description: string | null
          price: number
          discount_percentage: number
          final_price: number
          validity_days: number
          thumbnail_url: string | null
          status: 'active' | 'inactive' | 'draft'
          features: Json
          is_featured: boolean
          display_order: number
          total_tests: number
          total_pdfs: number
          total_videos: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bundles']['Row'], 'id' | 'final_price' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['bundles']['Insert']>
      }
      subjects: {
        Row: {
          id: string
          bundle_id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subjects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subjects']['Insert']>
      }
      modules: {
        Row: {
          id: string
          subject_id: string
          name: string
          slug: string
          description: string | null
          display_order: number
          is_locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['modules']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['modules']['Insert']>
      }
      pdf_content: {
        Row: {
          id: string
          title: string
          description: string | null
          file_url: string
          file_size: number | null
          file_name: string
          bundle_id: string
          subject_id: string
          module_id: string
          is_free: boolean
          page_count: number | null
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pdf_content']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pdf_content']['Insert']>
      }
      video_content: {
        Row: {
          id: string
          title: string
          description: string | null
          video_url: string
          video_type: 'youtube' | 'vimeo' | 'upload'
          duration_seconds: number | null
          thumbnail_url: string | null
          bundle_id: string
          subject_id: string
          module_id: string
          is_free: boolean
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['video_content']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['video_content']['Insert']>
      }
      tests: {
        Row: {
          id: string
          title: string
          description: string | null
          bundle_id: string
          subject_id: string | null
          duration_minutes: number
          total_marks: number
          passing_marks: number
          negative_marking: boolean
          negative_marking_value: number
          instructions: Json
          status: 'draft' | 'published' | 'archived'
          is_free: boolean
          test_type: 'mock' | 'chapter' | 'full_length' | 'sectional' | null
          total_questions: number
          created_by: string | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['tests']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tests']['Insert']>
      }
      questions: {
        Row: {
          id: string
          test_id: string
          question_text: string
          question_type: 'mcq_single' | 'mcq_multiple' | 'true_false' | 'numerical'
          options: Json
          correct_answer: Json
          explanation: string | null
          difficulty: 'easy' | 'medium' | 'hard' | null
          marks: number
          negative_marks: number
          display_order: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['questions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['questions']['Insert']>
      }
      students: {
        Row: {
          id: string
          mongodb_id: string | null
          full_name: string
          email: string
          phone: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['students']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          student_id: string
          bundle_id: string
          amount: number
          discount_amount: number
          final_amount: number
          coupon_code: string | null
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method: string | null
          payment_id: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          refund_amount: number | null
          refund_reason: string | null
          refunded_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      coupons: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_purchase_amount: number
          max_discount_amount: number | null
          usage_limit: number | null
          used_count: number
          applicable_bundles: string[] | null
          expires_at: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          title: string
          message: string
          type: 'announcement' | 'test_added' | 'offer' | 'update'
          target_audience: 'all' | 'specific_users' | 'bundle_users'
          target_bundle_id: string | null
          target_student_ids: string[] | null
          sent_via: Json
          sent_at: string | null
          status: 'draft' | 'sent' | 'scheduled'
          scheduled_for: string | null
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      cms_pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          meta_title: string | null
          meta_description: string | null
          is_published: boolean
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['cms_pages']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['cms_pages']['Insert']>
      }
    }
  }
}
