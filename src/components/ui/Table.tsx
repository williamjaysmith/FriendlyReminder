'use client'

import { cn } from '@/lib/utils'
import { TableProps, TableColumn } from '@/lib/types'
import LoadingSpinner from './LoadingSpinner'

function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  selectable = false,
  onSelectionChange,
  className,
  children,
  ...props
}: TableProps<T>) {
  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? data : [])
    }
  }

  const handleSelectRow = (row: T, checked: boolean) => {
    if (onSelectionChange) {
      const currentSelection = [] // This would come from parent component state
      const newSelection = checked 
        ? [...currentSelection, row]
        : currentSelection.filter(item => item !== row)
      onSelectionChange(newSelection)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-[#666]">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-[#ddd]', className)} {...props}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f5f5f5]">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-[#ddd] text-[#fcba28] focus:ring-[#fcba28]"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-medium text-[#262522]',
                    column.width && `w-[${column.width}]`
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ddd] bg-white">
            {data.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  'hover:bg-[#f9f9f9] transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => handleRowClick(row)}
              >
                {selectable && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectRow(row, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-[#ddd] text-[#fcba28] focus:ring-[#fcba28]"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-4 py-3 text-sm text-[#262522]"
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '')
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {children}
    </div>
  )
}

export default Table