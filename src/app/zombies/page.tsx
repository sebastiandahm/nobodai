"use client";

import { useEffect, useRef, useState } from "react";

/* =================================================================
   Zombie Survival — kindgerechter Top-Down-Shooter
   Steuerung: WASD oder Pfeiltasten = laufen, Maus = zielen, Klick = schiessen
   Mobil: linker Joystick = laufen, rechter Joystick = zielen/feuern
   ================================================================= */

type Vec = { x: number; y: number };
type Bullet = Vec & { vx: number; vy: number; life: number; dmg: number };
type Zombie = Vec & { hp: number; maxHp: number; speed: number; size: number; type: "normal" | "fast" | "tank"; hitFlash: number };
type Particle = Vec & { vx: number; vy: number; life: number; maxLife: number; color: string; size: number };
type Pickup = Vec & { kind: "med" | "ammo" | "rapid"; pulse: number };
type Joystick = { active: boolean; id: number; cx: number; cy: number; x: number; y: number };

export default function ZombiesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stats, setStats] = useState({ score: 0, wave: 1, hp: 100, ammo: 30, kills: 0, best: 0 });

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("zombies_best") : null;
    if (saved) setStats((s) => ({ ...s, best: parseInt(saved, 10) || 0 }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ---------- World state (mutable inside the loop) ----------
    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const player = { x: 0, y: 0, r: 18, speed: 220, hp: 100, maxHp: 100, ammo: 30, maxAmmo: 60, dir: 0, fireCd: 0, rapidT: 0, hurtT: 0 };
    const bullets: Bullet[] = [];
    const zombies: Zombie[] = [];
    const particles: Particle[] = [];
    const pickups: Pickup[] = [];

    let wave = 1;
    let waveCountdown = 2.5;
    let waveSpawnsLeft = 0;
    let waveSpawnTimer = 0;
    let score = 0;
    let kills = 0;
    let alive = true;
    let paused = false;
    let last = performance.now();
    let raf = 0;
    let shake = 0;

    const keys: Record<string, boolean> = {};
    const mouse = { x: 0, y: 0, down: false, inside: false };

    // Touch joysticks
    const leftJoy: Joystick = { active: false, id: -1, cx: 0, cy: 0, x: 0, y: 0 };
    const rightJoy: Joystick = { active: false, id: -1, cx: 0, cy: 0, x: 0, y: 0 };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas!.width = Math.floor(W * dpr);
      canvas!.height = Math.floor(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // Center the player on first run
    player.x = W / 2;
    player.y = H / 2;

    // ---------- Input ----------
    const onKey = (e: KeyboardEvent, down: boolean) => {
      const k = e.key.toLowerCase();
      keys[k] = down;
      if (down && k === "p") paused = !paused;
      if (down && k === "r" && !alive) restart();
      // Prevent page scroll when using arrows/space
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.inside = true;
    };
    const onMouseDown = () => { mouse.down = true; };
    const onMouseUp = () => { mouse.down = false; };
    const onMouseLeave = () => { mouse.inside = false; mouse.down = false; };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);

    // Touch handling
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas!.getBoundingClientRect();
      const touches = Array.from(e.touches);
      // Reset which touches are still on each joystick
      let leftSeen = false;
      let rightSeen = false;
      for (const t of touches) {
        const tx = t.clientX - rect.left;
        const ty = t.clientY - rect.top;
        const isLeftHalf = tx < W / 2;
        if (isLeftHalf) {
          if (leftJoy.id === t.identifier) {
            leftJoy.x = tx; leftJoy.y = ty; leftSeen = true;
          } else if (!leftJoy.active) {
            leftJoy.active = true; leftJoy.id = t.identifier;
            leftJoy.cx = tx; leftJoy.cy = ty; leftJoy.x = tx; leftJoy.y = ty;
            leftSeen = true;
          }
        } else {
          if (rightJoy.id === t.identifier) {
            rightJoy.x = tx; rightJoy.y = ty; rightSeen = true;
          } else if (!rightJoy.active) {
            rightJoy.active = true; rightJoy.id = t.identifier;
            rightJoy.cx = tx; rightJoy.cy = ty; rightJoy.x = tx; rightJoy.y = ty;
            rightSeen = true;
          }
        }
      }
      if (!leftSeen) { leftJoy.active = false; leftJoy.id = -1; }
      if (!rightSeen) { rightJoy.active = false; rightJoy.id = -1; }
    };
    canvas.addEventListener("touchstart", onTouch, { passive: false });
    canvas.addEventListener("touchmove", onTouch, { passive: false });
    canvas.addEventListener("touchend", onTouch, { passive: false });
    canvas.addEventListener("touchcancel", onTouch, { passive: false });

    // ---------- Helpers ----------
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const dist2 = (ax: number, ay: number, bx: number, by: number) => {
      const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy;
    };

    function spawnZombieAtEdge() {
      const side = Math.floor(Math.random() * 4);
      let x = 0, y = 0;
      const m = 30;
      if (side === 0) { x = rand(0, W); y = -m; }
      else if (side === 1) { x = W + m; y = rand(0, H); }
      else if (side === 2) { x = rand(0, W); y = H + m; }
      else { x = -m; y = rand(0, H); }

      // Choose type based on wave
      const roll = Math.random();
      let type: Zombie["type"] = "normal";
      if (wave >= 3 && roll < 0.2) type = "fast";
      if (wave >= 5 && roll > 0.85) type = "tank";

      let hp = 2 + Math.floor(wave * 0.6);
      let speed = 55 + wave * 3;
      let size = 16;
      if (type === "fast") { hp = Math.max(1, hp - 1); speed += 55; size = 13; }
      if (type === "tank") { hp += 6; speed = Math.max(40, speed - 20); size = 22; }

      zombies.push({ x, y, hp, maxHp: hp, speed, size, type, hitFlash: 0 });
    }

    function startWave(n: number) {
      wave = n;
      waveSpawnsLeft = 5 + Math.floor(n * 2.5);
      waveSpawnTimer = 0;
      waveCountdown = 0;
    }

    function shoot() {
      if (player.fireCd > 0) return;
      if (player.ammo <= 0) return;
      const angle = player.dir;
      const sp = 700;
      bullets.push({
        x: player.x + Math.cos(angle) * (player.r + 4),
        y: player.y + Math.sin(angle) * (player.r + 4),
        vx: Math.cos(angle) * sp,
        vy: Math.sin(angle) * sp,
        life: 0.7,
        dmg: 1,
      });
      // Muzzle flash particles
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: player.x + Math.cos(angle) * (player.r + 6),
          y: player.y + Math.sin(angle) * (player.r + 6),
          vx: Math.cos(angle) * 120 + rand(-40, 40),
          vy: Math.sin(angle) * 120 + rand(-40, 40),
          life: 0.18, maxLife: 0.18,
          color: "#fde68a", size: rand(2, 4),
        });
      }
      player.fireCd = player.rapidT > 0 ? 0.09 : 0.22;
      player.ammo--;
    }

    function damagePlayer(amount: number) {
      if (player.hurtT > 0) return;
      player.hp -= amount;
      player.hurtT = 0.5;
      shake = Math.min(shake + 10, 18);
      if (player.hp <= 0) {
        player.hp = 0;
        alive = false;
        const best = Math.max(score, parseInt(window.localStorage.getItem("zombies_best") || "0", 10));
        window.localStorage.setItem("zombies_best", String(best));
        setStats((s) => ({ ...s, hp: 0, score, wave, kills, best, ammo: player.ammo }));
        setGameOver(true);
      }
    }

    function killZombie(z: Zombie) {
      // Blood particles (red cartoonish dots)
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = rand(80, 240);
        particles.push({
          x: z.x, y: z.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: rand(0.35, 0.7), maxLife: 0.7, color: "#dc2626", size: rand(2, 4),
        });
      }
      // Chance to drop pickup
      const r = Math.random();
      if (r < 0.08) pickups.push({ x: z.x, y: z.y, kind: "med", pulse: 0 });
      else if (r < 0.22) pickups.push({ x: z.x, y: z.y, kind: "ammo", pulse: 0 });
      else if (r < 0.27) pickups.push({ x: z.x, y: z.y, kind: "rapid", pulse: 0 });

      score += z.type === "tank" ? 25 : z.type === "fast" ? 15 : 10;
      kills++;
    }

    function restart() {
      bullets.length = 0;
      zombies.length = 0;
      particles.length = 0;
      pickups.length = 0;
      player.x = W / 2; player.y = H / 2;
      player.hp = player.maxHp; player.ammo = 30; player.fireCd = 0; player.rapidT = 0; player.hurtT = 0;
      score = 0; kills = 0; wave = 1; waveCountdown = 2.5; waveSpawnsLeft = 0;
      alive = true;
      paused = false;
      shake = 0;
      setGameOver(false);
      setRunning(true);
      setStats({ score: 0, wave: 1, hp: 100, ammo: 30, kills: 0, best: parseInt(window.localStorage.getItem("zombies_best") || "0", 10) });
    }
    // expose restart
    (canvas as any).__restart = restart;

    // ---------- Drawing ----------
    function drawGrid() {
      const step = 40;
      ctx!.strokeStyle = "rgba(255,255,255,0.04)";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      for (let x = 0; x < W; x += step) { ctx!.moveTo(x, 0); ctx!.lineTo(x, H); }
      for (let y = 0; y < H; y += step) { ctx!.moveTo(0, y); ctx!.lineTo(W, y); }
      ctx!.stroke();
    }

    function drawPlayer() {
      const g = ctx!;
      g.save();
      g.translate(player.x, player.y);
      g.rotate(player.dir);
      // Shadow
      g.fillStyle = "rgba(0,0,0,0.35)";
      g.beginPath(); g.ellipse(0, 3, player.r + 2, player.r * 0.6, 0, 0, Math.PI * 2); g.fill();
      // Body
      const bodyColor = player.hurtT > 0 ? "#fca5a5" : "#60a5fa";
      g.fillStyle = bodyColor;
      g.strokeStyle = "#0f172a";
      g.lineWidth = 2;
      g.beginPath(); g.arc(0, 0, player.r, 0, Math.PI * 2); g.fill(); g.stroke();
      // Eye / direction
      g.fillStyle = "#0f172a";
      g.beginPath(); g.arc(player.r * 0.4, -3, 3, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(player.r * 0.4, 3, 3, 0, Math.PI * 2); g.fill();
      // Gun
      g.fillStyle = "#1f2937";
      g.fillRect(player.r - 3, -3, 16, 6);
      g.fillStyle = "#fbbf24";
      g.fillRect(player.r + 11, -2, 3, 4);
      g.restore();
    }

    function drawZombie(z: Zombie) {
      const g = ctx!;
      g.save();
      g.translate(z.x, z.y);
      // Shadow
      g.fillStyle = "rgba(0,0,0,0.35)";
      g.beginPath(); g.ellipse(0, 3, z.size + 1, z.size * 0.55, 0, 0, Math.PI * 2); g.fill();
      // Body
      const base = z.type === "tank" ? "#365314" : z.type === "fast" ? "#84cc16" : "#4d7c0f";
      g.fillStyle = z.hitFlash > 0 ? "#fef9c3" : base;
      g.strokeStyle = "#1a2e05";
      g.lineWidth = 2;
      g.beginPath(); g.arc(0, 0, z.size, 0, Math.PI * 2); g.fill(); g.stroke();
      // Eyes (cartoon red glow, not gory)
      g.fillStyle = "#ef4444";
      g.beginPath(); g.arc(-z.size * 0.35, -z.size * 0.2, 2.5, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(z.size * 0.35, -z.size * 0.2, 2.5, 0, Math.PI * 2); g.fill();
      // Mouth squiggle
      g.strokeStyle = "#1a2e05";
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(-z.size * 0.45, z.size * 0.35);
      g.lineTo(-z.size * 0.15, z.size * 0.2);
      g.lineTo(z.size * 0.15, z.size * 0.35);
      g.lineTo(z.size * 0.45, z.size * 0.2);
      g.stroke();
      // HP bar (only if hurt)
      if (z.hp < z.maxHp) {
        g.fillStyle = "#1f2937";
        g.fillRect(-z.size, -z.size - 8, z.size * 2, 4);
        g.fillStyle = "#22c55e";
        g.fillRect(-z.size, -z.size - 8, (z.size * 2) * (z.hp / z.maxHp), 4);
      }
      g.restore();
    }

    function drawBullet(b: Bullet) {
      const g = ctx!;
      g.fillStyle = "#fde68a";
      g.strokeStyle = "#f59e0b";
      g.lineWidth = 1;
      g.beginPath(); g.arc(b.x, b.y, 3, 0, Math.PI * 2); g.fill(); g.stroke();
    }

    function drawPickup(p: Pickup) {
      const g = ctx!;
      const t = p.pulse;
      const pulse = 1 + Math.sin(t * 4) * 0.08;
      g.save();
      g.translate(p.x, p.y);
      g.scale(pulse, pulse);
      g.lineWidth = 2;
      if (p.kind === "med") {
        g.fillStyle = "#ffffff";
        g.strokeStyle = "#16a34a";
        g.beginPath(); g.arc(0, 0, 12, 0, Math.PI * 2); g.fill(); g.stroke();
        g.fillStyle = "#16a34a";
        g.fillRect(-1.5, -7, 3, 14);
        g.fillRect(-7, -1.5, 14, 3);
      } else if (p.kind === "ammo") {
        g.fillStyle = "#fbbf24";
        g.strokeStyle = "#92400e";
        g.fillRect(-10, -8, 20, 16);
        g.strokeRect(-10, -8, 20, 16);
        g.fillStyle = "#92400e";
        g.font = "bold 12px system-ui, sans-serif";
        g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText("A", 0, 1);
      } else {
        g.fillStyle = "#a78bfa";
        g.strokeStyle = "#5b21b6";
        g.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const a2 = a + Math.PI / 5;
          if (i === 0) g.moveTo(Math.cos(a) * 11, Math.sin(a) * 11);
          else g.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
          g.lineTo(Math.cos(a2) * 5, Math.sin(a2) * 5);
        }
        g.closePath(); g.fill(); g.stroke();
      }
      g.restore();
    }

    function drawParticles() {
      const g = ctx!;
      for (const p of particles) {
        const a = Math.max(0, p.life / p.maxLife);
        g.globalAlpha = a;
        g.fillStyle = p.color;
        g.beginPath(); g.arc(p.x, p.y, p.size, 0, Math.PI * 2); g.fill();
      }
      g.globalAlpha = 1;
    }

    function drawHUD() {
      const g = ctx!;
      // Health bar
      g.fillStyle = "rgba(0,0,0,0.55)";
      g.fillRect(16, 16, 220, 24);
      g.fillStyle = player.hp > 30 ? "#22c55e" : "#ef4444";
      g.fillRect(20, 20, (212) * (player.hp / player.maxHp), 16);
      g.strokeStyle = "rgba(255,255,255,0.5)";
      g.strokeRect(16, 16, 220, 24);
      g.fillStyle = "#fff";
      g.font = "bold 12px system-ui, sans-serif";
      g.textAlign = "left"; g.textBaseline = "middle";
      g.fillText(`HP ${Math.ceil(player.hp)} / ${player.maxHp}`, 24, 28);

      // Ammo
      g.fillStyle = "rgba(0,0,0,0.55)";
      g.fillRect(16, 46, 220, 22);
      g.fillStyle = "#fbbf24";
      g.fillRect(20, 50, 212 * (player.ammo / player.maxAmmo), 14);
      g.strokeStyle = "rgba(255,255,255,0.5)";
      g.strokeRect(16, 46, 220, 22);
      g.fillStyle = "#fff";
      g.fillText(`Munition ${player.ammo} / ${player.maxAmmo}`, 24, 57);

      // Score / wave (top center / right)
      g.textAlign = "right";
      g.font = "bold 16px system-ui, sans-serif";
      g.fillStyle = "#fff";
      g.fillText(`Welle ${wave}`, W - 20, 28);
      g.fillText(`Score ${score}`, W - 20, 50);
      g.fillStyle = "rgba(255,255,255,0.6)";
      g.font = "11px system-ui, sans-serif";
      g.fillText(`Kills ${kills}`, W - 20, 70);

      // Rapid fire timer
      if (player.rapidT > 0) {
        g.textAlign = "center";
        g.fillStyle = "#a78bfa";
        g.font = "bold 14px system-ui, sans-serif";
        g.fillText(`SCHNELL-FEUER ${player.rapidT.toFixed(1)}s`, W / 2, 28);
      }

      // Wave countdown banner
      if (waveCountdown > 0) {
        g.textAlign = "center";
        g.fillStyle = "rgba(0,0,0,0.55)";
        g.fillRect(W / 2 - 140, H / 2 - 36, 280, 72);
        g.fillStyle = "#fff";
        g.font = "bold 22px system-ui, sans-serif";
        g.fillText(`Welle ${wave} startet...`, W / 2, H / 2 - 6);
        g.font = "bold 28px system-ui, sans-serif";
        g.fillStyle = "#fbbf24";
        g.fillText(Math.ceil(waveCountdown).toString(), W / 2, H / 2 + 24);
      }

      // Joystick visuals (mobile)
      if (leftJoy.active) drawJoystick(leftJoy);
      if (rightJoy.active) drawJoystick(rightJoy);

      // Pause
      if (paused) {
        g.fillStyle = "rgba(0,0,0,0.6)";
        g.fillRect(0, 0, W, H);
        g.fillStyle = "#fff";
        g.textAlign = "center";
        g.font = "bold 38px system-ui, sans-serif";
        g.fillText("Pause", W / 2, H / 2);
        g.font = "14px system-ui, sans-serif";
        g.fillText("Drücke P zum Weiterspielen", W / 2, H / 2 + 30);
      }
    }

    function drawJoystick(j: Joystick) {
      const g = ctx!;
      g.save();
      g.globalAlpha = 0.4;
      g.strokeStyle = "#fff";
      g.lineWidth = 2;
      g.beginPath(); g.arc(j.cx, j.cy, 50, 0, Math.PI * 2); g.stroke();
      const dx = j.x - j.cx, dy = j.y - j.cy;
      const d = Math.min(Math.hypot(dx, dy), 50);
      const a = Math.atan2(dy, dx);
      g.fillStyle = "#fff";
      g.beginPath(); g.arc(j.cx + Math.cos(a) * d, j.cy + Math.sin(a) * d, 22, 0, Math.PI * 2); g.fill();
      g.restore();
    }

    // ---------- Update / loop ----------
    function update(dt: number) {
      if (paused) return;

      // Wave control
      if (alive) {
        if (waveCountdown > 0) {
          waveCountdown -= dt;
          if (waveCountdown <= 0) startWave(wave);
        } else if (waveSpawnsLeft > 0) {
          waveSpawnTimer -= dt;
          if (waveSpawnTimer <= 0) {
            spawnZombieAtEdge();
            waveSpawnsLeft--;
            waveSpawnTimer = Math.max(0.25, 0.9 - wave * 0.04);
          }
        } else if (zombies.length === 0) {
          // wave complete
          wave++;
          waveCountdown = 3.0;
          // small reward
          player.ammo = Math.min(player.maxAmmo, player.ammo + 8);
          player.hp = Math.min(player.maxHp, player.hp + 12);
        }
      }

      // Determine movement input
      let mx = 0, my = 0;
      if (keys["w"] || keys["arrowup"]) my -= 1;
      if (keys["s"] || keys["arrowdown"]) my += 1;
      if (keys["a"] || keys["arrowleft"]) mx -= 1;
      if (keys["d"] || keys["arrowright"]) mx += 1;
      if (leftJoy.active) {
        const dx = leftJoy.x - leftJoy.cx, dy = leftJoy.y - leftJoy.cy;
        const d = Math.hypot(dx, dy);
        if (d > 12) { mx += dx / 50; my += dy / 50; }
      }
      const mag = Math.hypot(mx, my);
      if (mag > 1) { mx /= mag; my /= mag; }
      else if (mag > 0 && mag < 0.2) { mx = 0; my = 0; }

      if (alive) {
        player.x += mx * player.speed * dt;
        player.y += my * player.speed * dt;
        player.x = Math.max(player.r, Math.min(W - player.r, player.x));
        player.y = Math.max(player.r, Math.min(H - player.r, player.y));
      }

      // Aim direction
      let aimX: number | null = null, aimY: number | null = null;
      if (rightJoy.active) {
        const dx = rightJoy.x - rightJoy.cx, dy = rightJoy.y - rightJoy.cy;
        if (Math.hypot(dx, dy) > 10) {
          player.dir = Math.atan2(dy, dx);
          aimX = 1; aimY = 1; // marker
        }
      } else if (mouse.inside) {
        player.dir = Math.atan2(mouse.y - player.y, mouse.x - player.x);
      }

      // Fire
      if (alive) {
        player.fireCd -= dt;
        if (player.rapidT > 0) player.rapidT -= dt;
        if (player.hurtT > 0) player.hurtT -= dt;
        const wantFire = mouse.down || rightJoy.active;
        if (wantFire) shoot();
      }

      // Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
        if (b.life <= 0 || b.x < -10 || b.y < -10 || b.x > W + 10 || b.y > H + 10) {
          bullets.splice(i, 1); continue;
        }
        // Check zombie hit
        for (let j = zombies.length - 1; j >= 0; j--) {
          const z = zombies[j];
          if (dist2(b.x, b.y, z.x, z.y) < (z.size + 3) * (z.size + 3)) {
            z.hp -= b.dmg;
            z.hitFlash = 0.08;
            // small particles
            for (let k = 0; k < 3; k++) {
              particles.push({
                x: b.x, y: b.y,
                vx: rand(-60, 60), vy: rand(-60, 60),
                life: 0.25, maxLife: 0.25, color: "#fef3c7", size: 2,
              });
            }
            bullets.splice(i, 1);
            if (z.hp <= 0) {
              killZombie(z);
              zombies.splice(j, 1);
            }
            break;
          }
        }
      }

      // Zombies
      for (let i = zombies.length - 1; i >= 0; i--) {
        const z = zombies[i];
        if (z.hitFlash > 0) z.hitFlash -= dt;
        const dx = player.x - z.x, dy = player.y - z.y;
        const d = Math.hypot(dx, dy) || 1;
        z.x += (dx / d) * z.speed * dt;
        z.y += (dy / d) * z.speed * dt;
        // Separate from other zombies (cheap)
        for (let j = i - 1; j >= 0; j--) {
          const o = zombies[j];
          const ox = z.x - o.x, oy = z.y - o.y;
          const od = Math.hypot(ox, oy);
          const minD = z.size + o.size - 2;
          if (od > 0 && od < minD) {
            const push = (minD - od) / 2;
            z.x += (ox / od) * push;
            z.y += (oy / od) * push;
            o.x -= (ox / od) * push;
            o.y -= (oy / od) * push;
          }
        }
        // Touch player
        if (alive && dist2(z.x, z.y, player.x, player.y) < (z.size + player.r - 2) ** 2) {
          damagePlayer(z.type === "tank" ? 18 : z.type === "fast" ? 10 : 12);
        }
      }

      // Pickups
      for (let i = pickups.length - 1; i >= 0; i--) {
        const p = pickups[i];
        p.pulse += dt;
        if (alive && dist2(p.x, p.y, player.x, player.y) < (player.r + 14) ** 2) {
          if (p.kind === "med") player.hp = Math.min(player.maxHp, player.hp + 35);
          else if (p.kind === "ammo") player.ammo = Math.min(player.maxAmmo, player.ammo + 20);
          else if (p.kind === "rapid") player.rapidT = 8;
          pickups.splice(i, 1);
        }
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= 0.92; p.vy *= 0.92;
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }

      if (shake > 0) shake = Math.max(0, shake - dt * 40);

      // Push HUD state to React (cheap snapshot, throttle by frame)
      hudTick += dt;
      if (hudTick > 0.1) {
        hudTick = 0;
        setStats((s) => ({ ...s, hp: Math.ceil(player.hp), ammo: player.ammo, score, wave, kills, best: Math.max(s.best, score) }));
      }
    }

    let hudTick = 0;

    function render() {
      const g = ctx!;
      g.save();
      if (shake > 0) g.translate(rand(-shake, shake) * 0.5, rand(-shake, shake) * 0.5);
      // Background
      g.fillStyle = "#0b1220";
      g.fillRect(0, 0, W, H);
      drawGrid();
      // Vignette
      const grad = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.55)");
      g.fillStyle = grad; g.fillRect(0, 0, W, H);

      for (const p of pickups) drawPickup(p);
      for (const z of zombies) drawZombie(z);
      drawPlayer();
      for (const b of bullets) drawBullet(b);
      drawParticles();
      g.restore();

      drawHUD();

      // Red hurt flash overlay
      if (player.hurtT > 0.25) {
        g.fillStyle = `rgba(239,68,68,${(player.hurtT - 0.25) * 1.4})`;
        g.fillRect(0, 0, W, H);
      }
    }

    function loop(now: number) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      update(dt);
      render();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    setRunning(true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("touchmove", onTouch);
      canvas.removeEventListener("touchend", onTouch);
      canvas.removeEventListener("touchcancel", onTouch);
    };
  }, []);

  const onRestart = () => {
    const c: any = canvasRef.current;
    if (c && c.__restart) c.__restart();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0b1220", color: "#e2e8f0", fontFamily: "system-ui, -apple-system, sans-serif", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none", cursor: "crosshair", display: "block" }}
      />

      {/* Top-left small brand */}
      <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", pointerEvents: "none", textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
        <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: 1.5, color: "#fbbf24", textAlign: "center" }}>ZOMBIE SURVIVAL</div>
        <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "center" }}>Bestenwert: {stats.best}</div>
      </div>

      {/* Controls hint */}
      <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, textAlign: "center", fontSize: 11, color: "rgba(226,232,240,0.55)", pointerEvents: "none", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
        WASD / Pfeile = Laufen &nbsp;·&nbsp; Maus = Zielen &nbsp;·&nbsp; Klick / Halten = Schiessen &nbsp;·&nbsp; P = Pause &nbsp;·&nbsp; Mobil: linker Joystick laufen, rechter zielt &amp; feuert
      </div>

      {/* Game over overlay */}
      {gameOver && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
          <div style={{ background: "linear-gradient(180deg, #0f172a, #020617)", border: "1px solid rgba(251,191,36,0.35)", borderRadius: 16, padding: "32px 36px", textAlign: "center", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: 36, marginBottom: 6 }}>💀</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#ef4444", marginBottom: 4 }}>Game Over</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 22 }}>Die Zombies haben dich erwischt!</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "left", marginBottom: 22 }}>
              <Stat label="Score" value={stats.score} hi />
              <Stat label="Welle" value={stats.wave} />
              <Stat label="Kills" value={stats.kills} />
              <Stat label="Bestenwert" value={stats.best} />
            </div>
            <button onClick={onRestart} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "#fbbf24", color: "#0f172a", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Nochmal spielen ↻
            </button>
            <div style={{ marginTop: 10, fontSize: 11, color: "#64748b" }}>Tipp: Drücke R zum schnellen Neustart</div>
          </div>
        </div>
      )}

      {/* Start hint until first click (purely informational, not blocking) */}
      {!running && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ background: "rgba(0,0,0,0.6)", padding: "16px 22px", borderRadius: 12, fontSize: 14 }}>Lade Spiel …</div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, hi }: { label: string; value: number; hi?: boolean }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "10px 12px", borderRadius: 10 }}>
      <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: hi ? "#fbbf24" : "#e2e8f0", fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}
