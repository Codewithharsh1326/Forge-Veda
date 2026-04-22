import { motion } from "framer-motion";

const CircuitBackground = () => {
  const nodes = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 2,
  }));

  const connections = [
    { x1: 20, y1: 30, x2: 45, y2: 25 },
    { x1: 45, y1: 25, x2: 70, y2: 35 },
    { x1: 70, y1: 35, x2: 85, y2: 50 },
    { x1: 30, y1: 60, x2: 55, y2: 55 },
    { x1: 55, y1: 55, x2: 75, y2: 65 },
    { x1: 15, y1: 45, x2: 40, y2: 50 },
    { x1: 40, y1: 50, x2: 60, y2: 45 },
    { x1: 60, y1: 45, x2: 80, y2: 40 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden opacity-40">
      {/* Grid pattern */}
      <div className="absolute inset-0 node-graph-bg" />

      {/* Animated connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((conn, i) => (
          <motion.line
            key={i}
            x1={`${conn.x1}%`}
            y1={`${conn.y1}%`}
            x2={`${conn.x2}%`}
            y2={`${conn.y2}%`}
            stroke="hsl(185 75% 48% / 0.3)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              ease: "easeOut",
            }}
          />
        ))}
      </svg>

      {/* Animated nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: node.size,
            height: node.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0.3, 0.7, 0.3], scale: 1 }}
          transition={{
            opacity: {
              duration: 3,
              repeat: Infinity,
              delay: node.delay,
            },
            scale: {
              duration: 0.5,
              delay: node.delay,
            },
          }}
        />
      ))}

      {/* Central glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
    </div>
  );
};

export default CircuitBackground;
