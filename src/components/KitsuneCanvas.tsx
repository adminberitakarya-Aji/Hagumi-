import React, { useEffect, useRef } from 'react';
import { PetData, IdleThought } from '../types/game';
import { ELEMENTS_CONFIG } from '../data/gameConfig';

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    const elementInfo = ELEMENTS_CONFIG[pet.element] || ELEMENTS_CONFIG.fire;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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
  }, [pet, actionState, eggCrackCount]);

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
function pickIdleThought(pet: PetData): IdleThought {
  const { hunger, energy, cleanliness, happiness } = pet.stats;

  // Tier 1 — Urgent needs
  if (pet.isSick) {
    const sickThoughts: IdleThought[] = [
      { trigger: 'sick', emoji: '🤒', text: 'Badan nggak enak...', japaneseFlair: '気持ち悪い', actionHint: 'shop', bubbleColor: 'rgba(254,226,226,0.97)', accentColor: '#ef4444' },
      { trigger: 'sick', emoji: '💊', text: 'Mau minum obat...', japaneseFlair: '薬が欲しい', actionHint: 'shop', bubbleColor: 'rgba(254,226,226,0.97)', accentColor: '#ef4444' },
    ];
    return sickThoughts[Math.floor(Math.random() * sickThoughts.length)];
  }

  if (hunger <= 20) {
    const hungerThoughts: IdleThought[] = [
      { trigger: 'hunger', emoji: '🍱', text: 'Lapar... mau Bento!', japaneseFlair: 'お腹すいたよ', actionHint: 'bento', bubbleColor: 'rgba(255,237,213,0.97)', accentColor: '#f97316' },
      { trigger: 'hunger', emoji: '🫐', text: 'Pengen Aburaage~', japaneseFlair: '揚げ豆腐食べたい', actionHint: 'bento', bubbleColor: 'rgba(255,237,213,0.97)', accentColor: '#f97316' },
      { trigger: 'hunger', emoji: '🍡', text: 'Kangen Mitarashi Dango...', japaneseFlair: 'みたらし団子が恋しい', actionHint: 'bento', bubbleColor: 'rgba(255,237,213,0.97)', accentColor: '#f97316' },
    ];
    return hungerThoughts[Math.floor(Math.random() * hungerThoughts.length)];
  }

  if (energy <= 20) {
    const sleepThoughts: IdleThought[] = [
      { trigger: 'energy', emoji: '😴', text: 'Ngantuk banget...', japaneseFlair: 'ねむ〜い', actionHint: 'sleep', bubbleColor: 'rgba(224,231,255,0.97)', accentColor: '#6366f1' },
      { trigger: 'energy', emoji: '🛏️', text: 'Pengen Futon hangat~', japaneseFlair: '布団に入りたいな', actionHint: 'sleep', bubbleColor: 'rgba(224,231,255,0.97)', accentColor: '#6366f1' },
      { trigger: 'energy', emoji: '💤', text: 'Mau istirahat sebentar...', japaneseFlair: 'すこし休みたい', actionHint: 'sleep', bubbleColor: 'rgba(224,231,255,0.97)', accentColor: '#6366f1' },
    ];
    return sleepThoughts[Math.floor(Math.random() * sleepThoughts.length)];
  }

  if (cleanliness <= 25) {
    const bathThoughts: IdleThought[] = [
      { trigger: 'dirty', emoji: '🛁', text: 'Mau mandi Onsen!', japaneseFlair: '温泉に入りたい', actionHint: 'bath', bubbleColor: 'rgba(204,251,241,0.97)', accentColor: '#14b8a6' },
      { trigger: 'dirty', emoji: '🧼', text: 'Badan agak bau...', japaneseFlair: 'ちょっとくさいかも', actionHint: 'bath', bubbleColor: 'rgba(204,251,241,0.97)', accentColor: '#14b8a6' },
    ];
    return bathThoughts[Math.floor(Math.random() * bathThoughts.length)];
  }

  // Tier 2 — Happy / good state
  if (happiness >= 80) {
    const happyThoughts: IdleThought[] = [
      { trigger: 'happy', emoji: '✨', text: 'Senang sekali hari ini~!', japaneseFlair: '今日は幸せだよ', bubbleColor: 'rgba(254,249,195,0.97)', accentColor: '#eab308' },
      { trigger: 'happy', emoji: '🦊', text: 'Kitsune yang bahagia!', japaneseFlair: '幸せな狐', bubbleColor: 'rgba(254,249,195,0.97)', accentColor: '#eab308' },
      { trigger: 'happy', emoji: '🌸', text: 'Aroma sakura...', japaneseFlair: '桜の香りがする', bubbleColor: 'rgba(254,228,228,0.97)', accentColor: '#ec4899' },
      { trigger: 'happy', emoji: '🎋', text: 'Semuanya sempurna~', japaneseFlair: '全てが完璧だ', bubbleColor: 'rgba(220,252,231,0.97)', accentColor: '#22c55e' },
    ];
    return happyThoughts[Math.floor(Math.random() * happyThoughts.length)];
  }

  // Tier 3 — Bored / want to play
  if (happiness <= 50) {
    const boredThoughts: IdleThought[] = [
      { trigger: 'bored', emoji: '🎮', text: 'Mau main Matsuri!', japaneseFlair: 'お祭りがしたいな', actionHint: 'matsuri', bubbleColor: 'rgba(243,232,255,0.97)', accentColor: '#a855f7' },
      { trigger: 'bored', emoji: '🎯', text: 'Bosen... main yuk?', japaneseFlair: '暇だなぁ', actionHint: 'matsuri', bubbleColor: 'rgba(243,232,255,0.97)', accentColor: '#a855f7' },
      { trigger: 'bored', emoji: '🌟', text: 'Pengen ke Kuil Inari!', japaneseFlair: '稲荷神社に行きたい', actionHint: 'shrine', bubbleColor: 'rgba(254,252,232,0.97)', accentColor: '#ca8a04' },
    ];
    return boredThoughts[Math.floor(Math.random() * boredThoughts.length)];
  }

  // Tier 4 — Random zen thoughts
  const randomThoughts: IdleThought[] = [
    { trigger: 'random', emoji: '🍵', text: 'Teh matcha terasa manis...', japaneseFlair: '抹茶がおいしい', bubbleColor: 'rgba(220,252,231,0.97)', accentColor: '#16a34a' },
    { trigger: 'random', emoji: '🌙', text: 'Bulan malam ini indah...', japaneseFlair: '今夜の月が美しい', bubbleColor: 'rgba(224,231,255,0.97)', accentColor: '#818cf8' },
    { trigger: 'random', emoji: '🎐', text: 'Angin sepoi lewat~', japaneseFlair: 'そよ風が吹いてきた', bubbleColor: 'rgba(224,242,254,0.97)', accentColor: '#0ea5e9' },
    { trigger: 'random', emoji: '🦋', text: 'Kupu-kupu yang cantik!', japaneseFlair: '綺麗な蝶だな', bubbleColor: 'rgba(253,244,255,0.97)', accentColor: '#d946ef' },
    { trigger: 'random', emoji: '🌿', text: 'Mencium aroma hutan~', japaneseFlair: '森の香りがする', bubbleColor: 'rgba(220,252,231,0.97)', accentColor: '#22c55e' },
    { trigger: 'random', emoji: '⛩️', text: 'Inari-sama melindungi...', japaneseFlair: '稲荷様のご加護', bubbleColor: 'rgba(255,247,237,0.97)', accentColor: '#f97316' },
    { trigger: 'random', emoji: '🎵', text: 'Koto terdengar dari jauh~', japaneseFlair: '琴の音が聞こえる', bubbleColor: 'rgba(253,244,255,0.97)', accentColor: '#a855f7' },
    { trigger: 'random', emoji: '❄️', text: 'Sepertinya akan turun salju...', japaneseFlair: '雪が降りそうだな', bubbleColor: 'rgba(240,249,255,0.97)', accentColor: '#38bdf8' },
  ];
  return randomThoughts[Math.floor(Math.random() * randomThoughts.length)];
}

/**
 * Draws an anime-style speech/thought bubble above the Kitsune.
 * Returns the bounding box {x, y, w, h} for click detection.
 */
function drawThoughtBubble(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  thought: IdleThought,
  alpha: number,
  tick: number
): { x: number; y: number; w: number; h: number } {
  ctx.save();
  ctx.globalAlpha = alpha;

  // Gentle floating bob animation
  const bob = Math.sin(tick * 0.04) * 2.5;
  const drawY = cy + bob;

  // --- Measure text to determine bubble size ---
  const mainFont = 'bold 13px "Segoe UI", "Hiragino Kaku Gothic ProN", sans-serif';
  const flairFont = '10px "Segoe UI", "Hiragino Kaku Gothic ProN", sans-serif';
  ctx.font = mainFont;
  const mainW = ctx.measureText(thought.emoji + ' ' + thought.text).width;
  ctx.font = flairFont;
  const flairW = ctx.measureText(thought.japaneseFlair).width;

  const contentW = Math.max(mainW, flairW) + 28;
  const contentH = 50;
  const bx = Math.max(10, Math.min(cx - contentW / 2, 350 - contentW)); // keep on canvas
  const by = drawY - contentH;

  // --- Bubble body (rounded rect) ---
  const r = 12;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.lineTo(bx + contentW - r, by);
  ctx.arcTo(bx + contentW, by, bx + contentW, by + r, r);
  ctx.lineTo(bx + contentW, by + contentH - r);
  ctx.arcTo(bx + contentW, by + contentH, bx + contentW - r, by + contentH, r);
  ctx.lineTo(bx + r, by + contentH);
  ctx.arcTo(bx, by + contentH, bx, by + contentH - r, r);
  ctx.lineTo(bx, by + r);
  ctx.arcTo(bx, by, bx + r, by, r);
  ctx.closePath();

  ctx.fillStyle = thought.bubbleColor;
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = thought.accentColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // --- Cute bubble tail (pointing down toward Kitsune) ---
  const tailX = cx; // Center of bubble tail near pet position
  const clampedTailX = Math.max(bx + 20, Math.min(tailX, bx + contentW - 20));
  ctx.beginPath();
  ctx.moveTo(clampedTailX - 7, by + contentH - 1);
  ctx.lineTo(clampedTailX, by + contentH + 14); // Tail tip
  ctx.lineTo(clampedTailX + 7, by + contentH - 1);
  ctx.fillStyle = thought.bubbleColor;
  ctx.fill();
  ctx.strokeStyle = thought.accentColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cover the jagged joint between tail and bubble body
  ctx.beginPath();
  ctx.rect(clampedTailX - 6, by + contentH - 3, 13, 5);
  ctx.fillStyle = thought.bubbleColor;
  ctx.fill();

  // --- Emoji ---
  ctx.font = '16px "Segoe UI Emoji", "Apple Color Emoji", serif';
  ctx.fillText(thought.emoji, bx + 10, by + 22);

  // --- Main text ---
  ctx.font = mainFont;
  ctx.fillStyle = '#1c1917';
  ctx.fillText(thought.text, bx + 30, by + 23);

  // --- Japanese flair (smaller, muted) ---
  ctx.font = flairFont;
  ctx.fillStyle = '#78716c';
  ctx.fillText(thought.japaneseFlair, bx + 30, by + 39);

  // --- Tap hint glow if actionHint exists (subtle pulsing rim) ---
  if (thought.actionHint) {
    const pulse = 0.3 + Math.abs(Math.sin(tick * 0.07)) * 0.4;
    ctx.strokeStyle = thought.accentColor;
    ctx.globalAlpha = alpha * pulse;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + contentW - r, by);
    ctx.arcTo(bx + contentW, by, bx + contentW, by + r, r);
    ctx.lineTo(bx + contentW, by + contentH - r);
    ctx.arcTo(bx + contentW, by + contentH, bx + contentW - r, by + contentH, r);
    ctx.lineTo(bx + r, by + contentH);
    ctx.arcTo(bx, by + contentH, bx, by + contentH - r, r);
    ctx.lineTo(bx, by + r);
    ctx.arcTo(bx, by, bx + r, by, r);
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
  return { x: bx, y: by, w: contentW, h: contentH + 14 };
}


// Sacred Inari Hōju Jewel (宝珠) - Cintamani Wish-Fulfilling Sacred Gemstone
function drawHojuJewel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  element: any,
  cracks: number,
  tick: number
) {
  const tapCount = cracks;
  const wobble = tapCount > 0 ? Math.sin(tick * 0.4) * (tapCount * 2) : 0;
  const levitate = tapCount > 0 ? Math.sin(tick * 0.08) * (tapCount * 3.5) - (tapCount * 4) : 0;
  const pulse = Math.sin(tick * 0.06) * 5;

  ctx.save();
  ctx.translate(cx + wobble, cy + levitate);

  // 1. Divine Aura Glow (Kaen Flame Halo)
  const auraRadius = 80 + pulse + tapCount * 12;
  const glow = ctx.createRadialGradient(0, 0, 15, 0, 0, auraRadius);
  glow.addColorStop(0, element.auraColor || 'rgba(234, 88, 12, 0.45)');
  glow.addColorStop(0.7, 'rgba(254, 240, 138, 0.18)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
  ctx.fill();

  // 2. Sacred Wooden Sanbō Altar Stand (三方台座)
  ctx.save();
  ctx.translate(0, -levitate); // pedestal stays on ground
  // Altar tabletop
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-48, 56, 96, 12);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-44, 58, 88, 8);
  // Gold gilded corners
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-48, 56, 8, 12);
  ctx.fillRect(40, 56, 8, 12);
  // Altar column / foot
  ctx.fillStyle = '#292524';
  ctx.fillRect(-28, 68, 56, 10);
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(-36, 78, 72, 6);
  ctx.restore();

  // 3. Sacred Swirling Flames of the Hōju (火焔宝珠 - Kaen Tails)
  ctx.save();
  const flameWiggle = Math.sin(tick * 0.1) * 3;
  ctx.fillStyle = element.secondaryColor;
  ctx.globalAlpha = 0.55;
  // Left flame tongue
  ctx.beginPath();
  ctx.moveTo(-36, 20);
  ctx.bezierCurveTo(-55 + flameWiggle, 0, -50 - flameWiggle, -35, -20, -50);
  ctx.bezierCurveTo(-30, -30, -32, -10, -28, 20);
  ctx.fill();
  // Right flame tongue
  ctx.beginPath();
  ctx.moveTo(36, 20);
  ctx.bezierCurveTo(55 - flameWiggle, 0, 50 + flameWiggle, -35, 20, -50);
  ctx.bezierCurveTo(30, -30, 32, -10, 28, 20);
  ctx.fill();
  ctx.restore();

  // 4. Sacred Hōju Jewel (Teardrop / Flame-Tipped Gemstone Body)
  ctx.beginPath();
  ctx.moveTo(0, -54); // Tip of jewel
  ctx.bezierCurveTo(24, -30, 50, -5, 48, 24); // Right hip
  ctx.bezierCurveTo(46, 52, 24, 58, 0, 58); // Bottom base
  ctx.bezierCurveTo(-24, 58, -46, 52, -48, 24); // Left hip
  ctx.bezierCurveTo(-50, -5, -24, -30, 0, -54); // Back to tip
  ctx.closePath();

  // Rich Gemstone Gradient
  const gemGrad = ctx.createRadialGradient(-12, -15, 6, 0, 8, 54);
  gemGrad.addColorStop(0, '#ffffff'); // Glinting highlight
  gemGrad.addColorStop(0.2, element.secondaryColor);
  gemGrad.addColorStop(0.65, element.primaryColor);
  gemGrad.addColorStop(1, '#1c1917');
  ctx.fillStyle = gemGrad;
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();

  // 5. Crystalline Facet Reflections (Diamond / Jewel Cut)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.5;
  // Facet lines
  ctx.beginPath();
  ctx.moveTo(0, -54);
  ctx.lineTo(-24, 8);
  ctx.lineTo(0, 38);
  ctx.lineTo(24, 8);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-24, 8);
  ctx.lineTo(-44, 22);
  ctx.moveTo(24, 8);
  ctx.lineTo(44, 22);
  ctx.moveTo(0, 38);
  ctx.lineTo(0, 58);
  ctx.stroke();

  // Specular gleam highlight spot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.beginPath();
  ctx.ellipse(-14, -20, 10, 5, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Sacred Shimenawa Rope around base of Hōju
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, 36, 42, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Hanging White Paper Talismans (Shide - 紙垂)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1;
  [-20, 0, 20].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x - 5, 42);
    ctx.lineTo(x + 5, 42);
    ctx.lineTo(x, 56);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // 7. Glowing Inscribed Elemental Kanji in the Core
  ctx.save();
  ctx.shadowColor = element.secondaryColor;
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Shippori Mincho", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(element.kanji, 0, 10);
  ctx.restore();

  // 8. Awakening Energy & Spiritual Sparkles (on tap)
  if (tapCount > 0) {
    ctx.save();
    ctx.strokeStyle = element.secondaryColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = Math.max(0, 0.9 - tapCount * 0.15);
    ctx.beginPath();
    ctx.arc(0, 10, 58 + ((tick * 2) % 30), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Orbiting Elemental Crystals / Sparks
    const sparkCount = tapCount * 4;
    for (let i = 0; i < sparkCount; i++) {
      const angle = tick * 0.08 + (i * Math.PI * 2) / sparkCount;
      const dist = 56 + Math.sin(tick * 0.15 + i) * 16;
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * (dist * 0.65) + 5;

      ctx.save();
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : element.secondaryColor;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      const r = 3 + tapCount * 0.8;
      ctx.moveTo(sx, sy - r);
      ctx.lineTo(sx + r * 0.6, sy);
      ctx.lineTo(sx, sy + r);
      ctx.lineTo(sx - r * 0.6, sy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

// Stage 1: Kitsunebi (Spirit Fox Fireball)
function drawKitsunebi(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  element: any,
  action: string,
  pet: PetData,
  tick: number,
  isWalking: boolean = false
) {
  const floatSpeed = isWalking ? 0.18 : 0.08;
  const floatAmp = isWalking ? 12 : 8;
  const floatY = Math.sin(tick * floatSpeed) * floatAmp;
  const isSleeping = pet.isSleeping || action === 'sleeping';
  const isBathing = action === 'bathing';

  ctx.save();
  ctx.translate(cx, cy + floatY);

  // Outer spirit aura
  const aura = ctx.createRadialGradient(0, 0, 15, 0, 0, 65);
  aura.addColorStop(0, element.auraColor);
  aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, 65, 0, Math.PI * 2);
  ctx.fill();

  // Waving Fireball Tail behind
  const tailWave = Math.sin(tick * (isWalking ? 0.22 : 0.12)) * (isWalking ? 18 : 14);
  ctx.beginPath();
  ctx.moveTo(0, 15);
  ctx.quadraticCurveTo(35 + tailWave, -10, 20 + tailWave, -45);
  ctx.quadraticCurveTo(5, -20, 0, 15);
  ctx.fillStyle = element.primaryColor;
  ctx.fill();

  // Main Cute Orb Body
  ctx.beginPath();
  ctx.arc(0, 5, 36, 0, Math.PI * 2);
  const orbGrad = ctx.createRadialGradient(-10, -5, 5, 0, 5, 36);
  orbGrad.addColorStop(0, '#ffffff');
  orbGrad.addColorStop(0.4, element.secondaryColor);
  orbGrad.addColorStop(1, element.primaryColor);
  ctx.fillStyle = orbGrad;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3.5;
  ctx.fill();
  ctx.stroke();

  // Fox Ears on top of orb
  const earWiggle = action === 'happy' ? Math.sin(tick * 0.3) * 3 : 0;

  // Left Ear
  ctx.beginPath();
  ctx.moveTo(-28, -12);
  ctx.lineTo(-38 + earWiggle, -42);
  ctx.lineTo(-12, -26);
  ctx.closePath();
  ctx.fillStyle = element.primaryColor;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();

  // Left Ear Inner fluff
  ctx.beginPath();
  ctx.moveTo(-26, -16);
  ctx.lineTo(-33 + earWiggle, -36);
  ctx.lineTo(-16, -24);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Right Ear
  ctx.beginPath();
  ctx.moveTo(28, -12);
  ctx.lineTo(38 - earWiggle, -42);
  ctx.lineTo(12, -26);
  ctx.closePath();
  ctx.fillStyle = element.primaryColor;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();

  // Right Ear Inner fluff
  ctx.beginPath();
  ctx.moveTo(26, -16);
  ctx.lineTo(33 - earWiggle, -36);
  ctx.lineTo(16, -24);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Forehead Spirit Flame Mark
  ctx.fillStyle = element.primaryColor;
  ctx.beginPath();
  ctx.ellipse(0, -12, 4, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes & Expression
  const blink = tick % 140 > 132 && !isSleeping;

  if (isSleeping) {
    // Sleeping happy curves
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-14, 4, 6, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(14, 4, 6, Math.PI, 0);
    ctx.stroke();
  } else if (pet.isSick || action === 'sick') {
    // Swirly / sad eyes
    ctx.strokeStyle = '#4c1d95';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-14, 4, 5, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(14, 4, 5, 0, Math.PI * 1.5);
    ctx.stroke();
  } else if (blink) {
    // Blinking horizontal slits
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, 4);
    ctx.lineTo(-8, 4);
    ctx.moveTo(8, 4);
    ctx.lineTo(18, 4);
    ctx.stroke();
  } else {
    // Normal / cute big sparkling eyes
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(-13, 3, 5, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(13, 3, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye catch sparkles
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-15, 1, 2.5, 0, Math.PI * 2);
    ctx.arc(11, 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cheek Blushes
  ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-22, 12, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(22, 12, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cute Little Mouth
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2.5;
  if (action === 'eating') {
    // Eating open mouth
    const chomp = (tick % 20 > 10 ? 4 : 8);
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.ellipse(0, 14, 5, chomp, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (action === 'happy') {
    // Joyful cat smile :3
    ctx.beginPath();
    ctx.moveTo(-6, 12);
    ctx.quadraticCurveTo(-3, 16, 0, 13);
    ctx.quadraticCurveTo(3, 16, 6, 12);
    ctx.stroke();
  } else if (pet.stats.hunger < 30) {
    // Pouty mouth
    ctx.beginPath();
    ctx.arc(0, 16, 5, Math.PI, 0);
    ctx.stroke();
  } else {
    // Gentle smile
    ctx.beginPath();
    ctx.arc(0, 12, 4, 0, Math.PI);
    ctx.stroke();
  }

  // Draw Head & Neck Accessories for Spirit Baby (floating gracefully)
  drawHeadAccessory(ctx, pet, tick, earWiggle, true);
  drawNeckAccessory(ctx, pet, tick, isWalking, true);

  ctx.restore();
}

// Stage 2+: Fox (Anak, Remaja, Dewasa, Mistik)
function drawFox(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  element: any,
  action: string,
  pet: PetData,
  tick: number,
  isWalking: boolean = false
) {
  const isSleeping = pet.isSleeping || action === 'sleeping';
  const walkBob = isWalking ? Math.abs(Math.sin(tick * 0.3)) * 3.5 : 0;
  const breath = Math.sin(tick * 0.07) * (isSleeping ? 1.5 : 3.5);
  const tailWave = Math.sin(tick * (isWalking ? 0.2 : 0.08));

  ctx.save();
  ctx.translate(cx, cy + breath - walkBob);

  // Multi-tails behind body
  const tailCount = Math.max(1, Math.min(9, pet.tailCount || 2));
  drawTails(ctx, tailCount, element, tailWave, tick);

  // Body
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 26, 38, 34, 0, 0, Math.PI * 2);
  const bodyGrad = ctx.createRadialGradient(0, 15, 5, 0, 26, 40);
  bodyGrad.addColorStop(0, '#ffffff');
  bodyGrad.addColorStop(0.35, element.secondaryColor);
  bodyGrad.addColorStop(1, element.primaryColor);
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3.5;
  ctx.fill();
  ctx.stroke();

  // White Chest / Belly Bib Fur
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.quadraticCurveTo(16, 22, 10, 42);
  ctx.lineTo(-10, 42);
  ctx.quadraticCurveTo(-16, 22, 0, 6);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Front Paws (with animated reciprocal trotting step when roaming)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3;
  const leftPawOffset = isWalking ? Math.sin(tick * 0.3) * 5 : 0;
  const rightPawOffset = isWalking ? -Math.sin(tick * 0.3) * 5 : 0;

  // Left paw
  ctx.beginPath();
  ctx.ellipse(-18, 52 + leftPawOffset, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Right paw
  ctx.beginPath();
  ctx.ellipse(18, 52 + rightPawOffset, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Neck Accessories (Suzu Bell, Magatama Jade, Inari Scarf, Shimenawa rope, or classic bib)
  drawNeckAccessory(ctx, pet, tick, isWalking, false);

  // Head
  const headY = -18;
  ctx.save();
  ctx.translate(0, headY);

  // Large Fox Ears
  const earBounce = action === 'happy' ? Math.sin(tick * 0.25) * 4 : 0;

  // Left Ear
  ctx.beginPath();
  ctx.moveTo(-26, -10);
  ctx.lineTo(-44 + earBounce, -58);
  ctx.lineTo(-10, -28);
  ctx.closePath();
  ctx.fillStyle = element.primaryColor;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3.5;
  ctx.fill();
  ctx.stroke();

  // Left Ear Inner
  ctx.beginPath();
  ctx.moveTo(-23, -16);
  ctx.lineTo(-37 + earBounce, -50);
  ctx.lineTo(-14, -28);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Right Ear
  ctx.beginPath();
  ctx.moveTo(26, -10);
  ctx.lineTo(44 - earBounce, -58);
  ctx.lineTo(10, -28);
  ctx.closePath();
  ctx.fillStyle = element.primaryColor;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3.5;
  ctx.fill();
  ctx.stroke();

  // Right Ear Inner
  ctx.beginPath();
  ctx.moveTo(23, -16);
  ctx.lineTo(37 - earBounce, -50);
  ctx.lineTo(14, -28);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Main Head Shape (Cute Cheek Tuft)
  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.quadraticCurveTo(28, -30, 38, -6);
  ctx.quadraticCurveTo(46, 10, 32, 16); // right cheek tuft
  ctx.quadraticCurveTo(18, 24, 0, 24); // chin
  ctx.quadraticCurveTo(-18, 24, -32, 16); // left cheek tuft
  ctx.quadraticCurveTo(-46, 10, -38, -6);
  ctx.quadraticCurveTo(-28, -30, 0, -32);
  ctx.closePath();
  const headGrad = ctx.createRadialGradient(0, -5, 5, 0, 0, 42);
  headGrad.addColorStop(0, '#ffffff');
  headGrad.addColorStop(0.4, element.secondaryColor);
  headGrad.addColorStop(1, element.primaryColor);
  ctx.fillStyle = headGrad;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3.5;
  ctx.fill();
  ctx.stroke();

  // Cheek Fluff White Patches
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-26, 10, 12, 9, -0.2, 0, Math.PI * 2);
  ctx.ellipse(26, 10, 12, 9, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Inari Red Eye Liner / Facial Markings (Zenko/Tenko/Mistik)
  if (pet.stage !== 'anak') {
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    // Left eye flair
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.quadraticCurveTo(-38, -3, -42, 4);
    ctx.stroke();
    // Right eye flair
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.quadraticCurveTo(38, -3, 42, 4);
    ctx.stroke();
  }

  // Forehead Symbol / Star
  if (pet.form === 'tenko') {
    // Golden Star Tiara
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -22, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    // Sacred Inari Diamond / Flame
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(4, -18);
    ctx.lineTo(0, -12);
    ctx.lineTo(-4, -18);
    ctx.closePath();
    ctx.fill();
  }

  // Blushing cheeks
  ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-20, 10, 7, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(20, 10, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes & Expression
  const blink = tick % 130 > 122 && !isSleeping;

  if (isSleeping) {
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-16, 2, 7, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(16, 2, 7, Math.PI, 0);
    ctx.stroke();
  } else if (pet.isSick || action === 'sick') {
    // Swirly eyes
    ctx.strokeStyle = '#6b21a8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-16, 2, 6, 0, Math.PI * 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(16, 2, 6, 0, Math.PI * 1.6);
    ctx.stroke();
  } else if (blink) {
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-22, 2);
    ctx.lineTo(-10, 2);
    ctx.moveTo(10, 2);
    ctx.lineTo(22, 2);
    ctx.stroke();
  } else {
    // Large expressive anime fox eyes
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(-16, 1, 6, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(16, 1, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight sparkles
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-18, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(14, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(-14, 4, 1.2, 0, Math.PI * 2);
    ctx.arc(18, 4, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Black Nose
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.ellipse(0, 11, 3.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cute Mouth
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2.5;
  if (action === 'eating') {
    const chomp = tick % 16 > 8 ? 4 : 8;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(0, 17, 5, chomp, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (action === 'happy') {
    ctx.beginPath();
    ctx.moveTo(-6, 15);
    ctx.quadraticCurveTo(-3, 19, 0, 16);
    ctx.quadraticCurveTo(3, 19, 6, 15);
    ctx.stroke();
  } else if (pet.stats.hunger < 30) {
    ctx.beginPath();
    ctx.arc(0, 19, 5, Math.PI, 0);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 15, 4, 0, Math.PI);
    ctx.stroke();
  }

  // Head Accessories (Sakura Blossom Pin, Kitsune Mask, Tanuki Leaf)
  drawHeadAccessory(ctx, pet, tick, earBounce, false);

  ctx.restore();

  // Floating Kitsunebi Spirit Orbs for Remaja & Mistik
  if (pet.stage === 'remaja' || pet.stage === 'dewasa' || pet.stage === 'mistik') {
    const orbCount = pet.stage === 'mistik' ? 3 : 2;
    for (let i = 0; i < orbCount; i++) {
      const angle = tick * 0.04 + (i * Math.PI * 2) / orbCount;
      const ox = Math.cos(angle) * 75;
      const oy = Math.sin(angle) * 35 - 15;

      const orbGlow = ctx.createRadialGradient(ox, oy, 2, ox, oy, 16);
      orbGlow.addColorStop(0, '#ffffff');
      orbGlow.addColorStop(0.5, element.secondaryColor);
      orbGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = orbGlow;
      ctx.beginPath();
      ctx.arc(ox, oy, 16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// Draw Multiple Bushy Tails waving harmoniously
function drawTails(
  ctx: CanvasRenderingContext2D,
  count: number,
  element: any,
  tailWave: number,
  tick: number
) {
  // Angle spread based on tail count
  const spread = Math.min(Math.PI * 0.9, (count - 1) * 0.22);
  const startAngle = -Math.PI / 2 - spread / 2;
  const step = count > 1 ? spread / (count - 1) : 0;

  for (let i = 0; i < count; i++) {
    const baseAngle = startAngle + i * step;
    const waveOffset = Math.sin(tick * 0.09 + i * 0.6) * 12;
    const tailLength = 80 + Math.sin(i) * 10;

    ctx.save();
    ctx.translate(0, 28);
    ctx.rotate(baseAngle + (waveOffset * Math.PI) / 180);

    // Fluffy Curved Tail
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(24, -tailLength * 0.5, 8, -tailLength);
    ctx.quadraticCurveTo(-22, -tailLength * 0.6, 0, 0);
    ctx.closePath();

    const tailGrad = ctx.createLinearGradient(0, 0, 0, -tailLength);
    tailGrad.addColorStop(0, element.primaryColor);
    tailGrad.addColorStop(0.7, element.secondaryColor);
    tailGrad.addColorStop(1, '#ffffff'); // White tip on tails
    ctx.fillStyle = tailGrad;
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

// Draw Traditional Coiled Pixel Poops
function drawPoops(ctx: CanvasRenderingContext2D, count: number, tick: number) {
  const poopPositions = [
    { x: 55, y: 250 },
    { x: 300, y: 250 },
    { x: 80, y: 275 },
    { x: 275, y: 275 },
  ];

  for (let i = 0; i < Math.min(count, 4); i++) {
    const pos = poopPositions[i];
    ctx.save();
    ctx.translate(pos.x, pos.y);

    // Poop base coil
    ctx.fillStyle = '#854d0e';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2.5;

    // Bottom tier
    ctx.beginPath();
    ctx.ellipse(0, 8, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Middle tier
    ctx.beginPath();
    ctx.ellipse(0, 1, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Top swirl tip
    ctx.beginPath();
    ctx.moveTo(-6, -3);
    ctx.quadraticCurveTo(0, -12, 4, -14);
    ctx.quadraticCurveTo(2, -6, 6, -3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cute kawaii eyes on poop
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4, 0, 2.5, 0, Math.PI * 2);
    ctx.arc(4, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(-4, 0, 1.2, 0, Math.PI * 2);
    ctx.arc(4, 0, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Buzzing fly
    const flyX = Math.sin(tick * 0.2 + i) * 12;
    const flyY = -22 + Math.cos(tick * 0.25 + i) * 6;
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(flyX, flyY, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Draw Status Overlays (Floating Hearts, Bath Bubbles, Zzz Sleep runes)
function drawStatusFX(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  action: string,
  pet: PetData,
  tick: number
) {
  // Bathing Bubbles
  if (action === 'bathing') {
    for (let i = 0; i < 6; i++) {
      const bx = cx + Math.sin(tick * 0.05 + i * 2) * 55;
      const by = cy - 20 - ((tick * 1.5 + i * 25) % 90);
      const bSize = 6 + (i % 4) * 3;

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, bSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      // Bubble highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bx - bSize * 0.3, by - bSize * 0.3, bSize * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Floating Zzz on Sleeping
  if (pet.isSleeping || action === 'sleeping') {
    const zProgress = (tick * 0.03) % 1;
    const zx = cx + 45 + zProgress * 25;
    const zy = cy - 40 - zProgress * 50;

    ctx.save();
    ctx.font = 'bold 22px "Zen Maru Gothic", sans-serif';
    ctx.fillStyle = 'rgba(167, 139, 250, 0.9)';
    ctx.fillText('Z', zx, zy);
    ctx.font = 'bold 16px "Zen Maru Gothic", sans-serif';
    ctx.fillText('z', zx - 12, zy + 15);
    ctx.font = 'bold 12px "Zen Maru Gothic", sans-serif';
    ctx.fillText('z', zx - 22, zy + 28);
    ctx.restore();
  }

  // Hearts on Happy / Petting
  if (action === 'happy') {
    for (let i = 0; i < 3; i++) {
      const hx = cx + (i - 1) * 35;
      const hy = cy - 70 - ((tick * 1.2 + i * 20) % 50);
      ctx.save();
      ctx.font = '22px sans-serif';
      ctx.fillText('💖', hx, hy);
      ctx.restore();
    }
  }

  // Eating food crumbs
  if (action === 'eating') {
    const biteTick = tick % 15;
    if (biteTick < 6) {
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx - 20, cy + 5, 3, 0, Math.PI * 2);
      ctx.arc(cx + 22, cy + 8, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Sick purple poison bubble
  if (pet.isSick) {
    const sx = cx + 45;
    const sy = cy - 50 + Math.sin(tick * 0.1) * 6;
    ctx.save();
    ctx.font = '22px sans-serif';
    ctx.fillText('🟣', sx, sy);
    ctx.font = '14px sans-serif';
    ctx.fillText('💧', sx - 85, sy + 10);
    ctx.restore();
  }
}

// --- WARDROBE & ACCESSORIES RENDERING ENGINE ---

// Neck Accessories (Suzu bell, Magatama jade, Inari Scarf, Shimenawa, or classic bib)
function drawNeckAccessory(
  ctx: CanvasRenderingContext2D,
  pet: PetData,
  tick: number,
  isWalking: boolean,
  isBaby: boolean = false
) {
  const neckAcc = pet.accessories?.neck || 'none';
  const stage = pet.stage;

  ctx.save();

  if (neckAcc === 'suzu') {
    // Pita Lonceng Emas (Suzu Bell with red ribbon)
    const bellY = isBaby ? 32 : 30;
    const sway = Math.sin(tick * (isWalking ? 0.25 : 0.12)) * 2;

    // Vermilion Ribbon collar
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = isBaby ? 3.5 : 4.5;
    ctx.beginPath();
    ctx.ellipse(0, isBaby ? 24 : 16, isBaby ? 20 : 22, isBaby ? 8 : 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Ribbon bow wings
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(-6, bellY - 8, 5, 3, -0.4, 0, Math.PI * 2);
    ctx.ellipse(6, bellY - 8, 5, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Golden Suzu Bell with shine
    ctx.save();
    ctx.translate(sway, bellY);

    // Warm golden glow
    const bellGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
    bellGlow.addColorStop(0, 'rgba(250, 204, 21, 0.5)');
    bellGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = bellGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    // Bell sphere
    const bellGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, 8);
    bellGrad.addColorStop(0, '#fef08a');
    bellGrad.addColorStop(0.4, '#facc15');
    bellGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = bellGrad;
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, isBaby ? 6.5 : 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Horizontal sound slit & bottom round hole
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-4, 1, 8, 1.5);
    ctx.beginPath();
    ctx.arc(0, 3.5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Metallic gleam highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2.5, -2.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (neckAcc === 'magatama') {
    // Kalung Giok Magatama (Sacred curved emerald jade bead)
    const cordY = isBaby ? 24 : 16;
    const beadY = isBaby ? 32 : 28;
    const sway = Math.sin(tick * (isWalking ? 0.2 : 0.08)) * 2;

    // Dark braided holy cord
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, cordY, isBaby ? 20 : 22, isBaby ? 7 : 9, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(sway, beadY);

    // Jade spiritual green glow
    const jadeGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
    jadeGlow.addColorStop(0, 'rgba(52, 211, 153, 0.6)');
    jadeGlow.addColorStop(1, 'rgba(52, 211, 153, 0)');
    ctx.fillStyle = jadeGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Authentic curved Magatama comma geometry
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(6, -6, 6, 0);
    ctx.quadraticCurveTo(6, 6, 2, 8);
    ctx.quadraticCurveTo(-4, 10, -2, 4);
    ctx.quadraticCurveTo(-1, 0, -6, 0);
    ctx.quadraticCurveTo(-6, -6, 0, -6);
    ctx.closePath();

    const jadeGrad = ctx.createLinearGradient(-5, -6, 5, 8);
    jadeGrad.addColorStop(0, '#a7f3d0');
    jadeGrad.addColorStop(0.5, '#10b981');
    jadeGrad.addColorStop(1, '#065f46');
    ctx.fillStyle = jadeGrad;
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 1.8;
    ctx.fill();
    ctx.stroke();

    // Sacred eyelet hole
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.arc(0, -2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (neckAcc === 'scarf') {
    // Syal Merah Inari (Warm fluttering crimson scarf)
    const scarfY = isBaby ? 22 : 14;
    const wave = Math.sin(tick * (isWalking ? 0.28 : 0.12)) * (isWalking ? 7 : 3.5);

    // Scarf wrap around neck
    ctx.fillStyle = '#b91c1c';
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, scarfY, isBaby ? 24 : 26, isBaby ? 10 : 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bright fold highlight
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, scarfY + 2, isBaby ? 22 : 23, isBaby ? 7 : 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Trailing fluttering tail waving in wind
    ctx.save();
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(12, scarfY + 6);
    ctx.quadraticCurveTo(24 + wave, scarfY + 18, 30 + wave * 1.3, scarfY + 32);
    ctx.lineTo(22 + wave * 1.3, scarfY + 34);
    ctx.quadraticCurveTo(16 + wave, scarfY + 20, 6, scarfY + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Golden fringe at tip
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(22 + wave * 1.3, scarfY + 34);
    ctx.lineTo(30 + wave * 1.3, scarfY + 32);
    ctx.stroke();

    ctx.restore();
  } else if (neckAcc === 'shimenawa') {
    // Tali Suci Shimenawa (Braided holy rope with paper streamers)
    const ropeY = isBaby ? 22 : 16;
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, ropeY, isBaby ? 22 : 24, isBaby ? 8 : 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Dark straw twist texture
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1.5;
    [-14, -7, 0, 7, 14].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x - 2, ropeY - 4);
      ctx.lineTo(x + 2, ropeY + 4);
      ctx.stroke();
    });

    // Hanging White Shide Paper Streamers
    [-10, 0, 10].forEach((x, idx) => {
      const sway = Math.sin(tick * 0.1 + idx) * 1.5;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#a8a29e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 3 + sway, ropeY + 3);
      ctx.lineTo(x + 3 + sway, ropeY + 3);
      ctx.lineTo(x + 1 + sway, ropeY + 11);
      ctx.lineTo(x + 3 + sway, ropeY + 16);
      ctx.lineTo(x - 2 + sway, ropeY + 20);
      ctx.lineTo(x - 4 + sway, ropeY + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  } else {
    // 'none' - If stage is remaja / dewasa / mistik, show traditional classic bib
    if (!isBaby && (stage === 'remaja' || stage === 'dewasa' || stage === 'mistik')) {
      ctx.fillStyle = '#dc2626'; // Vermilion Red
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18, 12);
      ctx.lineTo(18, 12);
      ctx.lineTo(12, 28);
      ctx.lineTo(0, 34);
      ctx.lineTo(-12, 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Golden Bell on Collar
      ctx.beginPath();
      ctx.arc(0, 32, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}

// Head Accessories (Sakura Blossom Pin, Kitsune Mask, Tanuki Leaf)
function drawHeadAccessory(
  ctx: CanvasRenderingContext2D,
  pet: PetData,
  tick: number,
  earBounce: number,
  isBaby: boolean = false
) {
  const headAcc = pet.accessories?.head || 'none';
  if (headAcc === 'none') return;

  ctx.save();

  if (headAcc === 'sakura') {
    // Jepit Bunga Sakura (Pinned gracefully at base of ear)
    const px = isBaby ? 20 : 24;
    const py = (isBaby ? -20 : -26) + earBounce * 0.7;

    ctx.translate(px, py);

    // Subtle gentle petal float
    const petalWobble = Math.sin(tick * 0.08) * 0.08;
    ctx.rotate(petalWobble);

    // 5-Petal Sakura Blossom
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      ctx.save();
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-4, -6, -3, -10);
      ctx.quadraticCurveTo(0, -8.5, 3, -10);
      ctx.quadraticCurveTo(4, -6, 0, 0);
      ctx.closePath();

      const pGrad = ctx.createRadialGradient(0, -5, 1, 0, -5, 8);
      pGrad.addColorStop(0, '#ffffff');
      pGrad.addColorStop(0.4, '#fbcfe8');
      pGrad.addColorStop(1, '#f472b6');
      ctx.fillStyle = pGrad;
      ctx.strokeStyle = '#db2777';
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // Golden Stamen pistil center
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  } else if (headAcc === 'kitsune_mask') {
    // Topeng Rubah Kuil (Kitsune-men half-mask perched sideways)
    const mx = isBaby ? 22 : 28;
    const my = (isBaby ? -22 : -28) + earBounce * 0.6;

    ctx.translate(mx, my);
    ctx.rotate(0.25); // Stylish slant

    // Mask Porcelain Body
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.quadraticCurveTo(12, -12, 14, 0);
    ctx.quadraticCurveTo(10, 14, 0, 16);
    ctx.quadraticCurveTo(-10, 14, -14, 0);
    ctx.quadraticCurveTo(-12, -12, 0, -14);
    ctx.closePath();

    const maskGrad = ctx.createLinearGradient(-10, -10, 10, 10);
    maskGrad.addColorStop(0, '#ffffff');
    maskGrad.addColorStop(1, '#f5f5f4');
    ctx.fillStyle = maskGrad;
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Mask Fox Ears
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1.5;
    // Left ear
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.lineTo(-14, -18);
    ctx.lineTo(-4, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right ear
    ctx.beginPath();
    ctx.moveTo(10, -8);
    ctx.lineTo(14, -18);
    ctx.lineTo(4, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red Inari Swirl Markings on Mask
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, -1);
    ctx.quadraticCurveTo(-4, -4, 0, -1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -1);
    ctx.quadraticCurveTo(4, -4, 0, -1);
    ctx.stroke();

    // Cheek whiskers
    ctx.beginPath();
    ctx.moveTo(-10, 4);
    ctx.lineTo(-4, 4);
    ctx.moveTo(10, 4);
    ctx.lineTo(4, 4);
    ctx.stroke();

    // Snout
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, 8, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Red Tassel Cord hanging down with little gold bead
    const tasselSway = Math.sin(tick * 0.12) * 2;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, 6);
    ctx.quadraticCurveTo(-14 + tasselSway, 14, -12 + tasselSway, 22);
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-12 + tasselSway, 22, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (headAcc === 'leaf') {
    // Daun Mistis Tanuki (Magical Transformation Leaf on Forehead)
    const lx = 0;
    const ly = (isBaby ? -28 : -32) + earBounce * 0.3;

    ctx.translate(lx, ly);
    ctx.rotate(Math.sin(tick * 0.08) * 0.06);

    // Leaf body
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.quadraticCurveTo(9, -7, 7, 2);
    // Leaf notch cutout (traditional folklore tanuki leaf style)
    ctx.lineTo(4, 1);
    ctx.lineTo(6, 6);
    ctx.quadraticCurveTo(0, 10, -6, 6);
    ctx.lineTo(-4, 1);
    ctx.lineTo(-7, 2);
    ctx.quadraticCurveTo(-9, -7, 0, -12);
    ctx.closePath();

    const leafGrad = ctx.createLinearGradient(0, -12, 0, 10);
    leafGrad.addColorStop(0, '#86efac');
    leafGrad.addColorStop(0.5, '#22c55e');
    leafGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = leafGrad;
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    // Leaf center vein
    ctx.strokeStyle = '#bbf7d0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 7);
    ctx.stroke();
  }

  ctx.restore();
}
