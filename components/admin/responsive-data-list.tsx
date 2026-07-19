"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ItemGroup } from "@/components/ui/item";
import { cn } from "@/lib/utils";

type Props = {
  /** Desktop table header row */
  tableHeader: React.ReactNode;
  /** Desktop table body rows */
  tableBody: React.ReactNode;
  /** Mobile Item rows */
  mobileItems: React.ReactNode;
  className?: string;
  empty?: React.ReactNode;
  isEmpty?: boolean;
};

/**
 * Responsive list: shadcn Table on md+, Item group on mobile.
 * Compose only — no custom chrome beyond Card wrapper.
 */
export function ResponsiveDataList({
  tableHeader,
  tableBody,
  mobileItems,
  className,
  empty,
  isEmpty,
}: Props) {
  if (isEmpty) {
    return (
      <Card className={cn("border-border shadow-none", className)}>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          {empty ?? "No records found."}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border shadow-none overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="md:hidden">
          <ItemGroup className="divide-y divide-border">{mobileItems}</ItemGroup>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>{tableHeader}</TableRow>
            </TableHeader>
            <TableBody>{tableBody}</TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
