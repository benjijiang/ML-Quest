import type { Quest } from "../types";

/**
 * World 01 — Neural Network Valley.
 * Fully authored starter content with concrete, checkable objectives.
 */
export const WORLD1_QUESTS: Quest[] = [
  // ───────────────────────────── PyTorch ─────────────────────────────
  {
    id: "w1-q-tensors",
    worldId: "w1",
    topicId: "pytorch",
    type: "concept",
    title: "Tensors: The Atoms of Deep Learning",
    summary: "Create, reshape and broadcast tensors — the data structure behind every model.",
    description:
      "Every input, weight and gradient in PyTorch is a tensor. Before training anything, get fluent with how tensors are created, how their shapes change, and how broadcasting lets you write vectorized math without loops.",
    difficulty: 1,
    estimate: "30 min",
    objectives: [
      { id: "create", label: "Create tensors from Python lists, NumPy arrays and with torch.zeros / torch.randn", hint: "Compare torch.tensor(...) vs torch.from_numpy(...) — which one shares memory?" },
      { id: "attrs", label: "Inspect .shape, .dtype and .device for each tensor" },
      { id: "reshape", label: "Use view, reshape, unsqueeze and permute to change a (2, 3, 4) tensor's shape" },
      { id: "broadcast", label: "Add a (3, 1) tensor to a (1, 4) tensor and explain the resulting (3, 4) shape", hint: "Broadcasting aligns shapes from the right." },
      { id: "matmul", label: "Compute a batched matrix multiply with @ and verify the output shape" },
    ],
    completionCriteria: [
      "You can predict the output shape of a broadcasted operation before running it.",
      "Your notebook contains working examples of each operation above.",
    ],
    resources: [
      { title: "PyTorch — Tensors tutorial", url: "https://pytorch.org/tutorials/beginner/basics/tensorqs_tutorial.html", kind: "docs" },
      { title: "NumPy broadcasting rules", url: "https://numpy.org/doc/stable/user/basics.broadcasting.html", kind: "docs" },
    ],
    skillIds: ["ml-pytorch", "m-linear-algebra"],
  },
  {
    id: "w1-q-autograd",
    worldId: "w1",
    topicId: "pytorch",
    type: "concept",
    title: "Autograd: Automatic Differentiation",
    summary: "Let PyTorch compute gradients for you — and understand exactly what it is doing.",
    description:
      "Autograd records operations on tensors with requires_grad=True into a graph, then walks it backwards to compute gradients. Verify it against derivatives you compute by hand.",
    difficulty: 1,
    estimate: "30 min",
    objectives: [
      { id: "basic", label: "For y = x² + 3x at x = 2, call y.backward() and confirm x.grad equals 7" },
      { id: "graph", label: "Inspect y.grad_fn and walk .next_functions to see the recorded graph" },
      { id: "accumulate", label: "Call backward twice and observe gradient accumulation; fix it with .grad.zero_()" },
      { id: "nograd", label: "Use torch.no_grad() and .detach() and explain when each is needed" },
    ],
    completionCriteria: [
      "Hand-computed and autograd gradients match for at least two functions.",
      "You can explain why optimizers call zero_grad() every step.",
    ],
    resources: [
      { title: "PyTorch — Automatic differentiation", url: "https://pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html", kind: "docs" },
      { title: "Autograd mechanics (notes)", url: "https://pytorch.org/docs/stable/notes/autograd.html", kind: "docs" },
    ],
    skillIds: ["ml-pytorch"],
  },
  {
    id: "w1-c-training-loop",
    worldId: "w1",
    topicId: "pytorch",
    type: "challenge",
    title: "Implement a PyTorch Training Loop",
    summary: "Write the five-line heartbeat of deep learning from memory and recover hidden parameters.",
    description:
      "Generate synthetic data from y = 3x + 2 + noise, then train an nn.Linear model to recover the slope and intercept. The goal is to write the canonical forward → loss → zero_grad → backward → step loop without copying it.",
    difficulty: 2,
    estimate: "1 h",
    objectives: [
      { id: "data", label: "Generate 1,000 points from y = 3x + 2 + ε with ε ~ N(0, 0.1²)" },
      { id: "loader", label: "Wrap the data in a TensorDataset and DataLoader with batch_size=32 and shuffle=True" },
      { id: "model", label: "Define the model with nn.Linear(1, 1), an MSE loss and torch.optim.SGD" },
      { id: "loop", label: "Write the training loop: forward, loss, zero_grad, backward, step", hint: "Try writing it without looking anything up." },
      { id: "log", label: "Log the mean loss per epoch and plot it" },
      { id: "recover", label: "Print the learned weight and bias — both within 0.1 of 3 and 2" },
    ],
    completionCriteria: [
      "Learned parameters are within ±0.1 of the ground truth (w = 3, b = 2).",
      "The loss curve decreases monotonically on average.",
    ],
    resources: [
      { title: "PyTorch — Optimizing model parameters", url: "https://pytorch.org/tutorials/beginner/basics/optimization_tutorial.html", kind: "docs" },
      { title: "Dive into Deep Learning — Linear regression from scratch", url: "https://d2l.ai/chapter_linear-regression/linear-regression-scratch.html", kind: "book" },
    ],
    skillIds: ["ml-training-loop", "ml-pytorch"],
  },

  // ──────────────────────────── Gradient Descent ────────────────────────────
  {
    id: "w1-q-gd-intuition",
    worldId: "w1",
    topicId: "gradient-descent",
    type: "concept",
    title: "Understand Gradient Descent",
    summary: "Build an intuition for walking downhill on a loss surface — then do it by hand.",
    description:
      "The gradient points in the direction of steepest ascent; step the other way and the loss goes down. Work through a few steps by hand so the update rule θ ← θ − η∇L feels obvious.",
    difficulty: 1,
    estimate: "30 min",
    objectives: [
      { id: "define", label: "Explain in one sentence what the gradient of a function tells you" },
      { id: "rule", label: "Write down the update rule θ ← θ − η∇L(θ) and name each symbol" },
      { id: "byhand", label: "Minimize f(x) = (x − 3)² from x = 0 with η = 0.1 for three steps", hint: "You should get x ≈ 0.6, 1.08, 1.464." },
      { id: "lr", label: "Describe what happens with η = 1.0 and η = 1.1 on the same function" },
    ],
    completionCriteria: [
      "Your three hand-computed steps match the expected values.",
      "You can explain divergence when the learning rate is too large.",
    ],
    resources: [
      { title: "3Blue1Brown — Gradient descent, how neural networks learn", url: "https://www.3blue1brown.com/lessons/gradient-descent", kind: "video" },
      { title: "Distill — Why momentum really works", url: "https://distill.pub/2017/momentum/", kind: "article" },
    ],
    skillIds: ["ml-gradient-descent", "m-calculus"],
  },
  {
    id: "w1-c-gd-numpy",
    worldId: "w1",
    topicId: "gradient-descent",
    type: "challenge",
    title: "Gradient Descent from Scratch in NumPy",
    summary: "No autograd allowed. Derive the gradients yourself and fit a regression model.",
    description:
      "Implement linear regression trained with batch gradient descent using only NumPy. You'll derive the MSE gradient analytically, compare learning rates and then upgrade to mini-batch SGD.",
    difficulty: 2,
    estimate: "1.5 h",
    objectives: [
      { id: "derive", label: "Derive ∂MSE/∂w and ∂MSE/∂b analytically on paper" },
      { id: "impl", label: "Implement batch gradient descent with NumPy only" },
      { id: "curve", label: "Plot the loss curve for 200 iterations" },
      { id: "compare", label: "Compare learning rates 0.001, 0.01 and 0.1 on one plot" },
      { id: "sgd", label: "Implement a mini-batch SGD variant and compare convergence" },
    ],
    completionCriteria: [
      "Final parameters match the closed-form least-squares solution to 3 decimal places.",
      "The learning-rate comparison plot clearly shows slow, good and unstable regimes.",
    ],
    resources: [
      { title: "CS229 — Linear regression & gradient descent notes", url: "https://cs229.stanford.edu/main_notes.pdf", kind: "course" },
      { title: "An overview of gradient descent optimization algorithms", url: "https://www.ruder.io/optimizing-gradient-descent/", kind: "article" },
    ],
    skillIds: ["ml-gradient-descent", "m-optimization"],
  },

  // ──────────────────────────── Backpropagation ────────────────────────────
  {
    id: "w1-q-chain-rule",
    worldId: "w1",
    topicId: "backprop",
    type: "concept",
    title: "Explain Backpropagation in Your Own Words",
    summary: "Turn the chain rule into a story you could tell a friend.",
    description:
      "Backpropagation is the chain rule applied efficiently over a computational graph. Draw one, compute its local gradients by hand, and write a short explanation — teaching is the fastest test of understanding.",
    difficulty: 2,
    estimate: "45 min",
    objectives: [
      { id: "chain", label: "Review the chain rule for composite functions f(g(x))" },
      { id: "graph", label: "Draw the computational graph for L = (wx + b − y)²" },
      { id: "local", label: "Compute ∂L/∂w and ∂L/∂b by multiplying local gradients backwards" },
      { id: "explain", label: "Write a ~150-word explanation of backprop as if teaching a friend" },
    ],
    completionCriteria: [
      "Your hand-derived gradients match autograd for a numeric example.",
      "Your explanation mentions the forward pass, local gradients, and why reverse order is efficient.",
    ],
    resources: [
      { title: "CS231n — Backpropagation, intuitions", url: "https://cs231n.github.io/optimization-2/", kind: "course" },
      { title: "3Blue1Brown — Backpropagation calculus", url: "https://www.3blue1brown.com/lessons/backpropagation-calculus", kind: "video" },
      { title: "Neural Networks and Deep Learning — Chapter 2", url: "http://neuralnetworksanddeeplearning.com/chap2.html", kind: "book" },
    ],
    skillIds: ["ml-backprop", "m-calculus"],
  },
  {
    id: "w1-c-micrograd",
    worldId: "w1",
    topicId: "backprop",
    type: "challenge",
    title: "Build a Tiny Autograd Engine",
    summary: "Implement a scalar Value class with backward() — the core of every DL framework.",
    description:
      "Recreate the essence of autograd in ~100 lines of Python. Each Value stores its data, gradient and a closure that propagates gradients to its parents. A topological sort makes backward() correct.",
    difficulty: 3,
    estimate: "2–3 h",
    objectives: [
      { id: "value", label: "Implement a Value class storing data, grad, parents and a _backward closure" },
      { id: "ops", label: "Support +, *, ** (power), and tanh with correct local gradients" },
      { id: "topo", label: "Implement backward() using a topological sort of the graph" },
      { id: "verify", label: "Verify gradients against PyTorch on a multi-operation expression" },
      { id: "neuron", label: "Build a single neuron and a 2-layer MLP on top of Value" },
    ],
    completionCriteria: [
      "Gradients match PyTorch to within 1e-6 on at least one non-trivial expression.",
      "Your MLP can fit a tiny 4-sample dataset to near-zero loss.",
    ],
    resources: [
      { title: "Andrej Karpathy — Building micrograd", url: "https://www.youtube.com/watch?v=VMj-3S1tku0", kind: "video" },
      { title: "karpathy/micrograd", url: "https://github.com/karpathy/micrograd", kind: "repo" },
    ],
    skillIds: ["ml-backprop"],
  },
  {
    id: "w1-c-gradcheck",
    worldId: "w1",
    topicId: "backprop",
    type: "challenge",
    title: "Numerical Gradient Check",
    summary: "Trust, but verify: catch backprop bugs with finite differences.",
    description:
      "Implement central finite differences and use them to check analytic gradients of a small two-layer network. Gradient checking is the standard debugging tool when writing backward passes by hand.",
    difficulty: 2,
    estimate: "1 h",
    objectives: [
      { id: "fd", label: "Implement central differences: (f(θ+h) − f(θ−h)) / 2h" },
      { id: "mlp", label: "Write the forward and manual backward pass of a 2-layer MLP in NumPy" },
      { id: "relerr", label: "Compute the relative error between numerical and analytic gradients" },
      { id: "bug", label: "Introduce a deliberate bug in the backward pass and confirm the check catches it" },
    ],
    completionCriteria: [
      "Relative error < 1e-6 for a correct implementation (float64).",
      "The deliberate bug produces a clearly larger error.",
    ],
    resources: [
      { title: "CS231n — Gradient checks", url: "https://cs231n.github.io/neural-networks-3/#gradcheck", kind: "course" },
    ],
    skillIds: ["ml-backprop", "m-calculus"],
  },

  // ───────────────────────────── Mini-project ─────────────────────────────
  {
    id: "w1-p-mnist-mlp",
    worldId: "w1",
    topicId: "pytorch",
    type: "project",
    title: "Handwritten Digit Classifier",
    summary: "Train a multilayer perceptron on MNIST to 97%+ test accuracy.",
    description:
      "Combine everything from this world: tensors, the training loop and an understanding of what backprop is doing under the hood. Build, train and evaluate an MLP on MNIST, then document it as your first portfolio project.",
    difficulty: 3,
    estimate: "3–4 h",
    objectives: [
      { id: "data", label: "Load MNIST with torchvision and normalize the inputs" },
      { id: "model", label: "Build an MLP with two hidden layers and ReLU activations" },
      { id: "train", label: "Train with Adam, tracking training and validation loss each epoch" },
      { id: "eval", label: "Reach ≥ 97% test accuracy" },
      { id: "errors", label: "Visualize 16 misclassified digits and hypothesize why they fail" },
      { id: "readme", label: "Push to GitHub with a README: results, curves, and what you learned" },
    ],
    completionCriteria: [
      "Test accuracy ≥ 97% reported on the held-out test set.",
      "Public repository with code, plots and a README.",
    ],
    resources: [
      { title: "PyTorch — Quickstart (FashionMNIST)", url: "https://pytorch.org/tutorials/beginner/basics/quickstart_tutorial.html", kind: "docs" },
      { title: "torchvision.datasets.MNIST", url: "https://pytorch.org/vision/stable/generated/torchvision.datasets.MNIST.html", kind: "docs" },
    ],
    skillIds: ["ml-mlp", "ml-training-loop"],
    technologies: ["Python", "PyTorch", "torchvision", "Matplotlib"],
  },

  // ─────────────────────────────── Boss ───────────────────────────────
  {
    id: "w1-boss",
    worldId: "w1",
    topicId: "boss",
    type: "boss",
    title: "Build a Neural Network from Scratch",
    summary: "Implement, train and visualize a neural network that learns a nonlinear boundary — no autograd.",
    description:
      "The Valley's guardian tests whether you truly understand what a neural network is. Using only NumPy, build a multilayer network that learns to separate two interleaving half-moons — a problem no straight line can solve — and make its learning visible.",
    difficulty: 3,
    estimate: "4–6 h",
    objectives: [
      { id: "gen", stage: 1, label: "Generate a two-moons dataset (n = 1,000, noise = 0.2) with sklearn.datasets.make_moons" },
      { id: "viz", stage: 1, label: "Scatter-plot the dataset colored by class and split train / test (80 / 20)" },
      { id: "init", stage: 2, label: "Implement parameter initialization for a 2 → 16 → 16 → 1 network", hint: "Try He or Xavier initialization and explain your choice." },
      { id: "forward", stage: 2, label: "Implement the forward pass with tanh/ReLU hidden layers and a sigmoid output" },
      { id: "backward", stage: 2, label: "Derive and implement the backward pass for binary cross-entropy loss" },
      { id: "check", stage: 2, label: "Gradient-check your backward pass against finite differences" },
      { id: "train", stage: 3, label: "Train with mini-batch gradient descent and log train / test loss" },
      { id: "loss", stage: 3, label: "Plot the loss curves and report final train and test accuracy" },
      { id: "boundary", stage: 4, label: "Plot the learned decision boundary over a dense mesh grid" },
      { id: "evolve", stage: 4, label: "Visualize how the boundary evolves at 4+ checkpoints during training" },
    ],
    completionCriteria: [
      "≥ 95% test accuracy on two-moons with noise = 0.2.",
      "No autograd or deep-learning framework used for the network itself.",
      "Decision-boundary plot shows a clearly nonlinear separation.",
      "Code published in a public repository.",
    ],
    resources: [
      { title: "sklearn.datasets.make_moons", url: "https://scikit-learn.org/stable/modules/generated/sklearn.datasets.make_moons.html", kind: "docs" },
      { title: "CS231n — Putting it together: minimal neural network case study", url: "https://cs231n.github.io/neural-networks-case-study/", kind: "course" },
      { title: "TensorFlow Playground (for intuition)", url: "https://playground.tensorflow.org/", kind: "article" },
    ],
    skillIds: ["ml-mlp", "ml-backprop"],
    technologies: ["Python", "NumPy", "Matplotlib", "scikit-learn"],
    boss: {
      codename: "THE NEURAL ARCHITECT",
      mission: "Build and train a neural network that learns a nonlinear classification boundary.",
      achievementId: "boss-w1",
      stages: [
        { index: 1, title: "Forge the Dataset", summary: "Generate and visualize a dataset that no linear model can solve." },
        { index: 2, title: "Assemble the Network", summary: "Implement initialization, forward and backward passes by hand." },
        { index: 3, title: "Ignite Training", summary: "Train the model and make its loss visible." },
        { index: 4, title: "Reveal the Boundary", summary: "Plot the decision surface your network has learned." },
      ],
    },
  },
];
