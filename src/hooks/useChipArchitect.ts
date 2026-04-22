
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GroqService } from '@/lib/groq-service';

export interface ChipSpec {
  chipType: string;
  // Replaced simple 'tops' with flexible performance metric
  performance: {
    value: number;
    unit: "TOPS" | "MIPS" | "FLOPS";
  };
  powerLimit?: number;
  explicitComponents?: string[];
  precision?: string;
  useCase?: string;
  constraints?: string;
  memoryBandwidth?: number;
  targetNode?: string;
  bitWidth?: number;
  operationTypes?: string[];
}

export interface Architecture {
  id: string;
  name: string;
  score: number;
  bottleneck: string;
  ppa: { power: number; area: number; performance: number };
  status: 'recommended' | 'viable' | 'feasible' | 'warning';
  components?: { name: string; type: string; description: string }[];
  dataflow?: string;
  rationale?: string;
}

export interface GapAnalysisResult {
  gaps: { field: string; issue: string; severity: 'error' | 'warning' | 'info'; recommendation?: string }[];
  feasibility_score: number;
  summary: string;
}

export interface RTLModule {
  name: string;
  type: string;
  lines: number;
  status: 'ready' | 'needs_review';
  code: string;
}

export interface RTLResult {
  modules: RTLModule[];
  top_module: string;
  testbench: string;
}

export interface AgentLog {
  id: string;
  agent: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'action';
}

interface UseChipArchitectReturn {
  isLoading: boolean;
  error: string | null;
  architectures: Architecture[];
  gapAnalysis: GapAnalysisResult | null;
  rtlResult: RTLResult | null;
  logs: AgentLog[];
  generateArchitectures: (spec: ChipSpec) => Promise<void>;
  runGapAnalysis: (spec: ChipSpec) => Promise<void>;
  generateRTL: (spec: ChipSpec, architectureId: string) => Promise<void>;
  clearError: () => void;
  addLog: (log: Omit<AgentLog, 'id' | 'timestamp'>) => void;
}

export const useChipArchitect = (): UseChipArchitectReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [architectures, setArchitectures] = useState<Architecture[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysisResult | null>(null);
  const [rtlResult, setRtlResult] = useState<RTLResult | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);

  const addLog = useCallback((log: Omit<AgentLog, 'id' | 'timestamp'>) => {
    const newLog: AgentLog = {
      ...log,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  const generateArchitectures = useCallback(async (spec: ChipSpec) => {
    setIsLoading(true);
    setError(null);

    addLog({
      agent: 'Architecture',
      message: `Starting architecture generation for ${spec.chipType.toUpperCase()}...`,
      type: 'action',
    });

    try {
      const { data, error: fnError } = await supabase.functions.invoke('chip-architect', {
        body: {
          action: 'generate_architecture',
          spec,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const result = data?.data;

      if (result?.architectures && Array.isArray(result.architectures)) {
        setArchitectures(result.architectures);

        addLog({
          agent: 'Architecture',
          message: `Generated ${result.architectures.length} architecture variants`,
          type: 'success',
        });

        const topArch = result.architectures[0];
        if (topArch) {
          addLog({
            agent: 'Architecture',
            message: `Top candidate: ${topArch.name} (score: ${topArch.score?.toFixed(2) || 'N/A'})`,
            type: 'info',
          });
        }

        if (result.recommendations) {
          result.recommendations.forEach((rec: { type: string; title: string }) => {
            addLog({
              agent: 'Architecture',
              message: `${rec.title} `,
              type: rec.type === 'success' ? 'success' : rec.type === 'warning' ? 'warning' : 'info',
            });
          });
        }
      } else {
        throw new Error('Invalid response structure from architecture generation');
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate architectures';
      setError(message);
      addLog({
        agent: 'Architecture',
        message: `Error: ${message} `,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  const runGapAnalysis = useCallback(async (spec: ChipSpec) => {
    setIsLoading(true);
    setError(null);

    addLog({
      agent: 'Gap Analysis',
      message: `Analyzing ${spec.chipType.toUpperCase()} specification...`,
      type: 'action',
    });

    try {
      const { data, error: fnError } = await supabase.functions.invoke('chip-architect', {
        body: {
          action: 'gap_analysis',
          spec,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const result = data?.data as GapAnalysisResult;

      if (result) {
        setGapAnalysis(result);

        addLog({
          agent: 'Gap Analysis',
          message: `Analysis complete.Feasibility score: ${(result.feasibility_score * 100).toFixed(0)}% `,
          type: result.feasibility_score > 0.7 ? 'success' : 'warning',
        });

        result.gaps.forEach(gap => {
          addLog({
            agent: 'Gap Analysis',
            message: `${gap.field}: ${gap.issue} `,
            type: gap.severity === 'error' ? 'error' : gap.severity === 'warning' ? 'warning' : 'info',
          });
        });
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run gap analysis';
      setError(message);
      addLog({
        agent: 'Gap Analysis',
        message: `Error: ${message} `,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  const generateRTL = useCallback(async (spec: ChipSpec, architectureId: string) => {
    setIsLoading(true);
    setError(null);

    addLog({
      agent: 'RTL Generation',
      message: `Generating RTL for ${architectureId}...`,
      type: 'action',
    });

    try {
      // Use client-side GroqService instead of backend function to avoid timeouts
      const result = await GroqService.generateRTL(spec, architectureId);

      if (result) {
        setRtlResult(result);

        const totalLines = result.modules?.reduce((sum: number, m: RTLModule) => sum + (m.lines || 0), 0) || 0;

        addLog({
          agent: 'RTL Generation',
          message: `Generated ${result.modules?.length || 0} modules (${totalLines} lines)`,
          type: 'success',
        });

        addLog({
          agent: 'Verification',
          message: 'Testbench generated. Ready for simulation.',
          type: 'info',
        });
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate RTL';
      setError(message);
      addLog({
        agent: 'RTL Generation',
        message: `Error: ${message} `,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    architectures,
    gapAnalysis,
    rtlResult,
    logs,
    generateArchitectures,
    runGapAnalysis,
    generateRTL,
    clearError,
    addLog,
  };
};
