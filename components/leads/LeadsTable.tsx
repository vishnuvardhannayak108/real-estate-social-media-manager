"use client";

import { ArrowUpDown } from "lucide-react";
import type { Lead } from "@/lib/types";
import { formatIST } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function LeadsTable({
  leads,
  onLeadClick,
  onSortChange,
}: {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onSortChange: (sortBy: "created_at" | "last_message_at") => void;
}) {
  return (
    <DataTable
      columns={[
        { key: "instagram_id", title: "Instagram ID" },
        { key: "budget", title: "Budget" },
        { key: "location", title: "Location" },
        { key: "property_type", title: "Property Type" },
        { key: "timeline", title: "Timeline" },
        {
          key: "status",
          title: "Status",
          render: (row) => <StatusBadge status={row.status} />,
        },
        {
          key: "last_message_at",
          title: "Last Message At",
          render: (row) => formatIST(row.last_message_at),
        },
        {
          key: "created_at",
          title: "Created At",
          render: (row) => formatIST(row.created_at),
        },
      ]}
      rows={leads}
      getRowKey={(row) => row.id}
      onRowClick={onLeadClick}
      emptyMessage="No leads found for the selected filters."
    />
  );
}

export function LeadsSortControls({
  onSortChange,
}: {
  onSortChange: (sortBy: "created_at" | "last_message_at") => void;
}) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onSortChange("created_at")}> 
        <ArrowUpDown className="mr-1 h-4 w-4" /> Sort by Created
      </Button>
      <Button variant="outline" size="sm" onClick={() => onSortChange("last_message_at")}> 
        <ArrowUpDown className="mr-1 h-4 w-4" /> Sort by Last Message
      </Button>
    </div>
  );
}
