import React from 'react';

export default function StockBadge({ stockStatus }) {
  const config = {
    in_stock: { label: 'In Stock', className: 'badge-success' },
    low_stock: { label: 'Low Stock', className: 'badge-warning' },
    out_of_stock: { label: 'Out of Stock', className: 'badge-danger' },
  };

  const { label, className } = config[stockStatus] || config.in_stock;

  return <span className={`stock-badge ${className}`}>{label}</span>;
}
