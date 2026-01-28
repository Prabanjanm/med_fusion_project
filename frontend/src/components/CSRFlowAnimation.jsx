import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Html, Float, Icosahedron, Ring, Line } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * Connection Line - Subtle interactions
 */
const ConnectionLine = ({ start, end, color }) => {
    return (
        <Line
            points={[start, end]}
            color={color}
            lineWidth={1}
            transparent
            opacity={0.15}
        />
    );
};

/**
 * Central Hub - "Core Ecosystem"
 * Dominant, stable, slow breathing motion.
 */
const CentralHub = ({ onClick }) => {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Very slow, stable rotation
        meshRef.current.rotation.y = Math.sin(t * 0.1) * 0.05;
        meshRef.current.rotation.z = Math.cos(t * 0.1) * 0.02;
    });

    return (
        <group
            onClick={(e) => { e.stopPropagation(); onClick('ecosystem'); }}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
        >
            {/* Increased scale for hierarchy */}
            <Icosahedron args={[1.6, 0]} ref={meshRef}>
                <meshPhysicalMaterial
                    color={hovered ? "#60a5fa" : "#f1f5f9"} // White/Slate
                    roughness={0.1}
                    metalness={0.1}
                    transmission={0.4}
                    thickness={2}
                    clearcoat={1}
                    emissive={hovered ? "#3b82f6" : "#000000"}
                    emissiveIntensity={hovered ? 0.2 : 0}
                />
            </Icosahedron>
            {/* Inner stable core */}
            <mesh scale={[0.8, 0.8, 0.8]}>
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#3b82f6" roughness={0.5} />
            </mesh>

            <Html position={[0, -2.2, 0]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
                <div style={{
                    color: '#f8fafc',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    backdropFilter: 'blur(6px)',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    ECOSYSTEM CORE
                </div>
            </Html>
        </group>
    );
};

/**
 * Side Concept Nodes
 * Smaller, clearly labeled, interactive.
 */
const ConceptNode = ({ position, color, label, id, type, onClick }) => {
    const groupRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Extremely gentle "floating" - almost static stability
        groupRef.current.position.y = position[1] + Math.sin(t * 0.3 + position[0]) * 0.05;
        // Very slow rotation
        groupRef.current.rotation.y += 0.002;
    });

    const renderGeometry = () => {
        switch (type) {
            case 'contribution': return <boxGeometry args={[0.9, 0.9, 0.9]} />;
            case 'impact': return <octahedronGeometry args={[0.8, 0]} />;
            case 'verify': return <coneGeometry args={[0.7, 1, 4]} />;
            default: return <sphereGeometry args={[0.7]} />;
        }
    };

    return (
        <group
            ref={groupRef}
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                onClick(id);
            }}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
            scale={hovered ? 1.1 : 1}
        >
            <mesh>
                {renderGeometry()}
                <meshPhysicalMaterial
                    color={color}
                    roughness={0.2}
                    metalness={0.2}
                    transmission={0.3}
                    opacity={0.95}
                    transparent={true}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.5 : 0.15}
                />
            </mesh>

            <Html position={[0, -1.4, 0]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
                <div style={{
                    color: '#f1f5f9',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    fontWeight: '600',
                    letterSpacing: '0.3px',
                    textAlign: 'center',
                    background: 'rgba(30, 41, 59, 0.8)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${hovered ? color : 'rgba(148, 163, 184, 0.2)'}`,
                    opacity: hovered ? 1 : 0.8,
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                    backdropFilter: 'blur(4px)'
                }}>
                    {label}
                </div>
            </Html>
        </group>
    );
};

/**
 * Scene Content
 */
const SceneContent = ({ onNodeClick }) => {
    // Concepts: Updated Labels
    const concepts = [
        { id: 'contribution', label: 'CSR Contribution', color: '#14b8a6', type: 'contribution', angle: 0 },       // Teal
        { id: 'impact', label: 'Impact Tracking', color: '#3b82f6', type: 'impact', angle: (2 * Math.PI) / 3 },   // Blue
        { id: 'verify', label: 'Verification', color: '#6366f1', type: 'verify', angle: (4 * Math.PI) / 3 }, // Indigo
    ];

    const radius = 3.5;
    const positions = {};

    concepts.forEach(c => {
        positions[c.id] = [
            Math.cos(c.angle) * radius,
            -0.5, // Slightly lower to center visually with camera angle
            Math.sin(c.angle) * radius
        ];
    });

    return (
        <>
            {/* Adjusted Camera: Lower and closer for tighter framing */}
            <PerspectiveCamera makeDefault position={[0, 1.5, 8.5]} fov={45} />

            {/* Soft Studio Lighting */}
            <ambientLight intensity={0.6} color="#ffffff" />
            <directionalLight position={[5, 10, 5]} intensity={1.2} color="#f8fafc" />
            <spotLight position={[-10, 5, -5]} intensity={0.6} color="#e0f2fe" />

            {/* Central Hub */}
            <Float speed={1} rotationIntensity={0} floatIntensity={0.1}>
                {/* Visual center adjusted */}
                <group position={[0, 0, 0]}>
                    <CentralHub onClick={onNodeClick} />
                </group>
            </Float>

            {/* Surrounding Ring & Nodes */}
            <group rotation={[0.15, 0, 0]}>
                <Ring args={[radius - 0.03, radius + 0.03, 128]} rotation={[-Math.PI / 2, 0, 0]}>
                    <meshBasicMaterial color="#94a3b8" transparent opacity={0.08} side={THREE.DoubleSide} />
                </Ring>

                {concepts.map((c) => (
                    <React.Fragment key={c.id}>
                        <ConceptNode
                            {...c}
                            position={positions[c.id]}
                            onClick={onNodeClick}
                        />
                        <ConnectionLine start={[0, 0, 0]} end={positions[c.id]} color={c.color} />
                    </React.Fragment>
                ))}
            </group>
        </>
    );
};

const CSRFlowAnimation = ({ onNodeClick }) => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }} style={{ background: 'transparent' }}>
                <SceneContent onNodeClick={onNodeClick} />
            </Canvas>
        </div>
    );
};

export default CSRFlowAnimation;
