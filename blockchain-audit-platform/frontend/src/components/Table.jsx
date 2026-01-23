import React from 'react';
import '../styles/Table.css';

/**
 * Table Component
 * Reusable data table with responsive design
 * 
 * @param {Object} props - Component props
 * @param {Array} props.columns - Column configuration
 * @param {Object[]} props.data - Table data array
 * @param {Function} props.renderCell - Optional custom cell renderer
 */
const Table = ({ columns, data = [], renderCell }) => {
  if (!data || data.length === 0) {
    return (
      <div className="table-responsive" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>No data available</p>
      </div>
    );
  }

  const getColumnKey = (col) => {
    if (typeof col === 'string') return col;
    return col.key;
  };

  const getColumnLabel = (col) => {
    if (typeof col === 'string') return col;
    return col.label || col.key;
  };

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{getColumnLabel(col)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {columns.map((col, colIdx) => {
                const key = getColumnKey(col);
                return (
                  <td key={colIdx}>
                    {renderCell ? renderCell(row, key) : row[key]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
