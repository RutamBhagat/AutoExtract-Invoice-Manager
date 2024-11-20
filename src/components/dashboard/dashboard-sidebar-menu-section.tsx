"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Minus, Plus } from "lucide-react";
import {
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import React from "react";
import { usePathname } from "next/navigation";

type MenuItem = {
  title: string;
  url?: string;
  items?: MenuItem[]; // Optional sub-items
};

type Props = {
  item: MenuItem;
};

export default function DashboardSidebarMenuSection({ item }: Props) {
  const pathname = usePathname();

  // Check if any submenu item in a section matches current path
  const isGroupActive = (items: Array<{ url: string }>) => {
    return items?.some((item) => pathname?.startsWith(item.url));
  };

  return (
    <Collapsible
      key={item.title}
      defaultOpen={isGroupActive(
        (item.items ?? []).filter(
          (subItem) => subItem.url !== undefined,
        ) as Array<{ url: string }>,
      )}
      className="group/collapsible"
    >
      <div>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            {item.title}
            <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
            <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        {item.items?.length ? (
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={subItem.url === pathname}
                  >
                    <a href={subItem.url}>{subItem.title}</a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        ) : null}
      </div>
    </Collapsible>
  );
}
