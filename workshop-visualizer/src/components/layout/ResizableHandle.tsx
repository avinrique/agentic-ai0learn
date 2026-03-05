'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ResizableHandleProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
}

export default function ResizableHandle({ direction, onResize }: ResizableHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    lastPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
  }, [direction]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - lastPos.current;
      lastPos.current = currentPos;
      onResize(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, direction, onResize]);

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`
        ${isHorizontal ? 'w-1.5 cursor-col-resize hover:w-2' : 'h-1.5 cursor-row-resize hover:h-2'}
        flex-shrink-0 relative group transition-all
        ${isDragging ? (isHorizontal ? 'w-2' : 'h-2') : ''}
      `}
    >
      <div
        className={`
          absolute inset-0
          ${isHorizontal ? 'w-px mx-auto' : 'h-px my-auto'}
          bg-white/10 group-hover:bg-accent-blue/50 transition-colors
          ${isDragging ? 'bg-accent-blue/70' : ''}
        `}
      />
      {/* Grip dots */}
      <div className={`absolute inset-0 flex items-center justify-center ${isHorizontal ? 'flex-col gap-1' : 'flex-row gap-1'}`}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`w-1 h-1 rounded-full bg-white/0 group-hover:bg-white/30 transition-colors ${isDragging ? 'bg-white/40' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
