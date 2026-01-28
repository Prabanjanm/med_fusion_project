import React, { useState, useEffect, useRef } from 'react';

const COLORS = [
    'rgba(59, 130, 246, 0.3)', // Blue
    'rgba(6, 182, 212, 0.3)',  // Cyan
    'rgba(139, 92, 246, 0.3)', // Violet
    'rgba(20, 184, 166, 0.3)'  // Teal
];

const AmbientHoverRipple = () => {
    const [ripples, setRipples] = useState([]);
    const containerRef = useRef(null);
    const lastRippleTime = useRef(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const parent = container.parentElement;
        if (!parent) return;

        const handleMouseMove = (e) => {
            const now = Date.now();
            // Limit ripple generation rate (throttle)
            if (now - lastRippleTime.current < 100) return;

            const rect = parent.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const newRipple = {
                id: now,
                x,
                y,
                color: COLORS[Math.floor(Math.random() * COLORS.length)]
            };

            setRipples(prev => {
                // Keep only last few to prevent overload
                const active = prev.filter(r => now - r.id < 900);
                return [...active, newRipple];
            });

            lastRippleTime.current = now;
        };

        parent.addEventListener('mousemove', handleMouseMove);
        // Ensure parent is relative for absolute positioning of this container
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.position === 'static') {
            parent.style.position = 'relative';
        }

        return () => {
            parent.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="ambient-ripple-container"
            aria-hidden="true"
        >
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="ambient-ripple"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        backgroundColor: ripple.color
                    }}
                />
            ))}
        </div>
    );
};

export default AmbientHoverRipple;
