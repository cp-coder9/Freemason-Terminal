import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cone, Torus, Icosahedron, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
interface SymbolRendererProps {
  symbol: string;
}
const RotatingGroup = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
    }
  });
  return <group ref={ref}>{children}</group>;
};
const SquareAndCompasses = () => (
  <RotatingGroup>
    <Torus args={[1, 0.05, 8, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <meshStandardMaterial color="#c0c0c0" />
    </Torus>
    <Box args={[0.1, 2, 0.1]} rotation={[0, 0, -Math.PI / 6]} position={[-0.5, 0, 0]}>
      <meshStandardMaterial color="#c0c0c0" />
    </Box>
    <Box args={[0.1, 2, 0.1]} rotation={[0, 0, Math.PI / 6]} position={[0.5, 0, 0]}>
      <meshStandardMaterial color="#c0c0c0" />
    </Box>
  </RotatingGroup>
);
const AllSeeingEye = () => (
  <RotatingGroup>
    <Cone args={[1, 1.5, 3]} position={[0, 0, 0]}>
      <meshStandardMaterial color="#ffd700" wireframe />
    </Cone>
    <Icosahedron args={[0.3]} position={[0, 0.2, 0.5]}>
      <meshStandardMaterial color="#ffffff" />
    </Icosahedron>
  </RotatingGroup>
);
const SkullAndBones = () => (
  <RotatingGroup>
    <Box args={[0.6, 0.7, 0.6]} position={[0, 0.15, 0]}>
      <meshStandardMaterial color="#e0e0e0" />
    </Box>
    <Box args={[1.5, 0.2, 0.2]} rotation={[0, 0, Math.PI / 4]}>
      <meshStandardMaterial color="#e0e0e0" />
    </Box>
    <Box args={[1.5, 0.2, 0.2]} rotation={[0, 0, -Math.PI / 4]}>
      <meshStandardMaterial color="#e0e0e0" />
    </Box>
  </RotatingGroup>
);
const TwoPillars = () => (
  <RotatingGroup>
    <Cylinder args={[0.3, 0.3, 2, 16]} position={[-1, 0, 0]}>
      <meshStandardMaterial color="#a9a9a9" />
    </Cylinder>
    <Cylinder args={[0.3, 0.3, 2, 16]} position={[1, 0, 0]}>
      <meshStandardMaterial color="#a9a9a9" />
    </Cylinder>
  </RotatingGroup>
);
const Gavel = () => (
  <RotatingGroup>
    <Cylinder args={[0.2, 0.2, 1, 16]} rotation={[0, 0, Math.PI / 2]} position={[0, 0.5, 0]}>
      <meshStandardMaterial color="#8B4513" />
    </Cylinder>
    <Cylinder args={[0.1, 0.1, 1.5, 16]}>
      <meshStandardMaterial color="#8B4513" />
    </Cylinder>
  </RotatingGroup>
);
const UnknownSymbol = () => (
  <Box>
    <meshStandardMaterial color="red" wireframe />
  </Box>
);
export function SymbolRenderer({ symbol }: SymbolRendererProps): JSX.Element {
  switch (symbol) {
    case 'SQUARE_AND_COMPASSES':
      return <SquareAndCompasses />;
    case 'ALL_SEEING_EYE':
      return <AllSeeingEye />;
    case 'SKULL_AND_BONES':
      return <SkullAndBones />;
    case 'TWO_PILLARS':
      return <TwoPillars />;
    case 'GAVEL':
      return <Gavel />;
    default:
      console.warn(`Unknown symbol: ${symbol}`);
      return <UnknownSymbol />;
  }
}