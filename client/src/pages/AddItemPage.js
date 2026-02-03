import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import ItemForm from '../components/ItemForm';

export default function AddItemPage() {
  const navigate = useNavigate();

  async function handleSubmit(data) {
    try {
      await api.post('/inventory', data);
      toast.success('Item created successfully');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create item';
      toast.error(msg);
      throw err;
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Add New Item</h2>
      </div>
      <ItemForm onSubmit={handleSubmit} submitLabel="Create Item" />
    </div>
  );
}
