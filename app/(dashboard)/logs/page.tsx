"use client";

import { useEffect, useMemo, useState } from "react";

import type { SystemLog } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { formatIST } from "@/lib/format";

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

export default function LogsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLeadId, setSearchLeadId] = useState("");
  const [eventType, setEventType] = useState("ALL");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from("system_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(200);

      if (searchLeadId) query = query.ilike("lead_id", `%${searchLeadId}%`);
      if (eventType !== "ALL") query = query.eq("event_type", eventType);

      const { data } = await query;
      setLogs((data as SystemLog[]) ?? []);
      setLoading(false);
    };

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [eventType, searchLeadId, supabase]);

  const eventTypes = Array.from(new Set(logs.map((log) => log.event_type))).slice(0, 20);

  return (
    <div className="page-shell">
      <h1 className="text-2xl font-semibold">System Logs</h1>
      <div className="flex flex-wrap gap-2">
        <Input
          className="max-w-xs"
          placeholder="Search by lead_id"
          value={searchLeadId}
          onChange={(e) => setSearchLeadId(e.target.value)}
        />
        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Event Types</SelectItem>
            {eventTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Skeleton className="h-72" />
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Type</TableHead>
                <TableHead>Lead ID</TableHead>
                <TableHead>AI Decision</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-slate-500">
                    No logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.event_type}</TableCell>
                    <TableCell>{log.lead_id ?? "-"}</TableCell>
                    <TableCell className="max-w-[420px]">
                      <details>
                        <summary className="cursor-pointer text-sm text-blue-700">View JSON</summary>
                        <pre className="mt-2 max-h-40 overflow-auto rounded bg-slate-100 p-2 text-xs">
                          {JSON.stringify(
                            {
                              ai_decision: log.ai_decision,
                              payload: log.payload,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </details>
                    </TableCell>
                    <TableCell>{formatIST(log.timestamp)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
