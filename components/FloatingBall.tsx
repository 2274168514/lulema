'use client';

import React, { useState, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function FloatingBall() {
  const router = useRouter();
  const controls = useAnimation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initial position: Bottom right
    const initialX = window.innerWidth - 70;
    const initialY = window.innerHeight * 0.7;
    controls.set({ x: initialX, y: initialY });
  }, [controls]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setTimeout(() => setIsDragging(false), 10);
    
    const screenWidth = window.innerWidth;
    const pointerX = info.point.x;
    const pointerY = info.point.y;
    
    // Snap logic
    let targetX = 16; // Left margin
    if (pointerX > screenWidth / 2) {
      targetX = screenWidth - 66; // Right margin (50px width + 16px margin)
    }

    // Keep Y within bounds roughly
    let targetY = pointerY - 25; // Adjust for center offset
    if (targetY < 50) targetY = 50;
    if (targetY > window.innerHeight - 100) targetY = window.innerHeight - 100;

    controls.start({ 
      x: targetX, 
      y: targetY,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    });
  };

  if (!mounted) return null;

  return (
    <>
      {/* Menu Overlay */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/80 dark:bg-black/80 backdrop-blur-xl p-4 rounded-3xl grid grid-cols-3 gap-4 shadow-2xl border border-white/20 w-64 h-64"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="flex flex-col items-center justify-center gap-2" onClick={() => { router.push('/'); setIsOpen(false); }}>
               <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">🏠</div>
               <span className="text-xs">Home</span>
             </div>
             <div className="flex flex-col items-center justify-center gap-2" onClick={() => { router.push('/wooden-fish'); setIsOpen(false); }}>
               <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">🐟</div>
               <span className="text-xs">Fish</span>
             </div>
             <div className="flex flex-col items-center justify-center gap-2">
               <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">⭐</div>
               <span className="text-xs">Favs</span>
             </div>
             {/* More placeholders */}
          </motion.div>
        </motion.div>
      )}

      {/* Floating Ball */}
      <motion.div
        drag
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (!isDragging) setIsOpen(true);
        }}
        className="fixed top-0 left-0 z-50 w-[50px] h-[50px] rounded-[14px] bg-black/60 backdrop-blur-md border border-white/30 shadow-lg flex items-center justify-center cursor-pointer"
        style={{ touchAction: 'none' }}
      >
        <div className="w-[36px] h-[36px] rounded-full border-[3px] border-white/80 opacity-90" />
        <div className="w-[24px] h-[24px] rounded-full bg-white/90 absolute opacity-80" />
      </motion.div>
    </>
  );
}
