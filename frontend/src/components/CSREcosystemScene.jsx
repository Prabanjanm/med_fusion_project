import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Html, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Entity Component: Represents CSR Donor, NGO, Clinic, Auditor
 * Each entity has a 3D icon, rotating ring, and label
 */
const Entity = ({ position, color, label, type, angle }) => {
    const group = useRef();
    const ringRef = useRef();

    // Rotate the ring around each entity
    useFrame(() => {
        if (ringRef.current) {
            ringRef.current.rotation.z += 0.01;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
            <group ref={group} position={position}>
                {/* Rotating Ring around entity */}
                <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[1.2, 0.03, 16, 64]} />
                    <meshBasicMaterial color={color} transparent opacity={0.6} />
                </mesh>

                {/* Glow Halo */}
                <mesh>
                    <sphereGeometry args={[1.3, 32, 32]} />
                    <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.BackSide} />
                </mesh>

                {/* Icon Geometry */}
                <group scale={0.5}>
                    {type === 'donor' && (
                        <group position={[0, 0.3, 0]}>
                            {/* Building */}
                            <mesh castShadow>
                                <boxGeometry args={[0.8, 2, 0.8]} />
                                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                            </mesh>
                            {/* Windows */}
                            {[...Array(6)].map((_, i) => (
                                <mesh key={i} position={[0, -0.5 + i * 0.3, 0.41]}>
                                    <planeGeometry args={[0.5, 0.15]} />
                                    <meshBasicMaterial color="#a5f3fc" />
                                </mesh>
                            ))}
                        </group>
                    )}

                    {type === 'ngo' && (
                        <group>
                            {/* Person icon */}
                            <mesh position={[0, 0.5, 0]}>
                                <sphereGeometry args={[0.3, 32, 32]} />
                                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                            </mesh>
                            <mesh position={[0, -0.2, 0]}>
                                <cylinderGeometry args={[0.5, 0.3, 1, 32]} />
                                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                            </mesh>
                        </group>
                    )}

                    {type === 'clinic' && (
                        <group>
                            {/* Building with cross */}
                            <mesh>
                                <boxGeometry args={[1, 1.5, 1]} />
                                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                            </mesh>
                            {/* Medical cross */}
                            <group position={[0, 0, 0.51]}>
                                <mesh>
                                    <boxGeometry args={[0.6, 0.2, 0.05]} />
                                    <meshBasicMaterial color="#ffffff" />
                                </mesh>
                                <mesh>
                                    <boxGeometry args={[0.2, 0.6, 0.05]} />
                                    <meshBasicMaterial color="#ffffff" />
                                </mesh>
                            </group>
                        </group>
                    )}

                    {type === 'auditor' && (
                        <group>
                            {/* Shield */}
                            <mesh>
                                <cylinderGeometry args={[0.8, 0, 1.2, 6]} />
                                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                            </mesh>
                            {/* Checkmark */}
                            <mesh position={[0, 0, 0.5]}>
                                <torusGeometry args={[0.3, 0.05, 16, 100, Math.PI]} rotation={[0, 0, -Math.PI / 2]} />
                                <meshBasicMaterial color="#ffffff" />
                            </mesh>
                        </group>
                    )}
                </group>

                {/* Label */}
                <Html position={[0, -1.8, 0]} center style={{ pointerEvents: 'none' }}>
                    <div style={{
                        color: 'white',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        background: 'rgba(0,0,0,0.7)',
                        padding: '8px 20px',
                        borderRadius: '20px',
                        border: `1px solid ${color}`,
                        boxShadow: `0 0 20px ${color}`,
                        whiteSpace: 'nowrap',
                        textShadow: `0 0 10px ${color}`,
                        letterSpacing: '1px'
                    }}>
                        {label}
                    </div>
                </Html>
            </group>
        </Float>
    );
};

/**
 * Central Heart with Heartbeat and Protective Hands
 */
const CentralHeart = () => {
    const group = useRef();
    const heartbeatRef = useRef();

    // Create heart shape
    const heartShape = useMemo(() => {
        const shape = new THREE.Shape();
        const x = 0, y = 0;
        shape.moveTo(x + 0.5, y + 0.5);
        shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
        shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
        shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
        shape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
        shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
        shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
        return shape;
    }, []);

    // Heartbeat animation
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const scale = 1 + Math.sin(t * 3) * 0.1;
        group.current.scale.set(scale, scale, scale);
        group.current.rotation.y = Math.sin(t * 0.3) * 0.1;
    });

    // Heartbeat line points
    const heartbeatPoints = useMemo(() => {
        const points = [];
        for (let i = 0; i <= 100; i++) {
            const x = (i / 100) * 4 - 2;
            let y = 0;

            // Create heartbeat pattern
            if (i > 40 && i < 45) y = (i - 40) * 0.3;
            else if (i >= 45 && i < 50) y = (50 - i) * 0.3;
            else if (i >= 50 && i < 55) y = -(i - 50) * 0.5;
            else if (i >= 55 && i < 60) y = (i - 60) * 0.5;

            points.push(new THREE.Vector3(x, y, 0));
        }
        return points;
    }, []);

    return (
        <group position={[0, 0, 0]} ref={group}>
            {/* Heart */}
            <mesh rotation={[0, 0, Math.PI]} position={[-0.5, 1, 0]}>
                <extrudeGeometry args={[heartShape, {
                    depth: 0.4,
                    bevelEnabled: true,
                    bevelSegments: 3,
                    steps: 2,
                    bevelSize: 0.15,
                    bevelThickness: 0.1
                }]} />
                <meshStandardMaterial
                    color="#00d4ff"
                    emissive="#00d4ff"
                    emissiveIntensity={1.2}
                    roughness={0.2}
                    metalness={0.5}
                />
            </mesh>

            {/* Heartbeat line */}
            <Line
                ref={heartbeatRef}
                points={heartbeatPoints}
                color="#ff0066"
                lineWidth={3}
                position={[0, 1, 0.3]}
            />

            {/* Glow */}
            <pointLight distance={5} intensity={2} color="#00d4ff" />

            {/* Protective Hands */}
            <mesh position={[-1.5, -0.8, 0]} rotation={[0.3, 0, -0.3]}>
                <boxGeometry args={[0.8, 2, 0.3]} />
                <meshPhysicalMaterial
                    color="#4a9eff"
                    transmission={0.5}
                    opacity={0.3}
                    transparent
                    roughness={0}
                    ior={1.5}
                />
            </mesh>
            <mesh position={[1.5, -0.8, 0]} rotation={[0.3, 0, 0.3]}>
                <boxGeometry args={[0.8, 2, 0.3]} />
                <meshPhysicalMaterial
                    color="#4a9eff"
                    transmission={0.5}
                    opacity={0.3}
                    transparent
                    roughness={0}
                    ior={1.5}
                />
            </mesh>
        </group>
    );
};

/**
 * Animated Flow Arrows connecting entities in a circle
 */
const FlowArrows = () => {
    const particlesRef = useRef([]);
    const radius = 4;

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        particlesRef.current.forEach((particle, i) => {
            if (particle) {
                const offset = (i / 12) * Math.PI * 2;
                const angle = t * 0.5 + offset;
                particle.position.x = Math.cos(angle) * radius;
                particle.position.z = Math.sin(angle) * radius;
                particle.position.y = Math.sin(angle * 3) * 0.3;
            }
        });
    });

    // Create circular path with gradient colors
    const circlePoints = useMemo(() => {
        const points = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            ));
        }
        return points;
    }, []);

    return (
        <group>
            {/* Main circular flow path */}
            <Line
                points={circlePoints}
                color="#00d4ff"
                lineWidth={2}
                transparent
                opacity={0.4}
            />

            {/* Animated particles */}
            {[...Array(12)].map((_, i) => (
                <mesh
                    key={i}
                    ref={(el) => (particlesRef.current[i] = el)}
                >
                    <sphereGeometry args={[0.1, 16, 16]} />
                    <meshBasicMaterial
                        color={i % 2 === 0 ? "#00d4ff" : "#d946ef"}
                    />
                </mesh>
            ))}
        </group>
    );
};

/**
 * Main Scene Content
 */
const SceneContent = () => {
    const radius = 4;
    const entities = [
        { type: 'donor', label: 'CSR Donor', color: '#00d4ff', angle: 0 },
        { type: 'ngo', label: 'NGO', color: '#d946ef', angle: Math.PI / 2 },
        { type: 'clinic', label: 'Clinic', color: '#00d4ff', angle: Math.PI },
        { type: 'auditor', label: 'Auditor', color: '#d946ef', angle: (3 * Math.PI) / 2 }
    ];

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={45} />

            {/* Lighting */}
            <ambientLight intensity={0.3} color="#1e3a8a" />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
            <spotLight position={[-10, 10, -10]} angle={0.3} penumbra={1} intensity={0.8} color="#d946ef" />

            {/* Central Heart */}
            <CentralHeart />

            {/* Entities in circular formation */}
            {entities.map((entity, i) => (
                <Entity
                    key={i}
                    position={[
                        Math.cos(entity.angle) * radius,
                        0,
                        Math.sin(entity.angle) * radius
                    ]}
                    color={entity.color}
                    label={entity.label}
                    type={entity.type}
                    angle={entity.angle}
                />
            ))}

            {/* Flow Arrows */}
            <FlowArrows />

            {/* Starfield Background */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/* Camera Controls */}
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.5}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2}
            />
        </>
    );
};

/**
 * CSR Ecosystem Scene Component
 * Main 3D animation showing the CSR flow
 */
const CSREcosystemScene = () => {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none' // Allow clicks to pass through to UI elements
        }}>
            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance"
                }}
            >
                <color attach="background" args={['#0a0f1e']} />
                <SceneContent />
            </Canvas>
        </div>
    );
};

export default CSREcosystemScene;
