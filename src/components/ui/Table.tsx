import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data available.',
  className = '',
}: TableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
        <p className="text-body-md">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm ${className}`}>
      <table className="w-full text-left text-body-sm border-collapse">
        <thead className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-semibold">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {data.map((row, rowIndex) => (
            <tr key={keyExtractor(row, rowIndex)} className="hover:bg-surface-container-high/40 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`px-6 py-4 text-on-surface ${col.className || ''}`}>
                  {typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : (row[col.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
