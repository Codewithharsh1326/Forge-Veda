import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, GitBranch, Zap, Box, Clock,
  Thermometer, ArrowRight, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import { ParsedSpecification } from "./SpecFileUpload";

interface SpecVisualizationProps {
  specifications: ParsedSpecification[];
  className?: string;
}

const COLORS = {
  primary: 'hsl(185, 75%, 48%)',
  secondary: 'hsl(220, 15%, 55%)',
  success: 'hsl(142, 70%, 45%)',
  warning: 'hsl(38, 92%, 50%)',
  destructive: 'hsl(0, 72%, 51%)',
};

const SpecVisualization = ({ specifications, className = "" }: SpecVisualizationProps) => {
  const [activeChart, setActiveChart] = useState("power-area");

  if (specifications.length === 0) {
    return (
      <div className={`text-center py-12 text-muted-foreground ${className}`}>
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>Upload specification files to see visualizations</p>
      </div>
    );
  }

  // Prepare data for charts
  const powerAreaData = specifications.map(spec => ({
    name: spec.moduleName,
    power: spec.parameters.power?.value || 0,
    area: spec.parameters.area?.value || 0,
    frequency: spec.parameters.frequency?.value || 0,
  }));

  const performanceData = specifications.map(spec => ({
    name: spec.moduleName,
    frequency: spec.parameters.frequency?.value || 0,
    clockSkew: spec.parameters.clockSkew?.value || 0,
  }));

  const radarData = specifications.slice(0, 5).map(spec => ({
    module: spec.moduleName.slice(0, 10),
    power: Math.min(100, (spec.parameters.power?.value || 0) / 2),
    area: Math.min(100, (spec.parameters.area?.value || 0) * 20),
    frequency: Math.min(100, (spec.parameters.frequency?.value || 0) / 10),
    thermal: Math.min(100, (spec.parameters.thermalLimit?.value || 0)),
  }));

  // Dependency graph data
  const dependencyData = specifications.map((spec, i) => ({
    name: spec.moduleName,
    level: i % 3,
    connections: specifications.length > 1 ? Math.min(3, specifications.length - 1) : 0,
    power: spec.parameters.power?.value || 0,
    area: spec.parameters.area?.value || 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-mono">{entry.value?.toFixed(2)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Tabs value={activeChart} onValueChange={setActiveChart} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="power-area" className="gap-2 text-xs">
            <Zap className="w-3 h-3" />
            Power vs Area
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2 text-xs">
            <Clock className="w-3 h-3" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="radar" className="gap-2 text-xs">
            <Activity className="w-3 h-3" />
            Multi-Metric
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="gap-2 text-xs">
            <GitBranch className="w-3 h-3" />
            Dependencies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="power-area" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[300px] glass-panel p-4"
          >
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Power vs Area Analysis
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                <XAxis
                  dataKey="power"
                  name="Power"
                  unit=" mW"
                  tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                />
                <YAxis
                  dataKey="area"
                  name="Area"
                  unit=" mm²"
                  tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter
                  name="Modules"
                  data={powerAreaData}
                  fill={COLORS.primary}
                >
                  {powerAreaData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.power > 100 ? COLORS.warning : COLORS.primary}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </motion.div>
        </TabsContent>

        <TabsContent value="performance" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[300px] glass-panel p-4"
          >
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-success" />
              Clock Constraints vs Performance
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 10, right: 30, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }}
                  axisLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="frequency" name="Frequency (MHz)" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                <Bar dataKey="clockSkew" name="Clock Skew (ps)" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </TabsContent>

        <TabsContent value="radar" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[300px] glass-panel p-4"
          >
            {/* Refactored Radar Chart: Metrics as Axes */}
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Multi-Metric Balance (Normalized)
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { subject: 'Power', A: Math.min(100, (specifications[0]?.parameters.power?.value || 0) * 20), fullMark: 100 },
                { subject: 'Area', A: Math.min(100, (specifications[0]?.parameters.area?.value || 0) * 50), fullMark: 100 },
                { subject: 'Frequency', A: Math.min(100, (specifications[0]?.parameters.frequency?.value || 0) / 10), fullMark: 100 },
                { subject: 'Thermal', A: Math.min(100, (specifications[0]?.parameters.thermalLimit?.value || 0)), fullMark: 100 },
                { subject: 'Efficiency', A: Math.min(100, ((specifications[0]?.parameters.frequency?.value || 0) / (specifications[0]?.parameters.power?.value || 1)) * 5), fullMark: 100 },
              ]}>
                <PolarGrid stroke="hsl(220, 15%, 25%)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 9 }}
                />
                <Radar
                  name={specifications[0]?.moduleName || "Module"}
                  dataKey="A"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.4}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </TabsContent>

        <TabsContent value="dependencies" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[300px] glass-panel p-4"
          >
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-primary" />
              Constraint Dependency Graph
            </h4>

            {/* Visual dependency representation */}
            <div className="h-full flex items-center justify-center overflow-hidden">
              <div className="flex flex-col gap-4 w-full">
                {specifications.slice(0, 4).map((spec, i) => (
                  <motion.div
                    key={spec.filename}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-32 shrink-0">
                      <div className="px-3 py-2 rounded-lg bg-primary/20 border border-primary/30 text-xs font-mono truncate">
                        {spec.moduleName}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex gap-2 flex-wrap">
                      {spec.parameters.power && (
                        <div className="px-2 py-1 rounded bg-warning/20 text-warning text-xs flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {spec.parameters.power.value} {spec.parameters.power.unit}
                        </div>
                      )}
                      {spec.parameters.frequency && (
                        <div className="px-2 py-1 rounded bg-success/20 text-success text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {spec.parameters.frequency.value} {spec.parameters.frequency.unit}
                        </div>
                      )}
                      {spec.parameters.area && (
                        <div className="px-2 py-1 rounded bg-primary/20 text-primary text-xs flex items-center gap-1">
                          <Box className="w-3 h-3" />
                          {spec.parameters.area.value} {spec.parameters.area.unit}
                        </div>
                      )}
                      {spec.parameters.thermalLimit && (
                        <div className="px-2 py-1 rounded bg-destructive/20 text-destructive text-xs flex items-center gap-1">
                          <Thermometer className="w-3 h-3" />
                          {spec.parameters.thermalLimit.value}°C
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Total Power</span>
          </div>
          <p className="text-lg font-mono font-semibold">
            {specifications.reduce((sum, s) => sum + (s.parameters.power?.value || 0), 0).toFixed(1)} mW
          </p>
        </div>
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Box className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Area</span>
          </div>
          <p className="text-lg font-mono font-semibold">
            {specifications.reduce((sum, s) => sum + (s.parameters.area?.value || 0), 0).toFixed(2)} mm²
          </p>
        </div>
        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Max Frequency</span>
          </div>
          <p className="text-lg font-mono font-semibold">
            {Math.max(...specifications.map(s => s.parameters.frequency?.value || 0))} MHz
          </p>
        </div>
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="w-4 h-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Thermal Limit</span>
          </div>
          <p className="text-lg font-mono font-semibold">
            {Math.max(...specifications.map(s => s.parameters.thermalLimit?.value || 0))}°C
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpecVisualization;
