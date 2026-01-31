/**
 * EXAMPLE: How to integrate blockchain visualization into CSR Dashboard
 * 
 * This file demonstrates the complete integration of the blockchain
 * visualization system into your existing CSR Dashboard.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useBlockchain from '../hooks/useBlockchain';
import BlockchainLedger from '../components/BlockchainLedger';
import BlockchainDemo from '../components/BlockchainDemo';

const CsrDashboardWithBlockchain = () => {
    // Blockchain state management
    const {
        blocks,
        createBlock,
        getStats,
        isLedgerExpanded,
        toggleLedger,
    } = useBlockchain();

    // Demo animation state
    const [showDemo, setShowDemo] = useState(false);
    const [demoEventType, setDemoEventType] = useState(null);

    /**
     * Example: Handle donation creation with blockchain visualization
     */
    const handleCreateDonation = async (donationData) => {
        try {
            // Step 1: Show blockchain animation
            setDemoEventType('DONATION_CREATED');
            setShowDemo(true);

            // Step 2: Create donation via API (your existing code)
            // const response = await donationAPI.create(donationData);

            // Step 3: Animation will auto-complete and trigger handleDemoComplete

        } catch (error) {
            console.error('Donation creation failed:', error);
            setShowDemo(false);
        }
    };

    /**
     * Called when blockchain demo animation completes
     */
    const handleDemoComplete = () => {
        // Create the block after animation
        createBlock(demoEventType, {
            // Add relevant event data
            timestamp: new Date().toISOString(),
            // ... other data
        });

        // Hide demo overlay
        setShowDemo(false);
    };

    /**
     * Example: Handle allocation approval
     */
    const handleApproveAllocation = async (allocationId) => {
        setDemoEventType('ALLOCATION_APPROVED');
        setShowDemo(true);

        // Your API call here
        // await allocationAPI.approve(allocationId);
    };

    /**
     * Example: Handle receipt confirmation
     */
    const handleConfirmReceipt = async (receiptId) => {
        setDemoEventType('RECEIPT_CONFIRMED');
        setShowDemo(true);

        // Your API call here
        // await receiptAPI.confirm(receiptId);
    };

    // Get blockchain stats for display
    const stats = getStats();

    return (
        <div className="dashboard-container">

            {/* Your existing dashboard header */}
            <div className="dashboard-header">
                <h1>CSR Dashboard</h1>

                {/* Optional: Show blockchain stats in header */}
                {stats.totalBlocks > 0 && (
                    <div className="blockchain-stats-badge">
                        <span>🔗 {stats.totalBlocks} Blocks</span>
                    </div>
                )}
            </div>

            {/* Your existing dashboard content */}
            <div className="dashboard-content">
                {/* Summary cards, charts, etc. */}
            </div>

            {/* Blockchain Ledger Panel */}
            <div className="blockchain-section">
                <BlockchainLedger
                    blocks={blocks}
                    isExpanded={isLedgerExpanded}
                    onToggle={toggleLedger}
                />
            </div>

            {/* Blockchain Demo Animation Overlay */}
            {showDemo && (
                <BlockchainDemo
                    eventType={demoEventType}
                    onComplete={handleDemoComplete}
                />
            )}

            {/* Example: Button to test blockchain visualization */}
            <div className="test-controls" style={{ marginTop: '2rem' }}>
                <button onClick={() => handleCreateDonation({ test: true })}>
                    Test: Create Donation Block
                </button>
                <button onClick={() => handleApproveAllocation('TEST-001')}>
                    Test: Allocation Block
                </button>
                <button onClick={() => handleConfirmReceipt('TEST-001')}>
                    Test: Receipt Block
                </button>
            </div>
        </div>
    );
};

export default CsrDashboardWithBlockchain;

/**
 * INTEGRATION CHECKLIST:
 * 
 * 1. ✅ Import useBlockchain hook
 * 2. ✅ Import BlockchainLedger component
 * 3. ✅ Import BlockchainDemo component
 * 4. ✅ Add state for demo animation (showDemo, demoEventType)
 * 5. ✅ Call setShowDemo(true) when events occur
 * 6. ✅ Create block in handleDemoComplete
 * 7. ✅ Add BlockchainLedger to your JSX
 * 8. ✅ Add BlockchainDemo overlay to your JSX
 * 9. ✅ Test with sample data
 * 10. ✅ Verify demo mode indicators are visible
 */

/**
 * STYLING TIPS:
 * 
 * Position the ledger at the bottom of your dashboard:
 * 
 * .blockchain-section {
 *   margin-top: 3rem;
 *   padding-top: 2rem;
 *   border-top: 1px solid rgba(6, 182, 212, 0.2);
 * }
 * 
 * Or as a sidebar:
 * 
 * .dashboard-container {
 *   display: grid;
 *   grid-template-columns: 1fr 400px;
 *   gap: 2rem;
 * }
 * 
 * .blockchain-section {
 *   position: sticky;
 *   top: 20px;
 *   max-height: calc(100vh - 40px);
 *   overflow-y: auto;
 * }
 */
