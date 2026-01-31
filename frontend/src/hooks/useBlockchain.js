import { useState, useCallback } from 'react';

/**
 * useBlockchain Hook
 * Manages mock blockchain state for demonstration purposes
 * 
 * IMPORTANT: This is a MOCK/DEMO implementation
 * No real blockchain interaction occurs
 */
const useBlockchain = () => {
    const [blocks, setBlocks] = useState([]);
    const [isLedgerExpanded, setIsLedgerExpanded] = useState(false);

    /**
     * Generate a mock hash (for demonstration only)
     */
    const generateMockHash = (data) => {
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substring(2, 15);
        const dataPart = JSON.stringify(data).substring(0, 10);
        return `0x${timestamp.toString(16)}${randomPart}${dataPart}`.substring(0, 66);
    };

    /**
     * Create a new block
     * @param {string} eventType - Type of event (DONATION_CREATED, ALLOCATION_APPROVED, etc.)
     * @param {object} eventData - Data associated with the event
     */
    const createBlock = useCallback((eventType, eventData = {}) => {
        const prevBlock = blocks.length > 0 ? blocks[blocks.length - 1] : null;

        const newBlock = {
            id: `BLOCK-${String(blocks.length + 1).padStart(3, '0')}`,
            eventType,
            eventData,
            timestamp: new Date().toISOString(),
            prevHash: prevBlock ? prevBlock.hash : null,
            hash: generateMockHash({ eventType, eventData, timestamp: Date.now() }),
            status: 'verified',
            blockNumber: blocks.length + 1,
        };

        setBlocks(prev => [...prev, newBlock]);

        // Auto-expand ledger when new block is added
        setIsLedgerExpanded(true);

        return newBlock;
    }, [blocks]);

    /**
     * Toggle ledger expansion
     */
    const toggleLedger = useCallback(() => {
        setIsLedgerExpanded(prev => !prev);
    }, []);

    /**
     * Get block by ID
     */
    const getBlock = useCallback((blockId) => {
        return blocks.find(block => block.id === blockId);
    }, [blocks]);

    /**
     * Get blocks by event type
     */
    const getBlocksByEventType = useCallback((eventType) => {
        return blocks.filter(block => block.eventType === eventType);
    }, [blocks]);

    /**
     * Clear all blocks (for demo/testing purposes)
     */
    const clearBlocks = useCallback(() => {
        setBlocks([]);
    }, []);

    /**
     * Get blockchain stats
     */
    const getStats = useCallback(() => {
        return {
            totalBlocks: blocks.length,
            donationBlocks: blocks.filter(b => b.eventType === 'DONATION_CREATED').length,
            allocationBlocks: blocks.filter(b => b.eventType === 'ALLOCATION_APPROVED').length,
            receiptBlocks: blocks.filter(b => b.eventType === 'RECEIPT_CONFIRMED').length,
            lastBlock: blocks.length > 0 ? blocks[blocks.length - 1] : null,
        };
    }, [blocks]);

    return {
        blocks,
        createBlock,
        getBlock,
        getBlocksByEventType,
        clearBlocks,
        getStats,
        isLedgerExpanded,
        toggleLedger,
    };
};

export default useBlockchain;
