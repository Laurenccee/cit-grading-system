'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import * as React from 'react';

export default function BreadcrumbDynamic({
  sidebarData,
}: {
  sidebarData: any;
}) {
  const pathname = usePathname();

  function flattenSidebar(navMain: any[]) {
    const result: any[] = [];
    for (const group of navMain) {
      if (Array.isArray(group.items)) {
        for (const item of group.items) {
          result.push({ ...item, group: group.group });
          if (item.children) {
            for (const child of item.children) {
              result.push({ ...child, parent: item, group: group.group });
            }
          }
        }
      }
    }
    return result;
  }

  const flatItems = flattenSidebar(sidebarData.navMain);
  const segments = pathname.split('/').filter(Boolean);
  const trail = segments
    .map((segment) => {
      const url =
        '/' + segments.slice(0, segments.indexOf(segment) + 1).join('/');
      return flatItems.find((item) => item.url === url);
    })
    .filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        {trail.map((item, idx) => (
          <React.Fragment key={item.url}>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              {idx === trail.length - 1 ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.url}>{item.title}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
