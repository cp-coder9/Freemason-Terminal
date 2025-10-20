import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SymbolRenderer } from './SymbolRenderer';
interface ThreeCanvasProps {
  symbol: string;
}
export function ThreeCanvas({ symbol }: ThreeCanvasProps): JSX.Element {
  return (
    <div className="w-full h-48 my-4 bg-black/30 border border-retro-green/20">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <spotLight position={[-10, 10, 5]} angle={0.3} penumbra={1} intensity={1} castShadow />
        <Suspense fallback={null}>
          <SymbolRenderer symbol={symbol} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.0} />
      </Canvas>
    </div>
  );
}