import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Contracts from '../components/Contracts.jsx';
import About from '../components/About.jsx';
import Team from '../components/Team.jsx';
import '../src/index.scss';

function Home() {
  return (
    <div className="container py-4">
      <div className="text-center mb-3">
        <img src="/logo.png" alt="CarbonLock Logo" height="60" />
      </div>
      <h1 className="mb-4 text-center">🌱 CarbonLock: Carbon Credit Contracts</h1>
      <div className="alert alert-info" role="alert">
        Welcome! Use this UI to create, view, edit, and manage carbon credit contracts. Explore the About and Team pages to learn more about this project.
      </div>
    </div>
  );
}

function App() {
  const [contracts, setContracts] = React.useState([]);
  const [credits, setCredits] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [perPage] = React.useState(5);
  const [form, setForm] = React.useState({ amount: '', price: '', year: '', expiration: '' });
  const [formError, setFormError] = React.useState('');
  const [txFeedback, setTxFeedback] = React.useState('');
  const [principal, setPrincipal] = React.useState('');
  const [sortKey, setSortKey] = React.useState('id');
  const [sortDir, setSortDir] = React.useState('desc');
  const [filter, setFilter] = React.useState('');

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    try {
      const [cs, crs] = await Promise.all([
        carbonlock_backend.list_contracts(),
        carbonlock_backend.list_credits()
      ]);
      setContracts(cs);
      setCredits(crs);
      if (window.ic && window.ic.plug) {
        const p = await window.ic.plug.getPrincipal();
        setPrincipal(p);
      }
    } catch (e) {
      // setError && setError(e); // Optionally handle error
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
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
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contracts" element={<Contracts contracts={contracts} credits={credits} loading={loading} />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
      </Routes>
    </Router>
  );
}


export default App;
