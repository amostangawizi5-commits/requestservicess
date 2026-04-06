import React, { useEffect, useRef } from 'react';

const BackgroundParticles = () => {
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    let animationFrameId = 0;
    let particles = [];
    const connectionColor = { red: 37, green: 99, blue: 235 };
    const particleColor = { red: 59, green: 130, blue: 246 };
    const glowColor = { red: 147, green: 197, blue: 253 };

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const count = window.innerWidth < 768 ? 52 : 92;

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: Math.random() * 0.24 - 0.12,
        speedY: Math.random() * 0.24 - 0.12,
        alpha: Math.random() * 0.28 + 0.14,
      }));
    };

    const drawConnections = () => {
      for (let index = 0; index < particles.length; index += 1) {
        for (let compareIndex = index + 1; compareIndex < particles.length; compareIndex += 1) {
          const first = particles[index];
          const second = particles[compareIndex];
          const dx = first.x - second.x;
          const dy = first.y - second.y;
          const distance = Math.hypot(dx, dy);

          if (distance > 170) {
            continue;
          }

          context.beginPath();
          context.strokeStyle = `rgba(${connectionColor.red}, ${connectionColor.green}, ${connectionColor.blue}, ${0.34 - distance / 650})`;
          context.lineWidth = 1.15;
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.stroke();
        }
      }
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'rgba(191, 219, 254, 0.18)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        const pointer = pointerRef.current;
        if (pointer.active) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 180 && distance > 0) {
            const force = (180 - distance) / 1800;
            particle.x += (dx / distance) * force * 22;
            particle.y += (dy / distance) * force * 22;
          }
        }

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        context.beginPath();
        context.fillStyle = `rgba(${particleColor.red}, ${particleColor.green}, ${particleColor.blue}, ${particle.alpha + 0.3})`;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.fillStyle = `rgba(${glowColor.red}, ${glowColor.green}, ${glowColor.blue}, ${particle.alpha * 0.5})`;
        context.arc(particle.x, particle.y, particle.radius * 2.4, 0, Math.PI * 2);
        context.fill();
      });

      drawConnections();

      animationFrameId = window.requestAnimationFrame(draw);
    };

    const handleResize = () => {
      setCanvasSize();
      createParticles();
    };

    const handlePointerMove = (event) => {
      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
        active: true,
      };
    };

    const handlePointerLeave = () => {
      pointerRef.current = {
        x: -9999,
        y: -9999,
        active: false,
      };
    };

    setCanvasSize();
    createParticles();
    draw();

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="background-particles" aria-hidden="true" />;
};

export default BackgroundParticles;
