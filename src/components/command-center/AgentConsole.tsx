import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Terminal, ChevronDown, ChevronUp, Cpu, TestTube, Layers, FileText, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  agent: string;
  icon: typeof Bot;
  message: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "action";
}

const AgentConsole = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const agentIcons: Record<string, typeof Bot> = {
    "Gap Analysis": FileText,
    "Architecture": Layers,
    "RTL Planning": Cpu,
    "Verification": TestTube,
    "Sourcing": Truck,
    "System": Terminal,
  };

  const initialLogs: LogEntry[] = [
    {
      id: "1",
      agent: "System",
      icon: Terminal,
      message: "ForgeVeda initialized. All agents ready.",
      timestamp: "10:42:01",
      type: "info",
    },
    {
      id: "2",
      agent: "Gap Analysis",
      icon: FileText,
      message: "Parsing specification: INT8 inference engine, 50 TOPS, ≤5W",
      timestamp: "10:42:02",
      type: "action",
    },
    {
      id: "3",
      agent: "Gap Analysis",
      icon: FileText,
      message: "Spec complete. No missing constraints detected.",
      timestamp: "10:42:03",
      type: "success",
    },
    {
      id: "4",
      agent: "Architecture",
      icon: Layers,
      message: "Evaluating 12 candidate architectures...",
      timestamp: "10:42:04",
      type: "action",
    },
    {
      id: "5",
      agent: "Architecture",
      icon: Layers,
      message: "Systolic Array ranked #1 (score: 0.92)",
      timestamp: "10:42:08",
      type: "success",
    },
    {
      id: "6",
      agent: "Architecture",
      icon: Layers,
      message: "Warning: Hybrid SIMD exceeds power envelope (5.5W > 5W)",
      timestamp: "10:42:09",
      type: "warning",
    },
    {
      id: "7",
      agent: "Verification",
      icon: TestTube,
      message: "Generating testbench templates for top 3 architectures...",
      timestamp: "10:42:10",
      type: "action",
    },
  ];

  useEffect(() => {
    setLogs(initialLogs);
  }, []);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "action":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <aside className="w-80 bg-sidebar border-l border-sidebar-border flex flex-col">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 border-b border-sidebar-border hover:bg-sidebar-accent/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sidebar-foreground">Agent Console</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Logs */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 overflow-auto"
          >
            <div className="p-3 space-y-2">
              {logs.map((log, index) => {
                const IconComponent = agentIcons[log.agent] || Terminal;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg bg-card/50 border border-border/50"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <IconComponent className={cn("w-4 h-4", getTypeStyles(log.type))} />
                      <span className="text-xs font-medium text-muted-foreground">
                        {log.agent}
                      </span>
                      <span className="text-xs text-muted-foreground/60 ml-auto font-mono">
                        {log.timestamp}
                      </span>
                    </div>
                    <p className={cn("text-sm", getTypeStyles(log.type))}>
                      {log.message}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 text-sm text-muted-foreground">
          <Terminal className="w-4 h-4" />
          <span className="opacity-60">Type to query agents...</span>
        </div>
      </div>
    </aside>
  );
};

export default AgentConsole;
