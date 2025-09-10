"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

interface SidebarItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  activePaths?: string[];
}

interface SidebarItemsProps {
  title?: string;
  items: SidebarItem[];
  currentPath: string;
}

export function SidebarItem({ title, items, currentPath }: SidebarItemsProps) {
  return (
    <SidebarGroup>
      {title && (
        <SidebarGroupLabel className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {title}
        </SidebarGroupLabel>
      )}
      <SidebarMenu>
        {items.map((item) => {
          // Active state logic
          const isActive =
            currentPath === item.url ||
            (currentPath === "/" && item.url === "/") ||
            (item.url !== "/" && currentPath.startsWith(item.url)) ||
            (item.activePaths &&
              item.activePaths.some(
                (path) => currentPath === path || currentPath.startsWith(path)
              ));

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link
                  href={item.url}
                  className={cn(
                    "text-md font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-neutral-600 dark:text-neutral-300 hover:bg-sidebar-accent/40"
                  )}
                >
                  {item.icon && <item.icon className="h-8 w-8" />}
                  <span className="text-base">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
