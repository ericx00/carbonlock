import React from 'react';

export default function Toast({ show, message, type = 'success', onClose }) {
  if (!show) return null;
  return (
    <div className={`toast align-items-center text-bg-${type} border-0 position-fixed bottom-0 end-0 m-4`} role="alert" aria-live="assertive" aria-atomic="true" style={{zIndex: 9999, minWidth: '250px'}}>
      <div className="d-flex">
        <div className="toast-body">{message}</div>
        <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={onClose}></button>
      </div>
    </div>
  );
}
