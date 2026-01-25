import React, { useState, useEffect } from 'react';
import { X, Check, Lock, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import '../styles/WizardModal.css';

/**
 * Reusable Wizard Modal Component
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to close the modal
 * @param {string} title - Title of the wizard
 * @param {Array} steps - Array of step objects { id, label, component, validate }
 * @param {function} onComplete - Function to call on final submission
 * @param {boolean} isSubmitting - Loading state for the final step
 */
const WizardModal = ({ isOpen, onClose, title, steps, onComplete, isSubmitting }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState('forward');

    // Reset step when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleNext = () => {
        // Validate current step before proceeding
        const currentStepObj = steps[currentStep];
        if (currentStepObj.validate && !currentStepObj.validate()) {
            return; // Stop if validation fails
        }

        if (currentStep < steps.length - 1) {
            setDirection('forward');
            setCurrentStep(prev => prev + 1);
        } else {
            // Final step - trigger completion
            onComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setDirection('backward');
            setCurrentStep(prev => prev - 1);
        }
    };

    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    return (
        <div className="wizard-overlay">
            <div className="wizard-modal">
                {/* Header */}
                <div className="wizard-header">
                    <div className="wizard-title">
                        <h2>{title}</h2>
                    </div>
                    <button className="wizard-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Tracker */}
                <div className="wizard-progress">
                    {steps.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;
                        return (
                            <div
                                key={step.id}
                                className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                            >
                                <div className="step-number">
                                    {isCompleted ? <Check size={16} /> : index + 1}
                                </div>
                                <span className="step-label">{step.label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Body Content */}
                <div className="wizard-body">
                    {currentStepData.title && (
                        <h3 className="wizard-question">{currentStepData.title}</h3>
                    )}

                    <div className="wizard-content-wrapper">
                        {currentStepData.component}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="wizard-footer">
                    <button
                        className="btn-wizard-back"
                        onClick={handleBack}
                        disabled={currentStep === 0 || isSubmitting}
                        style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
                    >
                        <ChevronLeft size={16} style={{ marginRight: '8px' }} />
                        Back
                    </button>

                    <button
                        className={`btn-wizard-next ${isLastStep ? 'btn-wizard-confirm' : ''}`}
                        onClick={handleNext}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span>Processing...</span>
                        ) : isLastStep ? (
                            <>
                                <Lock size={16} /> Confirm & Record
                            </>
                        ) : (
                            <>
                                Next <ChevronRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Helper Component for displaying a Review Summary
 */
export const ReviewSummary = ({ data, customRender }) => {
    // Generate a mock hash for preview visualization
    const [hash, setHash] = useState('');

    useEffect(() => {
        const randomHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setHash('0x' + randomHash);
    }, []);

    return (
        <div className="review-container">
            <div className="review-data-grid">
                {Object.entries(data).map(([key, value]) => {
                    if (!value || typeof value === 'object') return null; // Skip complex objects or empty
                    return (
                        <div key={key} className="review-card">
                            <div className="review-label">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                            <div className="review-value">{value}</div>
                        </div>
                    );
                })}
                {customRender && customRender()}
            </div>

            <div className="blockchain-summary">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <ShieldCheck className="text-cyan" size={24} />
                    <h4 style={{ color: '#fff', margin: 0 }}>Blockchain Verification Preview</h4>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    The data above will be immutably recorded. Once submitted, this transaction cannot be modified.
                </p>

                <div className="hash-display">
                    {hash}
                </div>

                <div className="trust-badge">
                    <Lock size={14} /> End-to-End Encrypted & Verified
                </div>
            </div>
        </div>
    );
};

export default WizardModal;
