import { useEffect, useRef } from "react";

interface GridNode {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const SplashCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const nodesRef = useRef<GridNode[]>([]);
  const animRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cols = 0;
    let rows = 0;
    const spacing = 50;

    const buildGrid = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.ceil(canvas.width / spacing) + 2;
      rows = Math.ceil(canvas.height / spacing) + 2;
      const offsetX = (canvas.width - (cols - 1) * spacing) / 2;
      const offsetY = (canvas.height - (rows - 1) * spacing) / 2;

      nodesRef.current = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = offsetX + c * spacing;
          const by = offsetY + r * spacing;
          nodesRef.current.push({ baseX: bx, baseY: by, x: bx, y: by, vx: 0, vy: 0 });
        }
      }
    };

    buildGrid();
    window.addEventListener("resize", buildGrid);

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const animate = () => {
      timeRef.current += 0.008;
      const t = timeRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const nodes = nodesRef.current;

      // Update positions — wave + mouse repulsion
      nodes.forEach((n) => {
        // Ambient wave
        const waveX = Math.sin(t + n.baseY * 0.008) * 4;
        const waveY = Math.cos(t * 0.7 + n.baseX * 0.006) * 4;

        let targetX = n.baseX + waveX;
        let targetY = n.baseY + waveY;

        // Mouse repulsion
        const dx = n.baseX - mouse.x;
        const dy = n.baseY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 160;
        if (dist < radius && dist > 0) {
          const force = ((radius - dist) / radius) ** 2;
          targetX += (dx / dist) * force * 45;
          targetY += (dy / dist) * force * 45;
        }

        n.vx += (targetX - n.x) * 0.08;
        n.vy += (targetY - n.y) * 0.08;
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx;
        n.y += n.vy;
      });

      // Draw grid lines (horizontal)
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const n = nodes[r * cols + c];
          if (c === 0) ctx.moveTo(n.x, n.y);
          else ctx.lineTo(n.x, n.y);
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw grid lines (vertical)
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const n = nodes[r * cols + c];
          if (r === 0) ctx.moveTo(n.x, n.y);
          else ctx.lineTo(n.x, n.y);
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw dots at intersections near mouse with enhanced glow
      nodes.forEach((n) => {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250) {
          const power = Math.pow((250 - dist) / 250, 2);
          const alpha = power * 0.8; // Increased from 0.35
          const size = 1.2 + power * 1.5; // Dynamic sizing
          
          ctx.beginPath();
          ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
          
          // Add glow
          ctx.shadowBlur = 15 * power;
          ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
          
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
          
          // Reset shadow for next draw calls
          ctx.shadowBlur = 0;
        }
      });

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", buildGrid);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    />
  );
};

export default SplashCanvas;
