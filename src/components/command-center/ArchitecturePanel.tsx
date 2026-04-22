import { motion } from "framer-motion";
import { MoreHorizontal, Download, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TargetSpec } from "./SpecPanel";

export interface Architecture {
  id: string;
  name: string;
  score: number;
  bottleneck: string;
  ppa: { power: number; area: number; performance: number };
  status: string;
}

interface ArchitecturePanelProps {
  projectId: string;
  spec?: TargetSpec;
  selectedArchitecture: Architecture | null;
  onSelectArchitecture: (arch: Architecture) => void;
}

const ArchitecturePanel = ({ projectId, spec, selectedArchitecture, onSelectArchitecture }: ArchitecturePanelProps) => {
  const architectures: Architecture[] = [
    {
      id: "systolic_array",
      name: "Systolic Array",
      score: 0.92,
      bottleneck: "SRAM Bandwidth",
      ppa: { power: 4.8, area: 42, performance: 52 },
      status: "recommended",
    },
    {
      id: "npu_mesh",
      name: "NPU Mesh Architecture",
      score: 0.87,
      bottleneck: "NoC Congestion",
      ppa: { power: 5.1, area: 38, performance: 48 },
      status: "viable",
    },
    {
      id: "vector_engine",
      name: "Vector Processing Engine",
      score: 0.81,
      bottleneck: "Memory Hierarchy",
      ppa: { power: 4.5, area: 45, performance: 44 },
      status: "viable",
    },
    {
      id: "dataflow",
      name: "Dataflow Architecture",
      score: 0.76,
      bottleneck: "Scheduling Complexity",
      ppa: { power: 4.2, area: 50, performance: 40 },
      status: "feasible",
    },
    {
      id: "hybrid_simd",
      name: "Hybrid SIMD/Tensor",
      score: 0.72,
      bottleneck: "Control Overhead",
      ppa: { power: 5.5, area: 48, performance: 46 },
      status: "warning",
    },
  ];

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

  return (
    <div className="h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Architecture Evaluation</h1>
          <p className="text-muted-foreground">
            Top 5 architectures for INT8 inference engine • 50 TOPS • ≤5W
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            size="sm" 
            className="gap-2"
            onClick={() => {
              const data = {
                project_id: projectId,
                target_spec: spec,
                architectures: architectures.map(a => ({
                  id: a.id,
                  name: a.name,
                  score: a.score,
                  bottleneck: a.bottleneck,
                  ppa: a.ppa,
                  status: a.status
                }))
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${projectId}_architecture_evaluation.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-5 h-5" />
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
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Perf (TOPS)</th>
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
                  className={`border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer ${
                    selectedArchitecture?.id === arch.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      selectedArchitecture?.id === arch.id ? "bg-primary text-primary-foreground" : "bg-muted"
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
                          style={{ width: `${arch.score * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">{arch.score.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm">
                    <span className={arch.ppa.power > 5 ? "text-warning" : ""}>
                      {arch.ppa.power.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm">{arch.ppa.area}</td>
                  <td className="px-4 py-4 font-mono text-sm">
                    <div className="flex items-center gap-1">
                      {arch.ppa.performance}
                      {arch.ppa.performance >= 50 && <TrendingUp className="w-3 h-3 text-success" />}
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

      {/* PPA Heatmap Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">PPA Trade-off Heatmap</h3>
          <div className="grid grid-cols-5 gap-2">
            {architectures.map((arch, i) => (
              <div key={arch.id} className="space-y-2">
                {["Power", "Area", "Perf"].map((metric, j) => {
                  const values = [arch.ppa.power / 6, arch.ppa.area / 60, arch.ppa.performance / 60];
                  const intensity = values[j];
                  return (
                    <motion.div
                      key={metric}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + (i * 3 + j) * 0.05 }}
                      className="h-8 rounded"
                      style={{
                        backgroundColor: `hsl(185 75% ${20 + intensity * 40}% / ${0.3 + intensity * 0.5})`,
                      }}
                      title={`${arch.name}: ${metric}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-muted-foreground">
            <span>Low</span>
            <span className="font-medium">Intensity Scale</span>
            <span>High</span>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-success mb-1">Systolic Array recommended</p>
                  <p className="text-sm text-muted-foreground">
                    Best PPA balance for target specs. SRAM bandwidth bottleneck can be mitigated with dual-port memory.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning mb-1">Hybrid SIMD exceeds power envelope</p>
                  <p className="text-sm text-muted-foreground">
                    5.5W exceeds 5W limit. Consider clock gating or reduced precision modes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitecturePanel;
