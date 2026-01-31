import { useState, useCallback } from 'react';
import { createBlock } from '../services/blockchainService';

/**
 * Custom hook for blockchain notifications
 * Handles block creation and notification display
 */
export const useBlockchainNotification = () => {
    const [notification, setNotification] = useState({
        show: false,
        eventType: null,
        blockData: null
    });

    /**
     * Trigger a blockchain block creation with notification
     * @param {string} eventType - Type of event
     * @param {object} data - Event data
     */
    const triggerBlockCreation = useCallback(async (eventType, data) => {
        console.log('🔗 Triggering blockchain block creation:', eventType);

        // Show notification
        setNotification({
            show: true,
            eventType,
            blockData: data
        });

        // Create the actual block in background
        try {
            const block = await createBlock(eventType, data);
            console.log('✅ Block created successfully:', block.blockId);
            return block;
        } catch (error) {
            console.error('❌ Failed to create block:', error);
            return null;
        }
    }, []);

    /**
     * Hide the notification
     */
    const hideNotification = useCallback(() => {
        setNotification({
            show: false,
            eventType: null,
            blockData: null
        });
    }, []);

    return {
        notification,
        triggerBlockCreation,
        hideNotification
    };
};

export default useBlockchainNotification;
