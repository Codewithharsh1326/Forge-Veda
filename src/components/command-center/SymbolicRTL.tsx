import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, FileCode, Layers, ArrowRight, Copy, Check,
  ChevronDown, ChevronRight, Cpu, Database, Zap, Clock,
  Sparkles, Bot
} from "lucide-react";
import { GroqService } from "@/lib/groq-service";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RTLModule, RTLResult } from "@/hooks/useChipArchitect";
import { toast } from "sonner";

export interface SymbolicModule {
  name: string;
  inputs: { name: string; width: string; description?: string }[];
  outputs: { name: string; width: string; description?: string }[];
  operations: { trigger: string; action: string }[];
  control: { source: string; target: string; description?: string }[];
  timing: 'combinational' | 'sequential' | 'pipelined';
  parameters?: { name: string; value: string }[];
  dependencies?: string[];
}

interface SymbolicRTLProps {
  rtlResult: RTLResult;
  className?: string;
}

// Parse RTL code to extract symbolic representation
const parseRTLToSymbolic = (module: RTLModule): SymbolicModule => {
  const code = module.code;
  const lines = code.split('\n');

  const symbolic: SymbolicModule = {
    name: module.name,
    inputs: [],
    outputs: [],
    operations: [],
    control: [],
    timing: 'combinational',
    parameters: [],
    dependencies: [],
  };

  let inModuleBlock = false;
  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect module start
    if (trimmed.startsWith('module ')) {
      inModuleBlock = true;
      continue;
    }

    // Parse inputs
    const inputMatch = trimmed.match(/input\s+(?:logic\s+)?(?:\[(\d+):(\d+)\])?\s*(\w+)/);
    if (inputMatch) {
      const width = inputMatch[1] && inputMatch[2]
        ? `[${inputMatch[1]}:${inputMatch[2]}]`
        : '[0:0]';
      symbolic.inputs.push({
        name: inputMatch[3],
        width,
        description: inferDescription(inputMatch[3]),
      });
    }

    // Parse outputs
    const outputMatch = trimmed.match(/output\s+(?:logic\s+)?(?:reg\s+)?(?:\[(\d+):(\d+)\])?\s*(\w+)/);
    if (outputMatch) {
      const width = outputMatch[1] && outputMatch[2]
        ? `[${outputMatch[1]}:${outputMatch[2]}]`
        : '[0:0]';
      symbolic.outputs.push({
        name: outputMatch[3],
        width,
        description: inferDescription(outputMatch[3]),
      });
    }

    // Parse operations from assignments
    const assignMatch = trimmed.match(/(\w+)\s*(?:<=|=)\s*(.+);/);
    if (assignMatch && !trimmed.includes('input') && !trimmed.includes('output')) {
      const target = assignMatch[1];
      const expr = assignMatch[2];

      // Determine operation type
      if (expr.includes('+')) {
        symbolic.operations.push({ trigger: 'ADD', action: `${target} = ${simplifyExpression(expr)}` });
      } else if (expr.includes('-') && !expr.includes('->')) {
        symbolic.operations.push({ trigger: 'SUB', action: `${target} = ${simplifyExpression(expr)}` });
      } else if (expr.includes('*')) {
        symbolic.operations.push({ trigger: 'MUL', action: `${target} = ${simplifyExpression(expr)}` });
      } else if (expr.includes('&') && !expr.includes('&&')) {
        symbolic.operations.push({ trigger: 'AND', action: `${target} = ${simplifyExpression(expr)}` });
      } else if (expr.includes('|') && !expr.includes('||')) {
        symbolic.operations.push({ trigger: 'OR', action: `${target} = ${simplifyExpression(expr)}` });
      } else if (expr.includes('^')) {
        symbolic.operations.push({ trigger: 'XOR', action: `${target} = ${simplifyExpression(expr)}` });
      } else if (expr.includes('<<')) {
        symbolic.operations.push({ trigger: 'SHIFT_L', action: `${target} = ${simplifyExpression(expr)}` });
      } else if (expr.includes('>>')) {
        symbolic.operations.push({ trigger: 'SHIFT_R', action: `${target} = ${simplifyExpression(expr)}` });
      }
    }

    // Detect timing
    if (trimmed.includes('always_ff') || trimmed.includes('@(posedge') || trimmed.includes('@(negedge')) {
      symbolic.timing = 'sequential';
    }
    if (trimmed.includes('pipeline') || trimmed.includes('stage')) {
      symbolic.timing = 'pipelined';
    }

    // Parse case statements for control logic
    if (trimmed.startsWith('case') || trimmed.includes('case(')) {
      currentSection = 'case';
    }
    if (currentSection === 'case' && trimmed.match(/\d+'[bdh]\w+:/)) {
      const caseMatch = trimmed.match(/(\d+'[bdh]\w+):\s*(.+)/);
      if (caseMatch) {
        symbolic.control.push({
          source: caseMatch[1],
          target: caseMatch[2].replace(';', ''),
          description: `Case ${caseMatch[1]}`,
        });
      }
    }
    if (trimmed === 'endcase') {
      currentSection = '';
    }

    // Parse parameters
    const paramMatch = trimmed.match(/parameter\s+(\w+)\s*=\s*(.+);/);
    if (paramMatch) {
      symbolic.parameters?.push({
        name: paramMatch[1],
        value: paramMatch[2],
      });
    }
  }

  // Generate default operations if none found
  if (symbolic.operations.length === 0) {
    symbolic.operations = inferOperationsFromModuleType(module.type, module.name);
  }

  // Generate control flow if none found
  if (symbolic.control.length === 0) {
    symbolic.control = inferControlFromModuleType(module.type);
  }

  return symbolic;
};

const inferDescription = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('clk') || lower.includes('clock')) return 'System clock';
  if (lower.includes('rst') || lower.includes('reset')) return 'Reset signal';
  if (lower.includes('en') || lower.includes('enable')) return 'Enable signal';
  if (lower.includes('data') || lower.includes('din')) return 'Data input';
  if (lower.includes('dout') || lower.includes('out')) return 'Data output';
  if (lower.includes('addr') || lower.includes('address')) return 'Address bus';
  if (lower.includes('opcode') || lower.includes('op')) return 'Operation code';
  if (lower.includes('valid')) return 'Valid indicator';
  if (lower.includes('ready')) return 'Ready signal';
  return '';
};

const simplifyExpression = (expr: string): string => {
  return expr
    .replace(/\s+/g, ' ')
    .replace(/\[(\d+):(\d+)\]/g, '')
    .slice(0, 50);
};

const inferOperationsFromModuleType = (type: string, name: string): { trigger: string; action: string }[] => {
  const lower = name.toLowerCase();

  if (lower.includes('alu') || type === 'Compute') {
    return [
      { trigger: 'ADD', action: 'RESULT = A + B' },
      { trigger: 'SUB', action: 'RESULT = A - B' },
      { trigger: 'AND', action: 'RESULT = A & B' },
      { trigger: 'OR', action: 'RESULT = A | B' },
      { trigger: 'XOR', action: 'RESULT = A ^ B' },
      { trigger: 'SHIFT', action: 'RESULT = A << B[4:0]' },
    ];
  }

  if (lower.includes('mac') || lower.includes('multiply')) {
    return [
      { trigger: 'MAC', action: 'ACCUM += A * B' },
      { trigger: 'MUL', action: 'RESULT = A * B' },
      { trigger: 'CLEAR', action: 'ACCUM = 0' },
    ];
  }

  if (type === 'Memory' || lower.includes('sram') || lower.includes('buffer')) {
    return [
      { trigger: 'READ', action: 'DOUT = MEM[ADDR]' },
      { trigger: 'WRITE', action: 'MEM[ADDR] = DIN' },
    ];
  }

  if (type === 'Control' || lower.includes('decoder') || lower.includes('control')) {
    return [
      { trigger: 'DECODE', action: 'CTRL = f(OPCODE)' },
      { trigger: 'DISPATCH', action: 'NEXT_STATE = STATE_LUT[INPUT]' },
    ];
  }

  return [
    { trigger: 'PROCESS', action: 'OUTPUT = f(INPUT)' },
  ];
};

const inferControlFromModuleType = (type: string): { source: string; target: string; description?: string }[] => {
  if (type === 'Compute' || type === 'Datapath') {
    return [
      { source: 'OPCODE', target: 'Decoder', description: 'Operation Select' },
      { source: 'Decoder', target: 'Datapath', description: 'Control signals' },
    ];
  }

  if (type === 'Control') {
    return [
      { source: 'INPUT', target: 'FSM', description: 'State transition' },
      { source: 'FSM', target: 'OUTPUT', description: 'Control output' },
    ];
  }

  return [
    { source: 'CTRL', target: 'Datapath', description: 'Control flow' },
  ];
};

const SymbolicRTL = ({ rtlResult, className = "" }: SymbolicRTLProps) => {
  const [activeModule, setActiveModule] = useState(rtlResult.modules[0]?.name || "");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['inputs', 'outputs', 'operations']));
  const [copiedSymbolic, setCopiedSymbolic] = useState(false);
  const [viewMode, setViewMode] = useState<'symbolic' | 'diff'>('symbolic');
  const [symbolicModules, setSymbolicModules] = useState<SymbolicModule[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initial load using regex (fast), then upgrade with AI (if key exists)
  useEffect(() => {
    const rawModules = rtlResult.modules.map(parseRTLToSymbolic);
    setSymbolicModules(rawModules);

    const enhanceWithAI = async () => {
      const apiKey = localStorage.getItem("groq_api_key");
      if (apiKey) {
        setIsGenerating(true);
        try {
          const enhanced = await Promise.all(
            rtlResult.modules.map(async (mod, index) => {
              try {
                // Determine module complexity basics
                if (mod.lines > 200 || mod.type === 'Compute') {
                  const aiData = await GroqService.generateSymbolicRTL(mod.code);
                  return { ...rawModules[index], ...aiData };
                }
                return rawModules[index];
              } catch (e) {
                console.error(`AI enhancement failed for ${mod.name}:`, e);
                return rawModules[index];
              }
            })
          );
          setSymbolicModules(enhanced);
          toast.success("Enhanced with AI Symbolic Reasoning");
        } catch (error) {
          console.error("Global AI symbolic failure:", error);
        } finally {
          setIsGenerating(false);
        }
      }
    };

    enhanceWithAI();
  }, [rtlResult]);

  const activeSymbolic = symbolicModules.find(m => m.name === activeModule) || symbolicModules[0];

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const generateSymbolicText = (symbolic: SymbolicModule): string => {
    let text = `MODULE: ${symbolic.name}\n\n`;

    text += `INPUTS:\n`;
    symbolic.inputs.forEach(input => {
      text += `  ${input.name}${input.width}${input.description ? ` // ${input.description}` : ''}\n`;
    });

    text += `\nOUTPUTS:\n`;
    symbolic.outputs.forEach(output => {
      text += `  ${output.name}${output.width}${output.description ? ` // ${output.description}` : ''}\n`;
    });

    text += `\nOPERATIONS:\n`;
    symbolic.operations.forEach(op => {
      text += `  ${op.trigger} → ${op.action}\n`;
    });

    text += `\nCONTROL:\n`;
    symbolic.control.forEach(ctrl => {
      text += `  ${ctrl.source} → ${ctrl.target}${ctrl.description ? ` // ${ctrl.description}` : ''}\n`;
    });

    text += `\nTIMING: ${symbolic.timing.charAt(0).toUpperCase() + symbolic.timing.slice(1)}\n`;

    if (symbolic.parameters && symbolic.parameters.length > 0) {
      text += `\nPARAMETERS:\n`;
      symbolic.parameters.forEach(p => {
        text += `  ${p.name} = ${p.value}\n`;
      });
    }

    return text;
  };

  const copySymbolic = () => {
    if (activeSymbolic) {
      navigator.clipboard.writeText(generateSymbolicText(activeSymbolic));
      setCopiedSymbolic(true);
      toast.success("Symbolic representation copied");
      setTimeout(() => setCopiedSymbolic(false), 2000);
    }
  };

  const getTimingIcon = (timing: string) => {
    switch (timing) {
      case 'combinational': return <Zap className="w-3 h-3 text-warning" />;
      case 'sequential': return <Clock className="w-3 h-3 text-primary" />;
      case 'pipelined': return <Layers className="w-3 h-3 text-success" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          Symbolic RTL Representation
        </h3>
        <div className="flex items-center gap-2">
          {isGenerating && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-full text-xs text-primary animate-pulse">
              <Sparkles className="w-3 h-3" />
              Enhancing...
            </div>
          )}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="h-8">
            <TabsList className="h-8">
              <TabsTrigger value="symbolic" className="text-xs h-7">Symbolic</TabsTrigger>
              <TabsTrigger value="diff" className="text-xs h-7">Diff View</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="ghost" size="sm" className="gap-2" onClick={copySymbolic}>
            {copiedSymbolic ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            Copy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Module Selector */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Modules</p>
          <div className="space-y-1">
            {symbolicModules.map((mod) => (
              <button
                key={mod.name}
                onClick={() => setActiveModule(mod.name)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${activeModule === mod.name
                  ? 'bg-primary/20 border border-primary/30'
                  : 'bg-muted/30 hover:bg-muted/50'
                  }`}
              >
                <FileCode className="w-4 h-4 shrink-0" />
                <span className="truncate font-mono text-xs">{mod.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Symbolic View */}
        <div className="col-span-3 glass-panel p-4">
          {activeSymbolic && (
            <motion.div
              key={activeSymbolic.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 font-mono text-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-primary" />
                  <span className="text-lg font-semibold">MODULE: {activeSymbolic.name}</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-muted/50">
                  {getTimingIcon(activeSymbolic.timing)}
                  <span className="text-xs capitalize">{activeSymbolic.timing}</span>
                </div>
              </div>

              {/* Inputs Section */}
              <CollapsibleSection
                title="INPUTS"
                count={activeSymbolic.inputs.length}
                expanded={expandedSections.has('inputs')}
                onToggle={() => toggleSection('inputs')}
              >
                {activeSymbolic.inputs.map((input, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <span className="text-primary">{input.name}</span>
                    <span className="text-muted-foreground">{input.width}</span>
                    {input.description && (
                      <span className="text-xs text-muted-foreground/70">// {input.description}</span>
                    )}
                  </div>
                ))}
              </CollapsibleSection>

              {/* Outputs Section */}
              <CollapsibleSection
                title="OUTPUTS"
                count={activeSymbolic.outputs.length}
                expanded={expandedSections.has('outputs')}
                onToggle={() => toggleSection('outputs')}
              >
                {activeSymbolic.outputs.map((output, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <span className="text-success">{output.name}</span>
                    <span className="text-muted-foreground">{output.width}</span>
                    {output.description && (
                      <span className="text-xs text-muted-foreground/70">// {output.description}</span>
                    )}
                  </div>
                ))}
              </CollapsibleSection>

              {/* Operations Section */}
              <CollapsibleSection
                title="OPERATIONS"
                count={activeSymbolic.operations.length}
                expanded={expandedSections.has('operations')}
                onToggle={() => toggleSection('operations')}
              >
                {activeSymbolic.operations.map((op, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <span className="px-2 py-0.5 rounded bg-warning/20 text-warning text-xs">
                      {op.trigger}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground/90">{op.action}</span>
                  </div>
                ))}
              </CollapsibleSection>

              {/* Control Section */}
              <CollapsibleSection
                title="CONTROL"
                count={activeSymbolic.control.length}
                expanded={expandedSections.has('control')}
                onToggle={() => toggleSection('control')}
              >
                {activeSymbolic.control.map((ctrl, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <span className="text-primary">{ctrl.source}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground">{ctrl.target}</span>
                    {ctrl.description && (
                      <span className="text-xs text-muted-foreground/70">// {ctrl.description}</span>
                    )}
                  </div>
                ))}
              </CollapsibleSection>

              {/* Parameters Section */}
              {activeSymbolic.parameters && activeSymbolic.parameters.length > 0 && (
                <CollapsibleSection
                  title="PARAMETERS"
                  count={activeSymbolic.parameters.length}
                  expanded={expandedSections.has('parameters')}
                  onToggle={() => toggleSection('parameters')}
                >
                  {activeSymbolic.parameters.map((param, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <span className="text-accent">{param.name}</span>
                      <span className="text-muted-foreground">=</span>
                      <span className="text-foreground">{param.value}</span>
                    </div>
                  ))}
                </CollapsibleSection>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CollapsibleSectionProps {
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection = ({ title, count, expanded, onToggle, children }: CollapsibleSectionProps) => (
  <div className="border-b border-border/50 last:border-0 pb-3">
    <button
      onClick={onToggle}
      className="flex items-center gap-2 w-full text-left py-1 hover:text-primary transition-colors"
    >
      {expanded ? (
        <ChevronDown className="w-4 h-4" />
      ) : (
        <ChevronRight className="w-4 h-4" />
      )}
      <span className="font-semibold text-muted-foreground">{title}:</span>
      <span className="text-xs text-muted-foreground/70">({count})</span>
    </button>
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="pl-6 overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default SymbolicRTL;
