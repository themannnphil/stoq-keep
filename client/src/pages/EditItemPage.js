import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import api from '../api/axios';
import ItemForm from '../components/ItemForm';

export default function EditItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      try {
        const res = await api.get(`/inventory/${id}`);
        setItem(res.data.data.inventoryItem);
      } catch (err) {
        toast.error('Item not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [id, navigate]);

  async function handleSubmit(data) {
    try {
      await api.put(`/inventory/${id}`, data);
      toast.success('Item updated successfully');
      navigate('/inventory');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update item';
      toast.error(msg);
      throw err;
    }
  }

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /><p>Loading item...</p></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/inventory" className="btn btn-secondary"><FiArrowLeft /> Back</Link>
        <h2>Edit Item</h2>
      </div>
      <ItemForm initialData={item} onSubmit={handleSubmit} submitLabel="Update Item" />
    </div>
  );
}
