import React, { useEffect, useState, useCallback } from 'react';
import { carbonlock_backend } from 'declarations/carbonlock_backend';
import logo from './logo2.svg';

function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  return error ? (
    <div className="error-modal">
      <h2>Error</h2>
      <p>{error.message}</p>
      <button onClick={() => setError(null)}>Dismiss</button>
    </div>
  ) : (
    <React.Suspense fallback={<div>Loading...</div>}>
      {React.cloneElement(children, { setError })}
    </React.Suspense>
  );
}

function Spinner() {
  return <div className="spinner">Loading...</div>;
}

function Dashboard({ contracts, credits, principal }) {
  const myContracts = contracts.filter(c => c.buyer === principal || c.seller === principal);
  return (
    <section className="dashboard">
      <h3>My Contracts</h3>
      {myContracts.length === 0 ? <p>No contracts yet.</p> : (
        <ul>
          {myContracts.map(c => (
            <li key={c.id}>#{c.id} - {c.status} - {c.amount_tonnes}t @ ${c.price_usd} ({c.delivery_year})</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function App({ setError }) {
  const [contracts, setContracts] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  const [form, setForm] = useState({ amount: '', price: '', year: '', expiration: '' });
  const [formError, setFormError] = useState('');
  const [txFeedback, setTxFeedback] = useState('');
  const [principal, setPrincipal] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('desc');
  const [filter, setFilter] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cs, crs] = await Promise.all([
        carbonlock_backend.list_contracts(),
        carbonlock_backend.list_credits()
      ]);
      setContracts(cs);
      setCredits(crs);
      // Fetch principal if available
      if (window.ic && window.ic.plug) {
        const p = await window.ic.plug.getPrincipal();
        setPrincipal(p);
      }
    } catch (e) {
      setError && setError(e);
    }
    setLoading(false);
  }, [setError]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Pagination
  const paginatedContracts = contracts
    .filter(c => filter ? String(c.status).toLowerCase().includes(filter.toLowerCase()) : true)
    .sort((a, b) => {
      if (sortDir === 'asc') return a[sortKey] > b[sortKey] ? 1 : -1;
      return a[sortKey] < b[sortKey] ? 1 : -1;
    })
    .slice((page - 1) * perPage, page * perPage);

  // Form validation
  const validateForm = () => {
    if (!form.amount || !form.price || !form.year || !form.expiration) return 'All fields required.';
    if (+form.amount <= 0 || +form.price <= 0) return 'Amount and price must be positive.';
    if (+form.year < 2024) return 'Year must be >= 2024.';
    if (+form.expiration <= Date.now() / 1000) return 'Expiration must be in the future.';
    return '';
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleCreate = async e => {
    e.preventDefault();
    const err = validateForm();
    if (err) return setFormError(err);
    setLoading(true);
    setTxFeedback('');
    try {
      await carbonlock_backend.create_contract(
        +form.amount,
        +form.price,
        +form.year,
        +form.expiration
      );
      setTxFeedback('Contract created!');
      setForm({ amount: '', price: '', year: '', expiration: '' });
      fetchAll();
    } catch (e) {
      setFormError((e && e.message) || 'Error creating contract');
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <img src={logo} alt="DFINITY logo" style={{ maxWidth: '200px' }} />
      <h1>CarbonLock Marketplace</h1>
      <Dashboard contracts={contracts} credits={credits} principal={principal} />
      <section className="contract-actions">
        <form onSubmit={handleCreate} className="contract-form">
          <h2>Create Contract</h2>
          <input name="amount" type="number" placeholder="Tonnes" value={form.amount} onChange={handleFormChange} />
          <input name="price" type="number" placeholder="Price (USD)" value={form.price} onChange={handleFormChange} />
          <input name="year" type="number" placeholder="Delivery Year" value={form.year} onChange={handleFormChange} />
          <input name="expiration" type="number" placeholder="Expiration (epoch sec)" value={form.expiration} onChange={handleFormChange} />
          <button type="submit">Create</button>
          {formError && <div className="form-error">{formError}</div>}
        </form>
        {txFeedback && <div className="tx-feedback">{txFeedback}</div>}
      </section>
      <section className="contracts-list">
        <h2>Contracts</h2>
        <div className="controls">
          <label>Sort by: 
            <select value={sortKey} onChange={e => setSortKey(e.target.value)}>
              <option value="id">ID</option>
              <option value="price_usd">Price</option>
              <option value="amount_tonnes">Tonnes</option>
              <option value="status">Status</option>
            </select>
            <button onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </label>
          <label>Filter by status: 
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="e.g. Created" />
          </label>
        </div>
        {loading ? <Spinner /> : (
          <ul>
            {paginatedContracts.map(c => (
              <li key={c.id} title={`Seller: ${c.seller}\nBuyer: ${c.buyer || 'N/A'}`}>#{c.id} - {c.status} - {c.amount_tonnes}t @ ${c.price_usd} ({c.delivery_year})
                <button onClick={async () => {
                  setLoading(true);
                  setTxFeedback('');
                  try {
                    await carbonlock_backend.buy_contract(c.id);
                    setTxFeedback('Purchase successful!');
                    fetchAll();
                  } catch (e) {
                    setTxFeedback((e && e.message) || 'Purchase failed');
                  }
                  setLoading(false);
                }}>Buy</button>
              </li>
            ))}
          </ul>
        )}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {page}</span>
          <button disabled={page * perPage >= contracts.length} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </section>
      <section className="credits-list">
        <h2>Credits</h2>
        <ul>
          {credits.map(cr => (
            <li key={cr.id} title={`Risk Score: ${cr.risk_score || 'N/A'}\nHistory: ${cr.risk_score_history && cr.risk_score_history.join(', ')}`}>Credit #{cr.id} - Owner: {cr.owner}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function RootApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
