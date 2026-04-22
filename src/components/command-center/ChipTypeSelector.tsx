import { motion } from "framer-motion";
import { 
  Calculator, Brain, Cpu, Activity, Grid3x3, Network, Lock, Database,
  ChevronRight, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CHIP_TYPES, ChipType } from "@/lib/chipTypes";

interface ChipTypeSelectorProps {
  selectedType: string | null;
  onSelect: (chipType: ChipType) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator,
  Brain,
  Cpu,
  Activity,
  Grid3x3,
  Network,
  Lock,
  Database,
};

const categoryColors: Record<string, string> = {
  compute: "from-primary/20 to-primary/5 border-primary/30",
  memory: "from-success/20 to-success/5 border-success/30",
  networking: "from-accent/20 to-accent/5 border-accent/30",
  security: "from-warning/20 to-warning/5 border-warning/30",
};

const ChipTypeSelector = ({ selectedType, onSelect }: ChipTypeSelectorProps) => {
  const categories = ['compute', 'memory', 'networking', 'security'] as const;

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Chip Type–First Design</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold mb-2"
          >
            What are you building?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-lg mx-auto"
          >
            Select your silicon class. ForgeVeda will automatically generate a reference architecture, 
            component hierarchy, and RTL skeleton.
          </motion.p>
        </div>

        {/* Chip Type Grid by Category */}
        {categories.map((category, categoryIndex) => {
          const categoryTypes = CHIP_TYPES.filter(ct => ct.category === category);
          if (categoryTypes.length === 0) return null;

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + categoryIndex * 0.1 }}
              className="mb-8"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  category === 'compute' && "bg-primary",
                  category === 'memory' && "bg-success",
                  category === 'networking' && "bg-accent",
                  category === 'security' && "bg-warning"
                )} />
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTypes.map((chipType, index) => {
                  const IconComponent = iconMap[chipType.icon] || Cpu;
                  const isSelected = selectedType === chipType.id;

                  return (
                    <motion.button
                      key={chipType.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelect(chipType)}
                      className={cn(
                        "relative p-5 rounded-xl border text-left transition-all duration-200",
                        "bg-gradient-to-br hover:shadow-lg",
                        categoryColors[category],
                        isSelected && "ring-2 ring-primary shadow-glow"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-background/50"
                        )}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <ChevronRight className={cn(
                          "w-5 h-5 transition-transform",
                          isSelected && "translate-x-1 text-primary"
                        )} />
                      </div>
                      <h3 className="font-semibold mb-1">{chipType.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {chipType.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {chipType.defaultComponents.length} components
                        </span>
                        {chipType.defaultComponents.filter(c => c.required).length > 0 && (
                          <>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="text-xs text-muted-foreground">
                              {chipType.defaultComponents.filter(c => c.required).length} required
                            </span>
                          </>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ChipTypeSelector;
