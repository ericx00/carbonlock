import React from 'react';

export default function DeleteContractModal({ contract, onConfirm, onClose }) {
  if (!contract) return null;
  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog" style={{background: 'rgba(0,0,0,0.3)'}}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Delete Contract #{contract.id}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to delete this contract?</p>
            <ul>
              <li><strong>Buyer:</strong> {contract.buyer}</li>
              <li><strong>Seller:</strong> {contract.seller}</li>
              <li><strong>Amount:</strong> {contract.amount} tons</li>
              <li><strong>Price:</strong> ${contract.price}</li>
              <li><strong>Year:</strong> {contract.year}</li>
            </ul>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={() => onConfirm(contract.id)}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
