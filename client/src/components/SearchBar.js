import React from 'react';
import { FiSearch } from 'react-icons/fi';

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Books', 'Furniture', 'Sports', 'Other'];
const STATUSES = ['active', 'inactive', 'discontinued'];

export default function SearchBar({ search, category, status, onSearchChange, onCategoryChange, onStatusChange }) {
  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by name, SKU, or description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className="filter-select">
        <option value="">All Categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <select value={status} onChange={(e) => onStatusChange(e.target.value)} className="filter-select">
        <option value="">All Statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
    </div>
  );
}
