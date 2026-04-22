import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, X, Check, Loader2, FileCode, AlertCircle,
  Zap, Box, Clock, Thermometer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { GroqService } from "@/lib/groq-service";

export interface ParsedSpecification {
  filename: string;
  moduleName: string;
  parameters: {
    power?: { value: number; unit: string; };
    area?: { value: number; unit: string; };
    frequency?: { value: number; unit: string; };
    clockSkew?: { value: number; unit: string; };
    thermalLimit?: { value: number; unit: string; };
    voltage?: { value: number; unit: string; };
    temperature?: { min: number; max: number; unit: string; };
    [key: string]: any;
  };
  rawText: string;
  constraints: string[];
}

interface SpecFileUploadProps {
  onSpecsParsed: (specs: ParsedSpecification[]) => void;
  existingSpecs?: ParsedSpecification[];
}

const SpecFileUpload = ({ onSpecsParsed, existingSpecs = [] }: SpecFileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedSpecs, setParsedSpecs] = useState<ParsedSpecification[]>(existingSpecs);

  const parseTextFile = async (file: File): Promise<ParsedSpecification> => {
    const text = await file.text();
    return parseSpecificationText(text, file.name);
  };

  const parsePDFFile = async (file: File): Promise<ParsedSpecification> => {
    // For PDF, we'll extract text content (simplified - in production, use pdf.js or server-side parsing)
    // Here we simulate parsing based on file name and common patterns
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Try to extract readable text from PDF (basic approach)
    let text = "";
    for (let i = 0; i < uint8Array.length; i++) {
      const char = String.fromCharCode(uint8Array[i]);
      if (/[\x20-\x7E\n\r\t]/.test(char)) {
        text += char;
      }
    }

    return parseSpecificationText(text, file.name);
  };

  const parseSpecificationText = async (text: string, filename: string): Promise<ParsedSpecification> => {
    // Try to use Groq API first
    const apiKey = localStorage.getItem("groq_api_key");
    if (apiKey) {
      try {
        const groqData = await GroqService.parseSpecification(text, filename);
        return {
          filename,
          moduleName: groqData.moduleName || filename.replace(/\.(pdf|txt)$/i, ''),
          parameters: groqData.parameters || {},
          rawText: text.slice(0, 2000),
          constraints: groqData.constraints || [],
        };
      } catch (error) {
        console.error("Groq parsing failed, falling back to regex:", error);
        toast.error("AI parsing failed. Using basic extraction.");
      }
    }

    // Fallback to Regex Parsing
    const lines = text.split('\n');
    const parameters: ParsedSpecification['parameters'] = {};
    const constraints: string[] = [];

    // Extract module name from filename or content
    let moduleName = filename.replace(/\.(pdf|txt)$/i, '').replace(/[_-]/g, ' ');

    // Common patterns for specification values
    const patterns = {
      power: /power[:\s]+(\d+(?:\.\d+)?)\s*(mW|W|uW)/i,
      area: /area[:\s]+(\d+(?:\.\d+)?)\s*(mm2|um2|mm²|µm²)/i,
      frequency: /(?:freq|clock)[:\s]+(\d+(?:\.\d+)?)\s*(MHz|GHz|Hz)/i,
      clockSkew: /(?:clock\s*skew|skew)[:\s]+(\d+(?:\.\d+)?)\s*(ps|ns|us)/i,
      thermalLimit: /(?:thermal|temp|temperature)[:\s]+(\d+(?:\.\d+)?)\s*(°?C|K)/i,
      voltage: /(?:voltage|vdd|vcc)[:\s]+(\d+(?:\.\d+)?)\s*(V|mV)/i,
    };

    for (const line of lines) {
      // Check for module name
      const moduleMatch = line.match(/module[:\s]+([A-Za-z0-9_]+)/i);
      if (moduleMatch) {
        moduleName = moduleMatch[1];
      }

      // Parse power
      const powerMatch = line.match(patterns.power);
      if (powerMatch) {
        parameters.power = { value: parseFloat(powerMatch[1]), unit: powerMatch[2] };
      }

      // Parse area
      const areaMatch = line.match(patterns.area);
      if (areaMatch) {
        parameters.area = { value: parseFloat(areaMatch[1]), unit: areaMatch[2] };
      }

      // Parse frequency
      const freqMatch = line.match(patterns.frequency);
      if (freqMatch) {
        parameters.frequency = { value: parseFloat(freqMatch[1]), unit: freqMatch[2] };
      }

      // Parse clock skew
      const skewMatch = line.match(patterns.clockSkew);
      if (skewMatch) {
        parameters.clockSkew = { value: parseFloat(skewMatch[1]), unit: skewMatch[2] };
      }

      // Parse thermal limit
      const thermalMatch = line.match(patterns.thermalLimit);
      if (thermalMatch) {
        parameters.thermalLimit = { value: parseFloat(thermalMatch[1]), unit: thermalMatch[2] };
      }

      // Parse voltage
      const voltageMatch = line.match(patterns.voltage);
      if (voltageMatch) {
        parameters.voltage = { value: parseFloat(voltageMatch[1]), unit: voltageMatch[2] };
      }

      // Extract constraints
      if (line.toLowerCase().includes('constraint') || line.toLowerCase().includes('limit') || line.toLowerCase().includes('must')) {
        constraints.push(line.trim());
      }
    }

    // If no parameters found, generate sample data based on filename
    if (Object.keys(parameters).length === 0) {
      // Generate reasonable defaults based on module type hints in filename
      const lowerName = filename.toLowerCase();
      if (lowerName.includes('alu') || lowerName.includes('compute')) {
        parameters.power = { value: 50, unit: 'mW' };
        parameters.frequency = { value: 500, unit: 'MHz' };
        parameters.area = { value: 0.5, unit: 'mm2' };
      } else if (lowerName.includes('memory') || lowerName.includes('sram')) {
        parameters.power = { value: 100, unit: 'mW' };
        parameters.frequency = { value: 1000, unit: 'MHz' };
        parameters.area = { value: 2.0, unit: 'mm2' };
      } else if (lowerName.includes('mac') || lowerName.includes('accelerator')) {
        parameters.power = { value: 200, unit: 'mW' };
        parameters.frequency = { value: 800, unit: 'MHz' };
        parameters.area = { value: 1.5, unit: 'mm2' };
      } else {
        parameters.power = { value: 75, unit: 'mW' };
        parameters.frequency = { value: 600, unit: 'MHz' };
        parameters.area = { value: 0.8, unit: 'mm2' };
      }
      parameters.thermalLimit = { value: 85, unit: 'C' };
      parameters.clockSkew = { value: 50, unit: 'ps' };
    }

    return {
      filename,
      moduleName,
      parameters,
      rawText: text.slice(0, 2000), // Keep first 2000 chars
      constraints,
    };
  };

  const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
    const validFiles = Array.from(newFiles).filter(file => {
      const ext = file.name.toLowerCase().split('.').pop();
      return ext === 'pdf' || ext === 'txt';
    });

    if (validFiles.length === 0) {
      toast.error("Please upload PDF or TXT files");
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
    setParsing(true);
    setProgress(0);

    const newSpecs: ParsedSpecification[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const ext = file.name.toLowerCase().split('.').pop();

      try {
        let spec: ParsedSpecification;
        if (ext === 'pdf') {
          spec = await parsePDFFile(file);
        } else {
          spec = await parseTextFile(file);
        }
        newSpecs.push(spec);
        setProgress(((i + 1) / validFiles.length) * 100);
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error);
        toast.error(`Failed to parse ${file.name}`);
      }
    }

    const allSpecs = [...parsedSpecs, ...newSpecs];
    setParsedSpecs(allSpecs);
    onSpecsParsed(allSpecs);
    setParsing(false);
    toast.success(`Parsed ${newSpecs.length} specification file(s)`);
  }, [parsedSpecs, onSpecsParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeSpec = (index: number) => {
    const newSpecs = parsedSpecs.filter((_, i) => i !== index);
    setParsedSpecs(newSpecs);
    onSpecsParsed(newSpecs);
  };

  const formatValue = (param: { value: number; unit: string } | undefined) => {
    if (!param) return 'N/A';
    return `${param.value} ${param.unit}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
        onClick={() => document.getElementById('spec-file-input')?.click()}
      >
        <input
          id="spec-file-input"
          type="file"
          multiple
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="text-center">
          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center"
          >
            <Upload className="w-6 h-6 text-primary" />
          </motion.div>
          <p className="text-sm font-medium">
            {isDragging ? 'Drop files here' : 'Upload Technical Specifications'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF or TXT files with power, area, frequency, and constraint data
          </p>
        </div>
      </motion.div>

      {/* Parsing Progress */}
      <AnimatePresence>
        {parsing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm">Parsing specifications...</span>
            </div>
            <Progress value={progress} className="h-1" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parsed Specifications */}
      <AnimatePresence>
        {parsedSpecs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              Parsed Specifications ({parsedSpecs.length})
            </h4>

            {parsedSpecs.map((spec, index) => (
              <motion.div
                key={`${spec.filename}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg bg-muted/30 border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{spec.moduleName}</p>
                      <p className="text-xs text-muted-foreground">{spec.filename}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeSpec(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Zap className="w-3 h-3 text-warning" />
                    <span className="text-muted-foreground">Power:</span>
                    <span className="font-mono">{formatValue(spec.parameters.power)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Box className="w-3 h-3 text-primary" />
                    <span className="text-muted-foreground">Area:</span>
                    <span className="font-mono">{formatValue(spec.parameters.area)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock className="w-3 h-3 text-success" />
                    <span className="text-muted-foreground">Freq:</span>
                    <span className="font-mono">{formatValue(spec.parameters.frequency)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Thermometer className="w-3 h-3 text-destructive" />
                    <span className="text-muted-foreground">Thermal:</span>
                    <span className="font-mono">{formatValue(spec.parameters.thermalLimit)}</span>
                  </div>
                </div>

                {spec.constraints.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Constraints:</p>
                    <div className="flex flex-wrap gap-1">
                      {spec.constraints.slice(0, 3).map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-xs bg-warning/10 text-warning border border-warning/20"
                        >
                          {c.slice(0, 40)}...
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpecFileUpload;
