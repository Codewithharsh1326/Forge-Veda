import { Link } from "react-router-dom";
import { 
  FileText, 
  Layers, 
  Code, 
  TestTube, 
  Truck, 
  ChevronRight,
  FolderOpen,
  Plus,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface Project {
  id: string;
  name: string;
}

interface CommandSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  projects: Project[];
  activeProject: string;
  onProjectChange: (projectId: string) => void;
  onNewProject: () => void;
  onDeleteProject: (projectId: string) => void;
}

const CommandSidebar = ({ 
  activeSection, 
  onSectionChange, 
  projects = [], 
  activeProject = "", 
  onProjectChange,
  onNewProject,
  onDeleteProject
}: CommandSidebarProps) => {
  const sections = [
    { id: "spec", label: "Spec", icon: FileText },
    { id: "architecture", label: "Architecture", icon: Layers },
    { id: "rtl", label: "RTL", icon: Code },
    { id: "verification", label: "Test", icon: TestTube },
    { id: "sourcing", label: "Vendor", icon: Truck },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">FV</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
            ForgeVeda
          </span>
        </Link>
        <Button size="sm" className="w-full gap-2" onClick={onNewProject}>
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Project Tree */}
      <div className="flex-1 overflow-auto p-3">
        <div className="mb-4 space-y-1">
          {projects.map((project) => (
            <div
              key={project.id}
              className={cn(
                "flex items-center justify-between px-2 py-1.5 text-sm rounded-md cursor-pointer group",
                activeProject === project.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50"
              )}
              onClick={() => onProjectChange(project.id)}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                <span className="font-medium">{project.id}</span>
              </div>
              {projects.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                activeSection === section.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <div className="flex items-center gap-3">
                <section.icon className="w-4 h-4" />
                <span>{section.label}</span>
              </div>
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform",
                activeSection === section.id && "rotate-90"
              )} />
            </button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-2 mb-1">
            <div className="status-indicator-success" />
            <span>All agents ready</span>
          </div>
          <span className="text-muted-foreground/60">v0.1.0-alpha</span>
        </div>
      </div>
    </aside>
  );
};

export default CommandSidebar;
