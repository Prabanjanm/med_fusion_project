import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Html, Float, Icosahedron, Ring } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * Geometric Crystal Heart - The Core
 */
const GeometricHeart = () => {
    const meshRef = useRef();
    const glowRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
        meshRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05); // Heartbeat

        if (glowRef.current) {
            glowRef.current.scale.setScalar(1.2 + Math.sin(t * 2) * 0.1);
        }
    });

    return (
        <group>
            {/* Core Crystal */}
            <Icosahedron args={[1, 1]} ref={meshRef}>
                <meshPhysicalMaterial
                    color="#00d4ff"
                    emissive="#00d4ff"
                    emissiveIntensity={0.5}
                    roughness={0}
                    metalness={0.9}
                    transmission={0.2}
                    wireframe={true}
                />
            </Icosahedron>
            {/* Core Glow */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshBasicMaterial color="#00d4ff" transparent opacity={0.2} />
            </mesh>
        </group>
    );
};

/**
 * Interactive Role Node
 */
const RoleNode = ({ position, color, label, roleId, type, onRoleClick, isSelected }) => {
    const groupRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (!isSelected) {
            groupRef.current.rotation.y += 0.01; // Idle rotation
        } else {
            groupRef.current.rotation.y += 0.05; // Fast spin on selection
        }
    });

    const renderGeometry = () => {
        switch (type) {
            case 'csr': return <boxGeometry args={[0.7, 0.7, 0.7]} />;
            case 'ngo': return <octahedronGeometry args={[0.6, 0]} />;
            case 'clinic': return <dodecahedronGeometry args={[0.6, 0]} />;
            case 'auditor': return <coneGeometry args={[0.5, 0.8, 4]} />;
            default: return <sphereGeometry args={[0.5]} />;
        }
    };

    return (
        <group
            ref={groupRef}
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                onRoleClick(roleId);
            }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            scale={hovered ? 1.2 : 1}
        >
            <mesh>
                {renderGeometry()}
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 2 : 0.5}
                    wireframe={true}
                />
            </mesh>

            {/* Inner Solid */}
            <mesh scale={[0.8, 0.8, 0.8]}>
                {renderGeometry()}
                <meshBasicMaterial color={color} transparent opacity={0.1} />
            </mesh>

            {/* Label */}
            <Html position={[0, -1, 0]} center style={{ pointerEvents: 'none' }}>
                <div style={{
                    color: hovered || isSelected ? '#ffffff' : color,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '10px',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${color}`,
                    opacity: hovered || isSelected ? 1 : 0.6,
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap'
                }}>
                    {label}
                </div>
            </Html>
        </group>
    );
};

/**
 * Camera Controller
 * Handles the "Zoom to Role" animation
 */
const CameraController = ({ selectedRole, rolePositions }) => {
    const { camera } = useThree();

    useEffect(() => {
        if (selectedRole && rolePositions[selectedRole]) {
            const targetPos = rolePositions[selectedRole];

            // Animate Camera to zoom in on the selected role
            gsap.to(camera.position, {
                x: targetPos[0] * 0.8, // Move closer but keep some distance
                y: targetPos[1] + 1,       // Slightly above
                z: targetPos[2] + 2,       // Back a bit
                duration: 1.5,
                ease: "power3.inOut"
            });

            // Look at the role
            // We can't interpolate 'lookAt' directly easily with gsap alone usually, 
            // but moving position gets us most of the way. 
            // For a simpler effect, we just move the camera close.
        }
    }, [selectedRole, rolePositions, camera]);

    return null;
};

/**
 * Main Scene
 */
const SceneContent = ({ onRoleClick, selectedRole }) => {
    const radius = 3.5;

    // Define positions explicitly for camera targeting
    const roles = [
        { id: 'csr', label: 'CORPORATE', color: '#00d4ff', angle: 0 },
        { id: 'ngo', label: 'NGO', color: '#d946ef', angle: Math.PI / 2 },
        { id: 'clinic', label: 'CLINIC', color: '#00d4ff', angle: Math.PI },
        { id: 'auditor', label: 'AUDITOR', color: '#d946ef', angle: 3 * Math.PI / 2 },
    ];

    const rolePositions = {};
    roles.forEach(r => {
        rolePositions[r.id] = [
            Math.cos(r.angle) * radius,
            0,
            Math.sin(r.angle) * radius
        ];
    });

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 4, 10]} fov={50} />
            <CameraController selectedRole={selectedRole} rolePositions={rolePositions} />

            <ambientLight intensity={0.2} color="#001e36" />
            <pointLight position={[10, 5, 5]} intensity={1} color="#00d4ff" />

            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

            {/* Center */}
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <GeometricHeart />
            </Float>

            {/* Ring System */}
            <group rotation={[0.2, 0, 0]}>
                <Ring args={[radius - 0.05, radius + 0.05, 64]} rotation={[-Math.PI / 2, 0, 0]}>
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
                </Ring>

                {roles.map((r) => (
                    <RoleNode
                        key={r.id}
                        {...r}
                        type={r.id}
                        roleId={r.id}
                        position={rolePositions[r.id]}
                        onRoleClick={onRoleClick}
                        isSelected={selectedRole === r.id}
                    />
                ))}
            </group>
        </>
    );
};

const CSRFlowAnimation = ({ onRoleClick, selectedRole }) => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <Canvas dpr={[1, 2]} gl={{ antialias: true }} style={{ background: 'transparent' }}>
                <SceneContent onRoleClick={onRoleClick} selectedRole={selectedRole} />
            </Canvas>
        </div>
    );
};

export default CSRFlowAnimation;
