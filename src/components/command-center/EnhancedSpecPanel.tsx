import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Cpu, Zap, Box, Target, AlertCircle, CheckCircle, Play,
  Loader2, ChevronLeft, Sparkles, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChipType } from "@/lib/chipTypes";
import { ChipSpec, GapAnalysisResult } from "@/hooks/useChipArchitect";
import SpecFileUpload, { ParsedSpecification } from "./SpecFileUpload";
import SpecVisualization from "./SpecVisualization";

interface EnhancedSpecPanelProps {
  chipType: ChipType;
  onSpecSubmit: (spec: ChipSpec) => void;
  onBack: () => void;
  isLoading: boolean;
  gapAnalysis: GapAnalysisResult | null;
  onRunGapAnalysis: (spec: ChipSpec) => void;
  uploadedSpecs: ParsedSpecification[];
  onSpecsUploaded: (specs: ParsedSpecification[]) => void;
}

const EnhancedSpecPanel = ({
  chipType,
  onSpecSubmit,
  onBack,
  isLoading,
  gapAnalysis,
  onRunGapAnalysis,
  uploadedSpecs,
  onSpecsUploaded
}: EnhancedSpecPanelProps) => {
  /*
     REFACTOR NOTE:
     User requested removal of manual inputs in favor of file-based flow for everything except:
     1. Performance Goal (TOPS/MIPS)
     2. File Upload
     3. Suggestions Panel
  */

  const [spec, setSpec] = useState<ChipSpec>({
    chipType: chipType.id,
    performance: { value: 50, unit: "TOPS" },
    powerLimit: 5.0,
    precision: chipType.specTemplate.precisionOptions[0] || "INT8",
    useCase: "",
    constraints: "",
    memoryBandwidth: 256,
    targetNode: "7nm",
    bitWidth: 32,
  });

  useEffect(() => {
    setSpec(prev => ({ ...prev, chipType: chipType.id }));
  }, [chipType.id]);

  const handleGapAnalysis = () => {
    onRunGapAnalysis(spec);
  };

  const handleSubmit = () => {
    onSpecSubmit(spec);
  };

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back to Chip Selection</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold mb-1">
                {chipType.name} Specification
              </h1>
              <p className="text-muted-foreground">
                Define your target specifications from a datasheet or text file
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spec Input Form (Simplified) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 space-y-6"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Target Goals
            </h2>

            {/* Performance Metric Selector */}
            <div className="space-y-2">
              <Label htmlFor="perf-unit" className="text-sm text-muted-foreground">
                Primary Performance Metric
              </Label>
              <div className="flex gap-4 items-center">
                <div className="w-32">
                  <Select
                    value={spec.performance.unit}
                    onValueChange={(v) => setSpec({ ...spec, performance: { ...spec.performance, unit: v as any } })}
                  >
                    <SelectTrigger id="perf-unit" className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TOPS">TOPS</SelectItem>
                      <SelectItem value="MIPS">MIPS</SelectItem>
                      <SelectItem value="FLOPS">FLOPS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    min={0}
                    placeholder="Target Value"
                    value={spec.performance.value}
                    onChange={(e) => setSpec({ ...spec, performance: { ...spec.performance, value: Math.max(0, parseFloat(e.target.value) || 0) } })}
                    className="bg-background font-mono"
                  />
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-muted/10 rounded-lg p-4 border border-border/50">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Import from Datasheet
              </h3>
              <SpecFileUpload
                existingSpecs={uploadedSpecs}
                onSpecsParsed={onSpecsUploaded}
              />
            </div>

            {/* Suggestions Panel (Replaces old inputs) */}
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                Suggested Specs for {chipType.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Ensure your uploaded spec file includes these key parameters:
              </p>
              <div className="flex flex-wrap gap-2">
                {chipType.suggestions?.map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-background rounded border border-border text-xs text-muted-foreground">
                    {s}
                  </span>
                )) || <span className="text-xs text-muted-foreground">No specific suggestions available.</span>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleGapAnalysis}
                variant="secondary"
                className="gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run Gap Analysis
              </Button>
              <Button
                onClick={handleSubmit}
                className="gap-2 flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate Architectures
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Gap Analysis Results & Visualization */}
          <div className="space-y-6">
            {uploadedSpecs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6"
              >
                <SpecVisualization specifications={uploadedSpecs} />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-6"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Gap Analysis
                {gapAnalysis && (
                  <span className={`ml-auto text-sm font-normal ${gapAnalysis.feasibility_score > 0.7 ? 'text-success' : 'text-warning'
                    }`}>
                    Feasibility: {(gapAnalysis.feasibility_score * 100).toFixed(0)}%
                  </span>
                )}
              </h2>

              <AnimatePresence mode="wait">
                {!gapAnalysis && !isLoading && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Click "Run Gap Analysis" to validate your specifications with AI</p>
                  </motion.div>
                )}

                {isLoading && !gapAnalysis && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">AI analyzing specifications...</p>
                  </motion.div>
                )}

                {gapAnalysis && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
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
                          className={`p-4 rounded-lg border ${gap.severity === "error"
                            ? "bg-destructive/10 border-destructive/30"
                            : gap.severity === "warning"
                              ? "bg-warning/10 border-warning/30"
                              : "bg-primary/10 border-primary/30"
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${gap.severity === "error"
                              ? "text-destructive"
                              : gap.severity === "warning"
                                ? "text-warning"
                                : "text-primary"
                              }`} />
                            <div>
                              <p className={`font-medium ${gap.severity === "error"
                                ? "text-destructive"
                                : gap.severity === "warning"
                                  ? "text-warning"
                                  : "text-primary"
                                }`}>
                                {gap.field}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">{gap.issue}</p>
                              {gap.recommendation && (
                                <p className="text-sm text-foreground/80 mt-2 italic">
                                  💡 {gap.recommendation}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}

                    {gapAnalysis.summary && (
                      <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
                        <p className="text-sm text-muted-foreground">{gapAnalysis.summary}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Default Components Preview */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Default Architecture Components
                </h3>
                <div className="flex flex-wrap gap-2">
                  {chipType.defaultComponents.map((comp) => (
                    <span
                      key={comp.name}
                      className={`px-2 py-1 rounded text-xs border ${comp.required
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-muted border-border text-muted-foreground"
                        }`}
                    >
                      {comp.name.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSpecPanel;
