#[test_only]
module aegis_addr::license_tests {
    use aegis_addr::license::{Self, GameRegistry, LicenseList, License};
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::aptos_account;
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_std::table;

    // Test helper to setup aptos framework
    fun setup_test(aptos_framework: &signer, admin: &signer, seller: &signer, buyer: &signer) {
        // Initialize timestamp for testing
        aptos_framework::timestamp::set_time_has_started_for_testing(aptos_framework);
        
        // Initialize coin
        let (burn_cap, mint_cap) = aptos_framework::aptos_coin::initialize_for_test(aptos_framework);
        
        // Create accounts
        aptos_account::create_account(signer::address_of(admin));
        aptos_account::create_account(signer::address_of(seller));
        aptos_account::create_account(signer::address_of(buyer));
        
        // Register coins for all accounts
        coin::register<AptosCoin>(admin);
        coin::register<AptosCoin>(seller);
        coin::register<AptosCoin>(buyer);
        
        // Mint some coins to buyer (10 APT = 1,000,000,000 octas)
        let coins = coin::mint<AptosCoin>(1000000000, &mint_cap);
        coin::deposit(signer::address_of(buyer), coins);
        
        // Clean up capabilities
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @0x1, admin = @aegis_addr, seller = @0x456, buyer = @0x789)]
    public fun test_initialize_registry(
        aptos_framework: &signer,
        admin: &signer,
        seller: &signer,
        buyer: &signer
    ) {
        setup_test(aptos_framework, admin, seller, buyer);
        
        // Initialize registry
        license::initialize_registry(admin);
        
        // Verify registry exists
        assert!(license::is_registry_initialized(), 1);
    }

    #[test(aptos_framework = @0x1, admin = @aegis_addr, seller = @0x456, buyer = @0x789)]
    public fun test_register_game(
        aptos_framework: &signer,
        admin: &signer,
        seller: &signer,
        buyer: &signer
    ) {
        setup_test(aptos_framework, admin, seller, buyer);
        
        // Initialize registry
        license::initialize_registry(admin);
        
        // Register a game
        license::register_game(
            seller,
            100000000, // 1 APT in octas
            b"Test Game",
            b"A great test game",
            b"https://game-metadata.com/game1"
        );
        
        // Verify game was registered
        let all_games = license::get_all_games();
        assert!(vector::length(&all_games) == 1, 1);
    }

    #[test(aptos_framework = @0x1, admin = @aegis_addr, seller = @0x456, buyer = @0x789)]
    public fun test_buy_game_from_registry_success(
        aptos_framework: &signer,
        admin: &signer, 
        seller: &signer, 
        buyer: &signer
    ) {
        // Setup
        setup_test(aptos_framework, admin, seller, buyer);
        
        // Initialize registry
        license::initialize_registry(admin);
        
        // Verify registry exists
        assert!(license::is_registry_initialized(), 1);
        
        // Register a game
        license::register_game(
            seller, 
            100000000, // 1 APT in octas
            b"Test Game",
            b"A great test game",
            b"https://game-metadata.com/game1"
        );
        
        // Verify game was registered with ID 0
        let all_games = license::get_all_games();
        assert!(vector::length(&all_games) == 1, 2);
        
        // Buy the game (game_id should be 0 since it's auto-incremented from 0)
        license::buy_game_from_registry(buyer, 0);
        
        // Verify license was created
        let buyer_addr = signer::address_of(buyer);
        let licenses = license::get_user_licenses(buyer_addr);
        assert!(vector::length(&licenses) == 1, 3);
        
        // Verify buyer has the game license
        assert!(license::has_game_license(buyer_addr, 0), 4);
    }

    #[test(aptos_framework = @0x1, admin = @aegis_addr, seller = @0x456, buyer = @0x789)]
    #[expected_failure(abort_code = 2)] // EALREADY_ISSUED
    public fun test_buy_game_twice_fails(
        aptos_framework: &signer,
        admin: &signer,
        seller: &signer,
        buyer: &signer
    ) {
        // Setup
        setup_test(aptos_framework, admin, seller, buyer);
        
        // Initialize and register game
        license::initialize_registry(admin);
        license::register_game(
            seller,
            100000000,
            b"Test Game",
            b"A great test game",
            b"https://game-metadata.com/game1"
        );
        
        // Buy once - should succeed
        license::buy_game_from_registry(buyer, 0);
        
        // Buy again - should fail with EALREADY_ISSUED
        license::buy_game_from_registry(buyer, 0);
    }

    #[test(aptos_framework = @0x1, admin = @aegis_addr, buyer = @0x789)]
    #[expected_failure(abort_code = 3)] // ENOT_FOUND
    public fun test_buy_nonexistent_game_fails(
        aptos_framework: &signer,
        admin: &signer,
        buyer: &signer
    ) {
        // Setup (no seller needed)
        let seller = admin; // dummy
        setup_test(aptos_framework, admin, seller, buyer);
        
        // Initialize registry but don't register any games
        license::initialize_registry(admin);
        
        // Try to buy non-existent game
        license::buy_game_from_registry(buyer, 999);
    }

    #[test(aptos_framework = @0x1, admin = @aegis_addr, seller = @0x456, buyer = @0x789)]
    #[expected_failure]
    public fun test_buy_insufficient_funds_fails(
        aptos_framework: &signer,
        admin: &signer,
        seller: &signer,
        buyer: &signer
    ) {
        // Initialize framework
        aptos_framework::timestamp::set_time_has_started_for_testing(aptos_framework);
        let (burn_cap, mint_cap) = aptos_framework::aptos_coin::initialize_for_test(aptos_framework);
        
        // Create accounts
        aptos_account::create_account(signer::address_of(admin));
        aptos_account::create_account(signer::address_of(seller));
        aptos_account::create_account(signer::address_of(buyer));
        
        // Register coins
        coin::register<AptosCoin>(admin);
        coin::register<AptosCoin>(seller);
        coin::register<AptosCoin>(buyer);
        
        // Give buyer only 0.5 APT (not enough for 1 APT game)
        let coins = coin::mint<AptosCoin>(50000000, &mint_cap);
        coin::deposit(signer::address_of(buyer), coins);
        
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
        
        // Initialize and register expensive game (1 APT)
        license::initialize_registry(admin);
        license::register_game(
            seller,
            100000000, // 1 APT
            b"Expensive Game",
            b"A very expensive game",
            b"https://game-metadata.com/game1"
        );
        
        // Try to buy - should fail due to insufficient funds
        license::buy_game_from_registry(buyer, 0);
    }

    #[test(aptos_framework = @0x1, admin = @aegis_addr, seller = @0x456, buyer1 = @0x789, buyer2 = @0x7890)]
    public fun test_multiple_buyers(
        aptos_framework: &signer,
        admin: &signer,
        seller: &signer,
        buyer1: &signer,
        buyer2: &signer
    ) {
        // Setup framework
        aptos_framework::timestamp::set_time_has_started_for_testing(aptos_framework);
        let (burn_cap, mint_cap) = aptos_framework::aptos_coin::initialize_for_test(aptos_framework);
        
        // Create and fund accounts
        aptos_account::create_account(signer::address_of(admin));
        aptos_account::create_account(signer::address_of(seller));
        aptos_account::create_account(signer::address_of(buyer1));
        aptos_account::create_account(signer::address_of(buyer2));
        
        coin::register<AptosCoin>(admin);
        coin::register<AptosCoin>(seller);
        coin::register<AptosCoin>(buyer1);
        coin::register<AptosCoin>(buyer2);
        
        let coins1 = coin::mint<AptosCoin>(1000000000, &mint_cap);
        coin::deposit(signer::address_of(buyer1), coins1);
        
        let coins2 = coin::mint<AptosCoin>(1000000000, &mint_cap);
        coin::deposit(signer::address_of(buyer2), coins2);
        
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
        
        // Initialize and register game
        license::initialize_registry(admin);
        license::register_game(
            seller,
            100000000,
            b"Multi-player Game",
            b"A game for multiple players",
            b"https://game-metadata.com/game1"
        );
        
        // Both buyers purchase
        license::buy_game_from_registry(buyer1, 0);
        license::buy_game_from_registry(buyer2, 0);
        
        // Verify both have licenses
        assert!(license::has_game_license(signer::address_of(buyer1), 0), 1);
        assert!(license::has_game_license(signer::address_of(buyer2), 0), 2);
    }

    #[test(aptos_framework = @0x1, admin = @aegis_addr, seller = @0x456, buyer = @0x789)]
    public fun test_payment_transfer(
        aptos_framework: &signer,
        admin: &signer,
        seller: &signer,
        buyer: &signer
    ) {
        // Setup
        setup_test(aptos_framework, admin, seller, buyer);
        
        let seller_addr = signer::address_of(seller);
        let buyer_addr = signer::address_of(buyer);
        
        // Record initial balances
        let initial_seller_balance = coin::balance<AptosCoin>(seller_addr);
        let initial_buyer_balance = coin::balance<AptosCoin>(buyer_addr);
        
        // Initialize and register game
        license::initialize_registry(admin);
        let price = 100000000; // 1 APT
        license::register_game(
            seller,
            price,
            b"Payment Test Game",
            b"Testing payment mechanics",
            b"https://game-metadata.com/game1"
        );
        
        // Buy game
        license::buy_game_from_registry(buyer, 0);
        
        // Verify balances changed correctly
        let final_seller_balance = coin::balance<AptosCoin>(seller_addr);
        let final_buyer_balance = coin::balance<AptosCoin>(buyer_addr);
        
        assert!(final_seller_balance == initial_seller_balance + price, 1);
        assert!(final_buyer_balance == initial_buyer_balance - price, 2);
    }

    #[test(aptos_framework = @0x1, admin = @aegis_addr, seller = @0x456, buyer = @0x789)]
    public fun test_buy_game_license_simple(
        aptos_framework: &signer,
        admin: &signer,
        seller: &signer,
        buyer: &signer
    ) {
        setup_test(aptos_framework, admin, seller, buyer);
        
        // Use simple buy function (no payment)
        license::buy_game_license(
            buyer,
            100, // game_id
            0,   // no expiry
            true, // transferable
            b"https://metadata.com/game100"
        );
        
        // Verify license was created
        let buyer_addr = signer::address_of(buyer);
        assert!(license::has_game_license(buyer_addr, 100), 1);
    }

    #[test(aptos_framework = @0x1, admin = @aegis_addr, seller = @0x456, buyer = @0x789, recipient = @0xABC)]
    public fun test_transfer_license(
        aptos_framework: &signer,
        admin: &signer,
        seller: &signer,
        buyer: &signer,
        recipient: &signer
    ) {
        setup_test(aptos_framework, admin, seller, buyer);
        
        // Create account for recipient
        aptos_account::create_account(signer::address_of(recipient));
        
        // Recipient must initialize their license list first
        license::create_list(recipient);
        
        // Buyer gets a license
        license::buy_game_license(
            buyer,
            200, // game_id
            0,   // no expiry
            true, // transferable
            b"https://metadata.com/game200"
        );
        
        let buyer_addr = signer::address_of(buyer);
        let recipient_addr = signer::address_of(recipient);
        
        // Verify buyer has it
        assert!(license::has_game_license(buyer_addr, 200), 1);
        assert!(!license::has_game_license(recipient_addr, 200), 2);
        
        // Transfer license (license_id is 1 since it's the first one)
        license::transfer_license(buyer, recipient_addr, 1);
        
        // Verify transfer
        assert!(!license::has_game_license(buyer_addr, 200), 3);
        assert!(license::has_game_license(recipient_addr, 200), 4);
    }

    #[test(aptos_framework = @0x1, admin = @aegis_addr, seller1 = @0x456, seller2 = @0x457)]
    public fun test_multiple_sellers(
        aptos_framework: &signer,
        admin: &signer,
        seller1: &signer,
        seller2: &signer
    ) {
        let buyer = admin; // reuse admin as buyer for simplicity
        setup_test(aptos_framework, admin, seller1, seller2);
        
        // Initialize registry
        license::initialize_registry(admin);
        
        // Two sellers register different games
        license::register_game(
            seller1,
            50000000, // 0.5 APT
            b"Game from Seller 1",
            b"First seller's game",
            b"https://metadata.com/seller1-game"
        );
        
        license::register_game(
            seller2,
            75000000, // 0.75 APT
            b"Game from Seller 2",
            b"Second seller's game",
            b"https://metadata.com/seller2-game"
        );
        
        // Verify both games exist
        let all_games = license::get_all_games();
        assert!(vector::length(&all_games) == 2, 1);
    }
}