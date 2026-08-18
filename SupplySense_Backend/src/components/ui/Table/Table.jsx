import React from 'react';

export const Table = ({ columns = [], data = [], onRowClick, className = '' }) => {
  return (
    <div className={`table-container ${className}`}>
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, idx) => {
              const headerText = col.title || col.header || '';
              return (
                <th key={col.key || idx} style={{ width: col.width }}>
                  {headerText}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-subtle-blue)' }}>
                No records found matching your filters.
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={row.id || rIdx}
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col, cIdx) => {
                  const keyName = col.dataIndex || col.accessor;
                  const cellVal = keyName ? row[keyName] : undefined;
                  return (
                    <td key={col.key || cIdx}>
                      {col.render ? col.render(cellVal, row) : (cellVal !== undefined && cellVal !== null ? cellVal : '')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
