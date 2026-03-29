"use client";

import { useEffect, useMemo, useState } from "react";

import type { Chat, Lead } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

import { ChatWindow } from "@/components/chats/ChatWindow";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

interface LeadWithPreview extends Lead {
  preview?: string;
}

export default function ChatsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<LeadWithPreview[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const leadsRes = await fetch("/api/leads?limit=200&page=1&sortBy=last_message_at");
      const leadsJson = await leadsRes.json();
      const leadRows = (leadsJson.data ?? []) as Lead[];

      const { data: chatPreviewRows } = await supabase
        .from("chats")
        .select("lead_id,message,timestamp")
        .order("timestamp", { ascending: false })
        .limit(300);

      const previewMap = new Map<string, string>();
      (chatPreviewRows ?? []).forEach((chat) => {
        if (!previewMap.has(chat.lead_id)) {
          previewMap.set(chat.lead_id, chat.message);
        }
      });

      const merged = leadRows.map((lead) => ({ ...lead, preview: previewMap.get(lead.id) }));
      setLeads(merged);
      setSelectedLeadId((prev) => prev ?? merged[0]?.id ?? null);
      setLoading(false);
    };

    load();
  }, [supabase]);

  useEffect(() => {
    if (!selectedLeadId) {
      setChats([]);
      return;
    }

    const loadChats = async () => {
      const res = await fetch(`/api/leads/${selectedLeadId}/chats`);
      const json = await res.json();
      setChats((json.data ?? []) as Chat[]);
    };

    loadChats();

    const channel = supabase
      .channel("chats-monitor")
      .on("postgres_changes", { event: "*", schema: "public", table: "chats" }, (payload) => {
        const row = payload.new as Chat;
        if (row?.lead_id === selectedLeadId) {
          loadChats();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedLeadId, supabase]);

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? null;

  return (
    <div className="page-shell h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-semibold">Chat Monitor</h1>
      {loading ? (
        <Skeleton className="h-full" />
      ) : (
        <div className="grid h-full gap-4 lg:grid-cols-[320px_1fr]">
          <div className="rounded-lg border bg-white p-3 overflow-y-auto">
            {leads.length === 0 ? (
              <p className="text-sm text-slate-500">No leads found.</p>
            ) : (
              leads.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`mb-2 w-full rounded-lg border p-3 text-left ${
                    selectedLeadId === lead.id ? "border-slate-900 bg-slate-100" : ""
                  }`}
                >
                  <p className="font-medium">{lead.instagram_id}</p>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-1">{lead.preview ?? "No messages"}</p>
                  <div className="mt-2">
                    <StatusBadge status={lead.status} />
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="rounded-lg border bg-white p-3">
            {selectedLead ? (
              <>
                <div className="mb-3 border-b pb-2">
                  <p className="font-semibold">{selectedLead.instagram_id}</p>
                </div>
                <div className="h-[calc(100%-3rem)]">
                  <ChatWindow chats={chats} />
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Select a lead to view chat.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
