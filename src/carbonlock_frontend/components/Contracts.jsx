import React, { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';
import { canisterId, createActor } from 'declarations/carbonlock_backend';
import EditContractModal from './EditContractModal.jsx';
import DeleteContractModal from './DeleteContractModal.jsx';
import ContractDetailsModal from './ContractDetailsModal.jsx';
import Toast from './Toast.jsx';

// Initialize the backend actor
let backend;

const initBackend = async () => {
  try {
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();
    
    // Get the backend canister ID from the generated declarations
    const canisterId = process.env.CANISTER_ID_CARBONLOCK_BACKEND;
    const host = process.env.HOST || 'http://127.0.0.1:4943';
    
    if (!canisterId) {
      throw new Error('CANISTER_ID_CARBONLOCK_BACKEND is not set in environment variables');
    }
    
    console.log('Initializing backend with canister ID:', canisterId);
    console.log('Using host:', host);
    
    // Create an actor with the current identity and network configuration
    backend = createActor(canisterId, {
      agentOptions: {
        identity,
        host: host,
      },
    });
    
    // Test the connection
    try {
      console.log('Testing backend connection...');
      const contracts = await backend.list_contracts();
      console.log('Backend connection successful, contracts:', contracts);
      return backend;
    } catch (err) {
      console.error('Backend connection test failed:', err);
      throw new Error(`Failed to connect to the backend canister: ${err.message}`);
    }
  } catch (error) {
    console.error('Failed to initialize backend:', error);
    throw error;
  }
};

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

function statusColor(status) {
  switch (status) {
    case 'Created': return 'secondary';
    case 'Purchased': return 'success';
    case 'Expired': return 'warning';
    case 'Settled': return 'info';
    default: return 'light';
  }
}

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [editContract, setEditContract] = useState(null);
  const [deleteContract, setDeleteContract] = useState(null);
  const [detailsContract, setDetailsContract] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);
  
  // New contract form state
  const [newContract, setNewContract] = useState({
    buyer: '',
    seller: '',
    amount_tonnes: '',
    price_usd: '',
    delivery_year: new Date().getFullYear(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize backend on component mount
  useEffect(() => {
    const init = async () => {
      try {
        await initBackend();
        await fetchContracts();
      } catch (error) {
        console.error('Error initializing backend:', error);
        setToast({
          show: true,
          message: 'Failed to initialize application. Please refresh the page.',
          type: 'danger'
        });
      }
    };
    init();
  }, []);

  // Fetch contracts from the backend
  const fetchContracts = async () => {
    if (!backend) {
      console.error('Backend not initialized');
      setToast({
        show: true,
        message: 'Backend not initialized',
        type: 'danger'
      });
      return;
    }
    
    setLoading(true);
    try {
      const contracts = await backend.list_contracts();
      // Convert Principal objects to strings for display
      const formattedContracts = contracts.map(contract => ({
        ...contract,
        buyer: contract.buyer ? contract.buyer.toString() : null,
        seller: contract.seller.toString(),
      }));
      setContracts(formattedContracts);
      console.log('Fetched contracts:', formattedContracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setToast({ 
        show: true, 
        message: 'Failed to load contracts. Please try again.', 
        type: 'danger' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle new contract form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContract(prev => ({
      ...prev,
      [name]: name === 'amount_tonnes' || name === 'price_usd' 
        ? (value === '' ? '' : parseFloat(value) || 0) 
        : value
    }));
  };

  // Validate Principal string
  const validatePrincipal = (principalStr) => {
    try {
      if (!principalStr) return false;
      const principal = Principal.fromText(principalStr.trim());
      return principal.toText() === principalStr.trim();
    } catch (error) {
      return false;
    }
  };
  
  // Handle new contract submission
  const handleCreateContract = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    
    if (!backend) {
      setToast({
        show: true,
        message: 'Application not initialized. Please refresh the page.',
        type: 'danger'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Form data:', newContract);
      
      // Validate form
      if (!newContract.buyer || !newContract.seller || !newContract.amount_tonnes || !newContract.price_usd) {
        throw new Error('Please fill in all required fields');
      }
      
      // Validate Principals
      if (!validatePrincipal(newContract.buyer)) {
        throw new Error('Invalid buyer principal format. Expected format: xxxxx-xxxxx-xxxxx-xxxxx-xxx');
      }
      
      if (!validatePrincipal(newContract.seller)) {
        throw new Error('Invalid seller principal format. Expected format: xxxxx-xxxxx-xxxxx-xxxxx-xxx');
      }
      
      // Convert values
      const amount = Number(newContract.amount_tonnes);
      const price = Number(newContract.price_usd);
      const year = Number(newContract.delivery_year);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a positive number');
      }
      
      if (isNaN(price) || price <= 0) {
        throw new Error('Price must be a positive number');
      }
      
      if (isNaN(year) || year < new Date().getFullYear()) {
        throw new Error('Invalid delivery year');
      }
      
      console.log('Creating contract with:', { 
        buyer: newContract.buyer,
        seller: newContract.seller,
        amount,
        price,
        year
      });
      
      // Call the backend
      const contractId = await backend.create_contract(
        Principal.fromText(newContract.buyer.trim()),
        Principal.fromText(newContract.seller.trim()),
        amount,
        price,
        year
      );
      
      console.log('Created contract with ID:', contractId);
      
      // Refresh the contracts list
      await fetchContracts();
      
      // Reset form
      setNewContract({
        buyer: '',
        seller: '',
        amount_tonnes: '',
        price_usd: '',
        delivery_year: new Date().getFullYear(),
      });
      
      setToast({ 
        show: true, 
        message: `Contract #${contractId} created successfully!`,
        type: 'success' 
      });
      
    } catch (error) {
      console.error('Error in handleCreateContract:', error);
      setToast({ 
        show: true, 
        message: error.message || 'Failed to create contract', 
        type: 'danger' 
      });
    } finally {
      console.log('Finished submission attempt');
      setIsSubmitting(false);
    }
  };

  const handleEdit = (contract) => setEditContract(contract);
  const handleDelete = (contract) => setDeleteContract(contract);
  const handleDetails = async (contract) => {
    setDetailsContract(contract);
    // fetch event history for this contract
    try {
      const events = await carbonlock_backend.list_events();
      setEventHistory(events.filter(e => e.contract_id === contract.id));
    } catch {
      setEventHistory([]);
    }
  };
  const handleEditSave = (updated) => {
    setContracts(contracts.map(c => c.id === updated.id ? updated : c));
    setEditContract(null);
    setToast({ show: true, message: 'Contract updated!', type: 'success' });
  };
  const handleDeleteConfirm = (id) => {
    setContracts(contracts.filter(c => c.id !== id));
    setDeleteContract(null);
    setToast({ show: true, message: 'Contract deleted!', type: 'success' });
  };

  return (
    <div className="container py-4">
      {/* Create Contract Card */}
      <div className="card-green mb-5">
        <div className="card-body">
          <h3 className="mb-4">Create New Carbon Credit Contract</h3>
          <form onSubmit={handleCreateContract}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="buyer" className="form-label">Buyer Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="buyer"
                  name="buyer"
                  value={newContract.buyer}
                  onChange={handleInputChange}
                  placeholder="Enter buyer's principal ID"
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="seller" className="form-label">Seller Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="seller"
                  name="seller"
                  value={newContract.seller}
                  onChange={handleInputChange}
                  placeholder="Enter seller's principal ID"
                  required
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="amount_tonnes" className="form-label">Amount (tons)</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    id="amount_tonnes"
                    name="amount_tonnes"
                    min="1"
                    step="0.01"
                    value={newContract.amount_tonnes}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    required
                  />
                  <span className="input-group-text">tons</span>
                </div>
              </div>
              <div className="col-md-4">
                <label htmlFor="price_usd" className="form-label">Price per ton</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className="form-control"
                    id="price_usd"
                    name="price_usd"
                    min="0"
                    step="0.01"
                    value={newContract.price_usd}
                    onChange={handleInputChange}
                    placeholder="e.g., 50.00"
                    required
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label htmlFor="delivery_year" className="form-label">Delivery Year</label>
                <select
                  className="form-select"
                  id="delivery_year"
                  name="delivery_year"
                  value={newContract.delivery_year}
                  onChange={handleInputChange}
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 text-end">
                <button 
                  type="submit" 
                  className="btn btn-lg btn-green"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating...
                    </>
                  ) : 'Create Contract'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <h2 className="mb-4">All Contracts</h2>
      {loading ? <div className="text-center my-5"><div className="spinner-border" role="status"></div></div> : (
        <div className="table-responsive">
          <table className="table table-green align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Buyer</th>
                <th>Seller</th>
                <th>Amount</th>
                <th>Price</th>
                <th>Total</th>
                <th>Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(contract => (
                <tr key={contract.id} style={{cursor:'pointer'}} onClick={e => {if(e.target.tagName==='TD') handleDetails(contract);}}>
                  <td>{contract.id}</td>
                  <td className="text-truncate" style={{maxWidth: '120px'}} title={contract.buyer}>
                    {contract.buyer.substring(0, 6)}...{contract.buyer.slice(-4)}
                  </td>
                  <td className="text-truncate" style={{maxWidth: '120px'}} title={contract.seller}>
                    {contract.seller.substring(0, 6)}...{contract.seller.slice(-4)}
                  </td>
                  <td className="fw-bold">{contract.amount_tonnes.toLocaleString()} t</td>
                  <td>${contract.price_usd.toFixed(2)}/t</td>
                  <td className="fw-bold text-success">
                    ${(contract.amount_tonnes * contract.price_usd).toLocaleString(undefined, {maximumFractionDigits: 2})}
                  </td>
                  <td>{contract.delivery_year}</td>
                  <td>
                    <span className={`badge bg-${statusColor(contract.status)} px-3 py-2`}>
                      {contract.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm btn-outline-primary" 
                        onClick={e => {e.stopPropagation(); handleDetails(contract);}}
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-secondary" 
                        onClick={e => {e.stopPropagation(); handleEdit(contract);}}
                        title="Edit Contract"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={e => {e.stopPropagation(); handleDelete(contract);}}
                        title="Delete Contract"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <EditContractModal contract={editContract} onSave={handleEditSave} onClose={() => setEditContract(null)} />
      <DeleteContractModal contract={deleteContract} onConfirm={handleDeleteConfirm} onClose={() => setDeleteContract(null)} />
      <ContractDetailsModal contract={detailsContract} onClose={() => setDetailsContract(null)} eventHistory={eventHistory} />
      <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}
