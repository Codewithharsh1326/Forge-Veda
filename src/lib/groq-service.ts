
export interface GroqCompletionResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
  }[];
}

export class GroqService {
  private static readonly API_URL = "https://api.groq.com/openai/v1/chat/completions";
  // llama-3.3-70b-versatile is a good balance of capability and speed
  private static readonly MODEL = "llama-3.3-70b-versatile";

  private static getApiKey(): string | null {
    return localStorage.getItem("groq_api_key");
  }

  static async parseSpecification(text: string, fileName: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("Groq API key not found");
    }

    const prompt = `
      You are an expert hardware engineer. Extract technical specifications from the following text (from a file named "${fileName}").
      Return a STRICT JSON object with the following structure (do not include markdown formatting or explanations, JUST the JSON):
      
      {
        "moduleName": "Inferred module name",
        "parameters": {
          "power": { "value": number, "unit": "mW" | "W" | etc },
          "area": { "value": number, "unit": "mm2" | "um2" | etc },
          "frequency": { "value": number, "unit": "MHz" | "GHz" | etc },
          "clockSkew": { "value": number, "unit": "ps" | "ns" | etc },
          "thermalLimit": { "value": number, "unit": "C" },
          "voltage": { "value": number, "unit": "V" }
        },
        "constraints": ["list", "of", "text", "constraints"],
        "explicitComponents": ["List", "of", "explicitly", "requested", "hardware", "components", "found", "in", "text"]
      }

      If a value is not explicitly stated or clearly inferable, omit that field from the "parameters" object.
      
      TEXT CONTENT:
      ${text.slice(0, 6000)}
    `;

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            { role: "system", content: "You are a helpful assistant that outputs JSON only." },
            { role: "user", content: prompt }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data: GroqCompletionResponse = await response.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error("Error calling Groq API:", error);
      throw error;
    }
  }

  static async generateSymbolicRTL(rtlCode: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("Groq API key not found");
    }

    const prompt = `
      You are an expert Digital Design Engineer. Create a high-level "Symbolic RTL" representation of the following SystemVerilog code.
      Return a STRICT JSON object with the following structure (no markdown, just JSON):

      {
        "name": "Module Name",
        "inputs": [{ "name": "signal_name", "width": "[31:0]", "description": "brief purpose" }],
        "outputs": [{ "name": "signal_name", "width": "[31:0]", "description": "brief purpose" }],
        "operations": [{ "trigger": "ADD/SUB/etc", "action": "RESULT = A + B" }],
        "control": [{ "source": "OPCODE", "target": "ALU", "description": "Selects operation" }],
        "timing": "combinational" | "sequential" | "pipelined",
        "parameters": [{ "name": "WIDTH", "value": "32" }]
      }

      RTL CODE:
      ${rtlCode.slice(0, 6000)}
    `;

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            { role: "system", content: "You are a helpful assistant that outputs JSON only." },
            { role: "user", content: prompt }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data: GroqCompletionResponse = await response.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error("Error calling Groq API:", error);
      throw error;
    }
  }

  static async generateRTL(spec: any, architectureName: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("Groq API key not found");
    }

    const prompt = `
      You are an expert SystemVerilog engineer. Generate a COMPLETE, SYNTHESIZABLE SystemVerilog module for a "${architectureName}" based on these specs:
      ${JSON.stringify(spec, null, 2)}

      Output a STRICT JSON object with this structure:
      {
        "modules": [
           { "name": "module_name", "code": "full systemverilog code...", "type": "rtl", "lines": 100 }
        ],
        "top_module": "FULL SystemVerilog source code for the top-level module...",
        "testbench": "full systemverilog testbench code..."
      }
      
      Ensure the code is complete, correct, and ready for simulation.
    `;

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            { role: "system", content: "You are a helpful assistant that outputs JSON only." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data: GroqCompletionResponse = await response.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error("Error calling Groq API:", error);
      throw error;
    }
  }
}
