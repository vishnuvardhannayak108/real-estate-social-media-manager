"use client";

import { useQuery } from "@tanstack/react-query";

import type { DashboardStats } from "@/lib/types";
import { formatINR } from "@/lib/format";

import { LeadStatusDonut, LeadsPerDayChart, PostsPerWeekChart } from "@/components/dashboard/LeadChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";

async function getStats(): Promise<DashboardStats> {
  const res = await fetch("/api/stats");
  if (!res.ok) {
    throw new Error("Failed to load stats");
  }
  return res.json();
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getStats,
  });

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Skeleton key={idx} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <div className="page-shell text-sm text-red-600">Failed to load dashboard stats.</div>;
  }

  return (
    <div className="page-shell">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Leads" value={data.totalLeads} />
        <StatCard title="Total Posts" value={data.totalPosts} />
        <StatCard title="Bookings This Month" value={data.bookingsThisMonth} />
        <StatCard title="Revenue This Month" value={formatINR(data.revenueThisMonth)} />
        {Object.entries(data.leadsByStatus).map(([status, count]) => (
          <StatCard key={status} title={status.replace("_", " ")} value={count} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <LeadsPerDayChart data={data.leadsPerDay} />
        <LeadStatusDonut
          data={Object.entries(data.leadsByStatus).map(([name, value]) => ({ name, value }))}
        />
      </section>

      <section>
        <PostsPerWeekChart data={data.postsPerWeek} />
      </section>
    </div>
  );
}
