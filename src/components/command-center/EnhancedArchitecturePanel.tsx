import { motion } from "framer-motion";
import {
  Download, TrendingUp, AlertTriangle, CheckCircle2, Loader2,
  ChevronLeft, Sparkles, Layers, Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Architecture, ChipSpec } from "@/hooks/useChipArchitect";
import { ChipType } from "@/lib/chipTypes";

interface EnhancedArchitecturePanelProps {
  chipType: ChipType;
  spec: ChipSpec;
  architectures: Architecture[];
  selectedArchitecture: Architecture | null;
  onSelectArchitecture: (arch: Architecture) => void;
  onBack: () => void;
  isLoading: boolean;
  onGenerateRTL: () => void;
}

const EnhancedArchitecturePanel = ({
  chipType,
  spec,
  architectures,
  selectedArchitecture,
  onSelectArchitecture,
  onBack,
  isLoading,
  onGenerateRTL
}: EnhancedArchitecturePanelProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "recommended":
        return "bg-success/20 text-success border-success/30";
      case "viable":
        return "bg-primary/20 text-primary border-primary/30";
      case "feasible":
        return "bg-muted text-muted-foreground border-border";
      case "warning":
        return "bg-warning/20 text-warning border-warning/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const exportArchitectures = () => {
    const data = {
      chip_type: chipType.id,
      spec,
      architectures: architectures.map(a => ({
        id: a.id,
        name: a.name,
        score: a.score,
        bottleneck: a.bottleneck,
        ppa: a.ppa,
        status: a.status,
        components: a.components,
        rationale: a.rationale,
      })),
      generated_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chipType.id}_architecture_evaluation.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && architectures.length === 0) {
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
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
          </motion.div>
          <h2 className="text-xl font-semibold mb-2">AI Generating Architectures</h2>
          <p className="text-muted-foreground max-w-md">
            Analyzing {chipType.name} specifications and generating optimal architecture variants...
          </p>
        </div>
      </div>
    );
  }

  if (architectures.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No architectures generated</p>
          <p className="text-sm">Submit your specifications to generate architecture candidates</p>
        </div>
      </div>
    );
  }

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
            <span className="text-sm">Back to Spec</span>
          </button>
          <h1 className="text-2xl font-semibold mb-1">Architecture Evaluation</h1>
          <p className="text-muted-foreground">
            {architectures.length} architectures for {chipType.name} • {spec.precision} •
            {spec.performance?.value ? ` ${spec.performance.value} ${spec.performance.unit} •` : ''} ≤{spec.powerLimit}W
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedArchitecture && (
            <Button
              onClick={onGenerateRTL}
              className="gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Cpu className="w-4 h-4" />
              )}
              Generate RTL
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={exportArchitectures}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Decision Matrix */}
      <div className="glass-panel overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Rank</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Architecture</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Score</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Power (W)</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Area (mm²)</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Performance</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Bottleneck</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {architectures.map((arch, index) => (
                <motion.tr
                  key={arch.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onSelectArchitecture(arch)}
                  className={`border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer ${selectedArchitecture?.id === arch.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
                    }`}
                >
                  <td className="px-4 py-4">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${selectedArchitecture?.id === arch.id ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                      {selectedArchitecture?.id === arch.id ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium">{arch.name}</span>
                    {selectedArchitecture?.id === arch.id && (
                      <span className="ml-2 text-xs text-primary">Selected</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                          style={{ width: `${(arch.score || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">{(arch.score || 0).toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm">
                    <span className={(arch.ppa?.power || 0) > (spec.powerLimit || 5) ? "text-warning" : ""}>
                      {(arch.ppa?.power || 0).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm">{arch.ppa?.area || 'N/A'}</td>
                  <td className="px-4 py-4 font-mono text-sm">
                    <div className="flex items-center gap-1">
                      {arch.ppa?.performance || 'N/A'}
                      {(arch.ppa?.performance || 0) >= (spec.performance?.value || 50) && (
                        <TrendingUp className="w-3 h-3 text-success" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{arch.bottleneck}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(arch.status)}`}>
                      {arch.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Architecture Details */}
      {selectedArchitecture && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4">Components</h3>
            <div className="space-y-2">
              {selectedArchitecture.components?.map((comp, i) => (
                <motion.div
                  key={comp.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{comp.name}</span>
                      {spec.explicitComponents?.some(c => comp.name.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(comp.name.toLowerCase())) ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> System Component
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Added
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{comp.description}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary border border-primary/30">
                    {comp.type}
                  </span>
                </motion.div>
              )) || (
                  <p className="text-muted-foreground text-sm">No component details available</p>
                )}
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4">Design Rationale</h3>
            <div className="space-y-4">
              {selectedArchitecture.rationale && (
                <p className="text-sm text-muted-foreground">{selectedArchitecture.rationale}</p>
              )}
              {selectedArchitecture.dataflow && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Dataflow</h4>
                  <p className="text-sm text-muted-foreground">{selectedArchitecture.dataflow}</p>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <div className="flex items-start gap-3">
                  {selectedArchitecture.status === 'recommended' ? (
                    <>
                      <TrendingUp className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-success mb-1">Recommended Architecture</p>
                        <p className="text-sm text-muted-foreground">
                          Best PPA balance for your specifications.
                        </p>
                      </div>
                    </>
                  ) : selectedArchitecture.status === 'warning' ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-warning mb-1">Requires Attention</p>
                        <p className="text-sm text-muted-foreground">
                          May exceed constraints. Review bottleneck carefully.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-primary mb-1">Viable Option</p>
                        <p className="text-sm text-muted-foreground">
                          Meets specifications with acceptable trade-offs.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedArchitecturePanel;
