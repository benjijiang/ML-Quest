import type { World, WorldId } from "./types";

export const WORLDS: World[] = [
  {
    id: "w1",
    index: 1,
    name: "Neural Network Valley",
    tagline: "Where every intelligence begins: a single gradient.",
    description:
      "Master the primitives every model is built on. Learn to speak PyTorch, feel how gradient descent walks down a loss surface, and trace backpropagation through a computational graph until it becomes second nature.",
    topics: [
      { id: "pytorch", title: "PyTorch", blurb: "Tensors, autograd and the training loop." },
      { id: "gradient-descent", title: "Gradient Descent", blurb: "How models learn by walking downhill." },
      { id: "backprop", title: "Backpropagation", blurb: "The chain rule, applied at scale." },
    ],
    bossQuestId: "w1-boss",
    theme: { accent: "#00E5FF", accent2: "#38BDF8", emblem: "neural" },
  },
  {
    id: "w2",
    index: 2,
    name: "Deep Learning Forest",
    tagline: "Layers upon layers of learned representation.",
    description:
      "Go deep. Build convolutional networks that see, learn the optimizers that make deep training work, and assemble the attention mechanism that powers modern AI.",
    topics: [
      { id: "cnn", title: "Convolutional Networks", blurb: "Spatial inductive bias for vision." },
      { id: "optimization", title: "Optimization", blurb: "Momentum, Adam and learning-rate schedules." },
      { id: "transformers", title: "Transformers", blurb: "Attention, the universal architecture." },
    ],
    bossQuestId: "w2-boss",
    theme: { accent: "#34D399", accent2: "#00E5FF", emblem: "forest" },
  },
  {
    id: "w3",
    index: 3,
    name: "Reinforcement Learning Arena",
    tagline: "Learn by acting. Improve by consequence.",
    description:
      "Step into the simulation arena. Formalize decision making with MDPs, learn value functions with Q-learning, and train policies directly with PPO — the workhorse of modern RL.",
    topics: [
      { id: "mdp", title: "Markov Decision Processes", blurb: "States, actions, rewards and Bellman." },
      { id: "q-learning", title: "Q-Learning", blurb: "Temporal-difference value learning." },
      { id: "ppo", title: "PPO", blurb: "Policy gradients with a trust region." },
    ],
    bossQuestId: "w3-boss",
    theme: { accent: "#8B5CF6", accent2: "#F472B6", emblem: "arena" },
  },
  {
    id: "w4",
    index: 4,
    name: "Embodied AI Lab",
    tagline: "Intelligence, given a body.",
    description:
      "Bring agents into physical simulation. Understand how physics engines step the world forward, model robot kinematics, design controllers, and train digital twins that move.",
    topics: [
      { id: "physics", title: "Physics Simulation", blurb: "Integrators, contacts and MuJoCo." },
      { id: "robotics", title: "Robotics", blurb: "Kinematics, Jacobians and IK." },
      { id: "control", title: "Control", blurb: "Feedback control from PID to learned policies." },
    ],
    bossQuestId: "w4-boss",
    theme: { accent: "#F59E0B", accent2: "#00E5FF", emblem: "lab" },
  },
  {
    id: "w5",
    index: 5,
    name: "Research Frontier",
    tagline: "Beyond the map: contribute to what is known.",
    description:
      "The final frontier is the edge of human knowledge. Learn to read papers efficiently, design rigorous experiments, and reproduce published results — the rite of passage of every AI researcher.",
    topics: [
      { id: "reading", title: "Reading Research Papers", blurb: "Extract signal from dense literature." },
      { id: "reproduction", title: "Reproducing Experiments", blurb: "Turn claims into running code." },
      { id: "methodology", title: "Research Methodology", blurb: "Baselines, ablations and honest statistics." },
    ],
    bossQuestId: "w5-boss",
    theme: { accent: "#CDB07A", accent2: "#8B5CF6", emblem: "frontier" },
  },
];

export const WORLD_BY_ID: Record<WorldId, World> = Object.fromEntries(
  WORLDS.map((w) => [w.id, w]),
) as Record<WorldId, World>;

export function getWorld(id: string): World | undefined {
  return WORLD_BY_ID[id as WorldId];
}

export function nextWorld(id: WorldId): World | undefined {
  const w = WORLD_BY_ID[id];
  return WORLDS[w.index];
}

export function previousWorld(id: WorldId): World | undefined {
  const w = WORLD_BY_ID[id];
  return w.index > 1 ? WORLDS[w.index - 2] : undefined;
}
