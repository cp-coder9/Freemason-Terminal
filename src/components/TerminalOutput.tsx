import React, { useEffect, useRef } from 'react';
import { TypeAnimation } from 'react-type-animation';
import type { Message } from '../../worker/types';
interface TerminalOutputProps {
  messages: Message[];
  streamingMessage: string;
  isLoading: boolean;
}
const PUZZLE_REGEX = /\[PUZZLE:([^|]+)\|([^\]]+)\]/;
const IMAGE_REGEX = /\[IMAGE:([^|]+)\|([^\]]+)\]/;
const COMBINED_REGEX = /(\[PUZZLE:[^\]]+\]|\[IMAGE:[^\]]+\])/g;
const renderMessageContent = (content: string, isStreaming: boolean = false) => {
  const parts = content.split(COMBINED_REGEX).filter(part => part);
  const elements = parts.map((part, index) => {
    const puzzleMatch = part.match(PUZZLE_REGEX);
    if (puzzleMatch) {
      const prompt = puzzleMatch[1];
      return (
        <div key={`${part}-${index}`} className="my-4 p-4 border border-retro-amber/50 bg-black/30 text-retro-amber animate-pulse-once">
          <p className="font-bold tracking-widest text-center mb-2">[PUZZLE DETECTED]</p>
          <p className="whitespace-pre-wrap text-center">{prompt}</p>
        </div>
      );
    }
    const imageMatch = part.match(IMAGE_REGEX);
    if (imageMatch) {
      const url = imageMatch[1];
      const caption = imageMatch[2];
      return (
        <div key={`${part}-${index}`} className="my-4 p-2 border border-retro-green/20 bg-black/30">
          <div className="relative w-full max-w-sm mx-auto group">
            <img src={url} alt={caption} className="w-full h-auto object-cover" />
            <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.2)_0px,rgba(0,0,0,0.2)_1px,transparent_1px,transparent_2px)]"></div>
          </div>
          <p className="text-center text-xs text-retro-green/70 mt-2 italic">{caption}</p>
        </div>
      );
    }
    if (isStreaming && index === parts.length - 1) {
      return (
        <TypeAnimation
          key={`${part}-${index}`}
          sequence={[part]}
          wrapper="span"
          speed={90}
          cursor={false}
          style={{ whiteSpace: 'pre-wrap', display: 'inline' }}
          repeat={0}
        />
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
  return <>{elements}</>;
};
export function TerminalOutput({ messages, streamingMessage, isLoading }: TerminalOutputProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);
  return (
    <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.role === 'user' ? (
            <div className="flex items-start">
              <span className="text-retro-green mr-2 shrink-0">&gt;</span>
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words text-retro-green">
              {renderMessageContent(msg.content)}
            </div>
          )}
        </div>
      ))}
      {streamingMessage && (
        <div className="whitespace-pre-wrap break-words text-retro-green">
          {renderMessageContent(streamingMessage, true)}
          <span className="animate-[pulse_1s_step-end_infinite]">█</span>
        </div>
      )}
      {isLoading && !streamingMessage && messages.length > 0 && (
         <div className="flex items-center space-x-2">
            <div className="w-2 h-4 bg-retro-green animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-4 bg-retro-green animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-4 bg-retro-green animate-pulse" style={{ animationDelay: '0.4s' }}></div>
         </div>
      )}
    </div>
  );
}