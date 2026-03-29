"use client";

import { useEffect, useMemo, useState } from "react";

import type { Booking } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { formatIST } from "@/lib/format";

import { StatusBadge } from "@/components/shared/StatusBadge";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState<"ALL" | Booking["status"]>("ALL");
  const [calendarView, setCalendarView] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from("bookings")
        .select("*, leads(instagram_id)")
        .order("date", { ascending: true });

      if (status !== "ALL") {
        query = query.eq("status", status);
      }

      const { data } = await query;
      setBookings((data as Booking[]) ?? []);
      setLoading(false);
    };

    load();
  }, [status, supabase]);

  return (
    <div className="page-shell">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCalendarView((v) => !v)}>
            {calendarView ? "Table View" : "Calendar View"}
          </Button>
          <Select value={status} onValueChange={(value: "ALL" | Booking["status"]) => setStatus(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
              <SelectItem value="CANCELLED">CANCELLED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-72" />
      ) : calendarView ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {bookings.map((booking) => {
            const isUpcoming = new Date(`${booking.date}T${booking.time}`) > new Date();
            return (
              <div
                key={booking.id}
                className={`rounded-lg border bg-white p-4 ${isUpcoming ? "ring-2 ring-emerald-200" : ""}`}
              >
                <p className="font-medium">{booking.leads?.instagram_id ?? booking.lead_id}</p>
                <p className="text-sm text-slate-600">
                  {booking.date} {booking.time}
                </p>
                <div className="mt-2">
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead Instagram ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Calendly Event ID</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => {
                  const isUpcoming = new Date(`${booking.date}T${booking.time}`) > new Date();
                  return (
                    <TableRow key={booking.id} className={isUpcoming ? "bg-emerald-50" : ""}>
                      <TableCell>{booking.leads?.instagram_id ?? booking.lead_id}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>{booking.time}</TableCell>
                      <TableCell>
                        <StatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell>{booking.calendly_event_id ?? "-"}</TableCell>
                      <TableCell>{formatIST(booking.created_at)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
