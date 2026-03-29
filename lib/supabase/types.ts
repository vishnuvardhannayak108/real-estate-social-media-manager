export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LeadStatus =
  | "QUALIFYING"
  | "QUALIFIED"
  | "NEGOTIATION"
  | "CALL_BOOKED"
  | "NURTURE"
  | "CLOSED";

export type PostStatus = "PENDING" | "POSTED" | "FAILED";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          video_url: string;
          caption: string;
          hashtags: string | null;
          status: PostStatus;
          platform_links: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          video_url: string;
          caption: string;
          hashtags?: string | null;
          status?: PostStatus;
          platform_links?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          video_url?: string;
          caption?: string;
          hashtags?: string | null;
          status?: PostStatus;
          platform_links?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          instagram_id: string;
          budget: string | null;
          location: string | null;
          property_type: string | null;
          timeline: string | null;
          status: LeadStatus;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          instagram_id: string;
          budget?: string | null;
          location?: string | null;
          property_type?: string | null;
          timeline?: string | null;
          status?: LeadStatus;
          last_message_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          instagram_id?: string;
          budget?: string | null;
          location?: string | null;
          property_type?: string | null;
          timeline?: string | null;
          status?: LeadStatus;
          last_message_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      chats: {
        Row: {
          id: string;
          lead_id: string;
          message: string;
          sender: "lead" | "bot";
          timestamp: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          message: string;
          sender: "lead" | "bot";
          timestamp?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          message?: string;
          sender?: "lead" | "bot";
          timestamp?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          lead_id: string;
          date: string;
          time: string;
          status: BookingStatus;
          calendly_event_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          date: string;
          time: string;
          status?: BookingStatus;
          calendly_event_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          date?: string;
          time?: string;
          status?: BookingStatus;
          calendly_event_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          lead_id: string;
          amount: number;
          currency: string;
          status: PaymentStatus;
          payment_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          amount: number;
          currency?: string;
          status?: PaymentStatus;
          payment_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          amount?: number;
          currency?: string;
          status?: PaymentStatus;
          payment_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      system_logs: {
        Row: {
          id: string;
          event_type: string;
          lead_id: string | null;
          payload: Json | null;
          ai_decision: Json | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          lead_id?: string | null;
          payload?: Json | null;
          ai_decision?: Json | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          lead_id?: string | null;
          payload?: Json | null;
          ai_decision?: Json | null;
          timestamp?: string;
        };
        Relationships: [];
      };
      failed_jobs: {
        Row: {
          id: string;
          workflow_name: string;
          payload: Json | null;
          error_message: string;
          retry_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workflow_name: string;
          payload?: Json | null;
          error_message: string;
          retry_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          workflow_name?: string;
          payload?: Json | null;
          error_message?: string;
          retry_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TableInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TableUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Post = Tables<"posts">;
export type PostInsert = TableInsert<"posts">;
export type PostUpdate = TableUpdate<"posts">;

export type Lead = Tables<"leads">;
export type LeadInsert = TableInsert<"leads">;
export type LeadUpdate = TableUpdate<"leads">;

export type Chat = Tables<"chats">;
export type ChatInsert = TableInsert<"chats">;
export type ChatUpdate = TableUpdate<"chats">;

export type Booking = Tables<"bookings">;
export type BookingInsert = TableInsert<"bookings">;
export type BookingUpdate = TableUpdate<"bookings">;

export type Payment = Tables<"payments">;
export type PaymentInsert = TableInsert<"payments">;
export type PaymentUpdate = TableUpdate<"payments">;

export type SystemLog = Tables<"system_logs">;
export type SystemLogInsert = TableInsert<"system_logs">;
export type SystemLogUpdate = TableUpdate<"system_logs">;

export type FailedJob = Tables<"failed_jobs">;
export type FailedJobInsert = TableInsert<"failed_jobs">;
export type FailedJobUpdate = TableUpdate<"failed_jobs">;

export interface LeadFilters {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  search?: string;
}

export interface LeadWithChats extends Lead {
  chats: Chat[];
}

export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
}

export interface DashboardStats {
  totalLeads: number;
  leadsByStatus: Record<LeadStatus, number>;
  totalPosts: number;
  postsByStatus: Record<PostStatus, number>;
  bookingsThisMonth: number;
  revenueThisMonth: number;
  leadsPerDay: Array<{ date: string; count: number }>;
}
