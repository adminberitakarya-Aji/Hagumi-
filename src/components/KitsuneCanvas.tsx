import React, { useEffect, useRef } from 'react';
import { PetData, IdleThought } from '../types/game';
import { ELEMENTS_CONFIG } from '../data/gameConfig';
import { pickIdleThought } from '../utils/idleThoughts';
import { drawThoughtBubble } from '../canvas/drawThoughtBubble';
import { drawHojuJewel } from '../canvas/drawHojuJewel';
import { drawKitsunebi } from '../canvas/drawKitsunebi';
import { drawFox } from '../canvas/drawFox';
import { drawPoops } from '../canvas/drawPoops';
import { drawStatusFX } from '../canvas/drawStatusFX';

interface KitsuneCanvasProps {
  pet: PetData;
  actionState?: 'idle' | 'eating' | 'bathing' | 'sleeping' | 'happy' | 'sick';
  onPetClick?: () => void;
  eggCrackCount?: number;
  onThoughtClick?: (thoughtType: string, thoughtText: string) => void;
}

export const KitsuneCanvas: React.FC<KitsuneCanvasProps> = ({
  pet,
  actionState = 'idle',
  onPetClick,
  eggCrackCount = 0,
  onThoughtClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Persistent Roaming, Animation Physics & Idle Thoughts
  const posRef = useRef({
    x: 180,
    y: 175,
    targetX: 180,
    targetY: 175,
    facing: 1, // 1 = right, -1 = left
    isWalking: false,
    idleTimer: 120,
    hopTimer: 0,
    thoughtTimer: 180, // initial countdown to first thought
    thoughtDuration: 0, // duration of visible thought
    currentThought: null as null | IdleThought,
    thoughtAlpha: 0,
    thoughtBox: null as null | { x: number; y: number; w: number; h: number },
  });

  // Live refs untuk data yang dibutuhkan animation loop.
  // Disimpan di ref agar RAF loop utama (mount-once) tidak perlu teardown/rebuild
  // setiap kali decay loop di useGameLoop (tiap 10 detik) mengganti objek `pet` —
  // variabel `tick` animasi pun tidak pernah ter-reset (fix glitch fase animasi).
  const petRef = useRef(pet);
  const actionStateRef = useRef(actionState);
  const eggCrackCountRef = useRef(eggCrackCount);

  // Sync refs tanpa memicu re-run effect animasi (hanya assignment murah).
  useEffect(() => {
    petRef.current = pet;
    actionStateRef.current = actionState;
    eggCrackCountRef.current = eggCrackCount;
  }, [pet, actionState, eggCrackCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Snapshot nilai terkini dari refs (bukan closure prop) agar loop
      // mount-once tetap bereaksi terhadap perubahan pet/state tiap frame.
      const pet = petRef.current;
      const actionState = actionStateRef.current;
      const eggCrackCount = eggCrackCountRef.current;
      const elementInfo = ELEMENTS_CONFIG[pet.element] || ELEMENTS_CONFIG.fire;

      const p = posRef.current;

      // --- AUTONOMOUS ROAMING & BEHAVIOR AI ---
      if (pet.stage !== 'egg') {
        if (p.hopTimer > 0) {
          p.hopTimer--;
        }

        if (pet.isSleeping || actionState === 'sleeping') {
          // Move towards cozy sleeping corner on tatami
          p.targetX = 230;
          p.targetY = 185;
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 2) {
            p.x += (dx / dist) * 0.7;
            p.y += (dy / dist) * 0.7;
            p.isWalking = true;
            p.facing = dx >= 0 ? 1 : -1;
          } else {
            p.isWalking = false;
            p.facing = 1;
          }
        } else if (actionState === 'eating') {
          // Stay put and eat happily
          p.isWalking = false;
          p.facing = 1;
        } else if (actionState === 'bathing') {
          // Bathing tub stays in center
          p.targetX = 180;
          p.targetY = 175;
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 3) {
            p.x += (dx / dist) * 1.2;
            p.y += (dy / dist) * 1.2;
            p.isWalking = true;
            p.facing = dx >= 0 ? 1 : -1;
          } else {
            p.isWalking = false;
          }
        } else {
          // Normal Roaming State Machine
          if (p.isWalking) {
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const dist = Math.hypot(dx, dy);
            const speed = pet.isSick ? 0.45 : 0.9;

            if (dist > 3) {
              p.x += (dx / dist) * speed;
              p.y += (dy / dist) * speed;
              p.facing = dx >= 0 ? 1 : -1;
            } else {
              // Reached tatami target point
              p.x = p.targetX;
              p.y = p.targetY;
              p.isWalking = false;
              p.idleTimer = Math.floor(180 + Math.random() * 240); // 3-7 seconds idle pause
            }
          } else {
            // Idle countdown
            p.idleTimer--;
            if (p.idleTimer <= 0) {
              // Select new destination within safe tatami bounds
              const newTargetX = 85 + Math.random() * 190; // 85 to 275
              const newTargetY = 165 + Math.random() * 40;  // 165 to 205
              p.targetX = newTargetX;
              p.targetY = newTargetY;
              p.isWalking = true;
            }
          }
        }
      }

      const curX = pet.stage === 'egg' ? canvas.width / 2 : p.x;
      const curY = pet.stage === 'egg' ? canvas.height / 2 + 20 : p.y;
      const facing = pet.stage === 'egg' ? 1 : p.facing;
      const isWalking = pet.stage === 'egg' ? false : p.isWalking;
      const hopOffset = p.hopTimer > 0 ? Math.sin((p.hopTimer / 18) * Math.PI) * 12 : 0;

      // Soft ground shadow follows the pet across tatami mats
      ctx.save();
      ctx.beginPath();
      const shadowScale = p.hopTimer > 0 ? 1 - (hopOffset / 12) * 0.25 : 1;
      ctx.ellipse(curX, curY + 65, 52 * shadowScale, 13 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(24, 18, 14, 0.32)';
      ctx.fill();
      ctx.restore();

      // Draw depending on Stage with facing direction & walk animation
      ctx.save();
      ctx.translate(curX, curY - hopOffset);
      ctx.scale(facing, 1);

      if (pet.stage === 'egg') {
        drawHojuJewel(ctx, 0, 0, elementInfo, eggCrackCount, tick);
      } else if (pet.stage === 'bayi') {
        drawKitsunebi(ctx, 0, 0, elementInfo, actionState, pet, tick, isWalking);
      } else {
        drawFox(ctx, 0, 0, elementInfo, actionState, pet, tick, isWalking);
      }
      ctx.restore();

      // Draw Poops if present (in corners of tatami)
      if (pet.poopCount > 0 && pet.stage !== 'egg') {
        drawPoops(ctx, pet.poopCount, tick);
      }

      // Draw Floating Status Badges (unscaled so letters and emojis are never mirrored)
      drawStatusFX(ctx, curX, curY - hopOffset, actionState, pet, tick);

      // ─── IDLE THOUGHT BUBBLE SYSTEM ───────────────────────────────────
      // Only show thoughts when Kitsune is awake, idle on tatami, not an egg
      if (
        pet.stage !== 'egg' &&
        !pet.isSleeping &&
        actionState === 'idle' &&
        !p.isWalking
      ) {
        // Phase 1: Count down before showing next thought
        if (p.thoughtDuration <= 0) {
          p.thoughtTimer--;
          if (p.thoughtTimer <= 0) {
            // Pick a new thought and reset timers
            p.currentThought = pickIdleThought(pet);
            p.thoughtDuration = 210; // 3.5 seconds at 60fps
            p.thoughtAlpha = 0;
            p.thoughtTimer = 0;
          }
        }

        // Phase 2: Show thought – fade in, hold, fade out
        if (p.currentThought && p.thoughtDuration > 0) {
          p.thoughtDuration--;

          // Fade-in first 18 frames
          if (p.thoughtAlpha < 1 && p.thoughtDuration > 30) {
            p.thoughtAlpha = Math.min(1, p.thoughtAlpha + 0.06);
          }
          // Fade-out last 30 frames
          if (p.thoughtDuration <= 30) {
            p.thoughtAlpha = Math.max(0, p.thoughtAlpha - (1 / 30));
          }

          if (p.thoughtAlpha > 0) {
            const bubbleX = curX;
            const bubbleY = curY - hopOffset - 90; // Above the Kitsune's head
            p.thoughtBox = drawThoughtBubble(
              ctx,
              bubbleX,
              bubbleY,
              p.currentThought,
              p.thoughtAlpha,
              tick
            );
          } else if (p.thoughtDuration <= 0) {
            // After fade-out, clear thought and start next countdown
            p.currentThought = null;
            p.thoughtBox = null;
            p.thoughtTimer = Math.floor(300 + Math.random() * 360); // 5-11 sec pause
          }
        }
      } else {
        // Reset thought when walking or state changes
        if (p.isWalking && p.currentThought) {
          p.currentThought = null;
          p.thoughtDuration = 0;
          p.thoughtAlpha = 0;
          p.thoughtBox = null;
          p.thoughtTimer = Math.floor(180 + Math.random() * 180);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
    // Mount-once: loop membaca data terkini dari refs di setiap frame,
    // sehingga tidak perlu teardown/rebuild saat decay loop mengganti `pet`.
  }, []);

  // Handle click on canvas: check thought bubble first, then pet movement
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const p = posRef.current;

    // ── Check if thought bubble was tapped ──
    if (p.thoughtBox && p.currentThought && p.thoughtAlpha > 0.3) {
      const tb = p.thoughtBox;
      if (
        clickX >= tb.x && clickX <= tb.x + tb.w &&
        clickY >= tb.y && clickY <= tb.y + tb.h
      ) {
        // Dismiss the bubble with a pop
        const thought = p.currentThought;
        p.currentThought = null;
        p.thoughtDuration = 0;
        p.thoughtAlpha = 0;
        p.thoughtBox = null;
        p.thoughtTimer = Math.floor(240 + Math.random() * 240);
        p.hopTimer = 10; // Little happy hop
        onThoughtClick?.(thought.trigger, thought.text);
        return; // Don't move pet when tapping bubble
      }
    }

    // ── Normal click: pet walks to tapped position ──
    if (pet.stage !== 'egg' && !pet.isSleeping && actionState !== 'sleeping') {
      p.targetX = Math.max(75, Math.min(285, clickX));
      p.targetY = Math.max(160, Math.min(205, clickY));
      p.isWalking = true;
      p.facing = clickX >= p.x ? 1 : -1;
      p.idleTimer = 180;
      p.hopTimer = 18; // Excited hop!
    }
    onPetClick?.();
  };

  return (
    <div className="relative flex items-center justify-center cursor-pointer select-none max-h-full">
      <canvas
        ref={canvasRef}
        width={360}
        height={320}
        onClick={handleCanvasClick}
        className="max-h-[36dvh] sm:max-h-[44dvh] w-auto max-w-[320px] sm:max-w-[380px] aspect-[360/320] object-contain transition-transform active:scale-95 cursor-pointer"
        style={{ imageRendering: 'auto' }}
        title="Klik tatami untuk memanggil atau mengelus Kitsune-mu!"
      />
    </div>
  );
};

// --- DRAW FUNCTIONS ---

// ─── IDLE THOUGHT BUBBLE SYSTEM ──────────────────────────────────────────────

/**
 * Picks a contextual IdleThought based on current pet stats and state.
 * Priority: urgent needs first → then happiness → then boredom → random.
 */
