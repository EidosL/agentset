import type { ColumnDef, TableMeta } from "@tanstack/react-table";

import { Button, cn, DataTable } from "@agentset/ui";

interface PaginatedTableProps<T> {
  columns: ColumnDef<T>[];
  data?: {
    records: T[];
    nextCursor?: string | null;
  };
  meta?: TableMeta<T>;
  isLoading: boolean;
  isDialog?: boolean;
  onNext?: ({ nextCursor }: { nextCursor?: string | null }) => void;
  onPrevious?: () => void;
  hasPrevious?: boolean;
}

export function PaginatedTable<T>({
  columns,
  data,
  meta,
  isLoading,
  isDialog,
  onNext,
  onPrevious,
  hasPrevious,
}: PaginatedTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <div className={cn("w-full", isDialog && "min-h-[450px]")}>
        <DataTable
          columns={columns}
          data={data?.records}
          isLoading={isLoading}
          meta={meta}
        />
      </div>

      <div className="mt-10 flex gap-4">
        <Button variant="outline" onClick={onPrevious} disabled={!hasPrevious}>
          Previous Page
        </Button>

        <Button
          variant="outline"
          onClick={() => onNext?.({ nextCursor: data?.nextCursor })}
          disabled={!data?.nextCursor}
        >
          Next Page
        </Button>
      </div>
    </div>
  );
}
