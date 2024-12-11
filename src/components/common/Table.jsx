// src/components/common/Table.jsx
const Table = ({ 
    columns, 
    data, 
    onRowClick,
    className = '' 
  }) => {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {columns.map((column, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  