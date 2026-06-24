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
          role: "student" | "faculty" | "admin";
          display_name: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          institution_id: string;
          role?: "student" | "faculty" | "admin";
          display_name?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          role?: "student" | "faculty" | "admin";
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
      faculty_codes: {
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
            foreignKeyName: "faculty_codes_institution_id_fkey";
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
          people_involved: "student" | "faculty" | "group" | "unknown" | null;
          others_affected: boolean | null;
          status: "new" | "in_progress" | "escalated" | "resolved" | "unsubstantiated";
          recommended_action: string | null;
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
          people_involved?: "student" | "faculty" | "group" | "unknown" | null;
          others_affected?: boolean | null;
          status?: "new" | "in_progress" | "escalated" | "resolved" | "unsubstantiated";
          recommended_action?: string | null;
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
          people_involved?: "student" | "faculty" | "group" | "unknown" | null;
          others_affected?: boolean | null;
          status?: "new" | "in_progress" | "escalated" | "resolved" | "unsubstantiated";
          recommended_action?: string | null;
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
          sender_role: "student" | "faculty";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          sender_role: "student" | "faculty";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          sender_role?: "student" | "faculty";
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
          people_involved: "student" | "faculty" | "group" | "unknown" | null;
          others_affected: boolean | null;
          status: "new" | "in_progress" | "escalated" | "resolved" | "unsubstantiated";
          recommended_action: string | null;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: "student" | "faculty" | "admin";
      risk_level: "low" | "medium" | "high" | "critical";
      case_status: "new" | "in_progress" | "escalated" | "resolved" | "unsubstantiated";
      resource_type: "article" | "video" | "helpline" | "institution";
      reveal_status: "pending" | "accepted" | "declined";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type AnonymousCase = Database["public"]["Views"]["anonymous_cases"]["Row"];
