/**
 * Mock Blockchain Service
 * Simulates blockchain operations for demonstration purposes
 * All functions are clearly marked as mock/simulated
 */

/**
 * Generates a realistic-looking mock blockchain transaction hash
 * @returns {string} Mock hash in format 0x[64 hex characters]
 */
export const generateMockHash = () => {
    const hexChars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
        hash += hexChars[Math.floor(Math.random() * 16)];
    }
    return hash;
};

/**
 * Generates a shortened version of a hash for display
 * @param {string} hash - Full hash string
 * @returns {string} Shortened hash (e.g., 0xA1B2...C3D4)
 */
export const shortenHash = (hash) => {
    if (!hash || hash.length < 10) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

/**
 * Simulates blockchain transaction recording with delay
 * @param {Object} data - Transaction data
 * @param {number} delay - Simulated network delay in ms (default: 1500)
 * @returns {Promise<Object>} Mock transaction result
 */
export const simulateBlockchainTransaction = async (data, delay = 1500) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockHash = generateMockHash();
            const mockBlockNumber = Math.floor(Math.random() * 1000000) + 5000000;
            const mockGasUsed = Math.floor(Math.random() * 100000) + 21000;

            resolve({
                success: true,
                hash: mockHash,
                blockNumber: mockBlockNumber,
                gasUsed: mockGasUsed,
                timestamp: new Date().toISOString(),
                status: 'confirmed',
                // Mock flag to clearly indicate this is simulated
                _isMockTransaction: true,
                _disclaimer: 'This is a simulated blockchain transaction for demonstration purposes'
            });
        }, delay);
    });
};

/**
 * Mock blockchain event types for different CSR actions
 */
export const BlockchainEventTypes = {
    DONATION_CREATED: 'DONATION_CREATED',
    ALLOCATION_VERIFIED: 'ALLOCATION_VERIFIED',
    RECEIPT_CONFIRMED: 'RECEIPT_CONFIRMED',
    AUDIT_LOGGED: 'AUDIT_LOGGED'
};

/**
 * Gets a user-friendly message for blockchain events
 * @param {string} eventType - Type of blockchain event
 * @returns {string} User-friendly message
 */
export const getBlockchainEventMessage = (eventType) => {
    const messages = {
        [BlockchainEventTypes.DONATION_CREATED]: 'Donation successfully recorded on blockchain (simulated)',
        [BlockchainEventTypes.ALLOCATION_VERIFIED]: 'Allocation event verified on blockchain (mock)',
        [BlockchainEventTypes.RECEIPT_CONFIRMED]: 'Receipt confirmation immutably logged on blockchain (mock)',
        [BlockchainEventTypes.AUDIT_LOGGED]: 'Audit entry recorded on distributed ledger (demo)'
    };

    return messages[eventType] || 'Blockchain transaction processed (simulated)';
};

/**
 * Simulates blockchain verification check
 * @param {string} hash - Transaction hash to verify
 * @returns {Promise<Object>} Verification result
 */
export const verifyMockTransaction = async (hash) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                verified: true,
                hash: hash,
                confirmations: Math.floor(Math.random() * 50) + 10,
                network: 'Mock Testnet',
                _isMockVerification: true
            });
        }, 800);
    });
};

/**
 * Creates a mock blockchain explorer URL
 * @param {string} hash - Transaction hash
 * @returns {string} Mock explorer URL
 */
export const getMockExplorerUrl = (hash) => {
    return `https://mock-blockchain-explorer.demo/tx/${hash}`;
};

export default {
    generateMockHash,
    shortenHash,
    simulateBlockchainTransaction,
    BlockchainEventTypes,
    getBlockchainEventMessage,
    verifyMockTransaction,
    getMockExplorerUrl
};
