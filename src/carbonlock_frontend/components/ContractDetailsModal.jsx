import React from 'react';

export default function ContractDetailsModal({ contract, onClose, eventHistory }) {
  if (!contract) return null;
  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog" style={{background: 'rgba(0,0,0,0.3)'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Contract #{contract.id} Details</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <dl className="row">
              <dt className="col-sm-4">Buyer</dt>
              <dd className="col-sm-8">{contract.buyer}</dd>
              <dt className="col-sm-4">Seller</dt>
              <dd className="col-sm-8">{contract.seller}</dd>
              <dt className="col-sm-4">Amount (tons)</dt>
              <dd className="col-sm-8">{contract.amount}</dd>
              <dt className="col-sm-4">Price (USD)</dt>
              <dd className="col-sm-8">${contract.price}</dd>
              <dt className="col-sm-4">Year</dt>
              <dd className="col-sm-8">{contract.year}</dd>
              <dt className="col-sm-4">Status</dt>
              <dd className="col-sm-8"><span className={`badge bg-${contract.statusColor}`}>{contract.status}</span></dd>
              <dt className="col-sm-4">Created At</dt>
              <dd className="col-sm-8">{new Date(contract.created_at * 1000).toLocaleString()}</dd>
              <dt className="col-sm-4">Updated At</dt>
              <dd className="col-sm-8">{new Date(contract.updated_at * 1000).toLocaleString()}</dd>
            </dl>
            <h6>Event History</h6>
            <ul className="timeline list-unstyled">
              {eventHistory && eventHistory.length > 0 ? eventHistory.map((ev, idx) => (
                <li key={idx} className="mb-2">
                  <span className={`badge bg-secondary me-2`}>{ev.event_type}</span>
                  {new Date(ev.timestamp * 1000).toLocaleString()} - {ev.details || ''}
                </li>
              )) : <li>No events found.</li>}
            </ul>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
