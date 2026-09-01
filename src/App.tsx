import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'

type DimensionLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Direction = 'out' | 'in' | 'either'
type NodeKind =
  | 'focus'
  | 'concept'
  | 'state'
  | 'factor'
  | 'trajectory'
  | 'rule'
  | 'framework'
  | 'observer'
  | 'model'
  | 'architecture'
  | 'system'
  | 'axis'

type FocusField = 'definition' | 'boundary' | 'state' | 'evidence'

interface PromptTemplate {
  id: string
  title: string
  relation: string
  question: string
  example: string
  direction: Direction
  kind: NodeKind
}

interface DimensionDefinition {
  level: DimensionLevel
  name: string
  verb: string
  short: string
  description: string
  coreQuestion: string
  value: string
  targetRequired: number
  prompts: PromptTemplate[]
}

interface LabNode {
  id: string
  label: string
  kind: NodeKind
  x: number
  y: number
  layer: DimensionLevel
  context: string
  notes: string
  confidence: number
  createdAt: string
}

interface LabEdge {
  id: string
  from: string
  to: string
  relation: string
  layer: DimensionLevel
  promptId: string
  notes: string
}

interface FocusProfile {
  definition: string
  boundary: string
  state: string
  evidence: string
}

interface LabMap {
  schemaVersion: 1
  id: string
  title: string
  subject: string
  dimension: DimensionLevel
  rootId: string
  nodes: LabNode[]
  edges: LabEdge[]
  focus: FocusProfile
  createdAt: string
  updatedAt: string
}

interface ComposerState {
  key: string
  fromId: string
  prompt: PromptTemplate
  x: number
  y: number
}

interface ViewState {
  panX: number
  panY: number
  scale: number
}

const STORAGE_KEY = 'dream-unity.training-dimensions.v1'
const WORLD_WIDTH = 4200
const WORLD_HEIGHT = 3000
const WORLD_CENTRE = { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 }
const NODE_KINDS: NodeKind[] = [
  'focus',
  'concept',
  'state',
  'factor',
  'trajectory',
  'rule',
  'framework',
  'observer',
  'model',
  'architecture',
  'system',
  'axis',
]

const DIMENSIONS: DimensionDefinition[] = [
  {
    level: 1,
    name: 'Focus',
    verb: 'Isolate',
    short: 'Represent one phenomenon precisely before relating it.',
    description:
      'One-dimensional training is retained as a baseline: hold one subject steady, define it, mark its boundary and describe its present state. It deliberately creates no branches.',
    coreQuestion: 'What exactly is this, here and now?',
    value: 'Prevents vague labels from contaminating every later relationship.',
    targetRequired: 3,
    prompts: [],
  },
  {
    level: 2,
    name: 'Relation',
    verb: 'Connect',
    short: 'Discover direct pairwise relationships.',
    description:
      'Connect the focal subject to another concept with a precise semantic line. Nodes remain things; the line states what one thing does to the other.',
    coreQuestion: 'What is directly related, and how?',
    value: 'Turns isolated concepts into explicit, communicable relationships.',
    targetRequired: 3,
    prompts: [
      {
        id: 'd2-influence-in',
        title: 'Direct cause',
        relation: 'shapes',
        question: 'What directly shapes this?',
        example: 'Life experiences → shape → intuition',
        direction: 'in',
        kind: 'factor',
      },
      {
        id: 'd2-influence-out',
        title: 'Direct effect',
        relation: 'influences',
        question: 'What does this directly influence?',
        example: 'Intuition → influences → first impressions',
        direction: 'out',
        kind: 'concept',
      },
      {
        id: 'd2-dependence',
        title: 'Dependence',
        relation: 'depends on',
        question: 'What must exist for this to function?',
        example: 'Intuition → depends on → pattern exposure',
        direction: 'out',
        kind: 'factor',
      },
      {
        id: 'd2-contrast',
        title: 'Contrast',
        relation: 'contrasts with',
        question: 'What reveals this through contrast?',
        example: 'Intuition ↔ contrasts with ↔ deliberate calculation',
        direction: 'either',
        kind: 'concept',
      },
    ],
  },
  {
    level: 3,
    name: 'System',
    verb: 'Integrate',
    short: 'Build an interacting network, not a list of pairs.',
    description:
      'Add mediators, moderators, constraints and competing influences. Then cross-link existing nodes so the map becomes a functioning system rather than a radial catalogue.',
    coreQuestion: 'How do several relationships jointly produce the present pattern?',
    value: 'Reveals mechanisms, leverage points and hidden interactions.',
    targetRequired: 4,
    prompts: [
      {
        id: 'd3-mediator',
        title: 'Mediator',
        relation: 'is mediated by',
        question: 'What carries this influence from one part of the system to another?',
        example: 'Experience → emotion → intuitive judgement',
        direction: 'out',
        kind: 'factor',
      },
      {
        id: 'd3-moderator',
        title: 'Moderator',
        relation: 'is moderated by',
        question: 'What changes the strength or direction of this relationship?',
        example: 'Stress moderates whether intuition improves or degrades judgement',
        direction: 'out',
        kind: 'factor',
      },
      {
        id: 'd3-constraint',
        title: 'Constraint',
        relation: 'is constrained by',
        question: 'What limits the system despite its intentions?',
        example: 'Intuition is constrained by limited experience',
        direction: 'out',
        kind: 'factor',
      },
      {
        id: 'd3-tension',
        title: 'Competing force',
        relation: 'competes with',
        question: 'What pushes the system in a conflicting direction?',
        example: 'Social conformity competes with private intuition',
        direction: 'either',
        kind: 'factor',
      },
      {
        id: 'd3-function',
        title: 'System function',
        relation: 'helps regulate',
        question: 'What larger function does this perform within the whole?',
        example: 'Intuition helps regulate rapid decisions under uncertainty',
        direction: 'out',
        kind: 'system',
      },
    ],
  },
  {
    level: 4,
    name: 'Transformation',
    verb: 'Track',
    short: 'Follow changing relationships through time and feedback.',
    description:
      'Model prior state, transition, consequence and feedback. The system itself must change; merely attaching a date to a static map does not qualify.',
    coreQuestion: 'How does this network transform, and what returns to alter its starting conditions?',
    value: 'Exposes development, path-dependence, delays and self-reinforcing loops.',
    targetRequired: 4,
    prompts: [
      {
        id: 'd4-prior',
        title: 'Prior state',
        relation: 'developed from',
        question: 'What earlier state became this?',
        example: 'Unarticulated bodily signals → developed into → trusted intuition',
        direction: 'in',
        kind: 'state',
      },
      {
        id: 'd4-next',
        title: 'Next state',
        relation: 'transforms into',
        question: 'What could this become after repeated experience?',
        example: 'Intuition → transforms into → calibrated expertise',
        direction: 'out',
        kind: 'state',
      },
      {
        id: 'd4-feedback',
        title: 'Feedback',
        relation: 'feeds back into',
        question: 'What consequence returns and changes the original condition?',
        example: 'Decision outcomes → feed back into → future intuition',
        direction: 'out',
        kind: 'state',
      },
      {
        id: 'd4-delay',
        title: 'Delay',
        relation: 'changes after a delay through',
        question: 'Which effect arrives late enough to be misread?',
        example: 'Avoidance creates delayed evidence that falsely validates fear',
        direction: 'out',
        kind: 'state',
      },
      {
        id: 'd4-amplifier',
        title: 'Amplification',
        relation: 'amplifies over time through',
        question: 'What process strengthens this across repeated cycles?',
        example: 'Repeated accurate predictions amplify trust in intuition',
        direction: 'out',
        kind: 'state',
      },
    ],
  },
  {
    level: 5,
    name: 'Trajectory Space',
    verb: 'Branch',
    short: 'Compare multiple possible evolving futures.',
    description:
      'Generate counterfactual trajectories, decision branches, convergence points and irreversibilities. Hold several plausible histories in view rather than predicting one line.',
    coreQuestion: 'Which futures become possible from here, and where do they diverge?',
    value: 'Improves strategic choice by revealing branch points before they close.',
    targetRequired: 3,
    prompts: [
      {
        id: 'd5-branch',
        title: 'Possible future',
        relation: 'could branch into',
        question: 'What distinct future could emerge from this state?',
        example: 'Trusting intuition could branch into mastery or overconfidence',
        direction: 'out',
        kind: 'trajectory',
      },
      {
        id: 'd5-condition',
        title: 'Branch condition',
        relation: 'occurs if',
        question: 'What condition selects one trajectory over another?',
        example: 'Calibrated intuition occurs if feedback remains honest',
        direction: 'out',
        kind: 'trajectory',
      },
      {
        id: 'd5-counterfactual',
        title: 'Counterfactual',
        relation: 'would differ if',
        question: 'What single change produces a meaningfully different history?',
        example: 'Identity would differ if early failures were interpreted as information',
        direction: 'out',
        kind: 'trajectory',
      },
      {
        id: 'd5-convergence',
        title: 'Convergence',
        relation: 'may converge with',
        question: 'Which different paths eventually produce a similar state?',
        example: 'Practice-led and mentor-led learning may converge in expertise',
        direction: 'either',
        kind: 'trajectory',
      },
      {
        id: 'd5-irreversible',
        title: 'Irreversibility',
        relation: 'becomes hard to reverse after',
        question: 'Which threshold permanently changes later options?',
        example: 'Public identity can become hard to reverse after repeated commitments',
        direction: 'out',
        kind: 'trajectory',
      },
    ],
  },
  {
    level: 6,
    name: 'Generative Rules',
    verb: 'Expose',
    short: 'Find the assumptions and rules generating the trajectory space.',
    description:
      'Move above choosing among futures. Identify the definitions, incentives, constraints and hidden assumptions that decide which futures appear possible at all.',
    coreQuestion: 'What is generating this possibility landscape?',
    value: 'Lets the learner redesign the source of options rather than optimise inside inherited options.',
    targetRequired: 3,
    prompts: [
      {
        id: 'd6-assumption',
        title: 'Hidden assumption',
        relation: 'is generated by the assumption',
        question: 'What untested assumption makes this map look inevitable?',
        example: 'Status ambition is generated by the assumption that worth must be externally proven',
        direction: 'out',
        kind: 'rule',
      },
      {
        id: 'd6-rule',
        title: 'Operating rule',
        relation: 'is governed by the rule',
        question: 'What recurring rule converts conditions into outcomes?',
        example: 'When uncertainty rises, familiar interpretations receive priority',
        direction: 'out',
        kind: 'rule',
      },
      {
        id: 'd6-permission',
        title: 'Permission structure',
        relation: 'becomes possible when',
        question: 'What rule change makes previously invisible futures available?',
        example: 'Redefining failure as data makes experimentation possible',
        direction: 'out',
        kind: 'rule',
      },
      {
        id: 'd6-prohibition',
        title: 'Prohibition',
        relation: 'is excluded by',
        question: 'What constraint removes a trajectory before it can be considered?',
        example: 'A fixed identity excludes futures requiring beginnerhood',
        direction: 'out',
        kind: 'rule',
      },
      {
        id: 'd6-objective',
        title: 'Objective function',
        relation: 'optimises for',
        question: 'What is the system actually rewarding, regardless of stated values?',
        example: 'The self-protection system optimises for avoiding shame, not long-term growth',
        direction: 'out',
        kind: 'rule',
      },
    ],
  },
  {
    level: 7,
    name: 'Framework Plurality',
    verb: 'Reframe',
    short: 'Compare and translate between different rule-generating frameworks.',
    description:
      'Model several coherent frameworks that generate different realities from the same evidence. Translate between them, locate incompatibilities and search for higher-order integrations.',
    coreQuestion: 'How would another coherent framework generate a different map?',
    value: 'Prevents one ontology from silently defining every question and answer.',
    targetRequired: 3,
    prompts: [
      {
        id: 'd7-frame',
        title: 'Alternative framework',
        relation: 'is interpreted differently by',
        question: 'Which coherent framework would organise this evidence differently?',
        example: 'Intuition is interpreted differently by predictive-processing and spiritual frameworks',
        direction: 'out',
        kind: 'framework',
      },
      {
        id: 'd7-translation',
        title: 'Translation',
        relation: 'translates into',
        question: 'What concept in another framework performs a similar function?',
        example: 'Gut feeling translates into a rapid probabilistic prior in another vocabulary',
        direction: 'out',
        kind: 'framework',
      },
      {
        id: 'd7-incompatibility',
        title: 'Incompatibility',
        relation: 'cannot preserve simultaneously with',
        question: 'Which commitments cannot both remain true without revision?',
        example: 'Fixed essence cannot be preserved unchanged inside a fully process-based identity',
        direction: 'either',
        kind: 'framework',
      },
      {
        id: 'd7-integration',
        title: 'Higher integration',
        relation: 'can be integrated through',
        question: 'What higher distinction preserves the strongest insight from each frame?',
        example: 'Embodied inference can integrate felt intelligence with probabilistic learning',
        direction: 'out',
        kind: 'framework',
      },
    ],
  },
  {
    level: 8,
    name: 'Observer Relativity',
    verb: 'Rotate',
    short: 'Change observer, scale and standpoint while tracking second-order effects.',
    description:
      'Represent who is observing, what they can detect, how observation changes the system and how participants respond to being modelled. Perspective becomes an active variable.',
    coreQuestion: 'How does the map change when the observer changes?',
    value: 'Reveals blind spots, reflexivity and perspective-dependent truths.',
    targetRequired: 3,
    prompts: [
      {
        id: 'd8-observer',
        title: 'New observer',
        relation: 'appears differently to',
        question: 'From whose standpoint does this become a different phenomenon?',
        example: 'Ambition appears differently to present self, future self and family',
        direction: 'out',
        kind: 'observer',
      },
      {
        id: 'd8-scale',
        title: 'Scale shift',
        relation: 'changes meaning at the scale of',
        question: 'What changes when moving from person to group, species or planet?',
        example: 'Sexual pursuit changes meaning at personal, evolutionary and planetary scales',
        direction: 'out',
        kind: 'observer',
      },
      {
        id: 'd8-blindspot',
        title: 'Blind spot',
        relation: 'is invisible from',
        question: 'What can this observer not detect because of its position?',
        example: 'Immediate emotional urgency is invisible as a bias from inside the emotion',
        direction: 'out',
        kind: 'observer',
      },
      {
        id: 'd8-reflexive',
        title: 'Observer effect',
        relation: 'changes when observed by',
        question: 'How does the system respond to being measured, judged or anticipated?',
        example: 'Intuition changes when a person must publicly justify it',
        direction: 'out',
        kind: 'observer',
      },
    ],
  },
  {
    level: 9,
    name: 'Model Evolution',
    verb: 'Evolve',
    short: 'Model how frameworks learn, compete, select and transform.',
    description:
      'Frameworks and observers are no longer fixed. Track how models update from evidence, protect themselves, merge, go extinct or alter what counts as evidence.',
    coreQuestion: 'How do the models making sense of reality themselves change?',
    value: 'Improves epistemic adaptability and detects self-sealing belief systems.',
    targetRequired: 3,
    prompts: [
      {
        id: 'd9-update',
        title: 'Model update',
        relation: 'updates into',
        question: 'What revised model follows after this evidence is genuinely absorbed?',
        example: 'Intuition-as-magic updates into intuition-as-trainable compression',
        direction: 'out',
        kind: 'model',
      },
      {
        id: 'd9-selection',
        title: 'Selection pressure',
        relation: 'is selected for by',
        question: 'Which environment rewards this model over its competitors?',
        example: 'Fast social environments select for confident simplified models',
        direction: 'out',
        kind: 'model',
      },
      {
        id: 'd9-immunity',
        title: 'Self-protection',
        relation: 'protects itself from revision through',
        question: 'How does the model reinterpret disconfirming evidence to survive?',
        example: 'A destiny model calls every failure a hidden test',
        direction: 'out',
        kind: 'model',
      },
      {
        id: 'd9-invariant',
        title: 'Invariant',
        relation: 'retains across revisions',
        question: 'What valuable structure survives several model changes?',
        example: 'Sensitivity to subtle patterns survives changes in the explanation of intuition',
        direction: 'out',
        kind: 'model',
      },
    ],
  },
  {
    level: 10,
    name: 'Architecture Design',
    verb: 'Redesign',
    short: 'Alter the architecture producing models, rules and possibilities.',
    description:
      'Design learning loops, objectives, constraints, interfaces and governance that generate a better possibility space. State explicit trade-offs rather than merely seeking more complexity.',
    coreQuestion: 'What architecture would reliably generate better rules and models?',
    value: 'Converts meta-understanding into deliberate personal or institutional design.',
    targetRequired: 3,
    prompts: [
      {
        id: 'd10-intervention',
        title: 'Architectural intervention',
        relation: 'can be redesigned through',
        question: 'What structural change alters many downstream rules at once?',
        example: 'A feedback journal redesigns how intuition receives evidence',
        direction: 'out',
        kind: 'architecture',
      },
      {
        id: 'd10-objective',
        title: 'Objective redesign',
        relation: 'would improve by optimising for',
        question: 'What objective produces healthier behaviour than the current reward?',
        example: 'Optimise for calibration rather than always being right',
        direction: 'out',
        kind: 'architecture',
      },
      {
        id: 'd10-tradeoff',
        title: 'Trade-off',
        relation: 'gains at the cost of',
        question: 'What valuable capacity is weakened by this redesign?',
        example: 'More verification gains accuracy at the cost of speed',
        direction: 'out',
        kind: 'architecture',
      },
      {
        id: 'd10-governance',
        title: 'Governance',
        relation: 'is kept adaptive by',
        question: 'What process detects when the architecture itself must change?',
        example: 'Periodic adversarial review keeps the personal learning system adaptive',
        direction: 'out',
        kind: 'architecture',
      },
    ],
  },
  {
    level: 11,
    name: 'Co-evolving Architectures',
    verb: 'Coordinate',
    short: 'Track several architectures recursively changing one another.',
    description:
      'Model people, institutions, cultures or intelligences as adaptive architectures. Their interventions alter one another’s incentives, models and future redesigns, producing emergent order.',
    coreQuestion: 'How do several possibility-generating systems change one another over time?',
    value: 'Reveals emergence, arms races, cooperation and governance failures.',
    targetRequired: 3,
    prompts: [
      {
        id: 'd11-coadapt',
        title: 'Co-adaptation',
        relation: 'co-adapts with',
        question: 'Which other adaptive architecture changes in response to this one?',
        example: 'A person’s identity system co-adapts with family expectations',
        direction: 'either',
        kind: 'system',
      },
      {
        id: 'd11-incentive',
        title: 'Incentive reshaping',
        relation: 'reshapes the incentives of',
        question: 'How does one architecture alter what another rewards?',
        example: 'Public metrics reshape what creators learn to value',
        direction: 'out',
        kind: 'system',
      },
      {
        id: 'd11-emergence',
        title: 'Emergence',
        relation: 'jointly produces',
        question: 'What pattern exists only because several systems interact?',
        example: 'Individual status strategies jointly produce a culture nobody explicitly chose',
        direction: 'out',
        kind: 'system',
      },
      {
        id: 'd11-stability',
        title: 'Meta-stability',
        relation: 'stabilises mutual change through',
        question: 'What prevents recursive adaptation from becoming destructive?',
        example: 'Shared truth-seeking norms stabilise disagreement among evolving models',
        direction: 'out',
        kind: 'system',
      },
    ],
  },
  {
    level: 12,
    name: 'Dimension Invention',
    verb: 'Reconstitute',
    short: 'Create and test the axes through which the problem is represented.',
    description:
      'Question why these dimensions, categories and distinctions exist. Invent a new representational axis, test what it reveals and hides, then recursively revise the language of the map itself.',
    coreQuestion: 'What must become representable for a fundamentally better question to exist?',
    value: 'Breaks out of inherited problem spaces while retaining accountability for new blind spots.',
    targetRequired: 3,
    prompts: [
      {
        id: 'd12-axis',
        title: 'New axis',
        relation: 'becomes newly representable through',
        question: 'What new axis distinguishes states the current map collapses together?',
        example: 'Add reversibility as an axis, separating choices by how recoverable they are',
        direction: 'out',
        kind: 'axis',
      },
      {
        id: 'd12-visible',
        title: 'New visibility',
        relation: 'makes visible',
        question: 'What relationship appears only after introducing this dimension?',
        example: 'A dignity axis makes hidden costs of efficient decisions visible',
        direction: 'out',
        kind: 'axis',
      },
      {
        id: 'd12-blindness',
        title: 'Representational cost',
        relation: 'makes harder to perceive',
        question: 'What does the new representation hide or distort?',
        example: 'Quantifying meaning may hide irreducible qualitative differences',
        direction: 'out',
        kind: 'axis',
      },
      {
        id: 'd12-recursion',
        title: 'Recursive revision',
        relation: 'requires revising the dimension',
        question: 'What failure would force you to redesign the new axis itself?',
        example: 'If reversibility varies by observer, the axis must include standpoint',
        direction: 'out',
        kind: 'axis',
      },
    ],
  },
]

export default function App() {
  const [maps, setMaps] = useState<LabMap[]>(loadMaps)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedDimension, setSelectedDimension] = useState<DimensionLevel>(4)
  const [subject, setSubject] = useState('')
  const [activeLevel, setActiveLevel] = useState<DimensionLevel>(1)
  const [activeNodeId, setActiveNodeId] = useState<string>('')
  const [activeEdgeId, setActiveEdgeId] = useState<string>('')
  const [composer, setComposer] = useState<ComposerState | null>(null)
  const [showGuide, setShowGuide] = useState(true)
  const [showInspector, setShowInspector] = useState(true)

  const activeMap = useMemo(() => maps.find((map) => map.id === activeId) ?? null, [maps, activeId])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, maps }))
    } catch {
      // Storage can be unavailable in private or constrained browsing contexts.
    }
  }, [maps])

  useEffect(() => {
    if (!activeMap) return
    if (!activeNodeId || !activeMap.nodes.some((node) => node.id === activeNodeId)) {
      setActiveNodeId(activeMap.rootId)
    }
    if (activeLevel > activeMap.dimension) setActiveLevel(activeMap.dimension)
  }, [activeMap, activeLevel, activeNodeId])

  function updateActiveMap(transform: (map: LabMap) => LabMap) {
    if (!activeId) return
    setMaps((current) =>
      current.map((map) => {
        if (map.id !== activeId) return map
        const next = transform(map)
        return { ...next, updatedAt: new Date().toISOString() }
      }),
    )
  }

  function openMap(id: string) {
    const map = maps.find((item) => item.id === id)
    if (!map) return
    setActiveId(id)
    setActiveNodeId(map.rootId)
    setActiveEdgeId('')
    setActiveLevel(firstIncompleteLevel(map))
    setComposer(null)
  }

  function startMap() {
    const clean = subject.trim()
    if (!clean) return
    const map = makeMap(clean, selectedDimension)
    setMaps((current) => [map, ...current])
    setActiveId(map.id)
    setActiveNodeId(map.rootId)
    setActiveEdgeId('')
    setActiveLevel(1)
    setComposer(null)
    setSubject('')
  }

  function closeMap() {
    setActiveId(null)
    setActiveNodeId('')
    setActiveEdgeId('')
    setComposer(null)
  }

  function addBranch(draft: { name: string; relation: string; context: string }) {
    if (!activeMap || !composer) return
    const cleanName = draft.name.trim()
    const cleanRelation = draft.relation.trim()
    if (!cleanName || !cleanRelation) return
    const existing = activeMap.nodes.find((node) => node.label.toLowerCase() === cleanName.toLowerCase())
    const nodeId = existing?.id ?? makeId('node')
    const node: LabNode =
      existing ??
      ({
        id: nodeId,
        label: cleanName,
        kind: composer.prompt.kind,
        x: composer.x,
        y: composer.y,
        layer: activeLevel,
        context: draft.context.trim(),
        notes: '',
        confidence: 60,
        createdAt: new Date().toISOString(),
      } satisfies LabNode)
    const from = composer.prompt.direction === 'in' ? nodeId : composer.fromId
    const to = composer.prompt.direction === 'in' ? composer.fromId : nodeId
    const edge: LabEdge = {
      id: makeId('edge'),
      from,
      to,
      relation: cleanRelation,
      layer: activeLevel,
      promptId: composer.prompt.id,
      notes: '',
    }
    const nextMap: LabMap = {
      ...activeMap,
      nodes: existing ? activeMap.nodes : [...activeMap.nodes, node],
      edges: [...activeMap.edges, edge],
      updatedAt: new Date().toISOString(),
    }
    setMaps((current) => current.map((map) => (map.id === activeMap.id ? nextMap : map)))
    setActiveNodeId(nodeId)
    setActiveEdgeId('')
    setComposer(null)
    if (isLevelComplete(nextMap, activeLevel) && activeLevel < activeMap.dimension) {
      setActiveLevel(nextLevel(activeLevel))
    }
  }

  function addConnection(fromId: string, toId: string, relation: string, direction: Direction) {
    if (!activeMap || !relation.trim() || fromId === toId) return
    const from = direction === 'in' ? toId : fromId
    const to = direction === 'in' ? fromId : toId
    const edge: LabEdge = {
      id: makeId('edge'),
      from,
      to,
      relation: relation.trim(),
      layer: activeLevel,
      promptId: `manual-d${activeLevel}`,
      notes: '',
    }
    updateActiveMap((map) => ({ ...map, edges: [...map.edges, edge] }))
    setActiveEdgeId(edge.id)
  }

  function importMap(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    void file.text().then((text) => {
      try {
        const parsed = JSON.parse(text) as unknown
        const imported = normaliseImportedMap(parsed)
        if (!imported) {
          window.alert('This file is not a valid Training Dimensions map.')
          return
        }
        const copy = { ...imported, id: makeId('map'), updatedAt: new Date().toISOString() }
        setMaps((current) => [copy, ...current])
        openImportedMap(copy)
      } catch {
        window.alert('The selected file could not be read as JSON.')
      }
    })
    event.target.value = ''
  }

  function openImportedMap(map: LabMap) {
    setActiveId(map.id)
    setActiveNodeId(map.rootId)
    setActiveEdgeId('')
    setActiveLevel(firstIncompleteLevel(map))
  }

  if (!activeMap) {
    return (
      <StartScreen
        maps={maps}
        selectedDimension={selectedDimension}
        subject={subject}
        onDimension={setSelectedDimension}
        onSubject={setSubject}
        onStart={startMap}
        onOpen={openMap}
        onDelete={(id) => {
          if (!window.confirm('Delete this training map from this browser?')) return
          setMaps((current) => current.filter((map) => map.id !== id))
        }}
        onImport={importMap}
      />
    )
  }

  const progress = calculateProgress(activeMap)
  const activeNode = activeMap.nodes.find((node) => node.id === activeNodeId) ?? activeMap.nodes[0]
  const activeEdge = activeMap.edges.find((edge) => edge.id === activeEdgeId) ?? null

  return (
    <div className="laboratory" style={{ '--level-accent': levelColour(activeLevel) } as CSSProperties}>
      <header className="lab-topbar">
        <button className="brand-button" type="button" onClick={closeMap} title="Return to maps">
          <span className="brand-mark">DU</span>
          <span>
            <b>Dimensional Laboratory</b>
            <small>{activeMap.title}</small>
          </span>
        </button>
        <div className="topbar-centre">
          <button className="dimension-pill" type="button" onClick={() => setShowGuide(true)}>
            <strong>{activeMap.dimension}D</strong>
            <span>{dimension(activeMap.dimension).name}</span>
          </button>
          <div className="top-progress" aria-label={`${progress.percent}% complete`}>
            <i style={{ width: `${progress.percent}%` }} />
          </div>
          <span className="top-progress-label">{progress.percent}%</span>
        </div>
        <div className="top-actions">
          <button type="button" className={showGuide ? 'active' : ''} onClick={() => setShowGuide((value) => !value)}>
            Guide
          </button>
          <button type="button" className={showInspector ? 'active' : ''} onClick={() => setShowInspector((value) => !value)}>
            Inspect
          </button>
          <button type="button" onClick={() => downloadMap(activeMap)}>
            Export
          </button>
          <button type="button" onClick={closeMap}>
            Maps
          </button>
        </div>
      </header>

      <main className={`lab-workspace ${showGuide ? '' : 'without-guide'} ${showInspector ? '' : 'without-inspector'}`}>
        {showGuide ? (
          <GuidePanel
            map={activeMap}
            activeLevel={activeLevel}
            activeNode={activeNode}
            progress={progress}
            onLevel={(level) => {
              if (level <= activeMap.dimension) setActiveLevel(level)
            }}
            onFocus={(field, value) => updateActiveMap((map) => ({ ...map, focus: { ...map.focus, [field]: value } }))}
            onUsePrompt={(prompt) => {
              const position = suggestedPosition(activeMap, activeNode, activeLevel, prompt.id)
              setComposer({ key: makeId('compose'), fromId: activeNode.id, prompt, ...position })
            }}
          />
        ) : null}

        <MapCanvas
          map={activeMap}
          activeLevel={activeLevel}
          activeNodeId={activeNode.id}
          activeEdgeId={activeEdgeId}
          onSelectNode={(id) => {
            setActiveNodeId(id)
            setActiveEdgeId('')
          }}
          onSelectEdge={(id) => {
            setActiveEdgeId(id)
            setShowInspector(true)
          }}
          onMoveNode={(id, x, y) =>
            updateActiveMap((map) => ({
              ...map,
              nodes: map.nodes.map((node) => (node.id === id ? { ...node, x, y } : node)),
            }))
          }
          onCompose={(prompt, x, y) =>
            setComposer({ key: makeId('compose'), fromId: activeNode.id, prompt, x, y })
          }
          onFocusField={(field) => document.getElementById(`focus-${field}`)?.focus()}
        />

        {showInspector ? (
          <InspectorPanel
            map={activeMap}
            activeLevel={activeLevel}
            node={activeNode}
            edge={activeEdge}
            onUpdateNode={(patch) =>
              updateActiveMap((map) => ({
                ...map,
                nodes: map.nodes.map((node) => (node.id === activeNode.id ? { ...node, ...patch } : node)),
              }))
            }
            onUpdateEdge={(patch) => {
              if (!activeEdge) return
              updateActiveMap((map) => ({
                ...map,
                edges: map.edges.map((edge) => (edge.id === activeEdge.id ? { ...edge, ...patch } : edge)),
              }))
            }}
            onConnect={addConnection}
            onDeleteNode={() => {
              if (activeNode.id === activeMap.rootId) return
              updateActiveMap((map) => ({
                ...map,
                nodes: map.nodes.filter((node) => node.id !== activeNode.id),
                edges: map.edges.filter((edge) => edge.from !== activeNode.id && edge.to !== activeNode.id),
              }))
              setActiveNodeId(activeMap.rootId)
              setActiveEdgeId('')
            }}
            onDeleteEdge={() => {
              if (!activeEdge) return
              updateActiveMap((map) => ({ ...map, edges: map.edges.filter((edge) => edge.id !== activeEdge.id) }))
              setActiveEdgeId('')
            }}
          />
        ) : null}
      </main>

      {composer ? <BranchComposer key={composer.key} composer={composer} onCancel={() => setComposer(null)} onSubmit={addBranch} /> : null}
    </div>
  )
}

interface StartScreenProps {
  maps: LabMap[]
  selectedDimension: DimensionLevel
  subject: string
  onDimension: (level: DimensionLevel) => void
  onSubject: (value: string) => void
  onStart: () => void
  onOpen: (id: string) => void
  onDelete: (id: string) => void
  onImport: (event: ChangeEvent<HTMLInputElement>) => void
}

function StartScreen(props: StartScreenProps) {
  const selected = dimension(props.selectedDimension)
  const sortedMaps = [...props.maps].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  return (
    <div className="start-screen">
      <header className="start-header">
        <div className="start-brand">
          <span className="brand-mark large">DU</span>
          <span>Dream Unity</span>
        </div>
        <label className="import-button">
          Import map
          <input type="file" accept="application/json" hidden onChange={props.onImport} />
        </label>
      </header>

      <section className="hero">
        <div className="eyebrow">Dimensional reasoning laboratory</div>
        <h1>Train the operation,<br />not the number.</h1>
        <p>
          Begin with one state of awareness. Progress from precise definition, through systems and time, into possibility generators, observer shifts, co-evolving architectures and newly invented dimensions.
        </p>
      </section>

      <section className="launch-card">
        <div className="launch-copy">
          <span className="section-number">01</span>
          <div>
            <h2>Choose one training dimension</h2>
            <p>The selected level becomes the map’s ceiling. Every lower operation remains available as a foundation ladder.</p>
          </div>
        </div>
        <div className="dimension-grid" role="radiogroup" aria-label="Training dimension">
          {DIMENSIONS.map((item) => (
            <button
              key={item.level}
              type="button"
              role="radio"
              aria-checked={props.selectedDimension === item.level}
              className={props.selectedDimension === item.level ? 'dimension-card selected' : 'dimension-card'}
              style={{ '--card-accent': levelColour(item.level) } as CSSProperties}
              onClick={() => props.onDimension(item.level)}
            >
              <span>{item.level}D</span>
              <strong>{item.name}</strong>
              <small>{item.verb}</small>
            </button>
          ))}
        </div>

        <div className="dimension-explainer" style={{ '--card-accent': levelColour(selected.level) } as CSSProperties}>
          <div className="dimension-number">{selected.level}D</div>
          <div>
            <span className="eyebrow">{selected.verb}</span>
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
          </div>
          <div className="explainer-question">
            <small>Core question</small>
            <strong>{selected.coreQuestion}</strong>
            <span>{selected.value}</span>
          </div>
        </div>

        <div className="subject-launch">
          <label>
            <span className="section-number">02</span>
            <div>
              <strong>Start with one subject</strong>
              <small>Examples: intuition, fear of failure, mortality, identity, a relationship, a strategic decision</small>
            </div>
          </label>
          <div className="subject-row">
            <input
              value={props.subject}
              onChange={(event) => props.onSubject(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') props.onStart()
              }}
              placeholder="Name the state, problem or phenomenon…"
              autoComplete="off"
            />
            <button type="button" disabled={!props.subject.trim()} onClick={props.onStart}>
              Enter {selected.level}D laboratory <span>→</span>
            </button>
          </div>
          {selected.level === 1 ? (
            <p className="one-d-note"><b>Why 1D exists:</b> it is a disciplined single-focus baseline. It uses definition, boundary and state rather than pretending branches are one-dimensional.</p>
          ) : null}
        </div>
      </section>

      <section className="saved-section">
        <div className="saved-heading">
          <div>
            <span className="eyebrow">Persistent local laboratory</span>
            <h2>Your training maps</h2>
          </div>
          <span>{sortedMaps.length} saved in this browser</span>
        </div>
        {sortedMaps.length ? (
          <div className="saved-grid">
            {sortedMaps.map((map) => {
              const progress = calculateProgress(map)
              return (
                <article key={map.id} className="saved-map" style={{ '--card-accent': levelColour(map.dimension) } as CSSProperties}>
                  <button type="button" className="saved-open" onClick={() => props.onOpen(map.id)}>
                    <span className="saved-dimension">{map.dimension}D</span>
                    <div>
                      <small>{dimension(map.dimension).name}</small>
                      <h3>{map.title}</h3>
                      <p>{map.nodes.length} nodes · {map.edges.length} semantic lines</p>
                    </div>
                    <span className="saved-arrow">→</span>
                  </button>
                  <div className="saved-footer">
                    <div className="saved-progress"><i style={{ width: `${progress.percent}%` }} /></div>
                    <span>{progress.percent}% · {formatDate(map.updatedAt)}</span>
                    <button type="button" onClick={() => props.onDelete(map.id)}>Delete</button>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="empty-library">
            <strong>No maps yet.</strong>
            <span>Select a dimension and name a subject above. The map autosaves as you train.</span>
          </div>
        )}
      </section>

      <footer className="start-footer">
        <p>“Dimensions” are a designed cognitive-training grammar, not a claim about physical dimensions or an IQ test.</p>
      </footer>
    </div>
  )
}

interface GuidePanelProps {
  map: LabMap
  activeLevel: DimensionLevel
  activeNode: LabNode
  progress: ProgressSummary
  onLevel: (level: DimensionLevel) => void
  onFocus: (field: FocusField, value: string) => void
  onUsePrompt: (prompt: PromptTemplate) => void
}

function GuidePanel(props: GuidePanelProps) {
  const current = dimension(props.activeLevel)
  return (
    <aside className="guide-panel side-panel">
      <div className="panel-scroll">
        <div className="panel-kicker">Training ceiling · {props.map.dimension}D</div>
        <h2>Reasoning ladder</h2>
        <p className="panel-intro">Complete one gateway move at every lower level, then practise the target operation repeatedly.</p>
        <div className="ladder">
          {DIMENSIONS.map((item) => {
            const locked = item.level > props.map.dimension
            const count = levelCount(props.map, item.level)
            const required = levelRequirement(props.map, item.level)
            const complete = !locked && count >= required
            return (
              <button
                key={item.level}
                type="button"
                disabled={locked}
                className={`${props.activeLevel === item.level ? 'active' : ''} ${complete ? 'complete' : ''}`}
                onClick={() => props.onLevel(item.level)}
              >
                <span className="ladder-level">{item.level}D</span>
                <span><b>{item.name}</b><small>{item.verb}</small></span>
                <em>{locked ? 'Locked' : `${Math.min(count, required)}/${required}`}</em>
              </button>
            )
          })}
        </div>

        <section className="current-operation" style={{ '--card-accent': levelColour(current.level) } as CSSProperties}>
          <span className="eyebrow">Current operation · {current.level}D</span>
          <h3>{current.verb}: {current.name}</h3>
          <p>{current.short}</p>
          <blockquote>{current.coreQuestion}</blockquote>
        </section>

        {current.level === 1 ? (
          <FocusTrainer map={props.map} onFocus={props.onFocus} />
        ) : (
          <div className="prompt-deck">
            <div className="deck-heading">
              <div><small>Active thought</small><strong>{props.activeNode.label}</strong></div>
              <span>Choose a logical line</span>
            </div>
            {current.prompts.map((prompt) => (
              <button key={prompt.id} type="button" onClick={() => props.onUsePrompt(prompt)}>
                <span>{prompt.title}</span>
                <strong>{prompt.question}</strong>
                <small>{prompt.relation}</small>
              </button>
            ))}
          </div>
        )}

        <section className="progress-card">
          <div><span>Dimensional fidelity</span><strong>{props.progress.percent}%</strong></div>
          <div className="progress-track"><i style={{ width: `${props.progress.percent}%` }} /></div>
          <p>{props.progress.completedLevels} of {props.map.dimension} levels have met their current requirement.</p>
          {props.progress.percent === 100 ? <b>Target grammar completed. Continue mapping for depth, cross-links and contradiction testing.</b> : null}
        </section>
      </div>
    </aside>
  )
}

function FocusTrainer({ map, onFocus }: { map: LabMap; onFocus: (field: FocusField, value: string) => void }) {
  const fields: Array<{ key: FocusField; label: string; prompt: string }> = [
    { key: 'definition', label: 'Definition', prompt: `What exactly does “${map.subject}” mean in this map?` },
    { key: 'boundary', label: 'Boundary', prompt: 'What counts as this—and what does not?' },
    { key: 'state', label: 'Present state', prompt: 'How is it currently experienced, expressed or measured?' },
    { key: 'evidence', label: 'Anchor', prompt: 'What observation keeps this definition accountable?' },
  ]
  return (
    <div className="focus-trainer">
      <div className="focus-rule"><b>No branches yet.</b> Hold one phenomenon stable enough to map responsibly.</div>
      {fields.map((field) => (
        <label key={field.key}>
          <span>{field.label}</span>
          <small>{field.prompt}</small>
          <textarea
            id={`focus-${field.key}`}
            value={map.focus[field.key]}
            onChange={(event) => onFocus(field.key, event.target.value)}
            rows={3}
            placeholder="Write a precise answer…"
          />
        </label>
      ))}
    </div>
  )
}

interface MapCanvasProps {
  map: LabMap
  activeLevel: DimensionLevel
  activeNodeId: string
  activeEdgeId: string
  onSelectNode: (id: string) => void
  onSelectEdge: (id: string) => void
  onMoveNode: (id: string, x: number, y: number) => void
  onCompose: (prompt: PromptTemplate, x: number, y: number) => void
  onFocusField: (field: FocusField) => void
}

function MapCanvas(props: MapCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<ViewState>({ panX: 0, panY: 0, scale: 0.82 })
  const [promptOffset, setPromptOffset] = useState(0)
  const activeNode = props.map.nodes.find((node) => node.id === props.activeNodeId) ?? props.map.nodes[0]
  const current = dimension(props.activeLevel)
  const prompts = rotatePrompts(current.prompts, promptOffset).slice(0, 4)
  const nodeById = useMemo(() => new Map(props.map.nodes.map((node) => [node.id, node])), [props.map.nodes])

  useEffect(() => {
    setView({ panX: 0, panY: 0, scale: 0.82 })
  }, [props.map.id])

  function worldPoint(clientX: number, clientY: number, currentView = view) {
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return WORLD_CENTRE
    const localX = clientX - rect.left - rect.width / 2
    const localY = clientY - rect.top - rect.height / 2
    return {
      x: WORLD_CENTRE.x + (localX - currentView.panX) / currentView.scale,
      y: WORLD_CENTRE.y + (localY - currentView.panY) / currentView.scale,
    }
  }

  function beginPan(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target as Element
    if (event.button !== 0 || target.closest('button, .map-edge, input, textarea, select')) return
    const start = { x: event.clientX, y: event.clientY, panX: view.panX, panY: view.panY }
    const move = (next: PointerEvent) => setView((currentView) => ({ ...currentView, panX: start.panX + next.clientX - start.x, panY: start.panY + next.clientY - start.y }))
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  function zoom(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault()
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return
    const localX = event.clientX - rect.left - rect.width / 2
    const localY = event.clientY - rect.top - rect.height / 2
    const point = worldPoint(event.clientX, event.clientY)
    const scale = clamp(view.scale * Math.exp(-event.deltaY * 0.0012), 0.35, 1.75)
    setView({
      scale,
      panX: localX - (point.x - WORLD_CENTRE.x) * scale,
      panY: localY - (point.y - WORLD_CENTRE.y) * scale,
    })
  }

  function beginNodeDrag(event: ReactPointerEvent<HTMLButtonElement>, node: LabNode) {
    if (event.button !== 0) return
    event.stopPropagation()
    props.onSelectNode(node.id)
    const start = { x: event.clientX, y: event.clientY, nodeX: node.x, nodeY: node.y }
    let moved = false
    const move = (next: PointerEvent) => {
      const dx = (next.clientX - start.x) / view.scale
      const dy = (next.clientY - start.y) / view.scale
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true
      props.onMoveNode(node.id, clamp(start.nodeX + dx, 100, WORLD_WIDTH - 100), clamp(start.nodeY + dy, 100, WORLD_HEIGHT - 100))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      if (!moved) props.onSelectNode(node.id)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const ghostPoints = prompts.map((prompt, index) => ({ prompt, ...ghostPosition(activeNode, index, prompts.length, props.activeLevel) }))

  return (
    <section className="canvas-column">
      <div className="canvas-status">
        <span><b>{props.activeLevel}D</b> {current.name}</span>
        <strong>{current.coreQuestion}</strong>
        <span>{props.map.nodes.length} nodes · {props.map.edges.length} lines</span>
      </div>
      <div ref={viewportRef} className="map-viewport" onPointerDown={beginPan} onWheel={zoom}>
        <div
          className="map-world"
          style={{
            width: WORLD_WIDTH,
            height: WORLD_HEIGHT,
            transform: `translate(calc(50% + ${view.panX}px), calc(50% + ${view.panY}px)) scale(${view.scale}) translate(${-WORLD_CENTRE.x}px, ${-WORLD_CENTRE.y}px)`,
          }}
        >
          <svg className="edge-layer" width={WORLD_WIDTH} height={WORLD_HEIGHT} viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`} aria-hidden="true">
            <defs>
              <marker id="line-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
            </defs>
            {props.map.edges.map((edge) => {
              const from = nodeById.get(edge.from)
              const to = nodeById.get(edge.to)
              if (!from || !to) return null
              const geometry = edgeGeometry(from, to, edge.id)
              return (
                <g key={edge.id} className={`map-edge d${edge.layer} ${props.activeEdgeId === edge.id ? 'selected' : ''}`} onClick={() => props.onSelectEdge(edge.id)}>
                  <path className="edge-hit" d={geometry.path} />
                  <path className="edge-visible" d={geometry.path} markerEnd="url(#line-arrow)" />
                  <g className="edge-label" transform={`translate(${geometry.labelX} ${geometry.labelY})`}>
                    <rect x={-Math.max(45, edge.relation.length * 3.5)} y="-13" width={Math.max(90, edge.relation.length * 7)} height="26" rx="13" />
                    <text textAnchor="middle" dominantBaseline="middle">{truncate(edge.relation, 30)}</text>
                  </g>
                </g>
              )
            })}
            {ghostPoints.map((point) => (
              <line key={`ghost-line-${point.prompt.id}`} className="ghost-line" x1={activeNode.x} y1={activeNode.y} x2={point.x} y2={point.y} />
            ))}
          </svg>

          {props.map.nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              className={`map-node kind-${node.kind} layer-${node.layer} ${node.id === props.map.rootId ? 'root-node' : ''} ${node.id === props.activeNodeId ? 'selected' : ''}`}
              style={{ left: node.x, top: node.y, '--node-accent': levelColour(node.layer) } as CSSProperties}
              onPointerDown={(event) => beginNodeDrag(event, node)}
            >
              <span className="node-meta"><i>{node.layer}D</i><em>{node.kind}</em></span>
              <strong>{node.label}</strong>
              {node.context ? <small>{node.context}</small> : null}
            </button>
          ))}

          {props.activeLevel === 1 ? (
            <div className="focus-ghost-ring" style={{ left: activeNode.x, top: activeNode.y }}>
              <button type="button" className="focus-definition" onClick={() => props.onFocusField('definition')}>Define</button>
              <button type="button" className="focus-boundary" onClick={() => props.onFocusField('boundary')}>Boundary</button>
              <button type="button" className="focus-state" onClick={() => props.onFocusField('state')}>State</button>
            </div>
          ) : (
            ghostPoints.map((point) => (
              <button
                key={point.prompt.id}
                type="button"
                className="ghost-node"
                style={{ left: point.x, top: point.y }}
                onClick={() => props.onCompose(point.prompt, point.x, point.y)}
              >
                <small>{point.prompt.title}</small>
                <strong>{point.prompt.question}</strong>
                <span>{point.prompt.relation}</span>
              </button>
            ))
          )}
        </div>

        <div className="canvas-controls">
          <button type="button" onClick={() => setView((currentView) => ({ ...currentView, scale: clamp(currentView.scale + 0.12, 0.35, 1.75) }))}>＋</button>
          <button type="button" onClick={() => setView((currentView) => ({ ...currentView, scale: clamp(currentView.scale - 0.12, 0.35, 1.75) }))}>−</button>
          <button type="button" onClick={() => setView({ panX: 0, panY: 0, scale: 0.82 })}>Centre</button>
          {current.prompts.length > 4 ? <button type="button" onClick={() => setPromptOffset((value) => value + 1)}>Rotate prompts</button> : null}
        </div>
        <div className="canvas-help">Drag nodes · drag empty space to pan · wheel or pinch-pad to zoom · select a dashed prompt to grow the map</div>
      </div>
    </section>
  )
}

interface InspectorPanelProps {
  map: LabMap
  activeLevel: DimensionLevel
  node: LabNode
  edge: LabEdge | null
  onUpdateNode: (patch: Partial<LabNode>) => void
  onUpdateEdge: (patch: Partial<LabEdge>) => void
  onConnect: (fromId: string, toId: string, relation: string, direction: Direction) => void
  onDeleteNode: () => void
  onDeleteEdge: () => void
}

function InspectorPanel(props: InspectorPanelProps) {
  const [targetId, setTargetId] = useState('')
  const [relation, setRelation] = useState('influences')
  const [direction, setDirection] = useState<Direction>('out')

  useEffect(() => {
    const first = props.map.nodes.find((node) => node.id !== props.node.id)
    setTargetId(first?.id ?? '')
  }, [props.map.nodes, props.node.id])

  if (props.edge) {
    const from = props.map.nodes.find((node) => node.id === props.edge?.from)
    const to = props.map.nodes.find((node) => node.id === props.edge?.to)
    return (
      <aside className="inspector-panel side-panel">
        <div className="panel-scroll">
          <div className="panel-kicker">Semantic line · {props.edge.layer}D</div>
          <h2>Relationship</h2>
          <div className="edge-summary"><b>{from?.label ?? 'Unknown'}</b><span>→</span><b>{to?.label ?? 'Unknown'}</b></div>
          <label className="field-label">
            <span>Precise relationship</span>
            <input value={props.edge.relation} onChange={(event) => props.onUpdateEdge({ relation: event.target.value })} />
          </label>
          <label className="field-label">
            <span>Reasoning layer</span>
            <select value={props.edge.layer} onChange={(event) => props.onUpdateEdge({ layer: toDimension(Number(event.target.value)) })}>
              {DIMENSIONS.slice(0, props.map.dimension).map((item) => <option key={item.level} value={item.level}>{item.level}D · {item.name}</option>)}
            </select>
          </label>
          <label className="field-label">
            <span>Why this line is valid</span>
            <textarea rows={8} value={props.edge.notes} onChange={(event) => props.onUpdateEdge({ notes: event.target.value })} placeholder="Mechanism, evidence, conditions, exceptions…" />
          </label>
          <div className="inspector-rule">
            <b>Line rule</b>
            <p>A line must state a relationship. “Cause” is not a category node; it is the grammar between two concepts.</p>
          </div>
          <button type="button" className="danger-button" onClick={props.onDeleteEdge}>Delete relationship</button>
        </div>
      </aside>
    )
  }

  const connectable = props.map.nodes.filter((node) => node.id !== props.node.id)
  return (
    <aside className="inspector-panel side-panel">
      <div className="panel-scroll">
        <div className="panel-kicker">Selected node · originated at {props.node.layer}D</div>
        <h2>Thought inspector</h2>
        <label className="field-label">
          <span>Concept or state</span>
          <input value={props.node.label} onChange={(event) => props.onUpdateNode({ label: event.target.value })} />
        </label>
        <label className="field-label">
          <span>Node category</span>
          <select value={props.node.kind} onChange={(event) => props.onUpdateNode({ kind: event.target.value as NodeKind })}>
            {NODE_KINDS.map((kind) => <option key={kind} value={kind}>{titleCase(kind)}</option>)}
          </select>
        </label>
        <label className="field-label">
          <span>Context marker</span>
          <input value={props.node.context} onChange={(event) => props.onUpdateNode({ context: event.target.value })} placeholder="Time, scenario, observer, scale…" />
        </label>
        <label className="field-label">
          <span>Notes and evidence</span>
          <textarea rows={7} value={props.node.notes} onChange={(event) => props.onUpdateNode({ notes: event.target.value })} placeholder="Mechanism, examples, contradictions, evidence…" />
        </label>
        <label className="confidence-field">
          <span><b>Confidence</b><em>{props.node.confidence}%</em></span>
          <input type="range" min="0" max="100" value={props.node.confidence} onChange={(event) => props.onUpdateNode({ confidence: Number(event.target.value) })} />
          <small>Confidence is editable so certainty does not hide inside the diagram.</small>
        </label>

        <section className="crosslink-builder">
          <div><span className="eyebrow">System-building move</span><h3>Connect existing nodes</h3></div>
          {connectable.length ? (
            <>
              <select value={targetId} onChange={(event) => setTargetId(event.target.value)}>
                {connectable.map((node) => <option key={node.id} value={node.id}>{node.label}</option>)}
              </select>
              <input value={relation} onChange={(event) => setRelation(event.target.value)} placeholder="relationship line" />
              <select value={direction} onChange={(event) => setDirection(event.target.value as Direction)}>
                <option value="out">Selected → target</option>
                <option value="in">Target → selected</option>
                <option value="either">Bidirectional / contrast</option>
              </select>
              <button type="button" disabled={!targetId || !relation.trim()} onClick={() => props.onConnect(props.node.id, targetId, relation, direction)}>
                Add {props.activeLevel}D connection
              </button>
            </>
          ) : <p>Create another node before cross-linking.</p>}
        </section>

        {props.node.id !== props.map.rootId ? <button type="button" className="danger-button" onClick={props.onDeleteNode}>Delete node and its lines</button> : null}
      </div>
    </aside>
  )
}

function BranchComposer({ composer, onCancel, onSubmit }: { composer: ComposerState; onCancel: () => void; onSubmit: (draft: { name: string; relation: string; context: string }) => void }) {
  const [name, setName] = useState('')
  const [relation, setRelation] = useState(composer.prompt.relation)
  const [context, setContext] = useState('')
  return (
    <div className="composer-backdrop" onPointerDown={(event) => {
      if (event.target === event.currentTarget) onCancel()
    }}>
      <form className="branch-composer" onSubmit={(event) => {
        event.preventDefault()
        onSubmit({ name, relation, context })
      }}>
        <button type="button" className="composer-close" onClick={onCancel} aria-label="Close">×</button>
        <span className="eyebrow">Logical branch · {composer.prompt.title}</span>
        <h2>{composer.prompt.question}</h2>
        <p className="composer-example"><b>Example:</b> {composer.prompt.example}</p>
        <label>
          <span>Node: the thing, state or category</span>
          <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Name the new concept…" />
        </label>
        <label>
          <span>Line: the exact relationship</span>
          <input value={relation} onChange={(event) => setRelation(event.target.value)} />
        </label>
        <label>
          <span>Context marker <small>optional</small></span>
          <input value={context} onChange={(event) => setContext(event.target.value)} placeholder="At age 30, under stress, from future-self perspective…" />
        </label>
        <div className="composer-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit" disabled={!name.trim() || !relation.trim()}>Create semantic branch</button>
        </div>
      </form>
    </div>
  )
}

interface ProgressSummary {
  percent: number
  completedLevels: number
}

function calculateProgress(map: LabMap): ProgressSummary {
  let achieved = 0
  let possible = 0
  let completedLevels = 0
  for (let raw = 1; raw <= map.dimension; raw += 1) {
    const level = toDimension(raw)
    const required = levelRequirement(map, level)
    const count = levelCount(map, level)
    achieved += Math.min(count, required)
    possible += required
    if (count >= required) completedLevels += 1
  }
  return { percent: possible ? Math.round((achieved / possible) * 100) : 0, completedLevels }
}

function levelCount(map: LabMap, level: DimensionLevel): number {
  if (level === 1) return Object.values(map.focus).filter((value) => value.trim().length >= 8).length
  return map.edges.filter((edge) => edge.layer === level).length
}

function levelRequirement(map: LabMap, level: DimensionLevel): number {
  if (level === 1) return map.dimension === 1 ? 3 : 2
  return level === map.dimension ? dimension(level).targetRequired : 1
}

function isLevelComplete(map: LabMap, level: DimensionLevel): boolean {
  return levelCount(map, level) >= levelRequirement(map, level)
}

function firstIncompleteLevel(map: LabMap): DimensionLevel {
  for (let raw = 1; raw <= map.dimension; raw += 1) {
    const level = toDimension(raw)
    if (!isLevelComplete(map, level)) return level
  }
  return map.dimension
}

function dimension(level: DimensionLevel): DimensionDefinition {
  return DIMENSIONS[level - 1]
}

function nextLevel(level: DimensionLevel): DimensionLevel {
  return toDimension(Math.min(12, level + 1))
}

function toDimension(value: number): DimensionLevel {
  return Math.max(1, Math.min(12, Math.round(value))) as DimensionLevel
}

function makeMap(subject: string, dimensionLevel: DimensionLevel): LabMap {
  const now = new Date().toISOString()
  const rootId = makeId('node')
  return {
    schemaVersion: 1,
    id: makeId('map'),
    title: subject,
    subject,
    dimension: dimensionLevel,
    rootId,
    nodes: [
      {
        id: rootId,
        label: subject,
        kind: 'focus',
        x: WORLD_CENTRE.x,
        y: WORLD_CENTRE.y,
        layer: 1,
        context: 'Focal phenomenon',
        notes: '',
        confidence: 50,
        createdAt: now,
      },
    ],
    edges: [],
    focus: { definition: '', boundary: '', state: '', evidence: '' },
    createdAt: now,
    updatedAt: now,
  }
}

function loadMaps(): LabMap[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { maps?: unknown[] }
    if (!Array.isArray(parsed.maps)) return []
    return parsed.maps.map(normaliseImportedMap).filter((map): map is LabMap => Boolean(map))
  } catch {
    return []
  }
}

function normaliseImportedMap(value: unknown): LabMap | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<LabMap>
  if (!candidate.id || !candidate.title || !candidate.rootId || !Array.isArray(candidate.nodes) || !Array.isArray(candidate.edges)) return null
  const rootExists = candidate.nodes.some((node) => node && typeof node === 'object' && (node as LabNode).id === candidate.rootId)
  if (!rootExists) return null
  return {
    schemaVersion: 1,
    id: String(candidate.id),
    title: String(candidate.title),
    subject: String(candidate.subject ?? candidate.title),
    dimension: toDimension(Number(candidate.dimension ?? 2)),
    rootId: String(candidate.rootId),
    nodes: candidate.nodes as LabNode[],
    edges: candidate.edges as LabEdge[],
    focus: {
      definition: String(candidate.focus?.definition ?? ''),
      boundary: String(candidate.focus?.boundary ?? ''),
      state: String(candidate.focus?.state ?? ''),
      evidence: String(candidate.focus?.evidence ?? ''),
    },
    createdAt: String(candidate.createdAt ?? new Date().toISOString()),
    updatedAt: String(candidate.updatedAt ?? new Date().toISOString()),
  }
}

function suggestedPosition(map: LabMap, activeNode: LabNode, level: DimensionLevel, seed: string) {
  const siblings = map.edges.filter((edge) => edge.from === activeNode.id || edge.to === activeNode.id).length
  const angle = hashNumber(`${seed}-${siblings}`) * Math.PI * 2
  const radius = 245 + Math.min(level, 8) * 12
  return {
    x: clamp(activeNode.x + Math.cos(angle) * radius, 130, WORLD_WIDTH - 130),
    y: clamp(activeNode.y + Math.sin(angle) * radius, 100, WORLD_HEIGHT - 100),
  }
}

function ghostPosition(node: LabNode, index: number, total: number, level: DimensionLevel) {
  const sweep = total === 1 ? 0 : Math.PI * 1.45
  const angle = -Math.PI * 0.75 + (total === 1 ? 0 : (index / (total - 1)) * sweep) + level * 0.13
  const radius = 260 + Math.min(level, 9) * 10
  return {
    x: clamp(node.x + Math.cos(angle) * radius, 150, WORLD_WIDTH - 150),
    y: clamp(node.y + Math.sin(angle) * radius, 120, WORLD_HEIGHT - 120),
  }
}

function edgeGeometry(from: LabNode, to: LabNode, seed: string) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.max(1, Math.hypot(dx, dy))
  const normalX = -dy / length
  const normalY = dx / length
  const bend = (hashNumber(seed) - 0.5) * Math.min(100, length * 0.22)
  const controlX = (from.x + to.x) / 2 + normalX * bend
  const controlY = (from.y + to.y) / 2 + normalY * bend
  const labelX = 0.25 * from.x + 0.5 * controlX + 0.25 * to.x
  const labelY = 0.25 * from.y + 0.5 * controlY + 0.25 * to.y
  return { path: `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`, labelX, labelY }
}

function rotatePrompts(prompts: PromptTemplate[], offset: number): PromptTemplate[] {
  if (!prompts.length) return prompts
  const normalized = ((offset % prompts.length) + prompts.length) % prompts.length
  return [...prompts.slice(normalized), ...prompts.slice(0, normalized)]
}

function levelColour(level: DimensionLevel): string {
  const colours = ['#9aa9bd', '#6fb6ff', '#57d3bc', '#9d8cff', '#f0a86a', '#ff7f9a', '#b790ff', '#50c8e8', '#e7c35d', '#7bd383', '#ff986b', '#e970ff']
  return colours[level - 1]
}

function hashNumber(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) / 4294967295
}

function makeId(prefix: string): string {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${prefix}-${id}`
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value))
}

function truncate(value: string, length: number): string {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value
}

function titleCase(value: string): string {
  return value.replace(/(^|[-_\s])\w/g, (match) => match.toUpperCase())
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
}

function downloadMap(map: LabMap) {
  const blob = new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${map.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'dimensional-map'}-${map.dimension}d.json`
  link.click()
  URL.revokeObjectURL(url)
}
