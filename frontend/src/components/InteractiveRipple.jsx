import React, { useState, useEffect } from 'react';

const InteractiveRipple = () => {
    const [ripples, setRipples] = useState([]);

    useEffect(() => {
        const handleClick = (e) => {
            const newRipple = {
                x: e.clientX,
                y: e.clientY,
                id: Date.now() + Math.random() // Ensure unique ID
            };

            setRipples((prev) => [...prev, newRipple]);

            // Cleanup
            setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
            }, 800);
        };

        // Use capture phase to ensure we catch clicks even if propagation is stopped elsewhere
        window.addEventListener('click', handleClick, true);

        return () => {
            window.removeEventListener('click', handleClick, true);
        };
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden'
        }}>
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="ripple-effect"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                    }}
                />
            ))}
        </div>
    );
};

export default InteractiveRipple;
