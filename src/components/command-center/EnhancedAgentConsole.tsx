import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Terminal, ChevronDown, ChevronUp, Cpu, TestTube, Layers, 
  FileText, Truck, AlertCircle, CheckCircle, Loader2, Settings, 
  Code, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentLog } from "@/hooks/useChipArchitect";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface EnhancedAgentConsoleProps {
  logs: AgentLog[];
  isLoading: boolean;
}

const agentIcons: Record<string, typeof Bot> = {
  "Gap Analysis": FileText,
  "Architecture": Layers,
  "RTL Generation": Cpu,
  "RTL Planning": Cpu,
  "Verification": TestTube,
  "Sourcing": Truck,
  "System": Terminal,
};

const EnhancedAgentConsole = ({ logs, isLoading }: EnhancedAgentConsoleProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [devMode, setDevMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "error":
        return "text-destructive";
      case "action":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-3 h-3" />;
      case "warning":
        return <AlertCircle className="w-3 h-3" />;
      case "error":
        return <AlertCircle className="w-3 h-3" />;
      case "action":
        return <Loader2 className="w-3 h-3 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <aside className="w-80 bg-sidebar border-l border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Bot className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sidebar-foreground">Agent Console</span>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-sidebar-accent rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Dev Mode Toggle */}
      <div className="px-4 py-2 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Developer Mode</span>
        </div>
        <Switch 
          checked={devMode} 
          onCheckedChange={setDevMode}
          className="scale-75"
        />
      </div>

      {/* Logs */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <div ref={scrollRef} className="flex-1 overflow-auto p-3 space-y-2">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No agent activity yet</p>
                  <p className="text-xs mt-1">Actions will appear here</p>
                </div>
              ) : (
                logs.map((log, index) => {
                  const IconComponent = agentIcons[log.agent] || Terminal;
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index * 0.02, 0.3) }}
                      className="p-3 rounded-lg bg-card/50 border border-border/50"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <IconComponent className={cn("w-4 h-4", getTypeStyles(log.type))} />
                        <span className="text-xs font-medium text-muted-foreground">
                          {log.agent}
                        </span>
                        <div className={cn("ml-1", getTypeStyles(log.type))}>
                          {getTypeIcon(log.type)}
                        </div>
                        <span className="text-xs text-muted-foreground/60 ml-auto font-mono">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className={cn("text-sm", getTypeStyles(log.type))}>
                        {log.message}
                      </p>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Dev Mode - Raw Data */}
            {devMode && logs.length > 0 && (
              <div className="p-3 border-t border-sidebar-border">
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-2">
                    <Code className="w-3 h-3" />
                    Raw Log Data
                  </summary>
                  <pre className="mt-2 p-2 bg-background rounded text-[10px] overflow-auto max-h-32 font-mono">
                    {JSON.stringify(logs.slice(-5), null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isLoading ? "bg-primary animate-pulse" : "bg-success"
            )} />
            <span>{isLoading ? "Processing..." : "Ready"}</span>
          </div>
          <span className="font-mono">{logs.length} events</span>
        </div>
      </div>
    </aside>
  );
};

export default EnhancedAgentConsole;
