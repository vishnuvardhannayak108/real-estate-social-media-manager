"use client";

import type { Chat, Lead, LeadStatus } from "@/lib/types";
import { formatIST } from "@/lib/format";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ChatWindow } from "@/components/chats/ChatWindow";

const statuses: LeadStatus[] = [
  "QUALIFYING",
  "QUALIFIED",
  "NEGOTIATION",
  "CALL_BOOKED",
  "NURTURE",
  "CLOSED",
];

export function LeadDrawer({
  open,
  onOpenChange,
  lead,
  chats,
  onStatusChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  chats: Chat[];
  onStatusChange: (status: LeadStatus) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        {!lead ? null : (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {lead.instagram_id} <StatusBadge status={lead.status} />
              </SheetTitle>
              <SheetDescription>Lead details and full chat history</SheetDescription>
            </SheetHeader>

            <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <p>Budget: {lead.budget ?? "-"}</p>
              <p>Location: {lead.location ?? "-"}</p>
              <p>Property: {lead.property_type ?? "-"}</p>
              <p>Timeline: {lead.timeline ?? "-"}</p>
              <p>Last Message: {formatIST(lead.last_message_at)}</p>
              <p>Created: {formatIST(lead.created_at)}</p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Select onValueChange={(value) => onStatusChange(value as LeadStatus)} defaultValue={lead.status}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>

            <div className="mt-5 h-[55vh]">
              <ChatWindow chats={chats} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
