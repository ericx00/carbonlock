
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.scss';

// Log environment variables for debugging
console.log('Environment variables:', {
  CANISTER_ID_CARBONLOCK_BACKEND: process.env.CANISTER_ID_CARBONLOCK_BACKEND,
  DFX_NETWORK: process.env.DFX_NETWORK,
  NODE_ENV: process.env.NODE_ENV
});

// Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger">
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message || 'An unknown error occurred'}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize the application
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
