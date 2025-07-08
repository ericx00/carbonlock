import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory } from "../declarations/carbonlock_backend/carbonlock_backend.did.js";

// Manually set canisterId if not exported by did.js
defineCanisterId();

function defineCanisterId() {
  // Use the actual canister ID from your dfx deploy output
  window.canisterId = "bkyz2-fmaaa-aaaaa-qaaaq-cai";
}

const agent = new HttpAgent();
if (process.env.DFX_NETWORK === "local") {
  agent.fetchRootKey();
}

const carbonlock_backend = Actor.createActor(idlFactory, {
  agent,
  canisterId: window.canisterId,
});

const status = document.getElementById("status");

function showStatus(message, type = "info") {
  status.textContent = message;
  status.className = `alert alert-${type}`;
  status.classList.remove("d-none");
}

async function loadContracts(highlightLast = false) {
  const list = document.getElementById("contract-list");
  list.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;
  try {
    const contracts = await carbonlock_backend.list_contracts();
    list.innerHTML = "";
    if (contracts.length === 0) {
      list.innerHTML = `<tr><td colspan="5">No contracts found.</td></tr>`;
    }
    contracts.forEach((c, idx) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.buyer ?? c.owner ?? ""}</td>
        <td>${c.seller ?? c.company ?? ""}</td>
        <td>${c.amount_tonnes ?? c.amount ?? ""}</td>
        <td>$${c.price_usd ?? c.price ?? ""}</td>
        <td>${c.delivery_year ?? c.expiry_year ?? ""}</td>
      `;
      if (highlightLast && idx === contracts.length - 1) {
        row.classList.add("highlight");
        setTimeout(() => row.classList.remove("highlight"), 2000);
      }
      list.appendChild(row);
    });
  } catch (err) {
    list.innerHTML = `<tr><td colspan="5">❌ Failed to load contracts.</td></tr>`;
  }
}

document.getElementById("contract-form").onsubmit = async (e) => {
  e.preventDefault();

  showStatus("Creating contract...", "info");

  const owner = document.getElementById("owner").value;
  const company = document.getElementById("company").value;
  const amount = parseInt(document.getElementById("amount").value);
  const price = parseFloat(document.getElementById("price").value);
  const year = parseInt(document.getElementById("year").value);

  if (!owner || !company || amount <= 0 || price < 0 || year < 2024) {
    showStatus("❌ Please fill all fields with valid values.", "danger");
    return;
  }

  try {
    await carbonlock_backend.create_contract(owner, company, amount, price, year);
    showStatus("✅ Contract created!", "success");
    document.getElementById("contract-form").reset();
    await loadContracts(true); // Highlight the new contract
  } catch (err) {
    showStatus("❌ Failed to create contract: " + err, "danger");
    console.error(err);
  }
};

async function loadContracts() {
  const list = document.getElementById("contract-list");
  list.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;
  try {
    const contracts = await carbonlock_backend.list_contracts();
    list.innerHTML = "";
    if (contracts.length === 0) {
      list.innerHTML = `<tr><td colspan="5">No contracts found.</td></tr>`;
    }
    contracts.forEach((c) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.buyer ?? c.owner ?? ""}</td>
        <td>${c.seller ?? c.company ?? ""}</td>
        <td>${c.amount_tonnes ?? c.amount ?? ""}</td>
        <td>$${c.price_usd ?? c.price ?? ""}</td>
        <td>${c.delivery_year ?? c.expiry_year ?? ""}</td>
      `;
      list.appendChild(row);
    });
  } catch (err) {
    list.innerHTML = `<tr><td colspan="5">❌ Failed to load contracts.</td></tr>`;
  }
}

window.onload = loadContracts;
