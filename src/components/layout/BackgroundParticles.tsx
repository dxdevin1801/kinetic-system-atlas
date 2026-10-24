import { useEffect, useRef } from "react";

/** Gentle drifting dust in the app background. Pure canvas, very cheap. */
export function BackgroundParticles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pts = Array.from({ length: 46 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.2,
      vx: (Math.random() - 0.5) * 0.00006,
      vy: -0.00003 - Math.random() * 0.00006,
      a: 0.15 + Math.random() * 0.35,
    }));
    const color = () => getComputedStyle(document.documentElement).getPropertyValue("--cyan").trim() || "cyan";

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let last = performance.now();
    let c = color();
    let frame = 0;
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      if (frame++ % 120 === 0) c = color();
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = c;
      for (const p of pts) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y < -0.02) p.y = 1.02;
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-60" />;
}
