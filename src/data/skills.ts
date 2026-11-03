import type { Skill, SkillCategory, SkillCategoryId } from "./types";

export const SKILL_CATEGORIES: SkillCategory[] = [
  { id: "math", name: "Mathematical Foundations", color: "#94A3B8" },
  { id: "ml", name: "Machine Learning", color: "#00E5FF" },
  { id: "dl", name: "Deep Learning", color: "#34D399" },
  { id: "rl", name: "Reinforcement Learning", color: "#8B5CF6" },
  { id: "robotics", name: "Robotics & Simulation", color: "#F59E0B" },
  { id: "research", name: "Research Skills", color: "#CDB07A" },
];

export const CATEGORY_BY_ID = Object.fromEntries(SKILL_CATEGORIES.map((c) => [c.id, c])) as Record<
  SkillCategoryId,
  SkillCategory
>;

export const SKILLS: Skill[] = [
  // Mathematical Foundations
  {
    id: "m-linear-algebra",
    name: "Linear Algebra",
    category: "math",
    icon: "grid",
    description: "Vectors, matrices, and the tensor operations every model is made of.",
    prerequisites: [],
    questIds: ["w1-q-tensors", "w2-q-attention", "w4-q-kinematics"],
  },
  {
    id: "m-calculus",
    name: "Multivariable Calculus",
    category: "math",
    icon: "sigma",
    description: "Derivatives, gradients and the chain rule — the language of learning.",
    prerequisites: [],
    questIds: ["w1-q-gd-intuition", "w1-q-chain-rule", "w1-c-gradcheck"],
  },
  {
    id: "m-probability",
    name: "Probability & Statistics",
    category: "math",
    icon: "dices",
    description: "Uncertainty, expectation and the statistics that make results credible.",
    prerequisites: [],
    questIds: ["w3-q-mdp", "w5-q-methodology"],
  },
  {
    id: "m-optimization",
    name: "Optimization Theory",
    category: "math",
    icon: "trending-down",
    description: "Convexity, step sizes and the geometry of loss landscapes.",
    prerequisites: ["m-calculus"],
    questIds: ["w1-c-gd-numpy", "w2-q-optimizers"],
  },

  // Machine Learning
  {
    id: "ml-pytorch",
    name: "PyTorch Fundamentals",
    category: "ml",
    icon: "flame",
    description: "Tensors, autograd and devices: fluency in the framework.",
    prerequisites: ["m-linear-algebra"],
    questIds: ["w1-q-tensors", "w1-q-autograd", "w1-c-training-loop"],
  },
  {
    id: "ml-gradient-descent",
    name: "Gradient Descent",
    category: "ml",
    icon: "spline",
    description: "Iterative optimization by following the negative gradient.",
    prerequisites: ["m-calculus"],
    questIds: ["w1-q-gd-intuition", "w1-c-gd-numpy"],
  },
  {
    id: "ml-training-loop",
    name: "Training Loops",
    category: "ml",
    icon: "rotate",
    description: "Data loading, forward pass, loss, backward pass, optimizer step.",
    prerequisites: ["ml-pytorch", "ml-gradient-descent"],
    questIds: ["w1-c-training-loop", "w1-p-mnist-mlp"],
  },
  {
    id: "ml-backprop",
    name: "Backpropagation",
    category: "ml",
    icon: "workflow",
    description: "Efficient gradient computation through computational graphs.",
    prerequisites: ["m-calculus", "ml-gradient-descent"],
    questIds: ["w1-q-chain-rule", "w1-c-micrograd", "w1-c-gradcheck"],
  },
  {
    id: "ml-mlp",
    name: "Neural Networks",
    category: "ml",
    icon: "network",
    description: "Multilayer perceptrons: universal function approximators.",
    prerequisites: ["ml-backprop", "ml-training-loop"],
    questIds: ["w1-p-mnist-mlp", "w1-boss"],
  },

  // Deep Learning
  {
    id: "dl-cnn",
    name: "Convolutional Networks",
    category: "dl",
    icon: "layers",
    description: "Weight sharing and spatial hierarchies for perception.",
    prerequisites: ["ml-mlp"],
    questIds: ["w2-q-convolutions", "w2-c-cnn"],
  },
  {
    id: "dl-optimizers",
    name: "Modern Optimizers",
    category: "dl",
    icon: "gauge",
    description: "Momentum, Adam, weight decay and learning-rate schedules.",
    prerequisites: ["ml-mlp", "m-optimization"],
    questIds: ["w2-q-optimizers", "w2-c-optim-compare"],
  },
  {
    id: "dl-attention",
    name: "Attention",
    category: "dl",
    icon: "eye",
    description: "Content-based routing of information between tokens.",
    prerequisites: ["ml-mlp", "m-linear-algebra"],
    questIds: ["w2-q-attention", "w2-c-self-attention"],
  },
  {
    id: "dl-transformers",
    name: "Transformers",
    category: "dl",
    icon: "boxes",
    description: "The architecture behind modern language and vision models.",
    prerequisites: ["dl-attention", "dl-optimizers"],
    questIds: ["w2-p-mini-gpt"],
  },
  {
    id: "dl-vision",
    name: "Computer Vision",
    category: "dl",
    icon: "scan",
    description: "End-to-end image recognition with deep residual networks.",
    prerequisites: ["dl-cnn", "dl-optimizers"],
    questIds: ["w2-boss"],
  },

  // Reinforcement Learning
  {
    id: "rl-mdp",
    name: "MDPs & Bellman",
    category: "rl",
    icon: "route",
    description: "Formal models of sequential decision making.",
    prerequisites: ["m-probability"],
    questIds: ["w3-q-mdp", "w3-c-value-iteration"],
  },
  {
    id: "rl-q-learning",
    name: "Q-Learning",
    category: "rl",
    icon: "table",
    description: "Learning action values from experience with TD updates.",
    prerequisites: ["rl-mdp"],
    questIds: ["w3-q-q-learning", "w3-c-tabular-q"],
  },
  {
    id: "rl-deep-rl",
    name: "Deep Q-Networks",
    category: "rl",
    icon: "cpu",
    description: "Function approximation, replay buffers and target networks.",
    prerequisites: ["rl-q-learning", "ml-mlp"],
    questIds: ["w3-p-dqn"],
  },
  {
    id: "rl-policy-gradient",
    name: "Policy Gradients",
    category: "rl",
    icon: "trending-up",
    description: "Directly optimizing a parameterized policy.",
    prerequisites: ["rl-mdp", "ml-mlp"],
    questIds: ["w3-q-policy-gradient", "w3-c-gae"],
  },
  {
    id: "rl-ppo",
    name: "PPO",
    category: "rl",
    icon: "shield",
    description: "Stable policy optimization with a clipped surrogate objective.",
    prerequisites: ["rl-policy-gradient"],
    questIds: ["w3-boss"],
  },

  // Robotics & Simulation
  {
    id: "rb-physics",
    name: "Physics Simulation",
    category: "robotics",
    icon: "atom",
    description: "Integrators, contacts and the MuJoCo simulator.",
    prerequisites: ["m-linear-algebra"],
    questIds: ["w4-q-physics-sim", "w4-c-mujoco"],
  },
  {
    id: "rb-kinematics",
    name: "Kinematics",
    category: "robotics",
    icon: "move",
    description: "Forward and inverse kinematics, Jacobians and singularities.",
    prerequisites: ["m-linear-algebra", "m-calculus"],
    questIds: ["w4-q-kinematics", "w4-c-ik"],
  },
  {
    id: "rb-control",
    name: "Control Theory",
    category: "robotics",
    icon: "joystick",
    description: "Feedback control, from PID to stability.",
    prerequisites: ["rb-physics"],
    questIds: ["w4-q-pid", "w4-c-pid"],
  },
  {
    id: "rb-robot-learning",
    name: "Robot Learning",
    category: "robotics",
    icon: "bot",
    description: "Training embodied agents in simulation with deep RL.",
    prerequisites: ["rl-ppo", "rb-control", "rb-kinematics"],
    questIds: ["w4-p-reach", "w4-boss"],
  },

  // Research
  {
    id: "rs-reading",
    name: "Reading Papers",
    category: "research",
    icon: "book",
    description: "Efficiently extracting claims and evidence from literature.",
    prerequisites: [],
    questIds: ["w5-q-read-paper", "w5-c-paper-summary"],
  },
  {
    id: "rs-methodology",
    name: "Experimental Methodology",
    category: "research",
    icon: "flask",
    description: "Baselines, ablations, seeds and honest statistics.",
    prerequisites: ["rs-reading", "m-probability"],
    questIds: ["w5-q-methodology", "w5-c-ablation"],
  },
  {
    id: "rs-reproduction",
    name: "Reproduction",
    category: "research",
    icon: "microscope",
    description: "Independently verifying published results.",
    prerequisites: ["rs-methodology"],
    questIds: ["w5-q-reproducibility", "w5-c-trace-code", "w5-p-plan", "w5-boss"],
  },
];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

export function getSkill(id: string): Skill | undefined {
  return SKILL_BY_ID[id];
}

/** Longest prerequisite chain depth — used for skill-tree layout. */
export function skillDepth(id: string, memo: Record<string, number> = {}): number {
  if (memo[id] !== undefined) return memo[id];
  const s = SKILL_BY_ID[id];
  const d = s.prerequisites.length === 0 ? 0 : 1 + Math.max(...s.prerequisites.map((p) => skillDepth(p, memo)));
  memo[id] = d;
  return d;
}
