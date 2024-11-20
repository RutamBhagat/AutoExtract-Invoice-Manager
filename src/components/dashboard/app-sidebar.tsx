import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import DashboardSidebarMenuSection from "./dashboard-sidebar-menu-section";
import { FileText } from "lucide-react";
import { SearchForm } from "@/components/search-form";

const data = {
  navMain: [
    {
      title: "File Management",
      url: "/file-management",
      items: [
        {
          title: "File Upload",
          url: "/file-management/file-upload",
        },
      ],
    },
    {
      title: "Data Views",
      url: "/data-views",
      items: [
        {
          title: "Invoices",
          url: "/data-views/invoices",
        },
        {
          title: "Products",
          url: "/data-views/products",
        },
        {
          title: "Customers",
          url: "/data-views/customers",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <FileText className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Data Extractor</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item, index) => (
              <DashboardSidebarMenuSection key={index} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
