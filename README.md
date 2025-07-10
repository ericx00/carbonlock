# CarbonLock

A decentralized carbon credit trading platform built on the Internet Computer.

## Quick Start

1. **Start the local Internet Computer network** (in one terminal):
   ```bash
   dfx start --clean --background
   ```

2. **Deploy the canisters** (in another terminal):
   ```bash
   cd /path/to/carbonlock
   dfx deploy
   ```

3. **Start the frontend** (in another terminal):
   ```bash
   cd /path/to/carbonlock/src/carbonlock_frontend
   npm install
   npm start
   ```

4. **Access the application**:
   ```
   http://localhost:3000
   ```

## Project Structure

- `src/carbonlock_backend/` - Rust canister code
- `src/carbonlock_frontend/` - React frontend
- `dfx.json` - DFINITY project configuration

## Development

### Prerequisites

- [DFINITY Canister SDK (dfx)](https://sdk.dfinity.org/docs/quickstart/quickstart-intro.html)
- [Node.js](https://nodejs.org/) (v16 or later)
- [Rust](https://www.rust-lang.org/) (for backend development)

### Common Commands

- Start local network: `dfx start --clean --background`
- Stop local network: `dfx stop`
- Deploy canisters: `dfx deploy`
- Start frontend: `cd src/carbonlock_frontend && npm start`

## Deployment

To deploy to the Internet Computer mainnet:

1. Make sure you have cycles in your wallet:
   ```bash
   dfx wallet --network ic balance
   ```

2. Deploy to mainnet:
   ```bash
   dfx deploy --network ic
   ```

3. The frontend will be available at:
   ```
   https://<frontend-canister-id>.ic0.app
   ```
   - For the canister-served frontend, after `dfx deploy`, look for a URL like [http://localhost:4943/?canisterId=xxxx-...](http://localhost:4943/?canisterId=xxxx-...) in the deploy output.

5. **For Development:**
   - Edit your frontend code and Vite will hot-reload changes.
   - For backend changes, re-run `dfx deploy` after editing Rust code.

---


## Environment & Configuration

- **Canister IDs** are configurable via `.env` and `dfx.json`.
- **Frontend** uses Vite and React. Backend is Rust.
- **Build optimization**: Use `npm run build` for production frontend, and `cargo build --release` for backend.

## Usage

### Contracts
- Create: Use the UI form or `create_contract` endpoint.
- Buy: Use the UI Buy button or `buy_contract` endpoint (triggers ckBTC transfer).
- Expire: Contracts auto-expire after `expiration_ts` or via `expire_contract`.
- Events: Query recent events via `list_events`.

### Credits & Risk Scoring
- Credits are created with `create_credit`.
- AI oracle updates risk score via `update_risk_score` (only authorized principal).
- History of last 10 risk scores is tracked.

### Payments
- Payments use ckBTC. Admin sets ckBTC canister ID with `set_ckbtc_id`.
- Transaction status and balances can be queried.

### UI
- Dashboard shows user’s contracts.
- Contracts and credits are paginated, sortable, and filterable.
- All actions provide feedback and error handling.

## Deployment

1. Set environment variables and canister IDs as needed in `.env` and `dfx.json`.
2. Build backend: `cargo build --release`
3. Build frontend: `npm run build`
4. Deploy with `dfx deploy --network ic` for mainnet.

## Development Notes
- Inline code is commented for clarity.
- See `src/carbonlock_backend/src/lib.rs` for backend logic and endpoint docs.
- See `src/carbonlock_frontend/src/App.js` for UI logic and extensibility.
- For AI oracle integration, use a Python script with error handling, logging, and backoff (see `/scripts`).

## Security & Best Practices
- Only authorized principals can update risk scores or sensitive canister state.
- All user input is validated both client- and server-side.
- All critical actions are logged in canister events.

## Contributions
PRs and issues are welcome!

---

For more, see Internet Computer [developer docs](https://internetcomputer.org/docs/current/developer-docs/).
- Write your own `createActor` constructor

## 🖥️ Using the CarbonLock UI

### How to Use

1. **Start the local replica and deploy:**
   ```bash
   dfx start --clean --background
   dfx deploy
   ```

2. **Open the frontend:**
   - Visit the URL shown in the deploy output, e.g.  
     `http://localhost:4943/?canisterId=bd3sg-teaaa-aaaaa-qaaba-cai`

3. **Create a contract:**
   - Fill in the form at the top with the buyer, seller, amount (in tons), price (USD), and fulfillment year.
   - Click **Create Contract**.
   - A status message will confirm creation or show errors.
   - The new contract will appear in the table below, highlighted briefly for visibility.

4. **View contracts:**
   - All existing contracts are listed in a table below the form.
   - The table updates automatically after you add a contract.

### Features

- **Form validation:** Prevents invalid or empty submissions.
- **Status feedback:** Success and error messages are shown at the top.
- **Responsive table:** Contracts are displayed in a clear, sortable table.
- **Modern look:** Uses Bootstrap for a clean, professional UI.

---

If you encounter issues, make sure you are running the frontend from the correct canister URL and that your backend canister is deployed.

## How Does This Project Work?

### Architecture

- **Frontend:**  
  HTML/JS (with Bootstrap) UI for creating and viewing carbon credit futures contracts.
- **Backend:**  
  Rust canister (smart contract) on the Internet Computer (IC) that stores contract data and exposes methods to create and list contracts.
- **Communication:**  
  The frontend uses DFINITY’s JS agent to call backend canister methods via HTTP.

### Workflow

1. User fills out the form and submits a new contract.
2. Frontend JS calls the backend canister’s `create_contract` method.
3. Backend stores the contract in its state.
4. Frontend calls `list_contracts` to fetch all contracts and displays them in a table.

## Can We Make It Real?

Yes! This project is a solid prototype for a real decentralized app (dapp) on the Internet Computer. To make it production-ready:

### What’s Needed for a Real-World App

- **Authentication:**  
  Integrate Internet Identity or another auth system so users can prove ownership.
- **Persistence:**  
  Ensure the backend canister’s state is stable and can handle upgrades.
- **Cycles Management:**  
  Add logic to monitor and refill cycles (IC’s “gas”).
- **Security:**  
  Validate and sanitize all inputs, handle errors gracefully.
- **UI/UX Polish:**  
  Add more features (edit/delete, filtering, etc.), mobile optimization, and accessibility.
- **Mainnet Deployment:**  
  Deploy to the IC mainnet, not just local replica.
- **Legal/Compliance:**  
  For real carbon credits, ensure compliance with relevant regulations.

---

**Summary:**  
our project is a working dapp prototype for carbon credit contracts.  
Fix the UI update by ensuring `loadContracts()` is called after contract creation and check for errors.  
With some enhancements, you can make this a real, production-ready decentralized application.
