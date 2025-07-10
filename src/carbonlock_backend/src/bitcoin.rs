use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api;

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum TxStatus {
    Pending,
    Confirmed,
    Failed(String),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Transaction {
    pub tx_id: u64,
    pub from: Principal,
    pub to: Principal,
    pub amount: u64,
    pub status: TxStatus,
    pub timestamp: u64,
}

thread_local! {
    static CKBTC_CANISTER_ID: std::cell::RefCell<Option<Principal>> = std::cell::RefCell::new(None);
    static TRANSACTIONS: std::cell::RefCell<std::collections::HashMap<u64, Transaction>> = std::cell::RefCell::new(std::collections::HashMap::new());
    static NEXT_TX_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(1);
}

pub fn set_ckbtc_canister_id(id: Principal) {
    CKBTC_CANISTER_ID.with(|cid| {
        *cid.borrow_mut() = Some(id);
    });
}

pub fn get_ckbtc_canister_id() -> Option<Principal> {
    CKBTC_CANISTER_ID.with(|cid| *cid.borrow())
}

pub async fn transfer_ckbtc(from: Principal, to: Principal, amount: u64) -> Result<u64, String> {
    let canister_id = get_ckbtc_canister_id().ok_or("ckBTC canister ID not set")?;
    let tx_id = NEXT_TX_ID.with(|id| {
        let mut id_mut = id.borrow_mut();
        let tid = *id_mut;
        *id_mut += 1;
        tid
    });
    let timestamp = api::time();
    let tx = Transaction {
        tx_id,
        from,
        to,
        amount,
        status: TxStatus::Pending,
        timestamp,
    };
    TRANSACTIONS.with(|txs| {
        txs.borrow_mut().insert(tx_id, tx);
    });
    // --- Replace with actual inter-canister call ---
    let simulated_success = true;
    if simulated_success {
        TRANSACTIONS.with(|txs| {
            if let Some(tx) = txs.borrow_mut().get_mut(&tx_id) {
                tx.status = TxStatus::Confirmed;
            }
        });
        Ok(tx_id)
    } else {
        TRANSACTIONS.with(|txs| {
            if let Some(tx) = txs.borrow_mut().get_mut(&tx_id) {
                tx.status = TxStatus::Failed("Simulated failure".to_string());
            }
        });
        Err("ckBTC transfer failed".to_string())
    }
}

pub fn get_transaction(tx_id: u64) -> Option<Transaction> {
    TRANSACTIONS.with(|txs| txs.borrow().get(&tx_id).cloned())
}

pub fn list_transactions() -> Vec<Transaction> {
    TRANSACTIONS.with(|txs| txs.borrow().values().cloned().collect())
}

pub async fn query_balance(principal: Principal) -> Result<u64, String> {
    let canister_id = get_ckbtc_canister_id().ok_or("ckBTC canister ID not set")?;
    // --- Replace with actual inter-canister call ---
    Ok(1_000_000) // Simulated balance
}
