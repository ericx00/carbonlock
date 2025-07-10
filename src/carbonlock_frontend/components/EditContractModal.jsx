import React, { useState, useEffect } from 'react';

export default function EditContractModal({ contract, onSave, onClose }) {
  const [form, setForm] = useState({ id: '', buyer: '', seller: '', amount: '', price: '', year: '' });

  useEffect(() => {
    if (contract) setForm(contract);
  }, [contract]);

  if (!contract) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = e => {
    e.preventDefault();
    onSave(form);
  };
  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog" style={{background: 'rgba(0,0,0,0.3)'}}>
      <div className="modal-dialog">
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">Edit Contract #{contract.id}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label">Buyer</label>
              <input className="form-control" name="buyer" value={form.buyer} onChange={handleChange} required />
            </div>
            <div className="mb-2">
              <label className="form-label">Seller</label>
              <input className="form-control" name="seller" value={form.seller} onChange={handleChange} required />
            </div>
            <div className="mb-2">
              <label className="form-label">Amount (tons)</label>
              <input type="number" className="form-control" name="amount" value={form.amount} onChange={handleChange} required min="1" />
            </div>
            <div className="mb-2">
              <label className="form-label">Price (USD)</label>
              <input type="number" className="form-control" name="price" value={form.price} onChange={handleChange} required min="1" />
            </div>
            <div className="mb-2">
              <label className="form-label">Year</label>
              <input type="number" className="form-control" name="year" value={form.year} onChange={handleChange} required min="2024" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
