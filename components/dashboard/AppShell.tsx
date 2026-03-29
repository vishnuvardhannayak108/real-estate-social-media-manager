"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BarChart3,
  BookCheck,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Upload,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { formatDateOnlyIST } from "@/lib/format";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/posts", label: "Posts", icon: ClipboardList },
  { href: "/leads", label: "Leads CRM", icon: Users },
  { href: "/chats", label: "Chat Monitor", icon: MessageCircle },
  { href: "/bookings", label: "Bookings", icon: BookCheck },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/logs", label: "Logs", icon: BarChart3 },
];

function Sidebar({ close }: { close?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Admin</p>
          <h1 className="text-lg font-semibold">Real Estate AI</h1>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const today = useMemo(() => formatDateOnlyIST(new Date()), []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="hidden h-screen w-64 fixed inset-y-0 lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <Sidebar close={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <p className="text-sm text-slate-600">{today} IST</p>
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-slate-600 sm:block">{userEmail}</p>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
