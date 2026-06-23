"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function GlassForms() {
  const knot = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!knot.current) return;
    knot.current.rotation.x += delta * 0.08;
    knot.current.rotation.y += delta * 0.13;
    knot.current.position.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.18;
  });

  return (
    <>
      <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.6}>
        <mesh ref={knot} scale={1.3} position={[0.2, 0.25, -0.7]} rotation={[0.5, 0.15, -0.4]}>
          <torusKnotGeometry args={[1.3, 0.34, 180, 24, 2, 3]} />
          <meshStandardMaterial
            color="#72b6ff"
            transparent
            opacity={0.42}
            roughness={0.24}
            metalness={0.08}
          />
        </mesh>
      </Float>
      <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.9}>
        <mesh position={[2.6, -1.4, 0.4]} rotation={[0.2, 0.4, 0.2]}>
          <icosahedronGeometry args={[0.58, 1]} />
          <meshStandardMaterial color="#285cff" roughness={0.18} metalness={0.05} />
        </mesh>
      </Float>
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.75}>
        <mesh position={[-2.8, 1.6, -0.4]} rotation={[0.5, 0.1, 0.2]}>
          <torusGeometry args={[0.58, 0.16, 18, 64]} />
          <meshStandardMaterial color="#ffda45" roughness={0.35} />
        </mesh>
      </Float>
    </>
  );
}

export function HeroScene() {
  return (
    <div className="hero-scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6.8], fov: 42 }} dpr={[1, 1.6]}>
        <ambientLight intensity={1.8} />
        <directionalLight position={[4, 5, 6]} intensity={3.2} color="#fff8de" />
        <GlassForms />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
