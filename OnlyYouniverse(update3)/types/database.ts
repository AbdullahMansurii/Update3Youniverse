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
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          image_url: string | null
          role: 'student_in_india' | 'student_abroad'
          bio: string | null
          country: string
          university: string | null
          course: string | null
          year_of_study: string | null
          preferred_destination: string | null
          phone: string | null
          current_education_level: string | null
          expected_admission_year: string | null
          current_city: string | null
          profile_completed: boolean
          is_new_user: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          image_url?: string | null
          role: 'student_in_india' | 'student_abroad'
          bio?: string | null
          country: string
          university?: string | null
          course?: string | null
          year_of_study?: string | null
          preferred_destination?: string | null
          phone?: string | null
          current_education_level?: string | null
          expected_admission_year?: string | null
          current_city?: string | null
          profile_completed?: boolean
          is_new_user?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          image_url?: string | null
          role?: 'student_in_india' | 'student_abroad'
          bio?: string | null
          country?: string
          university?: string | null
          course?: string | null
          year_of_study?: string | null
          preferred_destination?: string | null
          phone?: string | null
          current_education_level?: string | null
          expected_admission_year?: string | null
          current_city?: string | null
          profile_completed?: boolean
          is_new_user?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          parent_comment_id: string | null
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          parent_comment_id?: string | null
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          parent_comment_id?: string | null
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comment_likes: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
          created_at?: string
        }
      }
      shares: {
        Row: {
          id: string
          post_id: string
          user_id: string
          share_type: string
          platform: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          share_type: string
          platform?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          share_type?: string
          platform?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string
          tags: string[] | null
          likes_count: number
          comments_count: number
          shares_count: number
          media_urls: string[] | null
          media_types: string[] | null
          link_preview: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          tags?: string[] | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
          media_urls?: string[] | null
          media_types?: string[] | null
          link_preview?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          tags?: string[] | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
          media_urls?: string[] | null
          media_types?: string[] | null
          link_preview?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'connection_request' | 'message' | 'connection_accepted' | 'new_post'
          title: string
          message: string
          read: boolean
          related_user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'connection_request' | 'message' | 'connection_accepted' | 'new_post'
          title: string
          message: string
          read?: boolean
          related_user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'connection_request' | 'message' | 'connection_accepted' | 'new_post'
          title?: string
          message?: string
          read?: boolean
          related_user_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student_in_india' | 'student_abroad'
      connection_status: 'pending' | 'accepted' | 'rejected'
      notification_type: 'connection_request' | 'message' | 'connection_accepted' | 'new_post'
    }
  }
}