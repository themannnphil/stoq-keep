import React from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiEye, FiPlus, FiMinus } from 'react-icons/fi';
import StockBadge from './StockBadge';

export default function ItemCard({ item, onStockAdjust }) {
  return (
    <div className="item-card">
      <div className="item-card-header">
        <div>
          <Link to={`/items/${item._id}`} className="item-name">{item.name}</Link>
          <span className="item-sku">{item.sku}</span>
        </div>
        <StockBadge stockStatus={item.stockStatus} />
      </div>
      <div className="item-card-body">
        <div className="item-detail">
          <span className="item-label">Category</span>
          <span>{item.category}</span>
        </div>
        <div className="item-detail">
          <span className="item-label">Price</span>
          <span>${Number(item.price).toFixed(2)}</span>
        </div>
        <div className="item-detail">
          <span className="item-label">Quantity</span>
          <span className="item-quantity">{item.quantity}</span>
        </div>
      </div>
      <div className="item-card-actions">
        <div className="stock-adjust">
          <button
            className="btn-icon btn-icon-danger"
            title="Subtract 1"
            onClick={() => onStockAdjust(item._id, 'subtract', 1)}
            disabled={item.quantity === 0}
          >
            <FiMinus />
          </button>
          <button
            className="btn-icon btn-icon-success"
            title="Add 1"
            onClick={() => onStockAdjust(item._id, 'add', 1)}
          >
            <FiPlus />
          </button>
        </div>
        <div className="card-links">
          <Link to={`/items/${item._id}`} className="btn-icon" title="View"><FiEye /></Link>
          <Link to={`/items/edit/${item._id}`} className="btn-icon" title="Edit"><FiEdit2 /></Link>
        </div>
      </div>
    </div>
  );
}
