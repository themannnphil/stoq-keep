import React, { useState } from 'react';

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Books', 'Furniture', 'Sports', 'Other'];

const emptyForm = {
  name: '',
  description: '',
  category: '',
  sku: '',
  quantity: 0,
  minStockLevel: 10,
  price: 0,
  supplierName: '',
  supplierEmail: '',
  supplierPhone: '',
  warehouse: '',
  aisle: '',
  shelf: '',
  status: 'active',
};

export default function ItemForm({ initialData, onSubmit, submitLabel }) {
  const [form, setForm] = useState(() => {
    if (!initialData) return emptyForm;
    return {
      name: initialData.name || '',
      description: initialData.description || '',
      category: initialData.category || '',
      sku: initialData.sku || '',
      quantity: initialData.quantity ?? 0,
      minStockLevel: initialData.minStockLevel ?? 10,
      price: initialData.price ?? 0,
      supplierName: initialData.supplier?.name || '',
      supplierEmail: initialData.supplier?.email || '',
      supplierPhone: initialData.supplier?.phone || '',
      warehouse: initialData.location?.warehouse || '',
      aisle: initialData.location?.aisle || '',
      shelf: initialData.location?.shelf || '',
      status: initialData.status || 'active',
    };
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        sku: form.sku.toUpperCase(),
        quantity: Number(form.quantity),
        minStockLevel: Number(form.minStockLevel),
        price: Number(form.price),
        supplier: {
          name: form.supplierName,
          email: form.supplierEmail,
          phone: form.supplierPhone,
        },
        location: {
          warehouse: form.warehouse,
          aisle: form.aisle,
          shelf: form.shelf,
        },
        status: form.status,
      };
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Basic Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input id="name" name="name" type="text" required maxLength={100} value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="sku">SKU *</label>
            <input id="sku" name="sku" type="text" required value={form.sku} onChange={handleChange} placeholder="e.g. ELEC-001" style={{ textTransform: 'uppercase' }} />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select id="category" name="category" required value={form.category} onChange={handleChange}>
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </div>
        <div className="form-group full-width">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" maxLength={500} rows={3} value={form.description} onChange={handleChange} />
        </div>
      </div>

      <div className="form-section">
        <h3>Stock &amp; Pricing</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input id="quantity" name="quantity" type="number" required min={0} value={form.quantity} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="minStockLevel">Min Stock Level *</label>
            <input id="minStockLevel" name="minStockLevel" type="number" required min={0} value={form.minStockLevel} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price ($) *</label>
            <input id="price" name="price" type="number" required min={0} step="0.01" value={form.price} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Supplier</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="supplierName">Supplier Name</label>
            <input id="supplierName" name="supplierName" type="text" maxLength={100} value={form.supplierName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="supplierEmail">Supplier Email</label>
            <input id="supplierEmail" name="supplierEmail" type="email" value={form.supplierEmail} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="supplierPhone">Supplier Phone</label>
            <input id="supplierPhone" name="supplierPhone" type="tel" value={form.supplierPhone} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Location</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="warehouse">Warehouse</label>
            <input id="warehouse" name="warehouse" type="text" maxLength={50} value={form.warehouse} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="aisle">Aisle</label>
            <input id="aisle" name="aisle" type="text" maxLength={20} value={form.aisle} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="shelf">Shelf</label>
            <input id="shelf" name="shelf" type="text" maxLength={20} value={form.shelf} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : (submitLabel || 'Save Item')}
        </button>
      </div>
    </form>
  );
}
