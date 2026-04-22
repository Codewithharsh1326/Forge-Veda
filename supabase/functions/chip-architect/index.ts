import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChipSpec {
  chipType: string;
  tops?: number;
  powerLimit?: number;
  precision?: string;
  useCase?: string;
  constraints?: string;
  memoryBandwidth?: number;
  targetNode?: string;
  bitWidth?: number;
  operationTypes?: string[];
}

interface ArchitectureRequest {
  action: 'generate_architecture' | 'gap_analysis' | 'rtl_generation' | 'validate_architecture';
  spec: ChipSpec;
  selectedArchitecture?: string;
}

const CHIP_TYPE_PROMPTS: Record<string, string> = {
  alu: `You are a silicon architect specializing in ALU design.
Generate a detailed architecture for an Arithmetic Logic Unit with these components:
- Adder/Subtractor (Ripple Carry, Carry Lookahead, or Carry Select based on bit-width)
- Multiplier (Booth, Wallace Tree, or Array based on performance needs)
- MAC Unit for fused multiply-accumulate
- Comparator for branch/conditional operations
- Barrel Shifter (logical and arithmetic)
- Opcode Decoder for control
- Pipeline stages if needed for clock speed

Return JSON with: { architecture_name, components[], dataflow_topology, control_logic, ppa_estimates, rtl_skeleton }`,

  ai_accelerator: `You are a silicon architect specializing in AI/NPU design.
Generate a detailed architecture for an AI Accelerator with:
- MAC Array (Systolic or SIMD based on use case)
- Accumulator Banks for partial sums
- Activation Units (ReLU, GELU, SiLU support)
- Local SRAM for weights/activations
- DMA Engine for memory movement
- Command Processor for scheduling
- Prefetch Controller
- Quantization support (INT4/INT8/FP16)

Return JSON with: { architecture_name, components[], dataflow_topology, memory_hierarchy, ppa_estimates, rtl_skeleton }`,

  processor: `You are a silicon architect specializing in general-purpose processor design.
Generate a RISC-V style processor architecture with:
- Fetch stage with branch prediction
- Decode stage with instruction decoder
- Execute stage with ALU, multiplier
- Memory stage with load/store unit
- Writeback with register file
- Pipeline hazard detection
- Cache hierarchy (I-cache, D-cache)

Return JSON with: { architecture_name, pipeline_stages[], components[], memory_hierarchy, ppa_estimates, rtl_skeleton }`,

  dsp: `You are a silicon architect specializing in DSP design.
Generate a Digital Signal Processor architecture with:
- MAC units optimized for filter operations
- Circular buffer addressing
- Bit-reverse addressing for FFT
- Saturation arithmetic
- Zero-overhead loops
- Dual data paths
- DMA for audio/sensor streams

Return JSON with: { architecture_name, components[], addressing_modes[], special_instructions, ppa_estimates, rtl_skeleton }`,

  gpu: `You are a silicon architect specializing in GPU/vector processor design.
Generate a GPU-style vector processor with:
- SIMD lanes (configurable width)
- Warp/wavefront scheduler
- Shared memory banks
- Texture/load-store units
- Register file per lane
- Special function units (SFU)
- Thread divergence handling

Return JSON with: { architecture_name, components[], memory_model, execution_model, ppa_estimates, rtl_skeleton }`,

  network: `You are a silicon architect specializing in network accelerator design.
Generate a SmartNIC/Packet Processor architecture with:
- Packet parser (programmable protocol)
- Match-action tables
- Traffic manager/scheduler
- Crypto engines (AES, SHA)
- CRC computation
- Buffer management
- DMA for host interface

Return JSON with: { architecture_name, components[], packet_pipeline, offload_engines, ppa_estimates, rtl_skeleton }`,

  crypto: `You are a silicon architect specializing in cryptographic accelerator design.
Generate a Crypto Accelerator architecture with:
- AES engine (128/256-bit)
- SHA-2/SHA-3 hash units
- RSA/ECC coprocessor
- True random number generator
- Key management unit
- Side-channel countermeasures
- DMA interface

Return JSON with: { architecture_name, components[], security_features, algorithms_supported, ppa_estimates, rtl_skeleton }`,

  memory_controller: `You are a silicon architect specializing in memory controller design.
Generate a Memory Controller architecture with:
- Command scheduler
- Address decoder
- Refresh controller
- PHY interface
- ECC engine
- Power management
- Training/calibration

Return JSON with: { architecture_name, components[], timing_parameters, interface_spec, ppa_estimates, rtl_skeleton }`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, spec, selectedArchitecture } = await req.json() as ArchitectureRequest;
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'generate_architecture':
        systemPrompt = CHIP_TYPE_PROMPTS[spec.chipType] || CHIP_TYPE_PROMPTS.alu;
        userPrompt = `Generate a complete architecture for a ${spec.chipType.toUpperCase()} with these specifications:
- Target Performance: ${spec.tops || 'N/A'} TOPS
- Power Budget: ${spec.powerLimit || 'N/A'} W
- Precision: ${spec.precision || 'INT8'}
- Memory Bandwidth: ${spec.memoryBandwidth || 'N/A'} GB/s
- Target Node: ${spec.targetNode || '7nm'}
- Bit Width: ${spec.bitWidth || 32}
- Use Case: ${spec.useCase || 'general'}
- Additional Constraints: ${spec.constraints || 'none'}

Generate 5 ranked architecture variants with different trade-offs.
Return a valid JSON object with this structure:
{
  "architectures": [
    {
      "id": "string",
      "name": "string",
      "score": 0.0-1.0,
      "bottleneck": "string",
      "ppa": { "power": number, "area": number, "performance": number },
      "status": "recommended|viable|feasible|warning",
      "components": [{ "name": "string", "type": "string", "description": "string" }],
      "dataflow": "string description",
      "rationale": "string"
    }
  ],
  "recommendations": [{ "type": "success|warning|info", "title": "string", "description": "string" }]
}`;
        break;

      case 'gap_analysis':
        systemPrompt = `You are a silicon design validation expert. Analyze specifications for feasibility and identify gaps.`;
        userPrompt = `Analyze this ${spec.chipType} specification for gaps and feasibility issues:
- Performance: ${spec.tops} TOPS
- Power: ${spec.powerLimit} W
- Precision: ${spec.precision}
- Memory BW: ${spec.memoryBandwidth} GB/s
- Target Node: ${spec.targetNode}
- Use Case: ${spec.useCase}
- Constraints: ${spec.constraints}

Identify:
1. Physical impossibilities (violating physics)
2. Unrealistic PPA combinations
3. Missing critical specifications
4. Industry norm violations

Return JSON:
{
  "gaps": [
    { "field": "string", "issue": "string", "severity": "error|warning|info", "recommendation": "string" }
  ],
  "feasibility_score": 0.0-1.0,
  "summary": "string"
}`;
        break;

      case 'rtl_generation':
        systemPrompt = `You are an RTL engineer. Generate synthesizable SystemVerilog code following industry standards.
Rules:
- Generate complete, synthesizable SystemVerilog
- Use proper parameterization
- Follow standard naming conventions
- Include proper reset handling
- No placeholder or incomplete code`;
        userPrompt = `Generate complete RTL for the ${selectedArchitecture} architecture of a ${spec.chipType}.
Specifications:
- Precision: ${spec.precision}
- Target: ${spec.tops} TOPS @ ${spec.powerLimit}W

Generate JSON with:
{
  "modules": [
    {
      "name": "string",
      "type": "Datapath|Control|Memory|Interface|Compute|Power",
      "lines": number,
      "status": "ready|needs_review",
      "code": "complete SystemVerilog code"
    }
  ],
  "top_module": "complete top-level SystemVerilog code",
  "testbench": "complete testbench code"
}`;
        break;

      case 'validate_architecture':
        systemPrompt = `You are a silicon architecture validation expert. Check for design issues.`;
        userPrompt = `Validate this ${spec.chipType} architecture: ${selectedArchitecture}
Check for:
1. Combinational loops
2. Clock domain crossings
3. Area-heavy blocks
4. Critical path issues
5. Industry baseline comparison

Return JSON:
{
  "issues": [{ "type": "string", "severity": "error|warning|info", "description": "string", "block": "string" }],
  "critical_path_estimate_ns": number,
  "area_estimate_mm2": number,
  "comparison_to_baseline": { "nvidia": "string", "arm": "string" }
}`;
        break;
    }

    console.log(`Calling Groq API for action: ${action}, chipType: ${spec.chipType}`);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 8000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please wait and try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('Empty response from Groq');
      return new Response(
        JSON.stringify({ error: 'Empty response from AI service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse Groq response:', e);
      console.log('Raw content:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', raw: content }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully processed ${action} for ${spec.chipType}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        action, 
        data: parsedContent,
        usage: data.usage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chip architect error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
