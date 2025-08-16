import React from 'react'

export default function Table({ columns = [], data = [], rowKey='id', actions }) {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map(c => (
            <th key={c.key}>{c.title}</th>
          ))}
          {actions && <th></th>}
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row[rowKey]}>
            {columns.map(c => (
              <td key={c.key}>
                {c.render ? c.render(row[c.key], row) : row[c.key]}
              </td>
            ))}
            {actions && (
              <td style={{ whiteSpace: 'nowrap' }}>
                {actions(row)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
