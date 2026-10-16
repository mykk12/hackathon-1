import type { DocumentChunk } from './ragEngine.ts';
import { splitIntoChunks } from './ragEngine.ts';

export interface SeedResourceData {
  id: string;
  title: string;
  fileName: string;
  subject: string;
  format: string;
  author: string;
  isPublic: boolean;
  ownerEmail?: string;
  topics: string[];
  pages: { pageNumber: number; text: string }[];
}

export const SEED_RESOURCES_DATA: SeedResourceData[] = [
  {
    id: 'user-res-1',
    title: 'Midterm Algorithms & Graph Review',
    fileName: 'Midterm_Algorithms_Graph_Review.pdf',
    subject: 'Computer Science',
    format: 'PDF',
    author: 'You (Student)',
    isPublic: true,
    ownerEmail: 'mayank.bamil012@gmail.com',
    topics: ['Graphs', 'Shortest Path', 'Topological Sort', 'Dijkstra', 'Kruskal'],
    pages: [
      {
        pageNumber: 1,
        text: `Midterm Algorithms & Graph Review - Page 1
Section 1: Single-Source Shortest Path (Dijkstra's Algorithm)
- Overview: Computes shortest paths from a single source vertex to all other vertices in a weighted graph with non-negative edge weights.
- Key Invariant: Once a vertex is extracted from the priority queue (visited), its tentative distance from the source is finalized and optimal.
- Priority Queue Implementation:
  Using a Min-Heap (Binary Heap): Time Complexity is O((V + E) * log V).
  Using a Fibonacci Heap: Time Complexity is O(E + V * log V).
- Relaxation Step: For each neighbor v of current vertex u, if dist[u] + weight(u, v) < dist[v], then dist[v] = dist[u] + weight(u, v) and parent[v] = u.
- Limitation: Fails on graphs containing negative edge weights because the greedy choice property is violated. Use Bellman-Ford instead.`,
      },
      {
        pageNumber: 2,
        text: `Midterm Algorithms & Graph Review - Page 2
Section 2: Bellman-Ford Algorithm & Negative Cycles
- Overview: Computes single-source shortest paths on graphs with arbitrary (including negative) edge weights and detects negative-weight cycles.
- Algorithm Mechanism: Relaxes all |E| edges repeatedly |V| - 1 times.
- Runtime Complexity: O(V * E) time, O(V) space.
- Negative Cycle Detection: Execute an additional relaxation pass (the |V|-th iteration). If any edge can still be relaxed (dist[u] + weight(u, v) < dist[v]), then the graph contains a negative-weight cycle reachable from the source vertex.
- Application: Currency arbitrage detection in financial networks and routing protocols like RIP (Routing Information Protocol).`,
      },
      {
        pageNumber: 3,
        text: `Midterm Algorithms & Graph Review - Page 3
Section 3: Minimum Spanning Trees (MST) - Kruskal's & Prim's
- Kruskal's Algorithm:
  Greedy algorithm that sorts all edges in non-decreasing order of weight. Iterates through sorted edges and adds the edge to the spanning tree if it connects two previously disconnected components.
  Disjoint Set Union (DSU / Union-Find) with Path Compression and Union by Rank achieves nearly linear O(E * alpha(V)) time after sorting.
  Total Runtime: O(E * log E) or O(E * log V) due to initial edge sorting.
- Prim's Algorithm:
  Grows a single tree from an arbitrary starting vertex. At each step, adds the cheapest edge connecting a tree vertex to a non-tree vertex.
  Runtime: O((V + E) * log V) using a binary heap. Best for dense graphs (E approx V^2) where Fibonacci heap achieves O(E + V * log V).`,
      },
      {
        pageNumber: 4,
        text: `Midterm Algorithms & Graph Review - Page 4
Section 4: Topological Sorting & Directed Acyclic Graphs (DAGs)
- Definition: A linear ordering of vertices such that for every directed edge u -> v, vertex u comes before vertex v in the ordering.
- Crucial Theorem: A directed graph possesses a topological sort if and only if it is a DAG (Directed Acyclic Graph).
- Kahn's Algorithm (BFS-based):
  1. Compute the in-degree of all vertices.
  2. Enqueue all vertices with in-degree 0 into a FIFO queue.
  3. While queue is not empty: dequeue vertex u, append u to output, and decrement in-degrees of all neighbors. If a neighbor reaches in-degree 0, enqueue it.
  4. If output length is less than |V|, a cycle exists.
  Runtime: O(V + E) time, O(V) space.
- Depth-First Search (DFS) Approach:
  Execute DFS traversal and maintain three vertex colors: White (unvisited), Gray (currently exploring on call stack), Black (fully processed).
  If an edge points to a Gray vertex, a back-edge (cycle) is detected.
  Push vertices to a stack upon post-visit completion; reversing the post-order sequence yields the topological order.`,
      },
    ],
  },
  {
    id: 'user-res-2',
    title: 'Biochemistry Reaction Pathways & Enzymes',
    fileName: 'Biochemistry_Reaction_Pathways.docx',
    subject: 'Biology',
    format: 'DOC',
    author: 'You (Student)',
    isPublic: false, // PRIVATE to mayank.bamil012@gmail.com
    ownerEmail: 'mayank.bamil012@gmail.com',
    topics: ['Enzymes', 'Glycolysis', 'Bioenergetics', 'Krebs Cycle', 'Michaelis-Menten'],
    pages: [
      {
        pageNumber: 1,
        text: `Biochemistry Reaction Pathways & Enzymes - Confidential Study Guide - Page 1
Section 1: Glycolysis 10-Step Pathway & Key Regulatory Checkpoints
- Net Reaction: Glucose + 2 NAD+ + 2 ADP + 2 Pi -> 2 Pyruvate + 2 NADH + 2 H+ + 2 ATP + 2 H2O.
- Preparatory Phase (Consumes 2 ATP):
  Step 1: Glucose -> Glucose-6-phosphate (Enzyme: Hexokinase or Glucokinase in liver). Irreversible.
  Step 2: Glucose-6-phosphate <-> Fructose-6-phosphate (Phosphoglucose Isomerase).
  Step 3: Fructose-6-phosphate -> Fructose-1,6-bisphosphate (Phosphofructokinase-1, PFK-1). Committed and rate-limiting step!
  Step 4: Fructose-1,6-bisphosphate <-> DHAP + GAP (Aldolase).
  Step 5: DHAP <-> GAP (Triose Phosphate Isomerase).
- Payoff Phase (Generates 4 ATP, 2 NADH):
  Step 6: GAP -> 1,3-Bisphosphoglycerate (GAPDH, yields NADH).
  Step 7: 1,3-BPG -> 3-Phosphoglycerate (Phosphoglycerate Kinase, generates ATP via substrate-level phosphorylation).
  Step 8: 3-PG <-> 2-PG (Phosphoglycerate Mutase).
  Step 9: 2-PG <-> Phosphoenolpyruvate (Enolase, releases H2O).
  Step 10: Phosphoenolpyruvate (PEP) -> Pyruvate (Pyruvate Kinase, generates ATP). Irreversible.`,
      },
      {
        pageNumber: 2,
        text: `Biochemistry Reaction Pathways & Enzymes - Page 2
Section 2: PFK-1 Allosteric Regulation
- Rate-Limiting Enzyme: Phosphofructokinase-1 (PFK-1).
- Allosteric Inhibitors (signals of high cellular energy):
  ATP (binds allosteric site lowering affinity for F6P) and Citrate (downstream feedback from Krebs cycle).
- Allosteric Activators (signals of low cellular energy):
  AMP, ADP, and Fructose-2,6-bisphosphate (F-2,6-BP).
- Hormonal Regulation:
  Insulin activates PFK-2 via dephosphorylation, increasing F-2,6-BP and stimulating glycolysis.
  Glucagon in liver activates FBPase-2 via protein kinase A phosphorylation, lowering F-2,6-BP and inhibiting glycolysis to promote gluconeogenesis.`,
      },
      {
        pageNumber: 3,
        text: `Biochemistry Reaction Pathways & Enzymes - Page 3
Section 3: Michaelis-Menten Enzyme Kinetics & Inhibition
- Michaelis-Menten Equation: v0 = (Vmax * [S]) / (Km + [S]).
- Km (Michaelis constant): Substrate concentration at which initial velocity v0 = 1/2 Vmax. Inversely proportional to enzyme-substrate affinity.
- Lineweaver-Burk Double Reciprocal Plot:
  1 / v0 = (Km / Vmax) * (1 / [S]) + (1 / Vmax).
  Slope = Km / Vmax, Y-intercept = 1 / Vmax, X-intercept = -1 / Km.
- Types of Reversible Inhibition:
  1. Competitive Inhibition: Inhibitor binds free enzyme active site. Vmax unchanged; apparent Km increases. Plot lines intersect at y-axis.
  2. Non-competitive Inhibition: Inhibitor binds allosteric site on enzyme or ES complex with equal affinity. Vmax decreases; Km unchanged. Plot lines intersect at negative x-axis.
  3. Uncompetitive Inhibition: Inhibitor binds strictly to enzyme-substrate (ES) complex. Both Vmax and Km decrease proportionally. Parallel lines on Lineweaver-Burk plot.`,
      },
    ],
  },
  {
    id: 'res-1',
    title: 'Data Structures — Quick Revision',
    fileName: 'Data_Structures_Quick_Revision.pdf',
    subject: 'Computer Science',
    format: 'PDF',
    author: 'Aria Chen',
    isPublic: true,
    topics: ['Binary Trees', 'Graph Algorithms', 'Hashing', 'Complexity', 'AVL Trees', 'Heaps'],
    pages: [
      {
        pageNumber: 1,
        text: `Data Structures — Quick Revision Cheat Sheet (Page 1)
Trees & Binary Search Trees (BST):
- Definition: Hierarchical data structure with a root node where each parent node has at most two children (left and right).
- BST Invariant: For any node X, all values in X's left subtree are strictly less than X.val, and all values in X's right subtree are strictly greater than X.val.
- In-Order Traversal (Left, Root, Right) of a BST always yields values in sorted ascending order.
- Time Complexities:
  Search, Insert, Delete in Balanced BST: O(log n) average.
  Skewed/Degenerate BST (linked list shape): O(n) worst case.
- AVL Tree Self-Balancing:
  Balance Factor = height(left_subtree) - height(right_subtree). Must remain in {-1, 0, 1}.
  Rotations: Left-Left (Right Rotation), Right-Right (Left Rotation), Left-Right (Left then Right Rotation), Right-Left (Right then Left Rotation).`,
      },
      {
        pageNumber: 2,
        text: `Data Structures — Quick Revision Cheat Sheet (Page 2)
Binary Heaps & Priority Queues:
- Complete Binary Tree property: All levels completely filled except possibly the bottom level, filled from left to right.
- Array Representation: Root at index 0. For node at index i: Left child = 2i + 1, Right child = 2i + 2, Parent = floor((i - 1) / 2).
- Min-Heap Property: parent.val <= child.val. Root contains the global minimum element.
- Operations:
  Insert: Add at end and bubble up (heapify-up). Time: O(log n).
  Extract-Min: Swap root with last element, pop last, bubble down (heapify-down). Time: O(log n).
  Build-Heap from arbitrary array: Bottom-up heapify runs in O(n) linear time, NOT O(n log n).
Hash Tables & Collision Resolution:
- Hash Function properties: Deterministic, uniform distribution, fast computation O(1).
- Separate Chaining: Linked lists or red-black trees at each bucket index. Load factor alpha = n / m.
- Open Addressing: Linear Probing (h(k, i) = (h(k) + i) mod m), Quadratic Probing, Double Hashing (prevents primary & secondary clustering).`,
      },
    ],
  },
  {
    id: 'res-2',
    title: 'Calculus Formula Sheet',
    fileName: 'Calculus_Formula_Sheet.pdf',
    subject: 'Mathematics',
    format: 'Notes',
    author: 'Prof. David Miller',
    isPublic: true,
    topics: ['Derivatives', 'Integration Rules', 'Taylor Series', 'Limits'],
    pages: [
      {
        pageNumber: 1,
        text: `Calculus Formula Sheet & Reference Tables (Page 1)
Fundamental Derivative Rules:
- Power Rule: d/dx [x^n] = n * x^(n - 1)
- Product Rule: d/dx [u * v] = u' * v + u * v'
- Quotient Rule: d/dx [u / v] = (u' * v - u * v') / (v^2)
- Chain Rule: d/dx [f(g(x))] = f'(g(x)) * g'(x)
- Exponential & Logarithm: d/dx [e^x] = e^x, d/dx [ln(x)] = 1 / x
- Trigonometric Derivatives:
  d/dx [sin(x)] = cos(x)
  d/dx [cos(x)] = -sin(x)
  d/dx [tan(x)] = sec^2(x)
  d/dx [sec(x)] = sec(x) * tan(x)`,
      },
      {
        pageNumber: 2,
        text: `Calculus Formula Sheet & Reference Tables (Page 2)
Integration Techniques & Series Expansions:
- Integration by Parts Formula: integral(u * dv) = u * v - integral(v * du). Selection heuristic: LIATE (Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential).
- Fundamental Theorem of Calculus: integral from a to b of f(x) dx = F(b) - F(a) where F'(x) = f(x).
- Taylor Series Expansion about x = a:
  f(x) = sum from n=0 to infinity of [f^(n)(a) / n!] * (x - a)^n.
  Maclaurin Series (a = 0):
  e^x = 1 + x + x^2 / 2! + x^3 / 3! + ...
  sin(x) = x - x^3 / 3! + x^5 / 5! - ...
  cos(x) = 1 - x^2 / 2! + x^4 / 4! - ...
  1 / (1 - x) = 1 + x + x^2 + x^3 + ... for |x| < 1.`,
      },
    ],
  },
  {
    id: 'res-5',
    title: 'Financial Accounting Fundamentals',
    fileName: 'Financial_Accounting_Fundamentals.pdf',
    subject: 'Business',
    format: 'PDF',
    author: 'Elena Gomez',
    isPublic: true,
    topics: ['Accounting Equation', 'Balance Sheet', 'Income Statement', 'Ratios'],
    pages: [
      {
        pageNumber: 1,
        text: `Financial Accounting Fundamentals (Page 1)
The Core Accounting Equation:
  Assets = Liabilities + Stockholders' Equity
- Assets: Economic resources owned by the business that offer future economic benefit (Cash, Accounts Receivable, Inventory, Equipment, Prepaid Expenses).
- Liabilities: Obligations to creditors requiring settlement via assets or services (Accounts Payable, Notes Payable, Accrued Expenses, Unearned Revenue).
- Stockholders' Equity: Residual claim on assets after deducting liabilities (Common Stock, Additional Paid-in Capital, Retained Earnings).
  Retained Earnings = Beginning Retained Earnings + Net Income - Dividends Paid.
- Double-Entry Bookkeeping Principles:
  Every transaction affects at least two accounts. Total Debits MUST equal Total Credits.
  DEALER Mnemonic:
  Debit normal balance: Dividends, Expenses, Assets.
  Credit normal balance: Liabilities, Equity, Revenue.`,
      },
      {
        pageNumber: 2,
        text: `Financial Accounting Fundamentals (Page 2)
Key Financial Ratios & Statements:
- Working Capital = Current Assets - Current Liabilities.
- Current Ratio = Current Assets / Current Liabilities (Health benchmark >= 1.5).
- Quick Ratio (Acid-Test) = (Cash + Marketable Securities + Accounts Receivable) / Current Liabilities (excludes Inventory and Prepaid Expenses).
- Debt-to-Equity Ratio = Total Debt / Total Stockholders' Equity.
- Gross Margin % = (Revenue - Cost of Goods Sold) / Revenue * 100.
- Net Profit Margin = Net Income / Revenue * 100.
- Return on Equity (ROE) = Net Income / Average Stockholders' Equity.`,
      },
    ],
  },
  {
    id: 'res-9',
    title: 'Database Normalization & SQL Queries',
    fileName: 'Database_Normalization_SQL.md',
    subject: 'Computer Science',
    format: 'Notes',
    author: 'Devon Lee',
    isPublic: true,
    topics: ['SQL', 'Normalization', 'Relational Algebra', 'Indexing'],
    pages: [
      {
        pageNumber: 1,
        text: `Database Normalization & SQL Architecture
Normalization Forms (1NF through BCNF):
- Purpose: Eliminate data redundancy and prevent insertion, update, and deletion anomalies.
- First Normal Form (1NF):
  Each column contains atomic (indivisible) values. No repeating groups or arrays. Unique primary key identified.
- Second Normal Form (2NF):
  Must be in 1NF. No partial functional dependency: every non-prime attribute must depend on the whole candidate key, not a proper subset of a composite primary key.
- Third Normal Form (3NF):
  Must be in 2NF. No transitive dependency: non-prime attributes must depend directly on candidate keys (X -> Y where Y is non-prime implies X is a superkey).
- Boyce-Codd Normal Form (BCNF):
  For every functional dependency X -> Y, X MUST be a superkey.
SQL Query Execution Order:
  FROM -> ON -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT.`,
      },
    ],
  },
  {
    id: 'res-13',
    title: 'Computer Networks & OSI Model',
    fileName: 'Computer_Networks_OSI_Model.pdf',
    subject: 'Computer Science',
    format: 'PDF',
    author: 'Zack Walker',
    isPublic: true,
    topics: ['Networking', 'TCP/IP', 'OSI Layers', 'Handshake'],
    pages: [
      {
        pageNumber: 1,
        text: `Computer Networks & Protocols Reference
The 7 Layers of the OSI Model:
1. Physical Layer: Raw bit stream over physical medium (copper cable, optical fiber, radio frequencies). PDU: Bit.
2. Data Link Layer: Node-to-node framing, physical MAC addressing, error detection (CRC). PDU: Frame. (Ethernet, Wi-Fi 802.11).
3. Network Layer: Logical host addressing (IPv4/IPv6), packet routing and forwarding across subnetworks. PDU: Packet. (IP, ICMP, OSPF, BGP).
4. Transport Layer: End-to-end host-to-host process communication, segmentation, flow control, reliability. PDU: Segment/Datagram. (TCP, UDP).
5. Session Layer: Establishes, manages, and terminates conversational sessions between processes.
6. Presentation Layer: Translation, character encoding (ASCII/Unicode), encryption (TLS/SSL), data compression.
7. Application Layer: End-user application network interfaces. (HTTP, DNS, SSH, SMTP).
TCP 3-Way Handshake Connection Establishment:
  1. Client sends SYN (Synchronize sequence number X).
  2. Server responds with SYN-ACK (Synchronize sequence number Y, Acknowledge X + 1).
  3. Client responds with ACK (Acknowledge Y + 1). Connection established.`,
      },
    ],
  },
  {
    id: 'res-17',
    title: 'Operating Systems & Concurrency',
    fileName: 'Operating_Systems_Concurrency.pdf',
    subject: 'Computer Science',
    format: 'PDF',
    author: 'Rachel Adams',
    isPublic: true,
    topics: ['Concurrency', 'Memory Management', 'Process Scheduling', 'Deadlocks'],
    pages: [
      {
        pageNumber: 1,
        text: `Operating Systems & Concurrency Deep-Dive
Processes, Threads & Synchronization:
- Process: An instance of an executing program with isolated address space (Text, Data, Heap, Stack) and PCB.
- Thread: Smallest unit of CPU execution sharing code, data, and OS resources with peer threads, but maintaining its own private stack and registers.
- Deadlock: A condition where a set of processes are blocked because each is holding a resource and waiting for another resource held by another process.
- The 4 Necessary Coffman Conditions for Deadlock:
  1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
  2. Hold and Wait: A process must be holding at least one resource and waiting to acquire additional resources held by other processes.
  3. No Preemption: Resources cannot be forcibly preempted; they are released only voluntarily by the holding process.
  4. Circular Wait: A closed chain of processes P0, P1, ..., Pn exists such that P0 waits for P1, P1 waits for P2, and Pn waits for P0.
- Prevention & Avoidance:
  Deadlock Avoidance: Dijkstra's Banker's Algorithm dynamically tests resource allocation safety before granting requests.
  Circular Wait Prevention: Impose a strict global ordering on all resource types and require processes to request resources in strictly increasing numerical order.`,
      },
    ],
  },
];

/**
 * Initializes the RAG knowledge store with pre-indexed seed materials
 */
export function initializeSeedKnowledgeBase(): DocumentChunk[] {
  const allChunks: DocumentChunk[] = [];

  for (const resource of SEED_RESOURCES_DATA) {
    const chunks = splitIntoChunks(
      resource.pages.map((p) => p.text).join('\n\n'),
      {
        resourceId: resource.id,
        title: resource.title,
        subject: resource.subject,
        format: resource.format,
        fileName: resource.fileName,
        isPublic: resource.isPublic,
        ownerEmail: resource.ownerEmail,
        topics: resource.topics,
      },
      resource.pages
    );
    allChunks.push(...chunks);
  }

  return allChunks;
}
