import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import "./HeroScene.css";

/**
 * HeroScene — a living 3D "network globe".
 *  - A rotating mesh of nodes; glowing packets (think: transactions) hop across it.
 *  - Tech + fintech keywords are pinned to the surface and travel around it.
 *  - Reacts to the cursor (tilt, constellation lines). Click / tap to send a burst of packets.
 *  - No box, no border: the canvas bleeds past its container and is masked into the page background.
 *  - Colours are read from your CSS variables, so it always matches the site theme.
 */

type RGB = [number, number, number];

const FALLBACK = {
  lime: [158, 232, 66] as RGB,
  teal: [64, 208, 190] as RGB,
  orange: [238, 150, 86] as RGB,
  fg: [236, 236, 224] as RGB,
  bg: [20, 24, 20] as RGB,
};

/** Resolve any CSS colour (including oklch) from a custom property into plain RGB. */
function readColor(variable: string, fallback: RGB): RGB {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    if (!raw) return fallback;
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    const c = probe.getContext("2d", { willReadFrequently: true });
    if (!c) return fallback;
    c.fillStyle = raw;
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return d[0] + d[1] + d[2] === 0 ? fallback : [d[0], d[1], d[2]];
  } catch {
    return fallback;
  }
}

const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/* Keywords pinned to the globe. lat / lon are in degrees. Edit freely. */
const LABELS: { text: string; lat: number; lon: number; tone: "lime" | "teal" | "orange" }[] = [
  { text: "React.js", lat: 32, lon: 0, tone: "lime" },
  { text: "Node.js", lat: -18, lon: 40, tone: "teal" },
  { text: "Laravel", lat: 12, lon: 80, tone: "orange" },
  { text: "Java", lat: 42, lon: 120, tone: "lime" },
  { text: "MySQL", lat: -34, lon: 160, tone: "teal" },
  { text: "REST API", lat: 8, lon: 200, tone: "orange" },
  { text: "Express.js", lat: 30, lon: 240, tone: "lime" },
  { text: "PHP", lat: -12, lon: 280, tone: "teal" },
  { text: "JavaScript", lat: 36, lon: 320, tone: "orange" },
];

export default function HeroScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lime = readColor("--portfolio-lime", FALLBACK.lime);
    const teal = readColor("--portfolio-teal", FALLBACK.teal);
    const orange = readColor("--portfolio-orange", FALLBACK.orange);
    const fg = readColor("--foreground", FALLBACK.fg);
    const bg = readColor("--background", FALLBACK.bg);
    const tones = { lime, teal, orange };

    /* ---------- geometry (built once) ---------- */
    const N = window.innerWidth < 680 ? 150 : 250;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const base = new Float32Array(N * 3);
    const spread = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const y = 1 - (2 * (i + 0.5)) / N;
      const r = Math.sqrt(1 - y * y);
      const th = i * golden;
      base[i * 3] = Math.cos(th) * r;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = Math.sin(th) * r;
      spread[i] = 0.5 + Math.random() * 1.2; // how far each node starts from home (intro)
    }

    // connect every node to its 3 nearest neighbours
    const adj: number[][] = Array.from({ length: N }, () => []);
    const edges: [number, number][] = [];
    const seen = new Set<number>();
    for (let i = 0; i < N; i++) {
      const near: [number, number][] = [];
      for (let j = 0; j < N; j++) {
        if (j === i) continue;
        const dx = base[i * 3] - base[j * 3], dy = base[i * 3 + 1] - base[j * 3 + 1], dz = base[i * 3 + 2] - base[j * 3 + 2];
        near.push([dx * dx + dy * dy + dz * dz, j]);
      }
      near.sort((a, b) => a[0] - b[0]);
      for (let k = 0; k < 3; k++) {
        const j = near[k][1];
        const key = Math.min(i, j) * N + Math.max(i, j);
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push([i, j]);
        adj[i].push(j);
        adj[j].push(i);
      }
    }

    const labelVec = LABELS.map((l) => {
      const la = (l.lat * Math.PI) / 180, lo = (l.lon * Math.PI) / 180;
      return [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)];
    });

    const dust = Array.from({ length: 48 }, () => ({
      x: Math.random(), y: Math.random(), d: 0.3 + Math.random() * 0.7,
      s: 0.5 + Math.random() * 1.3, ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 1.2,
      tone: Math.random() > 0.5 ? lime : teal,
    }));

    const rings = [
      { radius: 1.38, roll: 0.55, speed: 0.55, color: orange },
      { radius: 1.68, roll: -0.35, speed: -0.32, color: teal },
    ];
    const RING_SEGMENTS = 110;

    /* ---------- projected state (reused every frame) ---------- */
    const sx = new Float32Array(N), sy = new Float32Array(N), sz = new Float32Array(N), sp = new Float32Array(N);
    const lax = new Float32Array(LABELS.length), lay = new Float32Array(LABELS.length), laz = new Float32Array(LABELS.length);
    const ltx = new Float32Array(LABELS.length), lty = new Float32Array(LABELS.length);
    const ringX = rings.map(() => new Float32Array(RING_SEGMENTS + 1));
    const ringY = rings.map(() => new Float32Array(RING_SEGMENTS + 1));
    const ringZ = rings.map(() => new Float32Array(RING_SEGMENTS + 1));

    type Packet = { a: number; b: number; t: number; speed: number; hops: number; color: RGB };
    const packets: Packet[] = [];
    const spawnPacket = (from?: number) => {
      let a = from ?? -1;
      if (a < 0) {
        for (let tries = 0; tries < 12; tries++) {
          const i = Math.floor(Math.random() * N);
          if (sz[i] > -0.2) { a = i; break; }
        }
        if (a < 0) a = Math.floor(Math.random() * N);
      }
      const b = adj[a][Math.floor(Math.random() * adj[a].length)];
      packets.push({ a, b, t: 0, speed: 1.1 + Math.random() * 1.1, hops: 3 + Math.floor(Math.random() * 4), color: Math.random() > 0.3 ? lime : orange });
    };
    burstRef.current = () => {
      for (let k = 0; k < 9; k++) spawnPacket();
      pulseAt = performance.now();
    };

    /* ---------- view state ---------- */
    let W = 0, H = 0, dpr = 1, R = 100, cx = 0, cy = 0;
    let yaw = 0, yawOff = 0, yawOffT = 0, tilt = 0.32, tiltT = 0.32;
    let mx = -9999, my = -9999;
    let pulseAt = -9999;
    let ca = 1, sa = 0, ct = 1, st = 0;
    let ox = 0, oy = 0, oz = 0;
    const D = 3.2;

    const place = (x: number, y: number, z: number, useYaw: boolean) => {
      let X = x, Z = z;
      if (useYaw) { X = x * ca + z * sa; Z = -x * sa + z * ca; }
      ox = X; oy = y * ct - Z * st; oz = y * st + Z * ct;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H / 2;
      R = Math.min(W, H) * 0.225;
    };

    /* ---------- frame ---------- */
    const start = performance.now();
    let last = start;
    let spawnTimer = 0;

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = (now - start) / 1000;
      const e = reduceMotion ? 1 : easeOut((now - start) / 1900);
      const k = R / 230; // size factor

      if (!reduceMotion) {
        yaw += dt * 0.2;
        yawOff += (yawOffT - yawOff) * Math.min(1, dt * 3);
        tilt += (tiltT - tilt) * Math.min(1, dt * 3);
      }
      ca = Math.cos(yaw + yawOff); sa = Math.sin(yaw + yawOff); ct = Math.cos(tilt); st = Math.sin(tilt);

      ctx.clearRect(0, 0, W, H);

      /* dust */
      for (const p of dust) {
        const drift = reduceMotion ? 0 : time * 0.012 * p.sp;
        const px = p.x * W + (mx > -999 ? (cx - mx) * 0.03 * p.d : 0);
        const py = (((p.y - drift) % 1) + 1) % 1 * H;
        const tw = 0.45 + 0.55 * Math.sin(time * p.sp + p.ph);
        ctx.fillStyle = rgba(p.tone, 0.5 * tw * p.d * e);
        ctx.beginPath(); ctx.arc(px, py, p.s * k * 1.4, 0, 6.2832); ctx.fill();
      }

      /* soft core glow */
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.9);
      g.addColorStop(0, rgba(lime, 0.16 * e)); g.addColorStop(0.45, rgba(teal, 0.05 * e)); g.addColorStop(1, rgba(lime, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      /* project sphere nodes */
      for (let i = 0; i < N; i++) {
        const s = 1 + (1 - e) * spread[i];
        place(base[i * 3] * s, base[i * 3 + 1] * s, base[i * 3 + 2] * s, true);
        const p = D / Math.max(0.6, D - oz);
        sx[i] = cx + ox * R * p; sy[i] = cy + oy * R * p; sz[i] = oz; sp[i] = p;
      }
      /* project label pins (surface anchor + floating tip) */
      for (let i = 0; i < LABELS.length; i++) {
        const v = labelVec[i];
        place(v[0], v[1], v[2], true);
        let p = D / Math.max(0.6, D - oz);
        lax[i] = cx + ox * R * p; lay[i] = cy + oy * R * p; laz[i] = oz;
        place(v[0] * 1.2, v[1] * 1.2, v[2] * 1.2, true);
        p = D / Math.max(0.6, D - oz);
        ltx[i] = cx + ox * R * p; lty[i] = cy + oy * R * p;
      }
      /* project rings */
      rings.forEach((ring, ri) => {
        const cr = Math.cos(ring.roll), sr = Math.sin(ring.roll);
        for (let s = 0; s <= RING_SEGMENTS; s++) {
          const a = (s / RING_SEGMENTS) * 6.2832;
          const x0 = Math.cos(a) * ring.radius, z0 = Math.sin(a) * ring.radius;
          place(x0 * cr, x0 * sr, z0, false);
          const p = D / Math.max(0.6, D - oz);
          ringX[ri][s] = cx + ox * R * p; ringY[ri][s] = cy + oy * R * p; ringZ[ri][s] = oz;
        }
      });

      /* packets: advance */
      if (!reduceMotion) {
        spawnTimer -= dt;
        if (spawnTimer <= 0 && packets.length < 18) { spawnPacket(); spawnTimer = 0.28 + Math.random() * 0.3; }
        for (let i = packets.length - 1; i >= 0; i--) {
          const p = packets[i];
          p.t += dt * p.speed;
          if (p.t >= 1) {
            p.t = 0; p.hops--;
            const options = adj[p.b].filter((n) => n !== p.a);
            const next = options[Math.floor(Math.random() * options.length)] ?? adj[p.b][0];
            p.a = p.b; p.b = next;
            if (p.hops <= 0) packets.splice(i, 1);
          }
        }
      }

      const pulseT = (now - pulseAt) / 1000;

      /* two passes: back hemisphere, core mark, front hemisphere */
      for (let layer = 0; layer < 2; layer++) {
        const isFront = layer === 1;

        /* rings */
        rings.forEach((ring, ri) => {
          ctx.lineWidth = 1;
          for (let s = 0; s < RING_SEGMENTS; s++) {
            const z = (ringZ[ri][s] + ringZ[ri][s + 1]) / 2;
            if ((z >= 0) !== isFront) continue;
            const depth = clamp01((z / ring.radius + 1) / 2);
            ctx.strokeStyle = rgba(ring.color, (0.06 + 0.3 * depth) * e);
            ctx.beginPath(); ctx.moveTo(ringX[ri][s], ringY[ri][s]); ctx.lineTo(ringX[ri][s + 1], ringY[ri][s + 1]); ctx.stroke();
          }
          // travelling bead
          const idx = Math.floor((((time * ring.speed * 0.16) % 1) + 1) % 1 * RING_SEGMENTS);
          if ((ringZ[ri][idx] >= 0) === isFront) {
            const depth = clamp01((ringZ[ri][idx] / ring.radius + 1) / 2);
            ctx.fillStyle = rgba(ring.color, 0.22 * e); ctx.beginPath(); ctx.arc(ringX[ri][idx], ringY[ri][idx], 9 * k, 0, 6.2832); ctx.fill();
            ctx.fillStyle = rgba(ring.color, (0.5 + 0.5 * depth) * e); ctx.beginPath(); ctx.arc(ringX[ri][idx], ringY[ri][idx], (2.2 + 1.6 * depth) * k, 0, 6.2832); ctx.fill();
          }
        });

        /* mesh edges */
        ctx.lineWidth = 0.8;
        for (let i = 0; i < edges.length; i++) {
          const a = edges[i][0], b = edges[i][1];
          const z = (sz[a] + sz[b]) / 2;
          if ((z >= 0) !== isFront) continue;
          const depth = clamp01((z + 1) / 2);
          ctx.strokeStyle = rgba(mix(teal, lime, depth), (0.05 + 0.2 * depth) * e * e);
          ctx.beginPath(); ctx.moveTo(sx[a], sy[a]); ctx.lineTo(sx[b], sy[b]); ctx.stroke();
        }

        /* nodes (+ cursor constellation on the front side) */
        for (let i = 0; i < N; i++) {
          if ((sz[i] >= 0) !== isFront) continue;
          const depth = clamp01((sz[i] + 1) / 2);
          let size = (0.7 + 1.5 * depth) * sp[i] * k;
          let alpha = (0.18 + 0.75 * depth) * e;
          if (isFront && !reduceMotion) {
            const dx = sx[i] - mx, dy = sy[i] - my;
            const dist = Math.sqrt(dx * dx + dy * dy), reach = 150 * k;
            if (dist < reach) {
              const f = 1 - dist / reach;
              ctx.strokeStyle = rgba(lime, f * 0.55); ctx.lineWidth = 0.9;
              ctx.beginPath(); ctx.moveTo(sx[i], sy[i]); ctx.lineTo(mx, my); ctx.stroke();
              size *= 1 + f * 1.6; alpha = Math.min(1, alpha + f * 0.5);
            }
          }
          ctx.fillStyle = rgba(mix(teal, lime, depth), alpha);
          ctx.beginPath(); ctx.arc(sx[i], sy[i], size, 0, 6.2832); ctx.fill();
        }

        /* packets */
        for (const p of packets) {
          const x = sx[p.a] + (sx[p.b] - sx[p.a]) * p.t, y = sy[p.a] + (sy[p.b] - sy[p.a]) * p.t;
          const z = sz[p.a] + (sz[p.b] - sz[p.a]) * p.t;
          if ((z >= 0) !== isFront) continue;
          const depth = clamp01((z + 1) / 2);
          const t0 = Math.max(0, p.t - 0.3);
          const tx = sx[p.a] + (sx[p.b] - sx[p.a]) * t0, ty = sy[p.a] + (sy[p.b] - sy[p.a]) * t0;
          const fade = Math.sin(Math.PI * clamp01(p.t)) * 0.6 + 0.4;
          ctx.lineCap = "round";
          ctx.strokeStyle = rgba(p.color, 0.22 * fade * e); ctx.lineWidth = 5 * k; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
          ctx.strokeStyle = rgba(p.color, (0.55 + 0.4 * depth) * fade * e); ctx.lineWidth = 1.6 * k; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
          ctx.fillStyle = rgba(p.color, 0.2 * e); ctx.beginPath(); ctx.arc(x, y, 8 * k, 0, 6.2832); ctx.fill();
          ctx.fillStyle = rgba(mix(p.color, [255, 255, 255], 0.55), (0.7 + 0.3 * depth) * e); ctx.beginPath(); ctx.arc(x, y, (1.8 + 1.4 * depth) * k, 0, 6.2832); ctx.fill();
        }

        /* keyword pins */
        const labelSize = Math.max(11, R * 0.07);
        for (let i = 0; i < LABELS.length; i++) {
          if ((laz[i] >= 0) !== isFront) continue;
          const eL = easeOut((now - start - 700 - i * 90) / 1100);
          if (eL <= 0 && !reduceMotion) continue;
          const el = reduceMotion ? 1 : eL;
          const depth = clamp01((laz[i] + 1) / 2);
          const col = tones[LABELS[i].tone];
          const a = (0.28 + 0.72 * depth) * el;
          ctx.strokeStyle = rgba(col, 0.5 * a); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(lax[i], lay[i]); ctx.lineTo(ltx[i], lty[i]); ctx.stroke();
          ctx.fillStyle = rgba(col, a); ctx.beginPath(); ctx.arc(lax[i], lay[i], 2.4 * k + 0.6, 0, 6.2832); ctx.fill();
          ctx.fillStyle = rgba(col, 0.2 * a); ctx.beginPath(); ctx.arc(lax[i], lay[i], 7 * k, 0, 6.2832); ctx.fill();
          const fs = labelSize * (0.82 + 0.3 * depth);
          ctx.font = `600 ${fs.toFixed(1)}px "Space Grotesk", Arial, sans-serif`;
          ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.lineJoin = "round";
          ctx.lineWidth = 4; ctx.strokeStyle = rgba(bg, 0.85 * a);
          ctx.strokeText(LABELS[i].text, ltx[i] + 6, lty[i]);
          ctx.fillStyle = rgba(mix(col, fg, 0.35), a);
          ctx.fillText(LABELS[i].text, ltx[i] + 6, lty[i]);
        }

        /* core mark, drawn between the back and front halves */
        if (!isFront) {
          const breathe = reduceMotion ? 1 : 1 + 0.02 * Math.sin(time * 1.6);
          const hole = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
          hole.addColorStop(0, rgba(bg, 0.92 * e)); hole.addColorStop(0.7, rgba(bg, 0.55 * e)); hole.addColorStop(1, rgba(bg, 0));
          ctx.fillStyle = hole; ctx.beginPath(); ctx.arc(cx, cy, R * 0.5, 0, 6.2832); ctx.fill();

          if (pulseT >= 0 && pulseT < 1.6) {
            const f = pulseT / 1.6;
            ctx.strokeStyle = rgba(lime, 0.6 * (1 - f)); ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(cx, cy, R * (0.3 + 1.2 * easeOut(f)), 0, 6.2832); ctx.stroke();
          }

          const fs = R * 0.5 * breathe;
          ctx.font = `700 ${fs.toFixed(1)}px "Space Grotesk", Arial, sans-serif`;
          ctx.textBaseline = "middle"; ctx.textAlign = "left";
          const wU = ctx.measureText("U").width, wDot = ctx.measureText("•").width * 0.8;
          const x0 = cx - (wU + wDot) / 2;
          ctx.shadowColor = rgba(lime, 0.55 * e); ctx.shadowBlur = 28 * k;
          ctx.fillStyle = rgba(fg, e); ctx.fillText("U", x0, cy + fs * 0.03);
          ctx.fillStyle = rgba(lime, e); ctx.font = `700 ${(fs * 0.8).toFixed(1)}px "Space Grotesk", Arial, sans-serif`; ctx.fillText("•", x0 + wU, cy + fs * 0.03);
          ctx.shadowBlur = 0; ctx.shadowColor = "transparent";
        }
      }
    };

    /* ---------- loop control ---------- */
    let raf = 0;
    let visible = true;
    const loop = (now: number) => {
      draw(now);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const run = () => { if (!raf && !reduceMotion) { last = performance.now(); raf = requestAnimationFrame(loop); } };

    resize();
    for (let i = 0; i < 3; i++) spawnPacket();
    if (reduceMotion) draw(start + 5000); else run();

    const resizeObserver = new ResizeObserver(() => { resize(); if (reduceMotion) draw(start + 5000); });
    resizeObserver.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) run(); }, { threshold: 0 });
    visibility.observe(wrap);

    const onMove = (ev: PointerEvent) => {
      if (reduceMotion) return;
      const rect = canvas.getBoundingClientRect();
      if (ev.pointerType === "mouse") {
        yawOffT = (ev.clientX / window.innerWidth - 0.5) * 1.1;
        tiltT = 0.32 + (ev.clientY / window.innerHeight - 0.5) * 0.5;
      }
      mx = ev.clientX - rect.left; my = ev.clientY - rect.top;
      if (mx < 0 || my < 0 || mx > rect.width || my > rect.height) { mx = -9999; my = -9999; }
    };
    const onLeave = () => { mx = -9999; my = -9999; };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibility.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const handlePointerDown = (_event: ReactPointerEvent<HTMLDivElement>) => burstRef.current();

  return (
    <div
      ref={wrapRef}
      className="hero-orb"
      role="img"
      aria-label="Animated 3D network globe with React, Node.js, Java, Laravel, Express.js, MySQL, PostgreSQL, Redis, MongoDB,  orbiting a U monogram"
      onPointerDown={handlePointerDown}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <p className="orb-hint" aria-hidden="true">
        <span className="hint-mouse">Move your cursor <i>·</i> Click to send a transaction</span>
        <span className="hint-touch">Tap to send a transaction</span>
      </p>
    </div>
  );
}
