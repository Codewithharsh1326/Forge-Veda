import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPlus } from "lucide-react";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (project: { id: string; name: string }) => void;
}

const NewProjectDialog = ({ open, onOpenChange, onCreateProject }: NewProjectDialogProps) => {
  const [projectName, setProjectName] = useState("");

  const handleCreate = () => {
    if (projectName.trim()) {
      const id = projectName.toUpperCase().replace(/\s+/g, "_");
      onCreateProject({ id, name: projectName });
      setProjectName("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-primary" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Enter a name for your hardware design project. You'll define specifications next.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              placeholder="e.g., ACCEL_V2, NPU_CORE, DSP_ENGINE"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="bg-background"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!projectName.trim()}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectDialog;
