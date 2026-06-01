import { Float, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

function InventoryBox({ position, color, scale = 1 }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.55;
      meshRef.current.rotation.x += delta * 0.18;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.08} />
    </mesh>
  );
}

function WarehouseScene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={1.3} />
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.8}>
        <InventoryBox position={[-1.4, 0.2, 0]} color="#2563eb" scale={0.95} />
        <InventoryBox position={[0, -0.15, 0.2]} color="#14b8a6" scale={1.1} />
        <InventoryBox position={[1.4, 0.15, -0.1]} color="#f59e0b" scale={0.85} />
      </Float>
      <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.5, 3]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
    </>
  );
}

export default function Dashboard3D() {
  return (
    <div className="scene-card">
      <div className="scene-copy">
        <span className="eyebrow">Warehouse View</span>
        <h3>Live Inventory Flow</h3>
      </div>
      <div className="scene-canvas">
        <Canvas camera={{ position: [0, 1.2, 5], fov: 45 }}>
          <WarehouseScene />
        </Canvas>
      </div>
    </div>
  );
}
