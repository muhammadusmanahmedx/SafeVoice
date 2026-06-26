export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      institutions: {
        Row: {
          id: string;
          name: string;
          slug: string;
          settings: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          settings?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          settings?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          institution_id: string;
          role: "student" | "counselor" | "admin";
          display_name: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          institution_id: string;
          role?: "student" | "counselor" | "admin";
          display_name?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          role?: "student" | "counselor" | "admin";
          display_name?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_institution_id_fkey";
            columns: ["institution_id"];
            isOneToOne: false;
            referencedRelation: "institutions";
            referencedColumns: ["id"];
          },
        ];
      };
      counselor_codes: {
        Row: {
          id: string;
          institution_id: string;
          code: string;
          created_by: string | null;
          expires_at: string | null;
          used_by: string | null;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          code: string;
          created_by?: string | null;
          expires_at?: string | null;
          used_by?: string | null;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          code?: string;
          created_by?: string | null;
          expires_at?: string | null;
          used_by?: string | null;
          used_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "counselor_codes_institution_id_fkey";
            columns: ["institution_id"];
            isOneToOne: false;
            referencedRelation: "institutions";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          id: string;
          institution_id: string;
          student_id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          student_id: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          student_id?: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_institution_id_fkey";
            columns: ["institution_id"];
            isOneToOne: false;
            referencedRelation: "institutions";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: "user" | "assistant";
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      risk_assessments: {
        Row: {
          id: string;
          message_id: string;
          conversation_id: string;
          institution_id: string;
          risk_level: "low" | "medium" | "high" | "critical";
          category: string;
          requires_attention: boolean;
          summary: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          conversation_id: string;
          institution_id: string;
          risk_level?: "low" | "medium" | "high" | "critical";
          category?: string;
          requires_attention?: boolean;
          summary?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          conversation_id?: string;
          institution_id?: string;
          risk_level?: "low" | "medium" | "high" | "critical";
          category?: string;
          requires_attention?: boolean;
          summary?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "risk_assessments_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      cases: {
        Row: {
          id: string;
          institution_id: string;
          conversation_id: string | null;
          student_id: string;
          incident_type: string;
          severity: "low" | "medium" | "high" | "critical";
          summary: string;
          location: string | null;
          duration: string | null;
          people_involved: "student" | "counselor" | "group" | "unknown" | null;
          others_affected: boolean | null;
          status: "new" | "in_progress" | "escalated" | "resolved" | "unsubstantiated";
          recommended_action: string | null;
          identity_revealed: boolean;
          auto_alerted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          conversation_id?: string | null;
          student_id: string;
          incident_type: string;
          severity: "low" | "medium" | "high" | "critical";
          summary: string;
          location?: string | null;
          duration?: string | null;
          people_involved?: "student" | "counselor" | "group" | "unknown" | null;
          others_affected?: boolean | null;
          status?: "new" | "in_progress" | "escalated" | "resolved" | "unsubstantiated";
          recommended_action?: string | null;
          identity_revealed?: boolean;
          auto_alerted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          conversation_id?: string | null;
          student_id?: string;
          incident_type?: string;
          severity?: "low" | "medium" | "high" | "critical";
          summary?: string;
          location?: string | null;
          duration?: string | null;
          people_involved?: "student" | "counselor" | "group" | "unknown" | null;
          others_affected?: boolean | null;
          status?: "new" | "in_progress" | "escalated" | "resolved" | "unsubstantiated";
          recommended_action?: string | null;
          identity_revealed?: boolean;
          auto_alerted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cases_institution_id_fkey";
            columns: ["institution_id"];
            isOneToOne: false;
            referencedRelation: "institutions";
            referencedColumns: ["id"];
          },
        ];
      };
      case_messages: {
        Row: {
          id: string;
          case_id: string;
          sender_role: "student" | "counselor";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          sender_role: "student" | "counselor";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          sender_role?: "student" | "counselor";
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "case_messages_case_id_fkey";
            columns: ["case_id"];
            isOneToOne: false;
            referencedRelation: "cases";
            referencedColumns: ["id"];
          },
        ];
      };
      case_notes: {
        Row: {
          id: string;
          case_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "case_notes_case_id_fkey";
            columns: ["case_id"];
            isOneToOne: false;
            referencedRelation: "cases";
            referencedColumns: ["id"];
          },
        ];
      };
      identity_reveal_requests: {
        Row: {
          id: string;
          case_id: string;
          requested_by: string;
          status: "pending" | "accepted" | "declined";
          responded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          requested_by: string;
          status?: "pending" | "accepted" | "declined";
          responded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          requested_by?: string;
          status?: "pending" | "accepted" | "declined";
          responded_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "identity_reveal_requests_case_id_fkey";
            columns: ["case_id"];
            isOneToOne: false;
            referencedRelation: "cases";
            referencedColumns: ["id"];
          },
        ];
      };
      mood_logs: {
        Row: {
          id: string;
          student_id: string;
          institution_id: string;
          mood: number;
          note: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          institution_id: string;
          mood: number;
          note?: string | null;
          logged_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          institution_id?: string;
          mood?: number;
          note?: string | null;
          logged_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mood_logs_institution_id_fkey";
            columns: ["institution_id"];
            isOneToOne: false;
            referencedRelation: "institutions";
            referencedColumns: ["id"];
          },
        ];
      };
      resources: {
        Row: {
          id: string;
          institution_id: string | null;
          category: string;
          title: string;
          description: string | null;
          type: "article" | "video" | "helpline" | "institution";
          url: string | null;
          content: string | null;
          is_global: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_id?: string | null;
          category: string;
          title: string;
          description?: string | null;
          type?: "article" | "video" | "helpline" | "institution";
          url?: string | null;
          content?: string | null;
          is_global?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string | null;
          category?: string;
          title?: string;
          description?: string | null;
          type?: "article" | "video" | "helpline" | "institution";
          url?: string | null;
          content?: string | null;
          is_global?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          institution_id: string;
          title: string;
          content: string;
          published_at: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          title: string;
          content: string;
          published_at?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          title?: string;
          content?: string;
          published_at?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "announcements_institution_id_fkey";
            columns: ["institution_id"];
            isOneToOne: false;
            referencedRelation: "institutions";
            referencedColumns: ["id"];
          },
        ];
      };
      counseling_slots: {
        Row: {
          id: string;
          institution_id: string;
          counselor_id: string;
          slot_at: string;
          duration_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          counselor_id: string;
          slot_at: string;
          duration_minutes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          counselor_id?: string;
          slot_at?: string;
          duration_minutes?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "counseling_slots_institution_id_fkey";
            columns: ["institution_id"];
            isOneToOne: false;
            referencedRelation: "institutions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "counseling_slots_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      counseling_bookings: {
        Row: {
          id: string;
          slot_id: string;
          student_id: string;
          institution_id: string;
          topic: string | null;
          status: "booked" | "cancelled" | "completed";
          meeting_room_name: string | null;
          meeting_started_at: string | null;
          meeting_ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slot_id: string;
          student_id: string;
          institution_id: string;
          topic?: string | null;
          status?: "booked" | "cancelled" | "completed";
          meeting_room_name?: string | null;
          meeting_started_at?: string | null;
          meeting_ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slot_id?: string;
          student_id?: string;
          institution_id?: string;
          topic?: string | null;
          status?: "booked" | "cancelled" | "completed";
          meeting_room_name?: string | null;
          meeting_started_at?: string | null;
          meeting_ended_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "counseling_bookings_slot_id_fkey";
            columns: ["slot_id"];
            isOneToOne: false;
            referencedRelation: "counseling_slots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "counseling_bookings_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      counselor_weekly_availability: {
        Row: {
          id: string;
          counselor_id: string;
          institution_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          counselor_id: string;
          institution_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          duration_minutes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          counselor_id?: string;
          institution_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          duration_minutes?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "counselor_weekly_availability_counselor_id_fkey";
            columns: ["counselor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      anonymous_cases: {
        Row: {
          id: string;
          institution_id: string;
          conversation_id: string | null;
          incident_type: string;
          severity: "low" | "medium" | "high" | "critical";
          summary: string;
          location: string | null;
          duration: string | null;
          people_involved: "student" | "counselor" | "group" | "unknown" | null;
          others_affected: boolean | null;
          status: "new" | "in_progress" | "escalated" | "resolved" | "unsubstantiated";
          recommended_action: string | null;
          identity_revealed: boolean;
          auto_alerted: boolean;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: "student" | "counselor" | "admin";
      risk_level: "low" | "medium" | "high" | "critical";
      case_status: "new" | "in_progress" | "escalated" | "resolved" | "unsubstantiated";
      resource_type: "article" | "video" | "helpline" | "institution";
      reveal_status: "pending" | "accepted" | "declined";
      booking_status: "booked" | "cancelled" | "completed";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type AnonymousCase = Database["public"]["Views"]["anonymous_cases"]["Row"];
