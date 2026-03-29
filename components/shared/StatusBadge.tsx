import { Badge } from "@/components/ui/badge";
import type { LeadStatus, PaymentStatus, PostStatus } from "@/lib/types";

type StatusType = LeadStatus | PaymentStatus | PostStatus | "CONFIRMED" | "CANCELLED";

const statusStyles: Record<StatusType, string> = {
  QUALIFYING: "bg-blue-100 text-blue-700 border-blue-200",
  QUALIFIED: "bg-green-100 text-green-700 border-green-200",
  NEGOTIATION: "bg-orange-100 text-orange-700 border-orange-200",
  CALL_BOOKED: "bg-purple-100 text-purple-700 border-purple-200",
  NURTURE: "bg-slate-100 text-slate-700 border-slate-200",
  CLOSED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  POSTED: "bg-green-100 text-green-700 border-green-200",
  FAILED: "bg-red-100 text-red-700 border-red-200",
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REFUNDED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  CONFIRMED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export function StatusBadge({ status }: { status: StatusType }) {
  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {status}
    </Badge>
  );
}
