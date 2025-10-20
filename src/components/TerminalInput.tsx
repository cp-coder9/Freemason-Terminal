import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
interface TerminalInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isLoading: boolean;
}
export function TerminalInput({ input, setInput, handleSendMessage, isLoading }: TerminalInputProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleClick = () => {
      inputRef.current?.focus();
    };
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e as unknown as React.FormEvent);
    }
  };
  return (
    <form onSubmit={handleSendMessage} className="w-full">
      <div className="flex items-center">
        <span className="text-retro-green mr-2 shrink-0">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none text-retro-green w-full focus:outline-none focus:ring-0"
          autoFocus
          disabled={isLoading}
        />
        <span
          className={cn(
            'w-2 h-5 bg-retro-green ml-1',
            !isLoading && 'animate-[pulse_1s_step-end_infinite]'
          )}
        />
      </div>
    </form>
  );
}