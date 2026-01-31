/**
 * Blockchain Simulation Service
 * Frontend-only simulation of blockchain block creation and storage
 * For hackathon demonstration purposes
 */

// In-memory blockchain ledger (simulated)
let blockchainLedger = [];
let blockCounter = 0;

/**
 * Generate a simulated hash (not cryptographically secure - for demo only)
 */
const generateSimulatedHash = (data) => {
    const str = JSON.stringify(data) + Date.now() + Math.random();
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
        hash += Math.floor(Math.random() * 16).toString(16);
    }
    return hash;
};

/**
 * Create a new blockchain block
 * @param {string} eventType - Type of event (DONATION_CREATED, ALLOCATION_APPROVED, RECEIPT_CONFIRMED)
 * @param {object} data - Event data
 * @returns {object} Created block
 */
export const createBlock = async (eventType, data) => {
    console.log('🔗 Creating blockchain block for:', eventType);

    // Simulate block creation delay
    await new Promise(resolve => setTimeout(resolve, 800));

    blockCounter++;

    const previousBlock = blockchainLedger[blockchainLedger.length - 1];
    const previousHash = previousBlock ? previousBlock.hash : '0x0000000000000000000000000000000000000000000000000000000000000000';

    const block = {
        blockNumber: blockCounter,
        blockId: `BLK-${String(blockCounter).padStart(4, '0')}`,
        eventType,
        timestamp: new Date().toISOString(),
        previousBlockHash: previousHash,
        data: data,
        hash: null, // Will be generated
        status: 'STORED',
        immutable: true
    };

    // Generate hash based on block contents
    block.hash = generateSimulatedHash(block);

    // Add to ledger
    blockchainLedger.push(block);

    console.log('✅ Block created:', block.blockId, '| Hash:', block.hash.substring(0, 16) + '...');

    return block;
};

/**
 * Get all blocks in the blockchain
 */
export const getAllBlocks = () => {
    return [...blockchainLedger];
};

/**
 * Get a specific block by ID
 */
export const getBlockById = (blockId) => {
    return blockchainLedger.find(block => block.blockId === blockId);
};

/**
 * Get blocks by event type
 */
export const getBlocksByEventType = (eventType) => {
    return blockchainLedger.filter(block => block.eventType === eventType);
};

/**
 * Verify blockchain integrity (check if chain is valid)
 */
export const verifyBlockchainIntegrity = () => {
    if (blockchainLedger.length === 0) return true;

    for (let i = 1; i < blockchainLedger.length; i++) {
        const currentBlock = blockchainLedger[i];
        const previousBlock = blockchainLedger[i - 1];

        // Check if previous hash matches
        if (currentBlock.previousBlockHash !== previousBlock.hash) {
            console.error('❌ Blockchain integrity compromised at block:', currentBlock.blockId);
            return false;
        }
    }

    console.log('✅ Blockchain integrity verified');
    return true;
};

/**
 * Initialize blockchain with genesis block
 */
export const initializeBlockchain = () => {
    if (blockchainLedger.length === 0) {
        console.log('🔗 Initializing blockchain with genesis block');

        const genesisBlock = {
            blockNumber: 0,
            blockId: 'BLK-0000',
            eventType: 'GENESIS',
            timestamp: new Date().toISOString(),
            previousBlockHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
            data: { message: 'CSR Tracker Blockchain - Genesis Block' },
            hash: generateSimulatedHash({ genesis: true }),
            status: 'STORED',
            immutable: true
        };

        blockchainLedger.push(genesisBlock);
        console.log('✅ Genesis block created');
    }
};

/**
 * Reset blockchain (for demo purposes)
 */
export const resetBlockchain = () => {
    blockchainLedger = [];
    blockCounter = 0;
    console.log('🔄 Blockchain reset');
};

/**
 * Get blockchain statistics
 */
export const getBlockchainStats = () => {
    return {
        totalBlocks: blockchainLedger.length,
        lastBlockHash: blockchainLedger[blockchainLedger.length - 1]?.hash || null,
        isValid: verifyBlockchainIntegrity(),
        eventTypes: {
            donations: getBlocksByEventType('DONATION_CREATED').length,
            allocations: getBlocksByEventType('ALLOCATION_APPROVED').length,
            receipts: getBlocksByEventType('RECEIPT_CONFIRMED').length
        }
    };
};

// Initialize on module load
initializeBlockchain();

export default {
    createBlock,
    getAllBlocks,
    getBlockById,
    getBlocksByEventType,
    verifyBlockchainIntegrity,
    initializeBlockchain,
    resetBlockchain,
    getBlockchainStats
};
