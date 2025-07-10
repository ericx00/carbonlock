use candid::{CandidType, Deserialize, Principal};
use ic_cdk::caller;
use std::cell::RefCell;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

mod bitcoin;

const RISK_HISTORY_LEN: usize = 10;
const AI_ORACLE_PRINCIPAL: &str = "ai-oracle-principal-id-here";

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CarbonCredit {
    pub id: u64,
    pub owner: Principal,
    pub risk_score: Option<u8>,
    pub risk_score_history: Vec<u8>,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum ContractStatus {
    Created,
    Purchased,
    Expired,
    Settled,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct FuturesContract {
    pub id: u64,
    pub buyer: Option<Principal>,
    pub seller: Principal,
    pub amount_tonnes: u32,
    pub price_usd: f64,
    pub delivery_year: u16,
    pub status: ContractStatus,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum EventType {
    Created,
    Purchased,
    Expired,
    Settled,
    RiskScoreUpdated,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ContractEvent {
    pub event_type: EventType,
    pub contract_id: u64,
    pub timestamp: u64,
    pub details: Option<String>,
}

const EVENT_LOG_SIZE: usize = 100;

// Thread-local storage
thread_local! {
    static CONTRACTS: RefCell<HashMap<u64, FuturesContract>> = RefCell::new(HashMap::new());
    static NEXT_CONTRACT_ID: RefCell<u64> = RefCell::new(1);
    static CREDITS: RefCell<HashMap<u64, CarbonCredit>> = RefCell::new(HashMap::new());
    static NEXT_CREDIT_ID: RefCell<u64> = RefCell::new(1);
    static EVENTS: RefCell<Vec<ContractEvent>> = RefCell::new(Vec::with_capacity(EVENT_LOG_SIZE));
}

// Helper functions
fn now_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

fn emit_event(event: ContractEvent) {
    EVENTS.with(|events| {
        let mut events = events.borrow_mut();
        if events.len() >= EVENT_LOG_SIZE {
            events.remove(0);
        }
        events.push(event);
    });
}

// Contract implementation
#[ic_cdk::query]
fn list_contracts() -> Vec<FuturesContract> {
    CONTRACTS.with(|contracts| {
        contracts.borrow().values().cloned().collect()
    })
}

#[ic_cdk::query]
fn get_contract(id: u64) -> Option<FuturesContract> {
    CONTRACTS.with(|contracts| {
        contracts.borrow().get(&id).cloned()
    })
}

#[ic_cdk::update]
fn create_contract(buyer: Principal, seller: Principal, amount_tonnes: u32, price_usd: f64, delivery_year: u16) -> u64 {
    let id = NEXT_CONTRACT_ID.with(|id_ref| {
        let id = *id_ref.borrow();
        *id_ref.borrow_mut() = id + 1;
        id
    });

    let now = now_seconds();
    let contract = FuturesContract {
        id,
        buyer: Some(buyer),
        seller,
        amount_tonnes,
        price_usd,
        delivery_year,
        status: ContractStatus::Created,
        created_at: now,
        updated_at: now,
    };

    CONTRACTS.with(|contracts| {
        contracts.borrow_mut().insert(id, contract.clone());
    });

    emit_event(ContractEvent {
        event_type: EventType::Created,
        contract_id: id,
        timestamp: now,
        details: None,
    });

    id
}

#[ic_cdk::update]
fn buy_contract(contract_id: u64) -> bool {
    CONTRACTS.with(|contracts| {
        let mut contracts = contracts.borrow_mut();
        if let Some(mut contract) = contracts.get_mut(&contract_id) {
            if contract.status != ContractStatus::Created {
                return false;
            }
            
            contract.status = ContractStatus::Purchased;
            contract.updated_at = now_seconds();
            
            emit_event(ContractEvent {
                event_type: EventType::Purchased,
                contract_id,
                timestamp: contract.updated_at,
                details: None,
            });
            
            true
        } else {
            false
        }
    })
}

#[ic_cdk::update]
fn expire_contract(contract_id: u64) -> bool {
    CONTRACTS.with(|contracts| {
        let mut contracts = contracts.borrow_mut();
        if let Some(mut contract) = contracts.get_mut(&contract_id) {
            contract.status = ContractStatus::Expired;
            contract.updated_at = now_seconds();
            
            emit_event(ContractEvent {
                event_type: EventType::Expired,
                contract_id,
                timestamp: contract.updated_at,
                details: None,
            });
            
            true
        } else {
            false
        }
    })
}

// Credit implementation
#[ic_cdk::query]
fn list_credits() -> Vec<CarbonCredit> {
    CREDITS.with(|credits| {
        credits.borrow().values().cloned().collect()
    })
}

#[ic_cdk::update]
fn create_credit() -> Result<u64, String> {
    let id = NEXT_CREDIT_ID.with(|id_ref| {
        let id = *id_ref.borrow();
        *id_ref.borrow_mut() = id + 1;
        id
    });

    let credit = CarbonCredit {
        id,
        owner: caller(),
        risk_score: None,
        risk_score_history: Vec::new(),
    };

    CREDITS.with(|credits| {
        credits.borrow_mut().insert(id, credit);
    });

    Ok(id)
}

#[ic_cdk::update]
fn update_risk_score(credit_id: u64, score: u8) -> Result<(), String> {
    CREDITS.with(|credits| {
        let mut credits = credits.borrow_mut();
        if let Some(mut credit) = credits.get_mut(&credit_id) {
            credit.risk_score = Some(score);
            credit.risk_score_history.push(score);
            
            // Keep only the last N risk scores
            if credit.risk_score_history.len() > RISK_HISTORY_LEN {
                credit.risk_score_history.remove(0);
            }
            
            Ok(())
        } else {
            Err("Credit not found".to_string())
        }
    })
}

// Event queries
#[ic_cdk::query]
fn list_events() -> Vec<ContractEvent> {
    EVENTS.with(|events| {
        events.borrow().clone()
    })
}
