"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

import React from "react";
import { usePathname } from "next/navigation";

const toTitleCase = (str: string) => {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.replace(/^\//, "").split("/");
  const formattedParts = parts.map(toTitleCase);
  const breadcrumbParts = formattedParts.slice(0, -1);
  const lastPart = formattedParts[formattedParts.length - 1];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbParts.map((part, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">{part}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
          </React.Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{lastPart}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
