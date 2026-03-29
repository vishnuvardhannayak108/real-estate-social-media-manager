"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { Chat, Lead, LeadStatus } from "@/lib/types";
import { formatIST } from "@/lib/format";

import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { LeadsSortControls } from "@/components/leads/LeadsTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const STATUSES: Array<"ALL" | LeadStatus> = [
  "ALL",
  "QUALIFYING",
  "QUALIFIED",
  "NEGOTIATION",
  "CALL_BOOKED",
  "NURTURE",
  "CLOSED",
];

async function fetchLeads({
  page,
  search,
  status,
  sortBy,
}: {
  page: number;
  search: string;
  status: "ALL" | LeadStatus;
  sortBy: "created_at" | "last_message_at";
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: "20",
    sortBy,
    order: "desc",
  });

  if (search) params.set("search", search);
  if (status !== "ALL") params.set("status", status);

  const res = await fetch(`/api/leads?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | LeadStatus>("ALL");
  const [sortBy, setSortBy] = useState<"created_at" | "last_message_at">("created_at");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["leads", page, search, status, sortBy],
    queryFn: () => fetchLeads({ page, search, status, sortBy }),
  });

  const { data: chatsData } = useQuery<{ data: Chat[] }>({
    queryKey: ["lead-chats", selectedLead?.id],
    enabled: !!selectedLead?.id,
    queryFn: async () => {
      const res = await fetch(`/api/leads/${selectedLead?.id}/chats`);
      if (!res.ok) throw new Error("Failed to fetch chats");
      return res.json();
    },
  });

  const leads = (data?.data ?? []) as Lead[];

  const exportCsv = () => {
    const header = [
      "instagram_id",
      "budget",
      "location",
      "property_type",
      "timeline",
      "status",
      "last_message_at",
      "created_at",
    ];
    const rows = leads.map((lead) =>
      [
        lead.instagram_id,
        lead.budget ?? "",
        lead.location ?? "",
        lead.property_type ?? "",
        lead.timeline ?? "",
        lead.status,
        lead.last_message_at,
        lead.created_at,
      ].join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: leadId, status: newStatus }),
    });
    await queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  return (
    <div className="page-shell">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Leads CRM</h1>
        <Button onClick={exportCsv} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          className="max-w-xs"
          placeholder="Search Instagram ID or location"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={status}
          onValueChange={(value: "ALL" | LeadStatus) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <LeadsSortControls onSortChange={setSortBy} />
      </div>

      {isLoading ? (
        <Skeleton className="h-80" />
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instagram ID</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Property Type</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Message At</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-slate-500">
                    No leads found.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedLead(lead);
                      setDrawerOpen(true);
                    }}
                  >
                    <TableCell>{lead.instagram_id}</TableCell>
                    <TableCell>{lead.budget ?? "-"}</TableCell>
                    <TableCell>{lead.location ?? "-"}</TableCell>
                    <TableCell>{lead.property_type ?? "-"}</TableCell>
                    <TableCell>{lead.timeline ?? "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={lead.status}
                        onValueChange={(value: LeadStatus) => onStatusChange(lead.id, value)}
                      >
                        <SelectTrigger
                          className="w-[170px]"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.filter((s): s is LeadStatus => s !== "ALL").map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="mt-2">
                        <StatusBadge status={lead.status} />
                      </div>
                    </TableCell>
                    <TableCell>{formatIST(lead.last_message_at)}</TableCell>
                    <TableCell>{formatIST(lead.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                          setDrawerOpen(true);
                        }}
                      >
                        View Chat
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </Button>
        <p className="text-sm text-slate-600">
          Page {page} / {Math.max(data?.pagination?.totalPages ?? 1, 1)}
        </p>
        <Button
          variant="outline"
          disabled={page >= Math.max(data?.pagination?.totalPages ?? 1, 1)}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      <LeadDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        lead={selectedLead}
        chats={chatsData?.data ?? []}
        onStatusChange={(newStatus) => {
          if (!selectedLead) return;
          onStatusChange(selectedLead.id, newStatus);
        }}
      />
    </div>
  );
}
