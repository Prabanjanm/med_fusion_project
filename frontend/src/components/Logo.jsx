import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Logo = ({ size = 'medium', showText = true }) => {
    const isSmall = size === 'small';
    const iconSize = isSmall ? 28 : (size === 'large' ? 70 : 42);
    const fontSize = isSmall ? '1.1rem' : (size === 'large' ? '2.5rem' : '1.8rem');
    const gap = isSmall ? '6px' : '10px';

    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: gap }}>
            {/* Icon Group - Abstract Enterprise Mark */}
            <div style={{
                position: 'relative',
                width: iconSize + 6,
                height: iconSize + 6,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <ShieldCheck
                    size={iconSize}
                    color="#3b82f6" // blue-500
                    fill="rgba(59, 130, 246, 0.1)"
                    strokeWidth={1.5}
                />
            </div>

            {/* Text Group */}
            {showText && (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: fontSize,
                        fontWeight: '800',
                        letterSpacing: isSmall ? '0px' : '-1px',
                        color: '#f8fafc',
                        lineHeight: '1',
                        whiteSpace: 'nowrap'
                    }}>
                        CSR <span style={{ color: '#3b82f6' }}>HEALTHTRACE</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Logo;
