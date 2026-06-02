import { ContactShadows, Environment, Float, OrbitControls, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

function InventoryCrate({ position, color, scale = 1, speed = 0.45 }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * speed;
      meshRef.current.rotation.x += delta * 0.08;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={scale}>
      <RoundedBox args={[1, 0.72, 0.9]} radius={0.08} smoothness={8} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.34} metalness={0.12} />
      </RoundedBox>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[1.05, 0.05, 0.94]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.28} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.47]} castShadow>
        <boxGeometry args={[0.12, 0.76, 0.04]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.05} />
      </mesh>
    </group>
  );
}

function Rack({ position }) {
  return (
    <group position={position}>
      {[0, 0.75, 1.5].map((height) => (
        <mesh key={height} position={[0, height, 0]} receiveShadow>
          <boxGeometry args={[2.6, 0.08, 0.18]} />
          <meshStandardMaterial color="#334155" roughness={0.52} metalness={0.18} />
        </mesh>
      ))}
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 0.72, 0]} receiveShadow>
          <boxGeometry args={[0.08, 1.55, 0.18]} />
          <meshStandardMaterial color="#1e293b" roughness={0.42} metalness={0.22} />
        </mesh>
      ))}
    </group>
  );
}

function WarehouseScene() {
  return (
    <>
      <color attach="background" args={["#07111f"]} />
      <ambientLight intensity={0.42} />
      <spotLight position={[2.4, 5.5, 3]} angle={0.45} penumbra={0.7} intensity={2.4} castShadow />
      <pointLight position={[-3, 2.6, -2]} color="#06b6d4" intensity={2.2} />
      <pointLight position={[3, 1.8, 1.5]} color="#4f46e5" intensity={1.8} />
      <Environment preset="city" />

      <Rack position={[-1.7, -0.62, -1.05]} />
      <Rack position={[1.6, -0.62, -1.28]} />

      <Float speed={1.45} rotationIntensity={0.35} floatIntensity={0.9}>
        <InventoryCrate position={[-1.25, 0.28, 0.35]} color="#2563eb" scale={0.95} speed={0.42} />
        <InventoryCrate position={[0.08, -0.08, 0.08]} color="#14b8a6" scale={1.12} speed={0.58} />
        <InventoryCrate position={[1.38, 0.18, -0.08]} color="#06b6d4" scale={0.82} speed={0.5} />
        <InventoryCrate position={[0.7, 0.92, -0.92]} color="#4f46e5" scale={0.62} speed={0.7} />
      </Float>

      <mesh position={[0, -1.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6.2, 4.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.52} metalness={0.08} />
      </mesh>
      <mesh position={[0, -1.06, 0.68]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.24, 96]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.9} />
      </mesh>
      <ContactShadows position={[0, -1.02, 0]} opacity={0.55} scale={6} blur={2.7} far={3.8} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.65} />
    </>
  );
}

export default function Dashboard3D() {
  return (
    <div className="scene-card">
      <div className="scene-copy">
        <span className="eyebrow">Warehouse View</span>
        <h3>Digital Warehouse Flow</h3>
        <p>Floating containers, active racks, and real-time depth for a premium operations cockpit.</p>
      </div>
      <div className="scene-canvas">
        <Canvas shadows camera={{ position: [0, 1.25, 5.2], fov: 42 }}>
          <WarehouseScene />
        </Canvas>
      </div>
    </div>
  );
}
