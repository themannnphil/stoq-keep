import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import api from '../api/axios';
import StockBadge from '../components/StockBadge';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [stockQty, setStockQty] = useState('');
  const [stockOp, setStockOp] = useState('set');

  useEffect(() => {
    async function fetchItem() {
      try {
        const res = await api.get(`/inventory/${id}`);
        setItem(res.data.data.inventoryItem);
      } catch {
        toast.error('Item not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [id, navigate]);

  async function handleDelete() {
    try {
      await api.delete(`/inventory/${id}`);
      toast.success('Item deleted');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete item');
    }
    setShowDelete(false);
  }

  async function handleStockUpdate(e) {
    e.preventDefault();
    if (stockQty === '' || stockQty < 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    try {
      const res = await api.patch(`/inventory/${id}/stock`, {
        operation: stockOp,
        quantity: Number(stockQty),
      });
      setItem(res.data.data.inventoryItem);
      setStockQty('');
      toast.success('Stock updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Stock update failed');
    }
  }

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>;
  }

  if (!item) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/" className="btn btn-secondary"><FiArrowLeft /> Back</Link>
        <div className="page-header-actions">
          <Link to={`/items/edit/${item._id}`} className="btn btn-primary"><FiEdit2 /> Edit</Link>
          {user?.role === 'admin' && (
            <button className="btn btn-danger" onClick={() => setShowDelete(true)}><FiTrash2 /> Delete</button>
          )}
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-header">
          <div>
            <h2>{item.name}</h2>
            <span className="item-sku">{item.sku}</span>
          </div>
          <StockBadge stockStatus={item.stockStatus} />
        </div>

        {item.description && <p className="detail-description">{item.description}</p>}

        <div className="detail-grid">
          <div className="detail-section">
            <h3>Details</h3>
            <dl>
              <dt>Category</dt><dd>{item.category}</dd>
              <dt>Status</dt><dd className="capitalize">{item.status}</dd>
              <dt>Price</dt><dd>${Number(item.price).toFixed(2)}</dd>
              <dt>Quantity</dt><dd>{item.quantity}</dd>
              <dt>Min Stock Level</dt><dd>{item.minStockLevel}</dd>
            </dl>
          </div>

          {(item.supplier?.name || item.supplier?.email || item.supplier?.phone) && (
            <div className="detail-section">
              <h3>Supplier</h3>
              <dl>
                {item.supplier.name && <><dt>Name</dt><dd>{item.supplier.name}</dd></>}
                {item.supplier.email && <><dt>Email</dt><dd>{item.supplier.email}</dd></>}
                {item.supplier.phone && <><dt>Phone</dt><dd>{item.supplier.phone}</dd></>}
              </dl>
            </div>
          )}

          {(item.location?.warehouse || item.location?.aisle || item.location?.shelf) && (
            <div className="detail-section">
              <h3>Location</h3>
              <dl>
                {item.location.warehouse && <><dt>Warehouse</dt><dd>{item.location.warehouse}</dd></>}
                {item.location.aisle && <><dt>Aisle</dt><dd>{item.location.aisle}</dd></>}
                {item.location.shelf && <><dt>Shelf</dt><dd>{item.location.shelf}</dd></>}
              </dl>
            </div>
          )}
        </div>

        <div className="stock-adjust-section">
          <h3>Adjust Stock</h3>
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

        <div className="detail-meta">
          <span>Added by: {item.addedBy?.username || 'Unknown'}</span>
          <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
