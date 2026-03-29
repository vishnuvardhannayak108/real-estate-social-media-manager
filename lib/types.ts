export type LeadStatus =
  | "QUALIFYING"
  | "QUALIFIED"
  | "NEGOTIATION"
  | "CALL_BOOKED"
  | "NURTURE"
  | "CLOSED";

export type PostStatus = "PENDING" | "POSTED" | "FAILED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Lead {
  id: string;
  instagram_id: string;
  budget: string | null;
  location: string | null;
  property_type: string | null;
  timeline: string | null;
  status: LeadStatus;
  last_message_at: string;
  created_at: string;
}

export interface Chat {
  id: string;
  lead_id: string;
  message: string;
  sender: "lead" | "bot";
  timestamp: string;
}

export interface Post {
  id: string;
  video_url: string;
  caption: string;
  hashtags: string;
  status: PostStatus;
  platform_links: Record<string, string>;
  created_at: string;
}

export interface Booking {
  id: string;
  lead_id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  date: string;
  time: string;
  calendly_event_id: string | null;
  created_at: string;
  leads?: Pick<Lead, "instagram_id">;
}

export interface Payment {
  id: string;
  lead_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_id: string;
  created_at: string;
}

export interface SystemLog {
  id: string;
  event_type: string;
  lead_id: string | null;
  ai_decision: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  timestamp: string;
}

export interface DashboardStats {
  totalLeads: number;
  leadsByStatus: Record<LeadStatus, number>;
  totalPosts: number;
  bookingsThisMonth: number;
  revenueThisMonth: number;
  leadsPerDay: { date: string; count: number }[];
  postsPerWeek: { week: string; count: number }[];
}
