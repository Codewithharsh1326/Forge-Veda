import { useState, useCallback } from "react";
import CommandSidebar, { Project } from "@/components/command-center/CommandSidebar";

import NewProjectDialog from "@/components/command-center/NewProjectDialog";
import VendorPanel from "@/components/command-center/VendorPanel";
import ChipTypeSelector from "@/components/command-center/ChipTypeSelector";
import EnhancedSpecPanel from "@/components/command-center/EnhancedSpecPanel";
import EnhancedArchitecturePanel from "@/components/command-center/EnhancedArchitecturePanel";
import EnhancedRTLPanel from "@/components/command-center/EnhancedRTLPanel";
import EnhancedAgentConsole from "@/components/command-center/EnhancedAgentConsole";
import VerificationPanel from "@/components/command-center/VerificationPanel";
import SettingsDialog from "@/components/command-center/SettingsDialog";
import { ChipType, getChipType } from "@/lib/chipTypes";
import { useChipArchitect, ChipSpec, Architecture } from "@/hooks/useChipArchitect";
import { toast } from "sonner";
import { ParsedSpecification } from "@/components/command-center/SpecFileUpload";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type WorkflowStep = 'chip-select' | 'spec' | 'architecture' | 'rtl' | 'verification' | 'sourcing';

interface ProjectState {
  chipType: ChipType | null;
  spec: ChipSpec | null;
  selectedArchitecture: Architecture | null;
  uploadedSpecs: ParsedSpecification[];
  step: WorkflowStep;
}

const CommandCenter = () => {
  const [activeSection, setActiveSection] = useState("spec");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<string>("");
  const [projectStates, setProjectStates] = useState<Record<string, ProjectState>>({});
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(projects.length === 0);

  const {
    isLoading,
    error,
    architectures,
    gapAnalysis,
    rtlResult,
    logs,
    generateArchitectures,
    runGapAnalysis,
    generateRTL,
    addLog,
  } = useChipArchitect();

  const getProjectState = useCallback((projectId: string): ProjectState => {
    return projectStates[projectId] || { chipType: null, spec: null, selectedArchitecture: null, step: 'chip-select', uploadedSpecs: [] };
  }, [projectStates]);

  const updateProjectState = useCallback((projectId: string, updates: Partial<ProjectState>) => {
    setProjectStates(prev => ({
      ...prev,
      [projectId]: { ...getProjectState(projectId), ...updates }
    }));
  }, [getProjectState]);

  const handleCreateProject = (project: Project) => {
    setProjects([...projects, project]);
    setActiveProject(project.id);
    setActiveSection("spec");
    addLog({ agent: 'System', message: `Project "${project.id}" created`, type: 'success' });
  };

  const handleDeleteProject = (projectId: string) => {
    const newProjects = projects.filter(p => p.id !== projectId);
    setProjects(newProjects);
    if (activeProject === projectId && newProjects.length > 0) {
      setActiveProject(newProjects[0].id);
    } else if (newProjects.length === 0) {
      setActiveProject("");
      setShowNewProjectDialog(true);
    }
  };

  const handleChipTypeSelect = (chipType: ChipType) => {
    updateProjectState(activeProject, { chipType, step: 'spec' });
    addLog({ agent: 'System', message: `Selected chip type: ${chipType.name}`, type: 'info' });
  };

  const handleSpecSubmit = async (spec: ChipSpec) => {
    updateProjectState(activeProject, { spec, step: 'architecture' });
    setActiveSection("architecture");
    await generateArchitectures(spec);
  };

  const handleGapAnalysis = async (spec: ChipSpec) => {
    await runGapAnalysis(spec);
  };

  const handleSelectArchitecture = (arch: Architecture) => {
    updateProjectState(activeProject, { selectedArchitecture: arch });
    addLog({ agent: 'Architecture', message: `Selected: ${arch.name}`, type: 'info' });
  };

  const handleGenerateRTL = async () => {
    const state = getProjectState(activeProject);
    if (state.spec && state.selectedArchitecture) {
      await generateRTL(state.spec, state.selectedArchitecture.id);
      updateProjectState(activeProject, { step: 'rtl' });
      setActiveSection("rtl");
    }
  };

  const renderMainPanel = () => {
    if (!activeProject) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg mb-2">No project selected</p>
            <p className="text-sm">Create a new project to get started</p>
          </div>
        </div>
      );
    }

    const state = getProjectState(activeProject);

    // Chip type selection first
    if (!state.chipType) {
      return <ChipTypeSelector selectedType={null} onSelect={handleChipTypeSelect} />;
    }

    // Then spec
    if (activeSection === "spec" || !state.spec) {
      return (
        <EnhancedSpecPanel
          chipType={state.chipType}
          onSpecSubmit={handleSpecSubmit}
          onBack={() => updateProjectState(activeProject, { chipType: null })}
          isLoading={isLoading}
          gapAnalysis={gapAnalysis}
          onRunGapAnalysis={handleGapAnalysis}
          uploadedSpecs={state.uploadedSpecs}
          onSpecsUploaded={(specs) => updateProjectState(activeProject, { uploadedSpecs: specs })}
        />
      );
    }

    // Architecture
    if (activeSection === "architecture") {
      return (
        <EnhancedArchitecturePanel
          chipType={state.chipType}
          spec={state.spec}
          architectures={architectures}
          selectedArchitecture={state.selectedArchitecture}
          onSelectArchitecture={handleSelectArchitecture}
          onBack={() => setActiveSection("spec")}
          isLoading={isLoading}
          onGenerateRTL={handleGenerateRTL}
        />
      );
    }

    // RTL
    if (activeSection === "rtl" && state.selectedArchitecture) {
      return (
        <EnhancedRTLPanel
          chipType={state.chipType}
          spec={state.spec}
          architecture={state.selectedArchitecture}
          rtlResult={rtlResult}
          onBack={() => setActiveSection("architecture")}
          isLoading={isLoading}
        />
      );
    }

    // Verification
    if (activeSection === "verification" && state.selectedArchitecture) {
      return <VerificationPanel projectId={activeProject} architecture={state.selectedArchitecture as any} />;
    }

    // Vendor
    if (activeSection === "sourcing" && state.selectedArchitecture) {
      return <VendorPanel projectId={activeProject} architecture={state.selectedArchitecture as any} />;
    }

    return (
      <EnhancedArchitecturePanel
        chipType={state.chipType}
        spec={state.spec}
        architectures={architectures}
        selectedArchitecture={state.selectedArchitecture}
        onSelectArchitecture={handleSelectArchitecture}
        onBack={() => setActiveSection("spec")}
        isLoading={isLoading}
        onGenerateRTL={handleGenerateRTL}
      />
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar with Settings */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card/50">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gradient">ForgeVeda</span>
          <span className="text-xs text-muted-foreground">Command Center</span>
        </div>
        <SettingsDialog
          trigger={
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          }
        />
      </div>
      <div className="flex-1 flex overflow-hidden">
        <CommandSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          projects={projects}
          activeProject={activeProject}
          onProjectChange={setActiveProject}
          onNewProject={() => setShowNewProjectDialog(true)}
          onDeleteProject={handleDeleteProject}
        />
        <main className="flex-1 overflow-auto">
          {renderMainPanel()}
        </main>
        <EnhancedAgentConsole logs={logs} isLoading={isLoading} />
      </div>

      <NewProjectDialog
        open={showNewProjectDialog}
        onOpenChange={setShowNewProjectDialog}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};

export default CommandCenter;
