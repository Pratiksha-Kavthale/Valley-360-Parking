import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const ParkingAnimation = () => {
  const container = useRef();
  const carRef = useRef();

  useGSAP(() => {
    // We create a timeline that repeats forever
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

    // 1. Initial State: Car is off-screen to the right
    tl.set(carRef.current, { 
      x: 450, 
      y: 120, 
      rotation: -90, 
      opacity: 0 
    })
    // 2. Fade in and drive into the center lane
    .to(carRef.current, { 
      opacity: 1, 
      x: 180, 
      duration: 1.5, 
      ease: "power2.out" 
    })
    // 3. The "Swerve": Rotate to face the parking spot
    .to(carRef.current, { 
      rotation: 0, 
      x: 180, 
      y: 100, 
      duration: 0.8, 
      ease: "sine.inOut" 
    })
    // 4. The "Park": Reverse smoothly into the empty slot
    .to(carRef.current, { 
      y: 190, 
      duration: 1, 
      ease: "back.out(1.2)" // Gives it that slight 'bounce' when stopping
    })
    // 5. Stay parked for 2 seconds before restarting
    .to(carRef.current, { 
      opacity: 0, 
      duration: 0.5, 
      delay: 2 
    });

  }, { scope: container });

  return (
    <div ref={container} className="relative w-full max-w-[500px] aspect-square bg-[#f8fafc] rounded-full border-8 border-white shadow-2xl overflow-hidden">
      
      {/* THE PARKING LOT SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" fill="none">
        {/* Asphalt Road */}
        <rect width="400" height="400" fill="#e2e8f0" />
        
        {/* Lane Markings */}
        <line x1="0" y1="150" x2="400" y2="150" stroke="white" strokeWidth="4" strokeDasharray="10,10" />

        {/* Parking Slots (Bottom Row) */}
        <g stroke="#cbd5e1" strokeWidth="3">
          <rect x="50" y="180" width="70" height="110" rx="4" fill="#f1f5f9" /> {/* Slot 1 */}
          <rect x="130" y="180" width="70" height="110" rx="4" fill="#f1f5f9" /> {/* Target Slot (Slot 2) */}
          <rect x="210" y="180" width="70" height="110" rx="4" fill="#f1f5f9" /> {/* Slot 3 */}
          <rect x="290" y="180" width="70" height="110" rx="4" fill="#f1f5f9" /> {/* Slot 4 */}
        </g>

        {/* Static Parked Cars (Decorations) */}
        <rect x="60" y="195" width="50" height="85" rx="6" fill="#f87171" /> {/* Red Car */}
        <rect x="220" y="195" width="50" height="85" rx="6" fill="#60a5fa" /> {/* Blue Car */}
        <rect x="300" y="195" width="50" height="85" rx="6" fill="#fbbf24" /> {/* Yellow Car */}
      </svg>

      {/* THE ANIMATED WHITE CAR */}
      <div 
        ref={carRef}
        className="absolute w-[50px] h-[85px] bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col items-center p-1"
        style={{ transformOrigin: 'center center' }}
      >
        {/* Car Windshield */}
        <div className="w-full h-4 bg-slate-800 rounded-sm mt-1" />
        {/* Car Roof */}
        <div className="w-4/5 h-8 bg-slate-100 rounded-sm mt-1" />
        {/* Headlights */}
        <div className="flex justify-between w-full mt-auto mb-1">
          <div className="w-2 h-1 bg-yellow-200 rounded-full" />
          <div className="w-2 h-1 bg-yellow-200 rounded-full" />
        </div>
      </div>

      {/* Real-time Tag */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md">
        <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          SLOT #2 OCCUPIED
        </span>
      </div>
    </div>
  );
};

export default ParkingAnimation;