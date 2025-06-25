import { useEffect, useRef, useState } from "react";
import { useAudio } from "@/hooks/use-audio";

interface AudioVisualizerProps {
  width?: number;
  height?: number;
  barCount?: number;
  className?: string;
}

export function AudioVisualizer({ 
  width = 200, 
  height = 60, 
  barCount = 32,
  className = ""
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying, volume } = useAudio();
  const [animationData, setAnimationData] = useState<number[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Initialize animation data
    setAnimationData(new Array(barCount).fill(0));
  }, [barCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!isPlaying) {
        // Fade out animation when not playing
        setAnimationData(prev => prev.map(val => Math.max(0, val * 0.95)));
      } else {
        // Generate pseudo-random animation data when playing
        setAnimationData(prev => prev.map((val, index) => {
          const baseHeight = volume * 0.7;
          const randomFactor = Math.sin(Date.now() * 0.001 + index * 0.5) * 0.3 + 0.7;
          const targetHeight = baseHeight * randomFactor;
          
          // Smooth transition to target height
          return val + (targetHeight - val) * 0.1;
        }));
      }

      // Clear canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Draw bars
      const barWidth = width / barCount;
      
      animationData.forEach((barHeight, index) => {
        const x = index * barWidth;
        const normalizedHeight = Math.max(2, barHeight * height);
        const y = height - normalizedHeight;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, y, 0, height);
        
        if (isPlaying) {
          gradient.addColorStop(0, `hsl(${45 + barHeight * 60}, 80%, 70%)`);
          gradient.addColorStop(1, `hsl(${280 + barHeight * 40}, 60%, 50%)`);
        } else {
          gradient.addColorStop(0, 'hsl(45, 30%, 40%)');
          gradient.addColorStop(1, 'hsl(280, 30%, 30%)');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, Math.max(1, barWidth - 2), normalizedHeight);
        
        // Add glow effect when playing
        if (isPlaying && barHeight > 0.3) {
          ctx.shadowColor = `hsl(${45 + barHeight * 60}, 80%, 70%)`;
          ctx.shadowBlur = 4;
          ctx.fillRect(x + 1, y, Math.max(1, barWidth - 2), normalizedHeight);
          ctx.shadowBlur = 0;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, volume, width, height, barCount, animationData]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`rounded border border-yellow-600/20 bg-gray-900/50 ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}