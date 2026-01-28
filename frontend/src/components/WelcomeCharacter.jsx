import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, ContactShadows, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 3D Mascot Component - Procedural "Puppeteer" System (GLB Version)
 * 
 * Implements strict requirements:
 * - Locked Root
 * - Greeting Wave (Right Hand, Palm Out)
 * - Form Interaction (Look & Point)
 * - Privacy Mode (Look Away)
 */
<<<<<<< HEAD

const Mascot = ({ pose }) => {
=======
const CharacterModel = ({ animation = 'idle', lookAtCursor = false, roleColor = "#22d3ee" }) => {
>>>>>>> b659109380fa022a9de50b04be840f4d1ccc1008
    const group = useRef();
    // Start with stable GLB
    const { scene, nodes, animations } = useGLTF('/model.glb');
    const { actions, names } = useAnimations(animations, group);

    // Bone Refs
    const bones = useRef({
        rightArm: null,
        rightForeArm: null,
        rightHand: null,
        neck: null,
        head: null,
        spine: null
    });

    // Initial Rotations (Rest Pose)
    const restPose = useRef({});

    // Internal State
    const [activeAction, setActiveAction] = useState('idle');
    const [hasGreeted, setHasGreeted] = useState(false);

    // --- 1. SKELETON BINDING & DEBUG ---
    useEffect(() => {
        const allBones = [];
        scene.traverse(c => {
            if (c.isBone) allBones.push(c.name);
        });
        console.log("Mascot Debug - Found Bones:", allBones);
        console.log("Mascot Debug - Found Animations:", names);

        // Helper: Multi-strategy bone finder
        const find = (strategies) => {
            for (const strategy of strategies) {
                let found = null;
                scene.traverse(c => {
                    if (found) return;
                    const name = c.name.toLowerCase();
                    // Strategy is array of keywords that MUST all match
                    if (Array.isArray(strategy)) {
                        if (strategy.every(k => name.includes(k.toLowerCase()))) found = c;
                    }
                    // Strategy is exact string match
                    else if (typeof strategy === 'string') {
                        if (name === strategy.toLowerCase()) found = c;
                    }
                });
                if (found) return found;
            }
            return null;
        };

        // Robust Search Chain
        bones.current.rightArm = find([['Right', 'Arm'], ['Right', 'Shoulder'], ['Arm', 'R'], 'mixamorigRightArm', 'mixamorig_RightArm']);
        bones.current.rightForeArm = find([['Right', 'Fore'], ['Right', 'Elbow'], ['ForeArm', 'R'], 'mixamorigRightForeArm', 'mixamorig_RightForeArm']);
        bones.current.rightHand = find([['Right', 'Hand'], ['Hand', 'R'], 'mixamorigRightHand', 'mixamorig_RightHand']);
        bones.current.neck = find([['Neck'], ['Head'], 'mixamorigNeck', 'mixamorig_Neck']);
        bones.current.head = find([['Head'], ['Top'], 'mixamorigHead', 'mixamorig_Head']);
        bones.current.spine = find([['Spine'], ['Torso'], ['Hips'], 'mixamorigSpine', 'mixamorig_Spine']);

        // Snapshot Rest Pose
        Object.entries(bones.current).forEach(([key, bone]) => {
            if (bone) restPose.current[key] = bone.rotation.clone();
        });

    }, [scene, names]);

    // --- 2. GREETING LOGIC (Procedural Fallback) ---
    useEffect(() => {
        if (names.length === 0) { // Only use procedural greeting if no baked animations
            if (pose === 'wave' && !hasGreeted) {
                setActiveAction('wave');
                const t = setTimeout(() => {
                    setActiveAction('idle');
                    setHasGreeted(true);
                }, 2000); // 2.0s Duration for "Hi"
                return () => clearTimeout(t);
            } else if (pose !== 'wave') {
                setActiveAction(pose);
            }
        } else {
            // If baked animations exist, reset hasGreeted for potential re-wave
            if (pose !== 'wave') {
                setHasGreeted(false);
            }
        }
    }, [pose, hasGreeted, names.length]);

    // --- 3. ANIMATION PLAYBACK (Baked Animations) ---
    useEffect(() => {
        if (names.length > 0) {
            // 1. Determine which clip to play
            let clipName = names[0]; // Default to first

            // Try to find specific clips based on pose
            if (pose === 'wave') {
                const waveClip = names.find(n => n.toLowerCase().includes('wave')) || names.find(n => n.toLowerCase().includes('hello'));
                if (waveClip) clipName = waveClip;
            } else if (pose === 'idle') {
                const idleClip = names.find(n => n.toLowerCase().includes('idle'));
                if (idleClip) clipName = idleClip;
            } else {
                // For other poses, if no specific animation, default to idle
                const idleClip = names.find(n => n.toLowerCase().includes('idle'));
                if (idleClip) clipName = idleClip;
            }

            // 2. Play the clip
            const action = actions[clipName];
            if (action) {
                // Fade out others
                Object.values(actions).forEach(act => act !== action && act.fadeOut(0.5));
                action.reset().fadeIn(0.5).play();

                // If it's a wave, maybe only play once?
                if (pose === 'wave') {
                    action.setLoop(THREE.LoopOnce);
                    action.clampWhenFinished = true;
                    // After wave, transition back to idle
                    action.getMixer().addEventListener('finished', () => {
                        const idleClip = names.find(n => n.toLowerCase().includes('idle'));
                        if (idleClip && actions[idleClip]) {
                            actions[idleClip].reset().fadeIn(0.5).play();
                            actions[idleClip].setLoop(THREE.LoopRepeat);
                        }
                    });
                } else {
                    action.setLoop(THREE.LoopRepeat);
                }
            }
        }
    }, [pose, actions, names]);


    // --- 4. PROCEDURAL ANIMATION LOOP (Fallback/Additive) ---
    useFrame((state, delta) => {
        if (!group.current) return;
        const t = state.clock.getElapsedTime();
        const lerpFactor = delta * 5; // Original lerpFactor, adjust as needed for procedural

        // A. GLOBAL FALLBACK ANIMATION (Ensures it's never static)
        // Breathing via slight scale squash/stretch + subtle rotation
        // INCREASED INTENSITY (3x stronger)
        group.current.position.y = -1 + Math.sin(t * 2) * 0.03; // Float +/- 3cm
        group.current.rotation.y = Math.sin(t) * 0.05; // Sway +/- 3 degrees
        group.current.scale.y = 1.6 + Math.sin(t * 4) * 0.01; // Breathing Squash
        group.current.scale.x = 1.6 - (Math.sin(t * 4) * 0.005); // Squash/Stretch preservation
        group.current.position.y = -1 + (Math.sin(t * 2) * 0.03); // Micro-float planted
        group.current.rotation.x = 0; // Keep root X locked
        group.current.rotation.z = 0; // Keep root Z locked

        // B. PROCEDURAL OVERRIDES BASED ON activeAction
        if (activeAction === 'wave') {
            // Right arm wave (palm out)
            if (bones.current.rightArm && restPose.current.rightArm) {
                bones.current.rightArm.rotation.z = THREE.MathUtils.lerp(bones.current.rightArm.rotation.z, restPose.current.rightArm.z + 2.0, lerpFactor); // Arm up
                bones.current.rightArm.rotation.x = THREE.MathUtils.lerp(bones.current.rightArm.rotation.x, restPose.current.rightArm.x + 0.5, lerpFactor);
            }
            if (bones.current.rightForeArm && restPose.current.rightForeArm) {
                bones.current.rightForeArm.rotation.z = THREE.MathUtils.lerp(bones.current.rightForeArm.rotation.z, restPose.current.rightForeArm.z + 0.5, lerpFactor); // Forearm bend
            }
            if (bones.current.rightHand && restPose.current.rightHand) {
                bones.current.rightHand.rotation.y = THREE.MathUtils.lerp(bones.current.rightHand.rotation.y, restPose.current.rightHand.y + Math.sin(t * 10) * 0.5, lerpFactor); // Waving motion
                bones.current.rightHand.rotation.z = THREE.MathUtils.lerp(bones.current.rightHand.rotation.z, restPose.current.rightHand.z + 0.5, lerpFactor); // Palm out
            }
            // Head look at camera
            if (bones.current.neck && restPose.current.neck) {
                bones.current.neck.rotation.y = THREE.MathUtils.lerp(bones.current.neck.rotation.y, restPose.current.neck.y, lerpFactor);
                bones.current.neck.rotation.x = THREE.MathUtils.lerp(bones.current.neck.rotation.x, restPose.current.neck.x, lerpFactor);
            }
            if (bones.current.head && restPose.current.head) {
                bones.current.head.rotation.y = THREE.MathUtils.lerp(bones.current.head.rotation.y, restPose.current.head.y, lerpFactor);
            }
        }

        // --- INVITE (Look Down at Form) ---
        else if (activeAction === 'invite' || activeAction === 'filling') {
            // Head Look Down & Right (towards form)
            if (bones.current.neck && restPose.current.neck) {
                bones.current.neck.rotation.y = THREE.MathUtils.lerp(bones.current.neck.rotation.y, restPose.current.neck.y - 0.6, lerpFactor);
                bones.current.neck.rotation.x = THREE.MathUtils.lerp(bones.current.neck.rotation.x, restPose.current.neck.x + 0.5, lerpFactor); // Look down
            }
            if (bones.current.head && restPose.current.head) {
                bones.current.head.rotation.x = THREE.MathUtils.lerp(bones.current.head.rotation.x, restPose.current.head.x + 0.3, lerpFactor);
            }
            // Arm Pointing Low
            if (bones.current.rightArm && restPose.current.rightArm) {
                bones.current.rightArm.rotation.z = THREE.MathUtils.lerp(bones.current.rightArm.rotation.z, restPose.current.rightArm.z + 0.6, lerpFactor); // Low Lift
                bones.current.rightArm.rotation.x = THREE.MathUtils.lerp(bones.current.rightArm.rotation.x, restPose.current.rightArm.x + 0.8, lerpFactor); // Point Forward
            }
            if (bones.current.rightForeArm && restPose.current.rightForeArm) {
                bones.current.rightForeArm.rotation.z = THREE.MathUtils.lerp(bones.current.rightForeArm.rotation.z, restPose.current.rightForeArm.z + 0.5, lerpFactor);
            }
        }

        // --- SHY (Password - Look Away) ---
        else if (activeAction === 'shy') {
            // Head Look Away (Up & Left)
            if (bones.current.neck && restPose.current.neck) {
                bones.current.neck.rotation.y = THREE.MathUtils.lerp(bones.current.neck.rotation.y, restPose.current.neck.y + 0.8, lerpFactor); // Turn Left
                bones.current.neck.rotation.x = THREE.MathUtils.lerp(bones.current.neck.rotation.x, restPose.current.neck.x - 0.3, lerpFactor); // Look Up
            }
            // Arm Cover Eyes
            if (bones.current.rightArm && restPose.current.rightArm) {
                bones.current.rightArm.rotation.z = THREE.MathUtils.lerp(bones.current.rightArm.rotation.z, restPose.current.rightArm.z + 2.2, lerpFactor); // High Lift
                bones.current.rightArm.rotation.x = THREE.MathUtils.lerp(bones.current.rightArm.rotation.x, restPose.current.rightArm.x + 0.5, lerpFactor); // In front of face
            }
            if (bones.current.rightForeArm && restPose.current.rightForeArm) {
                bones.current.rightForeArm.rotation.z = THREE.MathUtils.lerp(bones.current.rightForeArm.rotation.z, restPose.current.rightForeArm.z + 2.5, lerpFactor); // Curl tight
            }
        }

        // --- IDLE ---
        else {
            // Reset to rest
            Object.entries(bones.current).forEach(([key, bone]) => {
                if (bone && restPose.current[key]) {
                    if (key !== 'spine') { // Spine handled by breath
                        bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, restPose.current[key].x, lerpFactor);
                        bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, restPose.current[key].y, lerpFactor);
                        bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, restPose.current[key].z, lerpFactor);
                    }
                }
            });
        }
    });

<<<<<<< HEAD
    return (
        <group dispose={null}>
            <group ref={group} position={[0, -1, 0]} scale={1.6}>
                <primitive object={scene} />
            </group>
=======
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

>>>>>>> b659109380fa022a9de50b04be840f4d1ccc1008
        </group>
    );
};

<<<<<<< HEAD
// Preload
useGLTF.preload('/model.glb');

const WelcomeCharacter = ({ animation = 'idle' }) => {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Canvas camera={{ position: [0, 0.5, 4], fov: 35 }} dpr={[1, 2]}>
                <ambientLight intensity={0.7} />
                <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-5, 5, 5]} intensity={0.5} color="#ffffff" />
                <Environment preset="city" />
                <React.Suspense fallback={null}>
                    <Mascot pose={animation} />
                </React.Suspense>
                <ContactShadows resolution={512} scale={10} blur={2} opacity={0.25} far={10} color="#000000" />
=======
const WelcomeCharacter = ({ animation = 'idle', roleColor = "#22d3ee" }) => {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
            <Canvas camera={{ position: [0, 0.8, 3.5], fov: 35 }} dpr={[1, 2]}>
                <ambientLight intensity={0.9} />
                <spotLight position={[5, 10, 5]} angle={0.2} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-5, 2, 5]} intensity={0.5} color="#e0f2fe" />

                <CharacterModel animation={animation} lookAtCursor={true} roleColor={roleColor} />
>>>>>>> b659109380fa022a9de50b04be840f4d1ccc1008
            </Canvas>
        </div>
    );
};

export default WelcomeCharacter;
