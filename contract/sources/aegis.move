module aegis_addr::license {
    use std::signer;
    use aptos_std::table::{Self, Table};
    use aptos_framework::event;

    // Basic error codes
    const ENOT_OWNER: u64 = 1;
    const EALREADY_ISSUED: u64 = 2;
    const ENOT_FOUND: u64 = 3;
    const EEXPIRED: u64 = 4;
    const EINVALID_DURATION: u64 = 5;

    // License list resource, stores all licenses for an account
    struct LicenseList has key {
        licenses: Table<u64, License>,
        license_counter: u64
    } 
    
    // stored under owner's account
    struct License has store, drop, copy {
        license_id: u64,
        game_id: vector<u8>,
        owner: address,
        expiry: u64,        // timestamp in seconds, 0 = no expiry
        transferable: bool,
        metadata_uri: vector<u8>
    }
    
    #[event]
    struct LicenseCreated has drop, store {
        license_id: u64,
        game_id: vector<u8>,
        owner: address,
        expiry: u64,        // timestamp in seconds, 0 = no expiry
        transferable: bool,
        metadata_uri: vector<u8>
    }

    // Initialize module
    public fun create_list(account: &signer) {
        // Build main resource
        let license_holder = LicenseList {
            licenses: table::new(),
            license_counter: 0
        };

        // Move LicenseList resource under account
        move_to(account, license_holder);
    }

    // Buy game license
    public entry fun buy_game_license(
        buyer: &signer, 
        game_id: vector<u8>,
        expiry: u64, 
        transferable: bool, 
        metadata_uri: vector<u8>
    ) {
        // Get buyer address
        let buyer_address = signer::address_of(buyer);

        // Get LicenseList resource
        let license_list = borrow_global_mut<LicenseList>(buyer_address);

        // Increment License counter
        let counter = license_list.license_counter + 1;

        // Create a new license 
        let new_license = License {
            license_id: counter,
            game_id, 
            owner: buyer_address,
            expiry, 
            transferable, 
            metadata_uri
        };

        // Update license list
        license_list.licenses.upsert(counter, new_license);
        license_list.license_counter = counter;

        // Emit license created event
        event::emit(LicenseCreated {
            license_id: counter,
            game_id, 
            owner: buyer_address,
            expiry, 
            transferable, 
            metadata_uri
        });
    }

    // 
}