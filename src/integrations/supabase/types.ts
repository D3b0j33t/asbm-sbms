export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          email: string | null
          id: number
          password: string
          phone_number: string | null
          reset_password_expires: string | null
          reset_password_token: string | null
          username: string
        }
        Insert: {
          email?: string | null
          id?: number
          password: string
          phone_number?: string | null
          reset_password_expires?: string | null
          reset_password_token?: string | null
          username: string
        }
        Update: {
          email?: string | null
          id?: number
          password?: string
          phone_number?: string | null
          reset_password_expires?: string | null
          reset_password_token?: string | null
          username?: string
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          created_at: string
          date: string
          id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          status: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      behavioral_incidents: {
        Row: {
          created_at: string
          description: string
          id: string
          incident_date: string
          severity: string
          student_id: string
          type: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          incident_date?: string
          severity: string
          student_id: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          incident_date?: string
          severity?: string
          student_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_incidents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty: {
        Row: {
          avatar_url: string | null
          chat_enabled: boolean | null
          department: string | null
          email: string
          id: number
          name: string | null
          password: string
          phone_number: string | null
          reset_password_expiry: string | null
          reset_password_token: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          chat_enabled?: boolean | null
          department?: string | null
          email: string
          id?: never
          name?: string | null
          password: string
          phone_number?: string | null
          reset_password_expiry?: string | null
          reset_password_token?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          chat_enabled?: boolean | null
          department?: string | null
          email?: string
          id?: never
          name?: string | null
          password?: string
          phone_number?: string | null
          reset_password_expiry?: string | null
          reset_password_token?: string | null
          username?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          recipient_id: string | null
          recipient_role: string | null
          student_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id: string
          message: string
          read?: boolean | null
          recipient_id?: string | null
          recipient_role?: string | null
          student_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          recipient_id?: string | null
          recipient_role?: string | null
          student_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      personality_traits: {
        Row: {
          agreeableness: number
          conscientiousness: number
          created_at: string
          extraversion: number
          id: string
          neuroticism: number
          openness: number
          student_id: string
          updated_at: string
        }
        Insert: {
          agreeableness?: number
          conscientiousness?: number
          created_at?: string
          extraversion?: number
          id?: string
          neuroticism?: number
          openness?: number
          student_id: string
          updated_at?: string
        }
        Update: {
          agreeableness?: number
          conscientiousness?: number
          created_at?: string
          extraversion?: number
          id?: string
          neuroticism?: number
          openness?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "personality_traits_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: number
          updated_at: string | null
          user_email: string | null
          user_id: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: number
          updated_at?: string | null
          user_email?: string | null
          user_id?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: number
          updated_at?: string | null
          user_email?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          expire: string
          sess: Json
          sid: string
        }
        Insert: {
          expire: string
          sess: Json
          sid: string
        }
        Update: {
          expire?: string
          sess?: Json
          sid?: string
        }
        Relationships: []
      }
      student_materials: {
        Row: {
          created_at: string | null
          id: string
          material_id: string | null
          student_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          material_id?: string | null
          student_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          material_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "teaching_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_materials_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_score: number
          attendance: number
          avatar_url: string | null
          behavior_score: number
          cgpa: number | null
          course: string
          created_at: string
          email: string
          id: string
          leaderboard_points: number | null
          name: string
          participation_score: number
          roll_number: string
          semester: number
          updated_at: string
        }
        Insert: {
          academic_score?: number
          attendance: number
          avatar_url?: string | null
          behavior_score: number
          cgpa?: number | null
          course: string
          created_at?: string
          email: string
          id?: string
          leaderboard_points?: number | null
          name: string
          participation_score?: number
          roll_number: string
          semester: number
          updated_at?: string
        }
        Update: {
          academic_score?: number
          attendance?: number
          avatar_url?: string | null
          behavior_score?: number
          cgpa?: number | null
          course?: string
          created_at?: string
          email?: string
          id?: string
          leaderboard_points?: number | null
          name?: string
          participation_score?: number
          roll_number?: string
          semester?: number
          updated_at?: string
        }
        Relationships: []
      }
      teaching_materials: {
        Row: {
          course: string | null
          created_at: string | null
          description: string | null
          file_size: number
          file_type: string
          file_url: string
          id: string
          name: string
          shared_with_all: boolean | null
          shared_with_course: string | null
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          course?: string | null
          created_at?: string | null
          description?: string | null
          file_size: number
          file_type: string
          file_url: string
          id?: string
          name: string
          shared_with_all?: boolean | null
          shared_with_course?: string | null
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          course?: string | null
          created_at?: string | null
          description?: string | null
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          name?: string
          shared_with_all?: boolean | null
          shared_with_course?: string | null
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          email: string | null
          id: number
          password: string
          username: string
        }
        Insert: {
          email?: string | null
          id?: number
          password: string
          username: string
        }
        Update: {
          email?: string | null
          id?: number
          password?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_reset_columns: {
        Args: { admin_users: string }
        Returns: undefined
      }
      check_if_student_exists: {
        Args: { user_email: string }
        Returns: boolean
      }
      create_student: {
        Args: {
          user_email: string
          user_username: string
          user_password: string
          user_phone?: string
        }
        Returns: undefined
      }
      get_student_by_email: {
        Args: { user_email: string }
        Returns: {
          academic_score: number
          attendance: number
          avatar_url: string | null
          behavior_score: number
          cgpa: number | null
          course: string
          created_at: string
          email: string
          id: string
          leaderboard_points: number | null
          name: string
          participation_score: number
          roll_number: string
          semester: number
          updated_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
