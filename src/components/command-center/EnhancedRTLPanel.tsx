import { useState } from "react";
import { motion } from "framer-motion";
import {
  Copy, Download, FileCode, Layers, Box, Cpu, Database, ArrowRight,
  ChevronLeft, Check, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Architecture, RTLResult, ChipSpec } from "@/hooks/useChipArchitect";
import { ChipType } from "@/lib/chipTypes";
import { toast } from "sonner";
import SymbolicRTL from "./SymbolicRTL";

interface EnhancedRTLPanelProps {
  chipType: ChipType;
  spec: ChipSpec;
  architecture: Architecture;
  rtlResult: RTLResult | null;
  onBack: () => void;
  isLoading: boolean;
}

const EnhancedRTLPanel = ({
  chipType,
  spec,
  architecture,
  rtlResult,
  onBack,
  isLoading
}: EnhancedRTLPanelProps) => {
  const [copiedModule, setCopiedModule] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<string>("top");

  const copyToClipboard = (text: string, moduleName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedModule(moduleName);
    toast.success(`${moduleName} copied to clipboard`);
    setTimeout(() => setCopiedModule(null), 2000);
  };

  const exportAllRTL = () => {
    if (!rtlResult) return;

    const files: Record<string, string> = {
      [`${architecture.id}_top.sv`]: rtlResult.top_module,
      [`${architecture.id}_tb.sv`]: rtlResult.testbench,
    };

    rtlResult.modules.forEach(mod => {
      files[`${mod.name}.sv`] = mod.code;
    });

    // Create a combined file for download
    let combined = `// ForgeVeda RTL Export - ${architecture.name}\n`;
    combined += `// Chip Type: ${chipType.name}\n`;
    combined += `// Generated: ${new Date().toISOString()}\n`;
    combined += `// Spec: ${spec.precision || 'N/A'} @ ${spec.powerLimit}W\n\n`;

    Object.entries(files).forEach(([filename, content]) => {
      combined += `// ========== ${filename} ==========\n\n`;
      combined += content;
      combined += '\n\n';
    });

    const blob = new Blob([combined], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${architecture.id}_rtl_bundle.sv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("RTL bundle exported");
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Datapath": return "bg-primary/20 text-primary border-primary/30";
      case "Memory": return "bg-accent/20 text-accent-foreground border-accent/30";
      case "Compute": return "bg-success/20 text-success border-success/30";
      case "Control": return "bg-warning/20 text-warning border-warning/30";
      case "Interface": return "bg-secondary text-secondary-foreground border-secondary";
      case "Power": return "bg-muted text-muted-foreground border-muted";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <div className="relative w-24 h-24 mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
              />
              <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                <FileCode className="w-8 h-8 text-primary" />
              </div>
            </div>
          </motion.div>
          <h2 className="text-xl font-semibold mb-2">AI Generating RTL</h2>
          <p className="text-muted-foreground max-w-md">
            Creating synthesizable SystemVerilog for {architecture.name}...
          </p>
        </div>
      </div>
    );
  }

  if (!rtlResult) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Cpu className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No RTL generated yet</p>
          <p className="text-sm">Generate RTL from the Architecture panel</p>
        </div>
      </div>
    );
  }

  const totalLines = rtlResult.modules.reduce((sum, m) => sum + m.lines, 0);

  return (
    <div className="h-full p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back to Architecture</span>
          </button>
          <h1 className="text-2xl font-semibold mb-1">RTL Generation</h1>
          <p className="text-muted-foreground">
            {rtlResult.modules.length} modules • {totalLines.toLocaleString()} lines • {architecture.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="gap-2" onClick={exportAllRTL}>
            <Download className="w-4 h-4" />
            Export All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module List */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Module Hierarchy</h3>
          </div>

          <div className="space-y-2">
            {/* Top Module */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setActiveModule("top")}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${activeModule === "top"
                ? "bg-primary/20 border border-primary/30"
                : "bg-muted/30 hover:bg-muted/50"
                }`}
            >
              <div className="flex items-center gap-3">
                <Box className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm">{architecture.id}_top.sv</span>
              </div>
              <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary border border-primary/30">
                Top
              </span>
            </motion.button>

            {/* Sub-modules */}
            {rtlResult.modules.map((mod, index) => (
              <motion.button
                key={mod.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index + 1) * 0.05 }}
                onClick={() => setActiveModule(mod.name)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${activeModule === mod.name
                  ? "bg-primary/20 border border-primary/30"
                  : "bg-muted/30 hover:bg-muted/50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FileCode className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{mod.name}.sv</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{mod.lines}</span>
                  <span className={`w-2 h-2 rounded-full ${mod.status === "ready" ? "bg-success" : "bg-warning"
                    }`} />
                </div>
              </motion.button>
            ))}

            {/* Testbench */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (rtlResult.modules.length + 1) * 0.05 }}
              onClick={() => setActiveModule("testbench")}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${activeModule === "testbench"
                ? "bg-primary/20 border border-primary/30"
                : "bg-muted/30 hover:bg-muted/50"
                }`}
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-sm">{architecture.id}_tb.sv</span>
              </div>
              <span className="px-2 py-0.5 rounded text-xs bg-success/20 text-success border border-success/30">
                TB
              </span>
            </motion.button>
          </div>

          {/* Stats */}
          <div className="mt-6 pt-4 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Modules:</span>
              <span className="font-mono">{rtlResult.modules.length + 2}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Lines:</span>
              <span className="font-mono">{totalLines.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ready:</span>
              <span className="font-mono text-success">
                {rtlResult.modules.filter(m => m.status === 'ready').length} / {rtlResult.modules.length}
              </span>
            </div>
          </div>
        </div>

        {/* Code/Symbolic View */}
        <div className="lg:col-span-2 glass-panel p-6 h-full">
          <Tabs defaultValue="code" className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="code" className="gap-2">
                  <FileCode className="w-4 h-4" />
                  Source Code
                </TabsTrigger>
                <TabsTrigger value="symbolic" className="gap-2">
                  <Cpu className="w-4 h-4" />
                  Symbolic RTL
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                {/* Copy Button (only for code view context really, but we can keep it generally or hide it based on tab if we had state tracking tabs) */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    const code = activeModule === "top"
                      ? rtlResult.top_module
                      : activeModule === "testbench"
                        ? rtlResult.testbench
                        : rtlResult.modules.find(m => m.name === activeModule)?.code || '';
                    copyToClipboard(code, activeModule);
                  }}
                >
                  {copiedModule === activeModule ? (
                    <>
                      <Check className="w-4 h-4 text-success" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </div>

            <TabsContent value="code" className="flex-1 mt-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <Box className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm opacity-70">
                  {activeModule === "top"
                    ? `${architecture.id}_top.sv`
                    : activeModule === "testbench"
                      ? `${architecture.id}_tb.sv`
                      : `${activeModule}.sv`}
                </span>
              </div>
              <div className="bg-background rounded-lg p-4 overflow-auto h-[500px]">
                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                  {activeModule === "top"
                    ? rtlResult.top_module
                    : activeModule === "testbench"
                      ? rtlResult.testbench
                      : rtlResult.modules.find(m => m.name === activeModule)?.code || 'No code available'}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="symbolic" className="flex-1 mt-0 overflow-hidden">
              <div className="h-[550px] overflow-auto pr-2">
                <SymbolicRTL rtlResult={rtlResult} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dependencies */}
      <div className="glass-panel p-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Module Dependencies</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-2 rounded-lg bg-primary/20 border border-primary/30 font-mono text-sm">
            {architecture.id}_top
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          {rtlResult.modules.slice(0, 5).map((mod, index) => (
            <motion.div
              key={mod.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className={`px-3 py-2 rounded-lg font-mono text-sm ${getTypeColor(mod.type)}`}>
                {mod.name}
              </div>
              {index < Math.min(4, rtlResult.modules.length - 1) && (
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              )}
            </motion.div>
          ))}
          {rtlResult.modules.length > 5 && (
            <span className="text-sm text-muted-foreground">
              +{rtlResult.modules.length - 5} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedRTLPanel;
