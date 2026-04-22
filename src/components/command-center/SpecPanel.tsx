import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Cpu, Zap, Box, Target, AlertCircle, CheckCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SpecPanelProps {
  projectId: string;
  onSpecSubmit: (spec: TargetSpec) => void;
}

export interface TargetSpec {
  tops: number;
  powerLimit: number;
  precision: string;
  useCase: string;
  constraints: string;
  memoryBandwidth?: number;
  targetNode?: string;
}

const SpecPanel = ({ projectId, onSpecSubmit }: SpecPanelProps) => {
  const [spec, setSpec] = useState<TargetSpec>({
    tops: 50,
    powerLimit: 5.0,
    precision: "INT8",
    useCase: "",
    constraints: "",
    memoryBandwidth: 256,
    targetNode: "7nm",
  });
  
  const [gapAnalysis, setGapAnalysis] = useState<{
    status: "idle" | "running" | "complete";
    gaps: { field: string; issue: string; severity: "warning" | "error" | "info" }[];
  }>({ status: "idle", gaps: [] });

  const runGapAnalysis = () => {
    setGapAnalysis({ status: "running", gaps: [] });
    
    // Simulate gap analysis
    setTimeout(() => {
      const gaps: { field: string; issue: string; severity: "warning" | "error" | "info" }[] = [];
      
      if (spec.tops > 100 && spec.powerLimit < 10) {
        gaps.push({ 
          field: "Power Budget", 
          issue: "100+ TOPS typically requires >10W power envelope",
          severity: "error"
        });
      }
      
      if (spec.precision === "FP32" && spec.tops > 20) {
        gaps.push({ 
          field: "Precision/Performance", 
          issue: "FP32 at >20 TOPS may require significant area",
          severity: "warning"
        });
      }
      
      if (!spec.useCase) {
        gaps.push({ 
          field: "Use Case", 
          issue: "Defining use case helps optimize architecture selection",
          severity: "info"
        });
      }

      if (spec.memoryBandwidth && spec.memoryBandwidth < spec.tops * 4) {
        gaps.push({
          field: "Memory Bandwidth",
          issue: `${spec.tops} TOPS typically needs ~${spec.tops * 4} GB/s bandwidth`,
          severity: "warning"
        });
      }
      
      setGapAnalysis({ status: "complete", gaps });
    }, 1500);
  };

  const handleSubmit = () => {
    onSpecSubmit(spec);
  };

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1 flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            Hardware Specification
          </h1>
          <p className="text-muted-foreground">
            Define your target specifications for <span className="font-mono text-foreground">{projectId}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spec Input Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 space-y-6"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Target Specifications
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tops" className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-muted-foreground" />
                  Performance (TOPS)
                </Label>
                <Input
                  id="tops"
                  type="number"
                  value={spec.tops}
                  onChange={(e) => setSpec({ ...spec, tops: parseFloat(e.target.value) || 0 })}
                  className="bg-background font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="power" className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  Power Limit (W)
                </Label>
                <Input
                  id="power"
                  type="number"
                  step="0.1"
                  value={spec.powerLimit}
                  onChange={(e) => setSpec({ ...spec, powerLimit: parseFloat(e.target.value) || 0 })}
                  className="bg-background font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precision">Precision</Label>
                <Select value={spec.precision} onValueChange={(v) => setSpec({ ...spec, precision: v })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INT4">INT4</SelectItem>
                    <SelectItem value="INT8">INT8</SelectItem>
                    <SelectItem value="FP16">FP16</SelectItem>
                    <SelectItem value="BF16">BF16</SelectItem>
                    <SelectItem value="FP32">FP32</SelectItem>
                    <SelectItem value="Mixed">Mixed Precision</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="node">Target Node</Label>
                <Select value={spec.targetNode} onValueChange={(v) => setSpec({ ...spec, targetNode: v })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="28nm">28nm</SelectItem>
                    <SelectItem value="16nm">16nm</SelectItem>
                    <SelectItem value="7nm">7nm</SelectItem>
                    <SelectItem value="5nm">5nm</SelectItem>
                    <SelectItem value="3nm">3nm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bandwidth" className="flex items-center gap-2">
                <Box className="w-4 h-4 text-muted-foreground" />
                Memory Bandwidth (GB/s)
              </Label>
              <Input
                id="bandwidth"
                type="number"
                value={spec.memoryBandwidth}
                onChange={(e) => setSpec({ ...spec, memoryBandwidth: parseFloat(e.target.value) || 0 })}
                className="bg-background font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="useCase">Primary Use Case</Label>
              <Select value={spec.useCase} onValueChange={(v) => setSpec({ ...spec, useCase: v })}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select use case..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inference">AI Inference</SelectItem>
                  <SelectItem value="training">AI Training</SelectItem>
                  <SelectItem value="edge">Edge Computing</SelectItem>
                  <SelectItem value="datacenter">Data Center</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="mobile">Mobile/Embedded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="constraints">Additional Constraints</Label>
              <Textarea
                id="constraints"
                placeholder="e.g., Must support AXI4 interface, thermal envelope 80°C, legacy IP compatibility..."
                value={spec.constraints}
                onChange={(e) => setSpec({ ...spec, constraints: e.target.value })}
                className="bg-background min-h-[100px]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={runGapAnalysis} variant="secondary" className="gap-2">
                <Play className="w-4 h-4" />
                Run Gap Analysis
              </Button>
              <Button onClick={handleSubmit} className="gap-2 flex-1">
                <CheckCircle className="w-4 h-4" />
                Save & Evaluate Architectures
              </Button>
            </div>
          </motion.div>

          {/* Gap Analysis Results */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Gap Analysis
            </h2>

            {gapAnalysis.status === "idle" && (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Click "Run Gap Analysis" to validate your specifications</p>
              </div>
            )}

            {gapAnalysis.status === "running" && (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground">Analyzing specifications...</p>
              </div>
            )}

            {gapAnalysis.status === "complete" && (
              <div className="space-y-4">
                {gapAnalysis.gaps.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
                    <p className="font-medium text-success">All specifications validated</p>
                    <p className="text-sm text-muted-foreground mt-1">No gaps or conflicts detected</p>
                  </div>
                ) : (
                  gapAnalysis.gaps.map((gap, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        gap.severity === "error" 
                          ? "bg-destructive/10 border-destructive/30" 
                          : gap.severity === "warning"
                          ? "bg-warning/10 border-warning/30"
                          : "bg-primary/10 border-primary/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                          gap.severity === "error" 
                            ? "text-destructive" 
                            : gap.severity === "warning"
                            ? "text-warning"
                            : "text-primary"
                        }`} />
                        <div>
                          <p className={`font-medium ${
                            gap.severity === "error" 
                              ? "text-destructive" 
                              : gap.severity === "warning"
                              ? "text-warning"
                              : "text-primary"
                          }`}>
                            {gap.field}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{gap.issue}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Spec Summary */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Current Spec Summary</h3>
              <div className="font-mono text-sm bg-background/50 rounded-lg p-4 overflow-auto">
                <pre className="text-xs">
{JSON.stringify({
  project_id: projectId,
  target_spec: {
    TOPS: spec.tops,
    Power_Limit_W: spec.powerLimit,
    Precision: spec.precision,
    Memory_BW_GBs: spec.memoryBandwidth,
    Target_Node: spec.targetNode,
    Use_Case: spec.useCase || "undefined",
  }
}, null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SpecPanel;
