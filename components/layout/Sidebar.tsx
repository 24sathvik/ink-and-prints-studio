/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, FileText, Users, Kanban,
  CheckSquare, UserCog, ChevronLeft, ChevronRight, LogOut,
} from "lucide-react";
import { useUIStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/invoices", icon: FileText, label: "Invoices" },
  { href: "/dashboard/leads", icon: Users, label: "Leads" },
  { href: "/dashboard/work-in-progress", icon: Kanban, label: "Work in Progress" },
  { href: "/dashboard/final-check", icon: CheckSquare, label: "Final Check" },
];

const ADMIN_ITEMS = [
  { href: "/dashboard/users", icon: UserCog, label: "Users" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  const isAdmin = session?.user?.role === "ADMIN";
  const name = session?.user?.name || "User";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const collapsed = isSidebarCollapsed;

  return (
    <aside
      className={`hidden md:flex flex-col bg-brand-navy text-white transition-all duration-300 relative shrink-0 ${
        collapsed ? "w-16" : "w-60"
      }`}
      style={{ minHeight: "100vh" }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0">
          I
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-sm leading-tight">Ink & Prints</div>
            <div className="text-[10px] text-slate-400 leading-tight">Studio</div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-brand-orange/20 text-brand-orange border-l-4 border-brand-orange"
                  : "text-slate-400 hover:bg-white/10 hover:text-white border-l-4 border-transparent"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className={`my-2 border-t border-white/10 ${collapsed ? "" : "mx-1"}`} />
            {ADMIN_ITEMS.map(({ href, icon: Icon, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-brand-orange/20 text-brand-orange border-l-4 border-brand-orange"
                      : "text-slate-400 hover:bg-white/10 hover:text-white border-l-4 border-transparent"
                  } ${collapsed ? "justify-center px-2" : ""}`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User Section */}
      <div className={`border-t border-white/10 p-3 ${collapsed ? "flex justify-center" : ""}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{name}</div>
              <div className="text-[10px] text-slate-400">{session?.user?.role}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-brand-navy border border-white/20 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
