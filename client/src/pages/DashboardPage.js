import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiMoreHorizontal, FiTrash2, FiEye, FiBox, FiAlertTriangle, FiXCircle, FiClock, FiBell } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StockBadge from '../components/StockBadge';
import Pagination from '../components/Pagination';

export default function DashboardPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  const fetchItems = useCallback(async () => {
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;
      const res = await api.get('/inventory', { params });
      setItems(res.data.data.inventoryItems);
      setPagination(res.data.data.pagination);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, status]);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await api.get('/inventory/alerts/low-stock');
      const lowItems = res.data.data.lowStockItems;
      setLowStockCount(lowItems.filter((i) => i.quantity > 0).length);
      setOutOfStockCount(lowItems.filter((i) => i.quantity === 0).length);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchItems();
      fetchAlerts();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchItems, fetchAlerts]);

  useEffect(() => {
    setPage(1);
  }, [search, category, status]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleDelete(id) {
    try {
      await api.delete(`/inventory/${id}`);
      toast.success('Item deleted');
      setOpenMenu(null);
      fetchItems();
      fetchAlerts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete item');
    }
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: undefined,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  function formatDate(dateString) {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ', ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  return (
    <div className="dashboard">
      {/* Top Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Inventory Management</h1>
          <p className="dashboard-date">Today, {dateStr}</p>
        </div>
        <div className="dashboard-header-right">
          <div className="header-search-wrapper">
            <FiSearch className="header-search-icon" />
            <input
              type="text"
              placeholder="Search"
              className="header-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="header-notification">
            <FiBell />
          </button>
          <div className="header-user">
            <div className="header-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="header-username">{user?.username || 'User'}</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <FiBox />
          </div>
          <div className="stat-info">
            <h3>Total Items</h3>
            <p className="stat-description">Total items in stock</p>
            <span className="stat-value">{pagination.totalItems}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-yellow">
            <FiAlertTriangle />
          </div>
          <div className="stat-info">
            <h3>Low Stock Items</h3>
            <p className="stat-description">Number of items that are running low</p>
            <span className="stat-value">{lowStockCount}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-red">
            <FiClock />
          </div>
          <div className="stat-info">
            <h3>Expired Items</h3>
            <p className="stat-description">Number of items past their expiration date</p>
            <span className="stat-value">0</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-teal">
            <FiXCircle />
          </div>
          <div className="stat-info">
            <h3>Out of Stock Items</h3>
            <p className="stat-description">Count of items currently out of stock</p>
            <span className="stat-value">{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* Inventory Overview */}
      <div className="inventory-section">
        <div className="inventory-section-header">
          <h2>Inventory Overview</h2>
          <div className="inventory-section-actions">
            <div className="table-search-wrapper">
              <FiSearch className="table-search-icon" />
              <input
                type="text"
                placeholder="Search Item"
                className="table-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn-filter" onClick={() => {
              setCategory('');
              setStatus('');
            }}>
              <FiFilter /> Filter
            </button>
            <Link to="/items/add" className="btn-add-item">
              <FiPlus /> Add Item
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /><p>Loading inventory...</p></div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <FiBox className="empty-icon" />
            <h3>No items found</h3>
            <p>{search || category || status ? 'Try adjusting your filters' : 'Add your first inventory item to get started'}</p>
          </div>
        ) : (
          <>
            <div className="inventory-table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th className="th-checkbox"><input type="checkbox" /></th>
                    <th>Item Name</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Category</th>
                    <th>Last Updated</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id}>
                      <td className="td-checkbox"><input type="checkbox" /></td>
                      <td className="td-name">
                        <Link to={`/items/${item._id}`}>{item.name}</Link>
                      </td>
                      <td className="td-sku">{item.sku}</td>
                      <td>{item.quantity}{item.quantity !== undefined ? '' : '-'}</td>
                      <td>{item.category || '-'}</td>
                      <td className="td-date">{formatDate(item.updatedAt)}</td>
                      <td><StockBadge stockStatus={item.stockStatus} /></td>
                      <td className="td-actions">
                        <Link to={`/items/edit/${item._id}`} className="action-btn" title="Edit">
                          <FiEdit2 />
                        </Link>
                        <div className="action-menu-container" ref={openMenu === item._id ? menuRef : null}>
                          <button
                            className="action-btn"
                            title="More"
                            onClick={() => setOpenMenu(openMenu === item._id ? null : item._id)}
                          >
                            <FiMoreHorizontal />
                          </button>
                          {openMenu === item._id && (
                            <div className="action-dropdown">
                              <button onClick={() => handleDelete(item._id)}>
                                <FiTrash2 /> Delete
                              </button>
                              <Link to={`/items/${item._id}`} onClick={() => setOpenMenu(null)}>
                                <FiEye /> View Details
                              </Link>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
