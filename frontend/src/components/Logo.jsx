import React from 'react';
import { Hexagon, Boxes } from 'lucide-react';

const Logo = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
            {/* Icon Group - Abstract Enterprise Mark */}
            <div style={{ position: 'relative', width: '64px', height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Hexagon
                    size={64}
                    color="#3b82f6" // blue-500
                    fill="rgba(59, 130, 246, 0.1)"
                    strokeWidth={1.5}
                />
                <div style={{ position: 'absolute' }}>
                    <Boxes
                        size={32}
                        color="#22d3ee" // cyan-400
                        strokeWidth={2}
                    />
                </div>
            </div>

            {/* Text Group */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '1.8rem',
                    fontWeight: '800',
                    letterSpacing: '-1px',
                    color: '#f8fafc',
                    lineHeight: '1',
                }}>
                    CSR<span style={{ color: '#3b82f6' }}>TRACKER</span>
                </div>
            </div>
        </div>
    );
};

export default Logo;
