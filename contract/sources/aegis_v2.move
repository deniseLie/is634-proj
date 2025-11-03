module aegis_addr::license {
    use std::signer;
    use std::vector;
    use aptos_std::table::{Self, Table};
    use aptos_framework::event;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;

    // Error codes
    const ENOT_OWNER: u64 = 1;
    const EALREADY_ISSUED: u64 = 2;
    const ENOT_FOUND: u64 = 3;
    const EEXPIRED: u64 = 4;
    const EINVALID_DURATION: u64 = 5;
    const EINSUFFICIENT_BALANCE: u64 = 6;
    const ENOT_TRANSFERABLE: u64 = 7;
    const ELIST_NOT_INITIALIZED: u64 = 8;

    // License list resource
    struct LicenseList has key {
        licenses: Table<u64, License>,
        license_counter: u64
    }
    
    // License struct
    struct License has store, drop, copy {
        license_id: u64,
        game_id: u64,
        owner: address,
        expiry: u64,
        transferable: bool,
        metadata_uri: vector<u8>
    }

    // Game registry to store game prices
    struct GameRegistry has key {
        games: Table<u64, GameInfo>,
        dev_games: Table<address, vector<u64>>,  // maps developer → list of game_ids
        all_game_ids: vector<u64>,
        next_game_id: u64,                      // auto-increment counter
    }

    struct GameInfo has store, drop, copy {
        game_id: u64,
        price: u64,  // in Octas (1 APT = 100,000,000 Octas)
        title: vector<u8>,
        description: vector<u8>,
        metadata_uri: vector<u8>,
        seller: address,
        active: bool
    }
    
    #[event]
    struct LicenseCreated has drop, store {
        license_id: u64,
        game_id: u64,
        owner: address,
        expiry: u64,
        transferable: bool,
        metadata_uri: vector<u8>
    }

    #[event]
    struct LicenseTransferred has drop, store {
        license_id: u64,
        from: address,
        to: address,
        game_id: u64
    }

    #[event]
    struct GameListed has drop, store {
        game_id: u64,
        price: u64,
        title: vector<u8>,
        description: vector<u8>,
        seller: address
    }

    // Initialize game registry (called once by admin)
    public entry fun initialize_registry(admin: &signer) {

        if (exists<GameRegistry>(@aegis_addr)) {
            return;
        };

        let registry = GameRegistry {
            games: table::new<u64, GameInfo>(),
            dev_games: table::new<address, vector<u64>>(),
            all_game_ids: vector::empty<u64>(),
            next_game_id: 0,
        };
        move_to(admin, registry);
    }
    
    // Initialize license list for user
    public entry fun create_list(account: &signer) {
        let license_holder = LicenseList {
            licenses: table::new(),
            license_counter: 0
        };
        move_to(account, license_holder);
    }

    // SIMPLE VERSION: Buy game license directly (no payment, for demo)
    // Use this for mock games - no pre-listing needed!
    public entry fun buy_game_license(
        buyer: &signer,
        game_id: u64,
        expiry: u64,
        transferable: bool,
        metadata_uri: vector<u8>
    ) acquires LicenseList {
        let buyer_address = signer::address_of(buyer);
        
        // Initialize if doesn't exist
        if (!exists<LicenseList>(buyer_address)) {
            create_list(buyer);
        };

        // Get the license list
        let license_list = borrow_global_mut<LicenseList>(buyer_address);
        
        // Increment counter
        let counter = license_list.license_counter + 1;
        
        // Create new license
        let new_license = License {
            license_id: counter,
            game_id,
            owner: buyer_address,
            expiry,
            transferable,
            metadata_uri
        };
        
        // Add to table
        table::add(&mut license_list.licenses, counter, new_license);
        license_list.license_counter = counter;
        
        // Emit event
        event::emit(LicenseCreated {
            license_id: counter,
            game_id,
            owner: buyer_address,
            expiry,
            transferable,
            metadata_uri
        });
    }

    // ADVANCED VERSION: Buy from registry with payment
    // Use this later when you want real payments
    public entry fun buy_game_from_registry(
        buyer: &signer,
        game_id: u64
    ) acquires LicenseList, GameRegistry {
        let buyer_address = signer::address_of(buyer);
        
        // Ensure buyer has initialized their license list
        if (!exists<LicenseList>(buyer_address)) {
            create_list(buyer);
        };

        // Get game info
        let registry = borrow_global<GameRegistry>(@aegis_addr);
        assert!(table::contains(&registry.games, game_id), ENOT_FOUND);

        let game_info = table::borrow(&registry.games, game_id);
        assert!(game_info.active, ENOT_FOUND);

        // Store values we need
        let seller_addr = game_info.seller;
        let price = game_info.price;
        let metadata_uri = game_info.metadata_uri;

        // Check if already owned
        assert!(!has_game_license(buyer_address, game_id), EALREADY_ISSUED);

        // Transfer payment from buyer to seller
        coin::transfer<AptosCoin>(buyer, seller_addr, price);

        // Get license list
        let license_list = borrow_global_mut<LicenseList>(buyer_address);
        let counter = license_list.license_counter + 1;
        
        // Create new license
        let new_license = License {
            license_id: counter,
            game_id,
            owner: buyer_address,
            expiry: 0,
            transferable: true,
            metadata_uri
        };
        
        // Add to table
        table::add(&mut license_list.licenses, counter, new_license);
        license_list.license_counter = counter;
        
        // Emit event
        event::emit(LicenseCreated {
            license_id: counter,
            game_id,
            owner: buyer_address,
            expiry: 0,
            transferable: true,
            metadata_uri
        });
    }

    // View function: Get all licenses for an account
    #[view]
    public fun get_user_licenses(owner: address): vector<License> acquires LicenseList {
        if (!exists<LicenseList>(owner)) {
            return vector::empty<License>()
        };
        
        let license_list = borrow_global<LicenseList>(owner);
        let licenses = vector::empty<License>();
        let i = 1;
        
        while (i <= license_list.license_counter) {
            if (table::contains(&license_list.licenses, i)) {
                let license = table::borrow(&license_list.licenses, i);
                vector::push_back(&mut licenses, *license);
            };
            i = i + 1;
        };
        
        licenses
    }

    // View function: Check if user owns a specific game
    #[view]
    public fun has_game_license(owner: address, game_id: u64): bool acquires LicenseList {
        if (!exists<LicenseList>(owner)) {
            return false
        };
        
        let license_list = borrow_global<LicenseList>(owner);
        let i = 1;
        
        while (i <= license_list.license_counter) {
            if (table::contains(&license_list.licenses, i)) {
                let license = table::borrow(&license_list.licenses, i);
                if (license.game_id == game_id) {
                    // Check expiry if set
                    if (license.expiry == 0 || license.expiry > timestamp::now_seconds()) {
                        return true
                    };
                };
            };
            i = i + 1;
        };
        
        false
    }

    // View function to check if registry is initialized
    #[view]
    public fun is_registry_initialized(): bool {
        exists<GameRegistry>(@aegis_addr)
    }

    // View function: Get all available games
    #[view]
    public fun get_all_games(): vector<GameInfo> acquires GameRegistry {
        // Check if registry exists, if not return empty vector
        if (!exists<GameRegistry>(@aegis_addr)) {
            return vector::empty<GameInfo>()
        };

        let registry = borrow_global<GameRegistry>(@aegis_addr);
        let all_games = vector::empty<GameInfo>();
        let all_game_ids = &registry.all_game_ids;

        let i = 0;
        let len = vector::length(all_game_ids);
        
        while (i < len) {
            let game_id = *vector::borrow(all_game_ids, i);
            if (table::contains(&registry.games, game_id)) {
                let game = table::borrow(&registry.games, game_id);
                vector::push_back(&mut all_games, *game);
            };
            i = i + 1;
        };
        
        all_games
    }

    // Transfer license to another user
    public entry fun transfer_license(
        from: &signer,
        to: address,
        license_id: u64
    ) acquires LicenseList {
        let from_addr = signer::address_of(from);
        
        // Get license from sender
        let from_list = borrow_global_mut<LicenseList>(from_addr);
        assert!(table::contains(&from_list.licenses, license_id), ENOT_FOUND);

        let license = table::borrow(&from_list.licenses, license_id);
        assert!(license.owner == from_addr, ENOT_OWNER);
        assert!(license.transferable, ENOT_TRANSFERABLE);
        
        let game_id_copy = license.game_id;
        let metadata_copy = license.metadata_uri;
        let expiry = license.expiry;
        
        // Remove from sender
        table::remove(&mut from_list.licenses, license_id);
        
        // Ensure receiver has license list
        if (!exists<LicenseList>(to)) {
            // Can't initialize for another account, they must do it themselves
            abort ELIST_NOT_INITIALIZED
        };
        
        // Add to receiver
        let to_list = borrow_global_mut<LicenseList>(to);
        let new_id = to_list.license_counter + 1;
        
        let new_license = License {
            license_id: new_id,
            game_id: game_id_copy,
            owner: to,
            expiry,
            transferable: true,
            metadata_uri: metadata_copy
        };
        
        table::add(&mut to_list.licenses, new_id, new_license);
        to_list.license_counter = new_id;
        
        event::emit(LicenseTransferred {
            license_id: new_id,
            from: from_addr,
            to,
            game_id: game_id_copy
        });
    }

    public entry fun register_game(
        seller: &signer,
        price: u64,
        title: vector<u8>,
        description: vector<u8>,
        metadata_uri: vector<u8>
    ) acquires GameRegistry {
        let seller_addr = signer::address_of(seller);
        let registry = borrow_global_mut<GameRegistry>(@aegis_addr);

        // Generate and increment game ID
        let game_id = registry.next_game_id;
        registry.next_game_id = game_id + 1;
       

        // Create game info
        let game_info = GameInfo {
            game_id,
            price,
            title,
            description,
            metadata_uri,
            seller: seller_addr,
            active: true
        };
        
        // Add to game table
        table::upsert(&mut registry.games, game_id, game_info);
        
        // Add to all_game_ids 
        if (!vector::contains(&registry.all_game_ids, &game_id)) {
            vector::push_back(&mut registry.all_game_ids, game_id);
        };

        // Initialize developer's list if needed
        if (!table::contains(&registry.dev_games, seller_addr)) {
            table::add(&mut registry.dev_games, seller_addr, vector::empty<u64>());
        };

        // Add in developer's list
        let dev_list = table::borrow_mut(&mut registry.dev_games, seller_addr);
        if (!vector::contains(dev_list, &game_id)) {
            vector::push_back(dev_list, game_id);
        };
        
        // Emit event
        event::emit(GameListed {
            game_id,
            price,
            title,
            description,
            seller: seller_addr
        });
    }
}