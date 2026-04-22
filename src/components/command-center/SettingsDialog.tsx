import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Key, Eye, EyeOff, Check, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SettingsDialogProps {
  trigger?: React.ReactNode;
}

const SettingsDialog = ({ trigger }: SettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem("groq_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setIsValid(true);
    }
  }, []);

  const validateApiKey = async (key: string) => {
    if (!key || key.length < 10) {
      setIsValid(false);
      return false;
    }

    setIsValidating(true);
    try {
      // Simple validation - check if key starts with expected prefix
      if (key.startsWith("gsk_")) {
        setIsValid(true);
        return true;
      }
      setIsValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const valid = await validateApiKey(apiKey);
      if (valid) {
        localStorage.setItem("groq_api_key", apiKey);
        toast.success("API key saved successfully");
        setOpen(false);
      } else {
        toast.error("Invalid API key format. Key should start with 'gsk_'");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = () => {
    localStorage.removeItem("groq_api_key");
    setApiKey("");
    setIsValid(null);
    toast.success("API key removed");
  };

  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}${"•".repeat(Math.max(0, apiKey.length - 12))}${apiKey.slice(-4)}` : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            API Settings
          </DialogTitle>
          <DialogDescription>
            Configure your Groq API key to enable AI-powered chip architecture generation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="flex items-center gap-2">
              Groq API Key
              {isValid === true && (
                <span className="text-xs text-success flex items-center gap-1">
                  <Check className="w-3 h-3" /> Valid
                </span>
              )}
              {isValid === false && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Invalid
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setIsValid(null);
                }}
                placeholder="gsk_..."
                className="pr-10 font-mono text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                console.groq.com
              </a>
            </p>
          </div>

          {apiKey && isValid && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-success/10 border border-success/20"
            >
              <p className="text-sm text-success font-medium">API key is configured</p>
              <p className="text-xs text-muted-foreground mt-1">
                Key: {maskedKey}
              </p>
            </motion.div>
          )}

          <div className="flex gap-2 pt-2">
            {apiKey && (
              <Button variant="destructive" size="sm" onClick={handleRemove}>
                Remove Key
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || !apiKey}
              className="flex-1 gap-2"
            >
              {isSaving || isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save API Key
            </Button>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium mb-2">Why do I need an API key?</h4>
          <p className="text-xs text-muted-foreground">
            ForgeVeda uses Groq's AI models to generate chip architectures, perform gap analysis, 
            and create RTL code. Your API key enables these AI-powered features and is stored 
            locally in your browser.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
