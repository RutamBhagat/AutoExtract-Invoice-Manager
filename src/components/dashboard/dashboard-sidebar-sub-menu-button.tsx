"use client";

import React from "react";
import { SidebarMenuSubButton } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

type Props = {
  item: { title: string; url: string };
};

export default function DashboardSidebarSubMenuButton({ item }: Props) {
  const pathname = usePathname();

  return (
    <SidebarMenuSubButton asChild isActive={item.url === pathname}>
      <a href={item.url}>{item.title}</a>
    </SidebarMenuSubButton>
  );
}
