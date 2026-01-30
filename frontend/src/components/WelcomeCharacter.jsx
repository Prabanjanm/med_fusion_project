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

const Mascot = ({ pose }) => {
    const group = useRef();
    // Start with stable GLB
    const { scene, nodes, animations } = useGLTF('/model.glb');
    const { actions, names } = useAnimations(animations, group);

    // Bone Refs
    const bones = useRef({
        rightArm: null,
        rightForeArm: null,
        rightHand: null,
        leftArm: null,
        leftForeArm: null,
        leftHand: null,
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
        bones.current.leftArm = find([['Left', 'Arm'], ['Left', 'Shoulder'], ['Arm', 'L'], 'mixamorigLeftArm', 'mixamorig_LeftArm']);
        bones.current.leftForeArm = find([['Left', 'Fore'], ['Left', 'Elbow'], ['ForeArm', 'L'], 'mixamorigLeftForeArm', 'mixamorig_LeftForeArm']);
        bones.current.leftHand = find([['Left', 'Hand'], ['Hand', 'L'], 'mixamorigLeftHand', 'mixamorig_LeftHand']);
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
        // 1. WELCOME HANDSHAKE (Warm Welcome Gesture)
        if (activeAction === 'welcome_handshake' || activeAction === 'wave') {
            // Right Arm Open
            if (bones.current.rightArm && restPose.current.rightArm) {
                bones.current.rightArm.rotation.z = THREE.MathUtils.lerp(bones.current.rightArm.rotation.z, restPose.current.rightArm.z + 1.2, lerpFactor);
                bones.current.rightArm.rotation.x = THREE.MathUtils.lerp(bones.current.rightArm.rotation.x, restPose.current.rightArm.x + 0.3, lerpFactor);
            }
            if (bones.current.rightForeArm && restPose.current.rightForeArm) {
                bones.current.rightForeArm.rotation.z = THREE.MathUtils.lerp(bones.current.rightForeArm.rotation.z, restPose.current.rightForeArm.z + 0.5, lerpFactor);
            }
            // Left Arm Open (Symmetrical Welcome)
            if (bones.current.leftArm && restPose.current.leftArm) {
                bones.current.leftArm.rotation.z = THREE.MathUtils.lerp(bones.current.leftArm.rotation.z, restPose.current.leftArm.z - 1.2, lerpFactor);
                bones.current.leftArm.rotation.x = THREE.MathUtils.lerp(bones.current.leftArm.rotation.x, restPose.current.leftArm.x + 0.3, lerpFactor);
            }
            if (bones.current.leftForeArm && restPose.current.leftForeArm) {
                bones.current.leftForeArm.rotation.z = THREE.MathUtils.lerp(bones.current.leftForeArm.rotation.z, restPose.current.leftForeArm.z - 0.5, lerpFactor);
            }
            // Head Up & Friendly
            if (bones.current.neck && restPose.current.neck) {
                bones.current.neck.rotation.x = THREE.MathUtils.lerp(bones.current.neck.rotation.x, restPose.current.neck.x - 0.2, lerpFactor);
            }
        }

        // 2. LOOK INPUT (Focus on Form)
        else if (activeAction === 'look_input' || activeAction === 'filling') {
            const lookDownIntensity = 0.5;
            // Head Tilts Down
            if (bones.current.neck && restPose.current.neck) {
                bones.current.neck.rotation.x = THREE.MathUtils.lerp(bones.current.neck.rotation.x, restPose.current.neck.x + lookDownIntensity, lerpFactor);
            }
            if (bones.current.head && restPose.current.head) {
                bones.current.head.rotation.x = THREE.MathUtils.lerp(bones.current.head.rotation.x, restPose.current.head.x + 0.2, lerpFactor);
            }
            // Arms Relaxed but slightly forward (ready to type concept)
            if (bones.current.rightArm && restPose.current.rightArm) {
                bones.current.rightArm.rotation.x = THREE.MathUtils.lerp(bones.current.rightArm.rotation.x, restPose.current.rightArm.x + 0.2, lerpFactor);
            }
        }

        // 3. CLOSE EYES / PRIVACY (Shy/Cover)
        else if (activeAction === 'close_eyes' || activeAction === 'shy') {
            // Head Turns Away (Privacy)
            if (bones.current.neck && restPose.current.neck) {
                bones.current.neck.rotation.y = THREE.MathUtils.lerp(bones.current.neck.rotation.y, restPose.current.neck.y + 1.2, lerpFactor); // Sharp turn
                bones.current.neck.rotation.x = THREE.MathUtils.lerp(bones.current.neck.rotation.x, restPose.current.neck.x + 0.4, lerpFactor); // Down
            }
            // Optional: Hand could potentially cover eyes if we wanted, but keeping it "Non-distracting"
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

    return (
        <group dispose={null}>
            <group ref={group} position={[0, -1, 0]} scale={1.6}>
                <primitive object={scene} />
            </group>
        </group>
    );
};

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
            </Canvas>
        </div>
    );
};

export default WelcomeCharacter;
