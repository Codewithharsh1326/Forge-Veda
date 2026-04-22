import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Factory, Package, Clock, DollarSign, TrendingUp, Filter, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Architecture } from "./ArchitecturePanel";

interface VendorPanelProps {
  projectId: string;
  architecture: Architecture | null;
}

const VendorPanel = ({ projectId, architecture }: VendorPanelProps) => {
  if (!architecture) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Factory className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No architecture selected</p>
          <p className="text-sm">Select an architecture from the evaluation panel first</p>
        </div>
      </div>
    );
  }

  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [compareVendor, setCompareVendor] = useState<string | null>(null);

  const vendors = [
    {
      name: "TSMC",
      region: "Asia",
      location: "Taiwan",
      node: "N5",
      cost: 0.85,
      leadTime: 12,
      yield: 92,
      packaging: ["CoWoS", "InFO"],
      score: 0.94,
      recommended: true,
    },
    {
      name: "Samsung",
      region: "Asia",
      location: "South Korea",
      node: "4LPP",
      cost: 0.72,
      leadTime: 14,
      yield: 88,
      packaging: ["I-Cube", "X-Cube"],
      score: 0.87,
      recommended: false,
    },
    {
      name: "Intel",
      region: "Americas",
      location: "USA",
      node: "Intel 4",
      cost: 0.68,
      leadTime: 16,
      yield: 85,
      packaging: ["EMIB", "Foveros"],
      score: 0.82,
      recommended: false,
    },
    {
      name: "GlobalFoundries",
      region: "Americas",
      location: "USA",
      node: "12LP+",
      cost: 0.45,
      leadTime: 10,
      yield: 95,
      packaging: ["2.5D", "SiP"],
      score: 0.76,
      recommended: false,
    },
    {
      name: "UMC",
      region: "Asia",
      location: "Taiwan",
      node: "14nm",
      cost: 0.38,
      leadTime: 9,
      yield: 94,
      packaging: ["Wirebond", "WLCSP"],
      score: 0.72,
      recommended: false,
    },
    {
      name: "SMIC",
      region: "Asia",
      location: "China",
      node: "N+1",
      cost: 0.55,
      leadTime: 11,
      yield: 82,
      packaging: ["2.5D"],
      score: 0.68,
      recommended: false,
    },
    {
      name: "Tower Semi",
      region: "EMEA",
      location: "Israel",
      node: "65nm RF",
      cost: 0.25,
      leadTime: 8,
      yield: 98,
      packaging: ["QFN"],
      score: 0.70,
      recommended: false,
    }
  ];

  const filteredVendors = selectedRegion === "All"
    ? vendors
    : vendors.filter(v => v.region === selectedRegion);

  const metrics = ["Cost", "Lead Time", "Yield", "Packaging", "Performance"];

  // Find recommended and comparison vendors
  const recommendedVendor = vendors.find(v => v.recommended) || vendors[0];
  const comparisonTarget = compareVendor ? vendors.find(v => v.name === compareVendor) : null;

  const activeRadarData = [recommendedVendor, comparisonTarget].filter(Boolean).map(v => ({
    name: v!.name,
    values: [
      1 - v!.cost, // Lower cost = better (simplified normalization)
      1 - (v!.leadTime / 24), // Normalize lead time
      v!.yield / 100,
      Math.min(v!.packaging.length / 4, 1),
      v!.score,
    ],
    color: v!.recommended ? "primary" : "success"
  }));

  const exportVendorData = () => {
    const data = {
      project_id: projectId,
      architecture: architecture.id,
      vendors: vendors.map(v => ({
        name: v.name,
        node: v.node,
        cost_per_mm2: v.cost,
        lead_time_weeks: v.leadTime,
        yield_percent: v.yield,
        packaging_options: v.packaging,
        score: v.score,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectId}_vendor_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Sourcing & Vendors</h1>
          <p className="text-muted-foreground">
            Foundry options for {architecture.name} ({architecture.ppa.area} mm²)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-muted/50 p-1 rounded-lg">
            {["All", "Asia", "Americas", "EMEA"].map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1 text-xs rounded-md transition-all ${selectedRegion === region
                  ? "bg-background shadow text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {region}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" className="gap-2" onClick={exportVendorData}>
            <Download className="w-4 h-4" />
            Export Analysis
          </Button>
        </div>
      </div>

      {/* Spider Chart Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Vendor Comparison</h3>
          </div>
          <div className="relative w-full aspect-square max-w-[340px] mx-auto">
            {/* Spider Chart Base - Expanded ViewBox to prevent clipping */}
            <svg viewBox="0 0 260 260" className="w-full h-full">
              {/* Grid circles */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
                <circle
                  key={i}
                  cx="130"
                  cy="130"
                  r={r * 80}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="0.5"
                  opacity={0.3}
                />
              ))}
              {/* Axes */}
              {metrics.map((_, i) => {
                const angle = (i * 2 * Math.PI) / metrics.length - Math.PI / 2;
                const x = 130 + 80 * Math.cos(angle);
                const y = 130 + 80 * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1="130"
                    y1="130"
                    x2={x}
                    y2={y}
                    stroke="hsl(var(--border))"
                    strokeWidth="0.5"
                    opacity={0.5}
                  />
                );
              })}
              {/* Data polygons */}
              {activeRadarData.map((vendor, vi) => {
                const points = vendor.values
                  .map((v, i) => {
                    const angle = (i * 2 * Math.PI) / metrics.length - Math.PI / 2;
                    const x = 130 + v * 80 * Math.cos(angle);
                    const y = 130 + v * 80 * Math.sin(angle);
                    return `${x},${y}`;
                  })
                  .join(" ");
                return (
                  <motion.polygon
                    key={vendor.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + vi * 0.2 }}
                    points={points}
                    fill={vi === 0 ? "hsl(var(--primary) / 0.2)" : "hsl(var(--success) / 0.2)"}
                    stroke={vi === 0 ? "hsl(var(--primary))" : "hsl(var(--success))"}
                    strokeWidth="2"
                  />
                );
              })}
              {/* Metric labels - pushed out further */}
              {metrics.map((metric, i) => {
                const angle = (i * 2 * Math.PI) / metrics.length - Math.PI / 2;
                const x = 130 + 105 * Math.cos(angle);
                const y = 130 + 105 * Math.sin(angle);
                return (
                  <text
                    key={metric}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-[10px] font-medium"
                  >
                    {metric}
                  </text>
                );
              })}
            </svg>
            <div className="flex justify-center gap-4 mt-[-10px] text-sm relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs">{recommendedVendor.name}</span>
              </div>
              {comparisonTarget && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-xs">{comparisonTarget.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Cost Analysis</h3>
          </div>
          <div className="space-y-4">
            {filteredVendors.map((vendor, index) => {
              const totalCost = vendor.cost * (architecture.ppa.area || 1); // Avoid 0 area
              const costDisplay = totalCost < 0.01 ? "<$0.01" : `$${totalCost.toFixed(2)}`;

              return (
                <motion.div
                  key={vendor.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setCompareVendor(vendor.name)}
                  className={`cursor-pointer p-2 rounded-lg transition-colors border border-transparent ${compareVendor === vendor.name ? "bg-muted border-primary/20" : "hover:bg-muted/50"
                    }`}
                >
                  <div className="flex justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{vendor.name}</span>
                      <span className="text-xs text-muted-foreground">({vendor.node})</span>
                    </div>
                    <span className="font-mono text-foreground">{costDisplay}/die</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${vendor.score * 100}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      className={`h-full rounded-full ${vendor.recommended ? "bg-primary" : "bg-muted-foreground/30"}`}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Vendor Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Foundry</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Region</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Node</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Cost/mm²</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Lead Time</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Yield</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Packaging</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Score</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor, index) => (
                <motion.tr
                  key={vendor.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setCompareVendor(vendor.name)}
                  className={`border-b border-border/50 cursor-pointer transition-colors ${compareVendor === vendor.name
                      ? "bg-muted/60"
                      : "hover:bg-muted/30"
                    } ${vendor.recommended ? "bg-primary/5" : ""}`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Factory className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{vendor.name}</span>
                      {vendor.recommended && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary border border-primary/30">
                          Rec
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{vendor.location}</span>
                      <span className="text-[10px] text-muted-foreground">{vendor.region}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm">{vendor.node}</td>
                  <td className="px-4 py-4 font-mono text-sm">${vendor.cost.toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{vendor.leadTime} wks</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm">{vendor.yield}%</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1 flex-wrap max-w-[150px]">
                      {vendor.packaging.map((pkg) => (
                        <span
                          key={pkg}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground border border-border"
                        >
                          {pkg}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${vendor.score * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm">{vendor.score.toFixed(2)}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorPanel;
