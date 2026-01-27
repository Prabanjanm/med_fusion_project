import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useCursor, Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Procedural 3D Cartoon Character - "Welcome" Style
 * Matches reference: Navy suit, cyan shirt, waving "Hi", friendly face.
 */
const CharacterModel = ({ animation = 'idle', lookAtCursor = false, roleColor = "#22d3ee" }) => {
    const group = useRef();
    const headRef = useRef();
    const rightArmRef = useRef();
    const [hovered, setHover] = useState(false);

    useCursor(hovered);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Idle Animation
        if (group.current) {
            group.current.position.y = -1 + Math.sin(t * 1.5) * 0.02; // Breathing
        }

        if (headRef.current) {
            headRef.current.rotation.x = Math.sin(t * 1) * 0.03;
            // Subtle head follow
            if (lookAtCursor) {
                const mouseX = state.mouse.x * 0.3;
                const mouseY = state.mouse.y * 0.2;
                headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, mouseX, 0.1);
                headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -mouseY, 0.1);
            }
        }

        // Wave Animation (Right Arm) - "Saying Hi"
        if (animation === 'greeting' && rightArmRef.current) {
            // Raised arm waving
            const wave = Math.sin(t * 6) * 0.3;
            rightArmRef.current.rotation.z = Math.PI / 1.4 + wave * 0.4;
            rightArmRef.current.rotation.x = 0.3;
            // Palm facing forward
            rightArmRef.current.rotation.y = 0.5;
        }

        // Idle Arm
        if (animation === 'idle' && rightArmRef.current) {
            rightArmRef.current.rotation.z = 0;
        }
    });

    // Shared Colors
    const skinColor = "#ffdbac";
    const hairColor = "#5D4037";
    const suitColor = "#1e3a8a";

    return (
        <group ref={group} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>

            {/* --- BODY --- */}

            {/* Shirt (Inner) */}
            <mesh position={[0, 0.7, 0]}>
                <capsuleGeometry args={[0.42, 0.75, 4, 16]} />
                <meshStandardMaterial color={roleColor} roughness={0.4} />
            </mesh>

            {/* Shirt Collar (Cyan) */}
            <mesh position={[0, 1.1, 0]}>
                <cylinderGeometry args={[0.22, 0.38, 0.2, 16]} />
                <meshStandardMaterial color={roleColor} roughness={0.4} />
            </mesh>

            {/* Suit Jacket (Open) */}
            <mesh position={[0, 0.6, 0.05]}>
                <cylinderGeometry args={[0.48, 0.48, 0.9, 16, 1, true, 0, Math.PI * 1.3]} rotation={[0, Math.PI * 1.35, 0]} />
                <meshStandardMaterial color={suitColor} roughness={0.5} side={THREE.DoubleSide} />
            </mesh>
            {/* Jacket Lapels */}
            <mesh position={[-0.15, 0.9, 0.2]} rotation={[0, 0, -0.4]}>
                <boxGeometry args={[0.1, 0.4, 0.02]} />
                <meshStandardMaterial color={suitColor} roughness={0.5} />
            </mesh>
            <mesh position={[0.15, 0.9, 0.2]} rotation={[0, 0, 0.4]}>
                <boxGeometry args={[0.1, 0.4, 0.02]} />
                <meshStandardMaterial color={suitColor} roughness={0.5} />
            </mesh>

            {/* Buttons on suit */}
            <mesh position={[0.2, 0.5, 0.28]} rotation={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.02]} rotation={[Math.PI / 2, 0, 0]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0.2, 0.3, 0.28]} rotation={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.02]} rotation={[Math.PI / 2, 0, 0]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>


            {/* --- HEAD --- */}
            <group ref={headRef} position={[0, 1.45, 0]}>
                {/* Face */}
                <mesh>
                    <sphereGeometry args={[0.36, 32, 32]} />
                    <meshStandardMaterial color={skinColor} roughness={0.3} />
                </mesh>

                {/* Hair - Swept Back Style */}
                <mesh position={[0, 0.15, -0.05]}>
                    <sphereGeometry args={[0.38, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
                    <meshStandardMaterial color={hairColor} roughness={0.6} />
                </mesh>
                {/* Hair Puff on top */}
                <mesh position={[0, 0.4, 0.1]} rotation={[-0.2, 0, 0]}>
                    <sphereGeometry args={[0.18, 16, 16]} />
                    <meshStandardMaterial color={hairColor} roughness={0.6} />
                </mesh>
                {/* Hair Sideburns */}
                <mesh position={[-0.32, 0.1, 0.1]}>
                    <sphereGeometry args={[0.08]} />
                    <meshStandardMaterial color={hairColor} roughness={0.6} />
                </mesh>
                <mesh position={[0.32, 0.1, 0.1]}>
                    <sphereGeometry args={[0.08]} />
                    <meshStandardMaterial color={hairColor} roughness={0.6} />
                </mesh>
                <mesh position={[-0.35, 0.1, 0]}>
                    <sphereGeometry args={[0.1]} /> {/* Ears */}
                    <meshStandardMaterial color={skinColor} roughness={0.3} />
                </mesh>
                <mesh position={[0.35, 0.1, 0]}>
                    <sphereGeometry args={[0.1]} /> {/* Ears */}
                    <meshStandardMaterial color={skinColor} roughness={0.3} />
                </mesh>


                {/* Eyes - Large Friendly */}
                <mesh position={[-0.11, 0.08, 0.32]}>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                <mesh position={[0.11, 0.08, 0.32]}>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                {/* Pupils */}
                <mesh position={[-0.11, 0.08, 0.37]}>
                    <sphereGeometry args={[0.035, 16, 16]} />
                    <meshStandardMaterial color="#3e2723" />
                </mesh>
                <mesh position={[0.11, 0.08, 0.37]}>
                    <sphereGeometry args={[0.035, 16, 16]} />
                    <meshStandardMaterial color="#3e2723" />
                </mesh>

                {/* Eyebrows */}
                <mesh position={[-0.11, 0.22, 0.3]} rotation={[0, 0, 0.1]}>
                    <capsuleGeometry args={[0.02, 0.12, 4]} rotation={[0, 0, Math.PI / 2]} />
                    <meshStandardMaterial color={hairColor} roughness={0.6} />
                </mesh>
                <mesh position={[0.11, 0.22, 0.3]} rotation={[0, 0, -0.1]}>
                    <capsuleGeometry args={[0.02, 0.12, 4]} rotation={[0, 0, Math.PI / 2]} />
                    <meshStandardMaterial color={hairColor} roughness={0.6} />
                </mesh>

                {/* Nose - Rounded Button */}
                <mesh position={[0, 0, 0.36]}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshStandardMaterial color={skinColor} roughness={0.3} />
                </mesh>

                {/* Smile - Open & Friendly */}
                <mesh position={[0, -0.12, 0.34]} rotation={[0.1, 0, 0]}>
                    {/* Adjusted rotation to make it a smile (U shape) instead of a frown */}
                    <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} rotation={[0, 0, 0]} />
                    <meshStandardMaterial color="#a1665e" />
                </mesh>
            </group>

            {/* --- ID BADGE --- */}
            <group position={[0.2, 0.8, 0.3]} rotation={[0.05, 0, -0.05]}>
                {/* Card */}
                <mesh>
                    <boxGeometry args={[0.16, 0.12, 0.01]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                {/* Clip */}
                <mesh position={[0, 0.07, 0]}>
                    <boxGeometry args={[0.04, 0.02, 0.01]} />
                    <meshStandardMaterial color="#94a3b8" />
                </mesh>
                {/* Text "CSR" */}
                <mesh position={[0, 0.02, 0.01]}>
                    <planeGeometry args={[0.14, 0.08]} />
                    <meshBasicMaterial color="#ffffff">
                        {/* Could use a texture here, but just a white plane implies it for now */}
                    </meshBasicMaterial>
                </mesh>
                {/* Blue Header on Badge - Matches Outfit */}
                <mesh position={[0, 0.04, 0.006]}>
                    <boxGeometry args={[0.14, 0.03, 0.001]} />
                    <meshStandardMaterial color={roleColor} />
                </mesh>
            </group>

            {/* --- ARMS --- */}
            {/* Right Arm (Waving) */}
            <group position={[0.55, 1.1, 0]} ref={rightArmRef}>
                {/* Shoulder/Upper Arm */}
                <mesh position={[0, -0.35, 0]}>
                    <capsuleGeometry args={[0.13, 0.7, 4, 16]} />
                    <meshStandardMaterial color={suitColor} roughness={0.5} />
                </mesh>
                {/* Custom Shirt Cuff */}
                <mesh position={[0, -0.7, 0]}>
                    <cylinderGeometry args={[0.135, 0.135, 0.1]} />
                    <meshStandardMaterial color={roleColor} roughness={0.4} />
                </mesh>
                {/* Hand - Palm open */}
                <group position={[0, -0.9, 0]} rotation={[0, 0, 0]}>
                    <mesh>
                        <boxGeometry args={[0.14, 0.16, 0.06]} /> {/* Palm */}
                        <meshStandardMaterial color={skinColor} roughness={0.3} />
                    </mesh>
                    {/* Fingers */}
                    <mesh position={[-0.05, 0.12, 0]}> <capsuleGeometry args={[0.03, 0.12]} /> <meshStandardMaterial color={skinColor} roughness={0.3} /> </mesh>
                    <mesh position={[-0.02, 0.14, 0]}> <capsuleGeometry args={[0.03, 0.14]} /> <meshStandardMaterial color={skinColor} roughness={0.3} /> </mesh>
                    <mesh position={[0.02, 0.13, 0]}> <capsuleGeometry args={[0.03, 0.13]} /> <meshStandardMaterial color={skinColor} roughness={0.3} /> </mesh>
                    <mesh position={[0.05, 0.11, 0]}> <capsuleGeometry args={[0.03, 0.11]} /> <meshStandardMaterial color={skinColor} roughness={0.3} /> </mesh>
                    {/* Thumb */}
                    <mesh position={[0.08, -0.05, 0]} rotation={[0, 0, -0.5]}> <capsuleGeometry args={[0.035, 0.1]} /> <meshStandardMaterial color={skinColor} roughness={0.3} /> </mesh>
                </group>
            </group>

            {/* Left Arm (Relaxed) */}
            <group position={[-0.55, 1.1, 0]} rotation={[0, 0, 0.15]}>
                <mesh position={[0, -0.35, 0]}>
                    <capsuleGeometry args={[0.13, 0.75, 4, 16]} />
                    <meshStandardMaterial color={suitColor} roughness={0.5} />
                </mesh>
                <mesh position={[0, -0.75, 0]}>
                    <cylinderGeometry args={[0.135, 0.135, 0.1]} />
                    <meshStandardMaterial color={roleColor} roughness={0.4} />
                </mesh>
                <mesh position={[0, -0.9, 0]}>
                    <sphereGeometry args={[0.13]} />
                    <meshStandardMaterial color={skinColor} roughness={0.3} />
                </mesh>
            </group>

        </group>
    );
};

const WelcomeCharacter = ({ animation = 'idle', roleColor = "#22d3ee" }) => {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
            <Canvas camera={{ position: [0, 0.8, 3.5], fov: 35 }} dpr={[1, 2]}>
                <ambientLight intensity={0.9} />
                <spotLight position={[5, 10, 5]} angle={0.2} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-5, 2, 5]} intensity={0.5} color="#e0f2fe" />

                <CharacterModel animation={animation} lookAtCursor={true} roleColor={roleColor} />
            </Canvas>
        </div>
    );
};

export default WelcomeCharacter;
