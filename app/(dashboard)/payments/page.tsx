"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";

import type { Payment } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { formatINR, formatIST } from "@/lib/format";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from("payments").select("*").order("created_at", { ascending: false });

      if (fromDate) query = query.gte("created_at", `${fromDate}T00:00:00`);
      if (toDate) query = query.lte("created_at", `${toDate}T23:59:59`);

      const { data } = await query;
      setPayments((data as Payment[]) ?? []);
      setLoading(false);
    };

    load();
  }, [fromDate, toDate, supabase]);

  const paid = payments.filter((p) => p.status === "PAID");
  const pending = payments.filter((p) => p.status === "PENDING");
  const failed = payments.filter((p) => p.status === "FAILED");

  const totalRevenue = paid.reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingAmount = pending.reduce((sum, p) => sum + Number(p.amount), 0);

  const exportCsv = () => {
    const rows = payments.map((p) =>
      [p.lead_id, p.amount, p.currency, p.status, p.payment_id, p.created_at].join(",")
    );
    const csv = ["lead_id,amount,currency,status,payment_id,created_at", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-shell">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Payments</h1>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Revenue (PAID)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatINR(totalRevenue)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatINR(pendingAmount)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Failed Transactions</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{failed.length}</CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input type="date" className="w-[180px]" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <Input type="date" className="w-[180px]" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>

      {loading ? (
        <Skeleton className="h-72" />
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.lead_id}</TableCell>
                    <TableCell>{formatINR(payment.amount)}</TableCell>
                    <TableCell>{payment.currency}</TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell>{payment.payment_id}</TableCell>
                    <TableCell>{formatIST(payment.created_at)}</TableCell>
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
