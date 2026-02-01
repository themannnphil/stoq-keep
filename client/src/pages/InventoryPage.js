import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiSearch, FiFilter, FiPlus, FiEdit2, FiMoreHorizontal,
  FiTrash2, FiEye, FiBox, FiChevronDown, FiChevronUp, FiX
} from 'react-icons/fi';
import api from '../api/axios';
import StockBadge from '../components/StockBadge';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [stockQty, setStockQty] = useState('');
  const [stockOp, setStockOp] = useState('set');
  const [showDelete, setShowDelete] = useState(false);
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

  useEffect(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems]);

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

  async function fetchItemDetail(id) {
    setDetailLoading(true);
    try {
      const res = await api.get(`/inventory/${id}`);
      setSelectedItem(res.data.data.inventoryItem);
    } catch {
      toast.error('Failed to load item details');
      setSelectedItemId(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function handleRowClick(itemId) {
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
      setSelectedItem(null);
    } else {
      setSelectedItemId(itemId);
      setStockQty('');
      setStockOp('set');
      fetchItemDetail(itemId);
    }
  }

  async function handleStockUpdate(e) {
    e.preventDefault();
    if (stockQty === '' || stockQty < 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    try {
      const res = await api.patch(`/inventory/${selectedItemId}/stock`, {
        operation: stockOp,
        quantity: Number(stockQty),
      });
      setSelectedItem(res.data.data.inventoryItem);
      setStockQty('');
      toast.success('Stock updated');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Stock update failed');
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/inventory/${id}`);
      toast.success('Item deleted');
      setOpenMenu(null);
      if (selectedItemId === id) {
        setSelectedItemId(null);
        setSelectedItem(null);
      }
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete item');
    }
    setShowDelete(false);
  }

  function formatDate(dateString) {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ', ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Inventory</h1>
          <p className="dashboard-date">{pagination.totalItems} total items</p>
        </div>
      </div>

      <div className="inventory-section">
        <div className="inventory-section-header">
          <h2>All Items</h2>
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
            <button className="btn-filter" onClick={() => { setCategory(''); setStatus(''); }}>
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
                    <React.Fragment key={item._id}>
                      <tr
                        className={`inventory-row-clickable ${selectedItemId === item._id ? 'inventory-row-selected' : ''}`}
                        onClick={() => handleRowClick(item._id)}
                      >
                        <td className="td-checkbox" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" />
                        </td>
                        <td className="td-name">
                          <span className="td-name-text">{item.name}</span>
                          {selectedItemId === item._id ? <FiChevronUp className="row-expand-icon" /> : <FiChevronDown className="row-expand-icon" />}
                        </td>
                        <td className="td-sku">{item.sku}</td>
                        <td>{item.quantity !== undefined ? item.quantity : '-'}</td>
                        <td>{item.category || '-'}</td>
                        <td className="td-date">{formatDate(item.updatedAt)}</td>
                        <td><StockBadge stockStatus={item.stockStatus} /></td>
                        <td className="td-actions" onClick={(e) => e.stopPropagation()}>
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
                                <button onClick={() => { setShowDelete(true); setOpenMenu(null); }}>
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
                      {selectedItemId === item._id && (
                        <tr className="detail-panel-row">
                          <td colSpan="8">
                            <div className="inline-detail-panel">
                              {detailLoading ? (
                                <div className="inline-detail-loading">
                                  <div className="spinner" /><p>Loading details...</p>
                                </div>
                              ) : selectedItem ? (
                                <>
                                  <div className="inline-detail-header">
                                    <div className="inline-detail-title">
                                      <h3>{selectedItem.name}</h3>
                                      <span className="item-sku">{selectedItem.sku}</span>
                                    </div>
                                    <div className="inline-detail-header-actions">
                                      <StockBadge stockStatus={selectedItem.stockStatus} />
                                      <button className="action-btn" onClick={() => { setSelectedItemId(null); setSelectedItem(null); }}>
                                        <FiX />
                                      </button>
                                    </div>
                                  </div>

                                  {selectedItem.description && (
                                    <p className="inline-detail-desc">{selectedItem.description}</p>
                                  )}

                                  <div className="inline-detail-grid">
                                    <div className="inline-detail-section">
                                      <h4>Details</h4>
                                      <dl>
                                        <dt>Category</dt><dd>{selectedItem.category}</dd>
                                        <dt>Status</dt><dd className="capitalize">{selectedItem.status}</dd>
                                        <dt>Price</dt><dd>${Number(selectedItem.price).toFixed(2)}</dd>
                                        <dt>Quantity</dt><dd>{selectedItem.quantity}</dd>
                                        <dt>Min Stock Level</dt><dd>{selectedItem.minStockLevel}</dd>
                                      </dl>
                                    </div>

                                    {(selectedItem.supplier?.name || selectedItem.supplier?.email || selectedItem.supplier?.phone) && (
                                      <div className="inline-detail-section">
                                        <h4>Supplier</h4>
                                        <dl>
                                          {selectedItem.supplier.name && <><dt>Name</dt><dd>{selectedItem.supplier.name}</dd></>}
                                          {selectedItem.supplier.email && <><dt>Email</dt><dd>{selectedItem.supplier.email}</dd></>}
                                          {selectedItem.supplier.phone && <><dt>Phone</dt><dd>{selectedItem.supplier.phone}</dd></>}
                                        </dl>
                                      </div>
                                    )}

                                    {(selectedItem.location?.warehouse || selectedItem.location?.aisle || selectedItem.location?.shelf) && (
                                      <div className="inline-detail-section">
                                        <h4>Location</h4>
                                        <dl>
                                          {selectedItem.location.warehouse && <><dt>Warehouse</dt><dd>{selectedItem.location.warehouse}</dd></>}
                                          {selectedItem.location.aisle && <><dt>Aisle</dt><dd>{selectedItem.location.aisle}</dd></>}
                                          {selectedItem.location.shelf && <><dt>Shelf</dt><dd>{selectedItem.location.shelf}</dd></>}
                                        </dl>
                                      </div>
                                    )}
                                  </div>

                                  <div className="inline-stock-adjust">
                                    <h4>Adjust Stock</h4>
                                    <form className="stock-adjust-form" onSubmit={handleStockUpdate}>
                                      <select value={stockOp} onChange={(e) => setStockOp(e.target.value)}>
                                        <option value="set">Set to</option>
                                        <option value="add">Add</option>
                                        <option value="subtract">Subtract</option>
                                      </select>
                                      <input
                                        type="number"
                                        min={0}
                                        value={stockQty}
                                        onChange={(e) => setStockQty(e.target.value)}
                                        placeholder="Quantity"
                                        required
                                      />
                                      <button type="submit" className="btn btn-primary">Update Stock</button>
                                    </form>
                                  </div>

                                  <div className="inline-detail-actions">
                                    <Link to={`/items/edit/${selectedItem._id}`} className="btn btn-primary">
                                      <FiEdit2 /> Edit Item
                                    </Link>
                                    <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
                                      <FiTrash2 /> Delete Item
                                    </button>
                                  </div>
                                </>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

      <ConfirmModal
        isOpen={showDelete}
        title="Delete Item"
        message={`Are you sure you want to delete this item? This action cannot be undone.`}
        onConfirm={() => handleDelete(selectedItemId || openMenu)}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
