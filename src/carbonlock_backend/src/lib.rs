use candid::{CandidType, Deserialize};
use std::cell::RefCell;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone)]
struct FuturesContract {
    id: u64,
    buyer: String,
    seller: String,
    amount_tonnes: u32,
    price_usd: f64,
    delivery_year: u16,
}

thread_local! {
    static CONTRACTS: RefCell<HashMap<u64, FuturesContract>> = RefCell::new(HashMap::new());
    static NEXT_ID: RefCell<u64> = RefCell::new(0);
}

#[ic_cdk::query]
fn list_contracts() -> Vec<FuturesContract> {
    CONTRACTS.with(|contracts| contracts.borrow().values().cloned().collect())
}

#[ic_cdk::update]
fn create_contract(buyer: String, seller: String, amount_tonnes: u32, price_usd: f64, delivery_year: u16) -> u64 {
    let id = NEXT_ID.with(|id| {
        let mut id_mut = id.borrow_mut();
        *id_mut += 1;
        *id_mut
    });

    let contract = FuturesContract {
        id,
        buyer,
        seller,
        amount_tonnes,
        price_usd,
        delivery_year,
    };

    CONTRACTS.with(|contracts| {
        contracts.borrow_mut().insert(id, contract);
    });

    id
}
