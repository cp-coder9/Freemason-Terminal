import React from 'react';
import { TypeAnimation } from 'react-type-animation';
interface BootSequenceProps {
  onComplete: () => void;
}
export function BootSequence({ onComplete }: BootSequenceProps): JSX.Element {
  const bootMessages = [
    'INITIALIZING CONNECTION...',
    500,
    'SYNCING WITH GRAND LODGE ARCHIVES...',
    500,
    'AUTHENTICATING CREDENTIALS... [OK]',
    300,
    'LOADING MASONIC CIPHERS... [OK]',
    300,
    'ESTABLISHING SECURE CHANNEL... [OK]',
    800,
    'Welcome, Brother. The Archive is open.',
    1000,
  ];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-3xl font-mono text-retro-green">
        <TypeAnimation
          sequence={[...bootMessages, onComplete]}
          wrapper="span"
          speed={80}
          cursor={true}
          repeat={0}
          style={{ whiteSpace: 'pre-wrap', display: 'block' }}
        />
      </div>
    </div>
  );
}