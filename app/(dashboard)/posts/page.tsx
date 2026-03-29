"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

import type { Post, PostStatus } from "@/lib/types";
import { formatIST } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

const icons: Record<string, React.ReactNode> = {
  instagram: <ExternalLink className="h-4 w-4" />,
  facebook: <ExternalLink className="h-4 w-4" />,
  youtube: <ExternalLink className="h-4 w-4" />,
};

export default function PostsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<"ALL" | PostStatus>("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [count, setCount] = useState(0);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("posts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (status !== "ALL") {
      query = query.eq("status", status);
    }

    const { data, error, count: total } = await query;
    if (!error) {
      setPosts((data as Post[]) ?? []);
      setCount(total ?? 0);
    }
    setLoading(false);
  }, [page, status, supabase]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    const channel = supabase
      .channel("posts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, loadPosts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadPosts, supabase]);

  const totalPages = Math.max(Math.ceil(count / PAGE_SIZE), 1);

  return (
    <div className="page-shell">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Select
          value={status}
          onValueChange={(value: "ALL" | PostStatus) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="POSTED">POSTED</SelectItem>
            <SelectItem value="FAILED">FAILED</SelectItem>
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
                <TableHead>Video URL</TableHead>
                <TableHead>Caption</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Platform Links</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell className="py-8 text-center text-slate-500" colSpan={5}>
                    No posts found.
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <Link href={post.video_url} target="_blank" className="text-blue-700 hover:underline">
                        Open
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{post.caption}</TableCell>
                    <TableCell>
                      <StatusBadge status={post.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {Object.entries(post.platform_links ?? {}).map(([platform, url]) => (
                          <Link key={platform} href={url} target="_blank" className="rounded-md border p-2 hover:bg-slate-50">
                            {icons[platform] ?? platform}
                          </Link>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{formatIST(post.created_at)}</TableCell>
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
          Page {page} of {totalPages}
        </p>
        <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
