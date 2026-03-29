export type LeadStatus =
  | "QUALIFYING"
  | "QUALIFIED"
  | "NEGOTIATION"
  | "CALL_BOOKED"
  | "NURTURE"
  | "CLOSED";

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

export interface ApiErrorBody {
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "UNAUTHORIZED" | "NOT_FOUND" | "INTERNAL_ERROR";
    message: string;
  };
  timestamp: string;
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface AppError extends Error {
  statusCode?: number;
  code?: ApiErrorBody["error"]["code"];
  retryCount?: number;
}
