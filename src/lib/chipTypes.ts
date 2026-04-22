export interface ChipType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'compute' | 'memory' | 'networking' | 'security';
  defaultComponents: ComponentTemplate[];
  specTemplate: SpecTemplate;
  suggestions?: string[];
}

export interface ComponentTemplate {
  name: string;
  type: 'Datapath' | 'Memory' | 'Compute' | 'Control' | 'Interface' | 'Power' | 'NoC';
  description: string;
  required: boolean;
  parameters?: Record<string, { type: string; default: number | string; min?: number; max?: number }>;
}

export interface SpecTemplate {
  showTops: boolean;
  showPower: boolean;
  showPrecision: boolean;
  showBitWidth: boolean;
  showMemoryBW: boolean;
  precisionOptions: string[];
  useCaseOptions: string[];
}

export const CHIP_TYPES: ChipType[] = [
  {
    id: 'alu',
    name: 'Arithmetic Logic Unit (ALU)',
    description: 'Fundamental compute unit for integer and logical operations',
    icon: 'Calculator',
    category: 'compute',
    suggestions: [
      "Target Frequency (e.g., 1GHz)",
      "Bit Width (32-bit vs 64-bit)",
      "Supported Operations (Add, Sub, Mul, Div, Logic)",
      "Area Constraints (um²)",
      "Power Budget (mW)"
    ],
    defaultComponents: [
      { name: 'adder_subtractor', type: 'Compute', description: 'Add/Sub unit with carry logic', required: true },
      { name: 'multiplier', type: 'Compute', description: 'Integer multiplier (Booth/Wallace)', required: true },
      { name: 'mac_unit', type: 'Compute', description: 'Fused multiply-accumulate', required: false },
      { name: 'comparator', type: 'Compute', description: 'Comparison and branch support', required: true },
      { name: 'shifter', type: 'Compute', description: 'Barrel shifter (logical/arithmetic)', required: true },
      { name: 'opcode_decoder', type: 'Control', description: 'Instruction decode logic', required: true },
      { name: 'control_fsm', type: 'Control', description: 'Sequencing state machine', required: true },
      { name: 'register_file', type: 'Memory', description: 'Operand storage', required: true },
    ],
    specTemplate: {
      showTops: false,
      showPower: true,
      showPrecision: true,
      showBitWidth: true,
      showMemoryBW: false,
      precisionOptions: ['INT8', 'INT16', 'INT32', 'INT64'],
      useCaseOptions: ['general', 'embedded', 'high_performance', 'low_power'],
    },
  },
  {
    id: 'ai_accelerator',
    name: 'AI Accelerator / NPU',
    description: 'Neural processing unit for ML inference and training',
    icon: 'Brain',
    category: 'compute',
    suggestions: [
      "Total Performance (TOPS/FLOPS)",
      "Memory Bandwidth (GB/s)",
      "On-chip SRAM Size (MB)",
      "Precision (INT8, FP16, BF16)",
      "Network Interface (PCIe, AXI)",
      "Thermal Design Power (TDP)"
    ],
    defaultComponents: [
      { name: 'mac_array', type: 'Compute', description: 'Systolic/SIMD MAC array', required: true },
      { name: 'accumulator_bank', type: 'Datapath', description: 'Partial sum accumulation', required: true },
      { name: 'activation_unit', type: 'Compute', description: 'ReLU/GELU/Softmax units', required: true },
      { name: 'weight_buffer', type: 'Memory', description: 'On-chip weight SRAM', required: true },
      { name: 'activation_buffer', type: 'Memory', description: 'Activation feature maps', required: true },
      { name: 'dma_engine', type: 'Interface', description: 'Memory movement controller', required: true },
      { name: 'command_processor', type: 'Control', description: 'Instruction scheduling', required: true },
      { name: 'quantization_unit', type: 'Compute', description: 'INT8/FP16 conversion', required: false },
      { name: 'prefetch_controller', type: 'Control', description: 'Data prefetch logic', required: false },
    ],
    specTemplate: {
      showTops: true,
      showPower: true,
      showPrecision: true,
      showBitWidth: false,
      showMemoryBW: true,
      precisionOptions: ['INT4', 'INT8', 'FP16', 'BF16', 'FP32', 'Mixed'],
      useCaseOptions: ['inference', 'training', 'edge', 'datacenter', 'automotive', 'mobile'],
    },
  },
  {
    id: 'processor',
    name: 'General Purpose Processor',
    description: 'RISC-V or ARM-like CPU with pipeline',
    icon: 'Cpu',
    category: 'compute',
    suggestions: [
      "Core Frequency (MHz/GHz)",
      "ISA (RISC-V, ARM, Custom)",
      "Pipeline Stages (e.g., 5-stage)",
      "Cache Sizes (L1 I/D)",
      "Branch Prediction Strategy",
      "Performance (MIPS/DMIPS)"
    ],
    defaultComponents: [
      { name: 'fetch_unit', type: 'Control', description: 'Instruction fetch with PC', required: true },
      { name: 'decode_unit', type: 'Control', description: 'Instruction decoder', required: true },
      { name: 'execute_alu', type: 'Compute', description: 'Execution ALU', required: true },
      { name: 'load_store_unit', type: 'Memory', description: 'Memory access unit', required: true },
      { name: 'register_file', type: 'Memory', description: '32-register file', required: true },
      { name: 'branch_predictor', type: 'Control', description: 'Branch prediction unit', required: false },
      { name: 'icache', type: 'Memory', description: 'Instruction cache', required: false },
      { name: 'dcache', type: 'Memory', description: 'Data cache', required: false },
      { name: 'hazard_unit', type: 'Control', description: 'Pipeline hazard detection', required: true },
    ],
    specTemplate: {
      showTops: false,
      showPower: true,
      showPrecision: false,
      showBitWidth: true,
      showMemoryBW: true,
      precisionOptions: [],
      useCaseOptions: ['embedded', 'application', 'real_time', 'high_performance'],
    },
  },
  {
    id: 'dsp',
    name: 'Digital Signal Processor',
    description: 'Optimized for signal processing algorithms',
    icon: 'Activity',
    category: 'compute',
    suggestions: [
      "Filter support (FIR, IIR)",
      "MACs per cycle",
      "Data Path Width",
      "Hardware Loop Support",
      "FFT capability"
    ],
    defaultComponents: [
      { name: 'mac_units', type: 'Compute', description: 'Parallel MAC for filters', required: true },
      { name: 'address_generator', type: 'Control', description: 'Circular buffer addressing', required: true },
      { name: 'bit_reverse_unit', type: 'Compute', description: 'FFT addressing support', required: true },
      { name: 'saturation_logic', type: 'Compute', description: 'Overflow handling', required: true },
      { name: 'loop_controller', type: 'Control', description: 'Zero-overhead loops', required: true },
      { name: 'dma_engine', type: 'Interface', description: 'Audio/sensor DMA', required: true },
    ],
    specTemplate: {
      showTops: false,
      showPower: true,
      showPrecision: true,
      showBitWidth: true,
      showMemoryBW: true,
      precisionOptions: ['INT16', 'INT32', 'Fixed-Point', 'FP32'],
      useCaseOptions: ['audio', 'radar', 'communications', 'medical'],
    },
  },
  {
    id: 'gpu',
    name: 'GPU-style Vector Processor',
    description: 'SIMD/SIMT vector processing architecture',
    icon: 'Grid3x3',
    category: 'compute',
    suggestions: [
      "TFLOPs / TOPS",
      "Number of Cores / SIMD Lanes",
      "VRAM Size & Bandwidth",
      "Texture Mapping Units",
      "GPGPU support (CUDA/OpenCL)"
    ],
    defaultComponents: [
      { name: 'simd_lanes', type: 'Compute', description: 'Parallel execution lanes', required: true },
      { name: 'warp_scheduler', type: 'Control', description: 'Thread group scheduling', required: true },
      { name: 'shared_memory', type: 'Memory', description: 'Per-block shared SRAM', required: true },
      { name: 'register_file', type: 'Memory', description: 'Per-lane registers', required: true },
      { name: 'load_store_unit', type: 'Memory', description: 'Coalesced memory access', required: true },
      { name: 'sfu', type: 'Compute', description: 'Special function units', required: false },
      { name: 'texture_unit', type: 'Compute', description: 'Texture sampling', required: false },
    ],
    specTemplate: {
      showTops: true,
      showPower: true,
      showPrecision: true,
      showBitWidth: false,
      showMemoryBW: true,
      precisionOptions: ['FP16', 'FP32', 'INT8', 'Mixed'],
      useCaseOptions: ['graphics', 'compute', 'ml_inference', 'scientific'],
    },
  },
  {
    id: 'network',
    name: 'Network Accelerator',
    description: 'SmartNIC / Packet processor architecture',
    icon: 'Network',
    category: 'networking',
    suggestions: [
      "Throughput (Gbps / Mpps)",
      "Supported Protocols (Eth, IP, TCP, UDP)",
      "Table Sizes (Routes, Flows)",
      "Latency Constraints",
      "Buffer Sizes"
    ],
    // ... defaultComponents
    defaultComponents: [
      { name: 'packet_parser', type: 'Datapath', description: 'Protocol parsing engine', required: true },
      { name: 'match_action_tables', type: 'Memory', description: 'Forwarding table lookup', required: true },
      { name: 'traffic_manager', type: 'Control', description: 'QoS and scheduling', required: true },
      { name: 'crypto_engine', type: 'Compute', description: 'IPsec/TLS offload', required: false },
      { name: 'crc_engine', type: 'Compute', description: 'Checksum computation', required: true },
      { name: 'buffer_manager', type: 'Memory', description: 'Packet buffering', required: true },
      { name: 'dma_engine', type: 'Interface', description: 'Host DMA interface', required: true },
    ],
    // ...
    specTemplate: {
      showTops: false,
      showPower: true,
      showPrecision: false,
      showBitWidth: false,
      showMemoryBW: true,
      precisionOptions: [],
      useCaseOptions: ['datacenter', 'enterprise', 'telecom', '5g'],
    },
  },
  {
    id: 'crypto',
    name: 'Cryptographic Accelerator',
    description: 'Hardware security and encryption engine',
    icon: 'Lock',
    category: 'security',
    suggestions: [
      "Algorithms (AES, SHA, RSA, ECC)",
      "Key Sizes",
      "Throughput (Gbps)",
      "Side-channel Resistance",
      "Tamper Detection"
    ],
    defaultComponents: [
      { name: 'aes_engine', type: 'Compute', description: 'AES-128/256 encryption', required: true },
      { name: 'sha_engine', type: 'Compute', description: 'SHA-2/SHA-3 hashing', required: true },
      { name: 'rsa_ecc_unit', type: 'Compute', description: 'Public key operations', required: false },
      { name: 'trng', type: 'Compute', description: 'True random number gen', required: true },
      { name: 'key_manager', type: 'Control', description: 'Key storage and handling', required: true },
      { name: 'dma_interface', type: 'Interface', description: 'Data movement', required: true },
    ],
    specTemplate: {
      showTops: false,
      showPower: true,
      showPrecision: false,
      showBitWidth: false,
      showMemoryBW: false,
      precisionOptions: [],
      useCaseOptions: ['iot', 'automotive', 'datacenter', 'payment'],
    },
  },
  {
    id: 'memory_controller',
    name: 'Memory Controller',
    description: 'DDR/HBM memory interface controller',
    icon: 'Database',
    category: 'memory',
    suggestions: [
      "Standard (DDR4, DDR5, HBM, LPDDR)",
      "Bus Width (32b, 64b)",
      "Data Rate (MT/s)",
      "Capacity Support",
      "ECC Requirements"
    ],
    defaultComponents: [
      { name: 'command_scheduler', type: 'Control', description: 'Memory command ordering', required: true },
      { name: 'address_decoder', type: 'Control', description: 'Row/bank/column decode', required: true },
      { name: 'refresh_controller', type: 'Control', description: 'DRAM refresh logic', required: true },
      { name: 'phy_interface', type: 'Interface', description: 'PHY timing control', required: true },
      { name: 'ecc_engine', type: 'Compute', description: 'Error correction', required: false },
      { name: 'power_controller', type: 'Power', description: 'Power state management', required: false },
      { name: 'training_unit', type: 'Control', description: 'PHY calibration', required: false },
    ],
    specTemplate: {
      showTops: false,
      showPower: true,
      showPrecision: false,
      showBitWidth: false,
      showMemoryBW: true,
      precisionOptions: [],
      useCaseOptions: ['ddr4', 'ddr5', 'lpddr', 'hbm'],
    },
  },
];

export const getChipType = (id: string): ChipType | undefined => {
  return CHIP_TYPES.find(ct => ct.id === id);
};

export const getChipTypesByCategory = (category: ChipType['category']): ChipType[] => {
  return CHIP_TYPES.filter(ct => ct.category === category);
};
