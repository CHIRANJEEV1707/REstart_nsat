"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  User, 
  Heart, 
  BookOpen, 
  Calendar, 
  Settings, 
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Profile",
    icon: User,
    href: "/dashboard/profile",
  },
  {
    title: "Saved Colleges",
    icon: Heart,
    href: "/dashboard/saved",
  },
  {
    title: "Exam Prep",
    icon: BookOpen,
    href: "/dashboard/exams",
  },
  {
    title: "Reminders",
    icon: Calendar,
    href: "/dashboard/reminders",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ width: 250 }}
      animate={{ width: collapsed ? 80 : 250 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "h-[calc(100vh-4rem)] sticky top-16 left-0 border-r border-border bg-background flex flex-col",
        collapsed ? "items-center" : ""
      )}
    >
      <div className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start mb-1",
                      collapsed ? "justify-center px-2" : ""
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
                    {!collapsed && <span>{item.title}</span>}
                    {isActive && !collapsed && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"
                      />
                    )}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="self-end m-4"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </motion.div>
  );
}
