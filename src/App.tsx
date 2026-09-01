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
import {
  DimensionCanvasScaffold,
  DimensionExperiencePanel,
  FrontPageDimensionGuide,
  experiencePromptOffset,
  getDimensionExperience,
} from './dimension-experiences'

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
  workedExample: string
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
  bidirectional: boolean
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
const COMPACT_QUERY = '(max-width: 900px)'

function isCompactViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(COMPACT_QUERY).matches
}
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
    workedExample: 'Fear of failure = anticipated identity threat under possible negative evaluation; ordinary task difficulty sits outside that boundary.',
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
    workedExample: 'Fear of failure → increases → avoidance.',
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
    workedExample: 'Social evaluation threatens identity, fear drives avoidance, and avoidance prevents the corrective experiences that could weaken fear.',
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
    workedExample: 'Avoidance lowers fear now, blocks corrective evidence later, then strengthens the future fear that generated the avoidance.',
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
    workedExample: 'One future practises publicly and recalibrates; another avoids exposure and narrows. A small early branch compounds into different future selves.',
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
    workedExample: 'Both futures may be generated by the rule “mistakes determine my worth.” Change that rule and a new possibility landscape appears.',
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
    workedExample: 'A performance framework treats failure as status loss; a learning framework treats it as information. Translate their terms before judging them.',
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
    workedExample: 'Present self sees protection, future self sees lost possibility, peers see withdrawal—and being observed may itself change the behaviour.',
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
    workedExample: 'Repeated outcomes update a learning model, while a self-protective model reclassifies every failure so it never has to change.',
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
    workedExample: 'Build private experiments, rapid feedback and a calibration metric; gain learning speed while accepting less short-term image protection.',
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
    workedExample: 'Personal habits, family expectations and workplace metrics co-adapt, recursively changing what each system rewards and what identities become viable.',
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
    workedExample: 'Add recoverability as a new axis, revealing which risks are reversible and which choices cannot be reduced to success versus failure.',
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
  const [compactLayout, setCompactLayout] = useState(isCompactViewport)
  const [showGuide, setShowGuide] = useState(true)
  const [showInspector, setShowInspector] = useState(() => !isCompactViewport())

  const activeMap = useMemo(() => maps.find((map) => map.id === activeId) ?? null, [maps, activeId])

  useEffect(() => {
    const media = window.matchMedia(COMPACT_QUERY)
    const sync = () => setCompactLayout(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (compactLayout && showGuide && showInspector) setShowInspector(false)
  }, [compactLayout, showGuide, showInspector])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, maps }))
      } catch {
        // Storage can be unavailable in private or constrained browsing contexts.
      }
    }, 180)
    return () => window.clearTimeout(timer)
  }, [maps])

  useEffect(() => {
    if (!activeMap) return
    if (!activeNodeId || !activeMap.nodes.some((node) => node.id === activeNodeId)) {
      setActiveNodeId(activeMap.rootId)
    }
    if (activeLevel !== activeMap.dimension) setActiveLevel(activeMap.dimension)
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
    setActiveLevel(map.dimension)
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
    setActiveLevel(selectedDimension)
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
      bidirectional: composer.prompt.direction === 'either',
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
    // Stay inside the chosen dimensional mode after each branch.
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
      bidirectional: direction === 'either',
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
    setActiveLevel(map.dimension)
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
    <div className={`laboratory experience-d${activeLevel}`} style={{ '--level-accent': levelColour(activeLevel) } as CSSProperties}>
      <header className="lab-topbar">
        <button className="brand-button" type="button" onClick={closeMap} title="Return to maps">
          <span className="brand-mark">DU</span>
          <span>
            <b>Dimensional Laboratory</b>
            <small>{activeMap.title}</small>
          </span>
        </button>
        <div className="topbar-centre">
          <button className="dimension-pill" type="button" onClick={() => {
            setShowGuide(true)
            if (compactLayout) setShowInspector(false)
          }}>
            <strong>{activeMap.dimension}D</strong>
            <span>{getDimensionExperience(activeMap.dimension).studio}</span>
          </button>
          <div className="top-progress" aria-label={`${progress.percent}% complete`}>
            <i style={{ width: `${progress.percent}%` }} />
          </div>
          <span className="top-progress-label">{progress.percent}%</span>
        </div>
        <div className="top-actions">
          <button type="button" className={showGuide ? 'active' : ''} onClick={() => {
            const opening = !showGuide
            setShowGuide(opening)
            if (opening && compactLayout) setShowInspector(false)
          }}>
            Guide
          </button>
          <button type="button" className={showInspector ? 'active' : ''} onClick={() => {
            const opening = !showInspector
            setShowInspector(opening)
            if (opening && compactLayout) setShowGuide(false)
          }}>
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
            if (compactLayout) setShowGuide(false)
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

      {composer ? (
        <BranchComposer
          key={composer.key}
          composer={composer}
          existingNodes={activeMap.nodes}
          onCancel={() => setComposer(null)}
          onSubmit={addBranch}
        />
      ) : null}
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
          Choose one of twelve genuinely different laboratories. Each dimension changes the map shape, prompt logic, completion rules and mental operation rather than merely changing a number.
        </p>
      </section>

      <section className="launch-card" id="start-a-map">
        <div className="launch-copy">
          <span className="section-number">01</span>
          <div>
            <h2>Choose one training dimension</h2>
            <p>The selected level becomes the entire grammar of this map. It opens directly in that dedicated laboratory; lower dimensions do not gate or homogenise the experience.</p>
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
          <div className="worked-example">
            <small>Worked personal-development example</small>
            <strong>{selected.workedExample}</strong>
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

      <FrontPageDimensionGuide
        selectedLevel={props.selectedDimension}
        onSelect={(level) => props.onDimension(level as DimensionLevel)}
      />

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
  onFocus: (field: FocusField, value: string) => void
  onUsePrompt: (prompt: PromptTemplate) => void
}

function GuidePanel(props: GuidePanelProps) {
  const current = dimension(props.activeLevel)
  const assessment = assessLevel(props.map, props.activeLevel)
  return (
    <aside className="guide-panel side-panel">
      <div className="panel-scroll">
        <div className="panel-kicker">Selected training mode · {props.map.dimension}D</div>
        <h2>{current.name} laboratory</h2>
        <p className="panel-intro">This map trains one distinct operation directly. It is not a shared lower-level course wearing a different dimension label.</p>

        <DimensionExperiencePanel level={props.activeLevel} subject={props.map.subject} />

        <section className="current-operation" style={{ '--card-accent': levelColour(current.level) } as CSSProperties}>
          <span className="eyebrow">Live completion test · {current.level}D</span>
          <h3>{current.verb}: {current.name}</h3>
          <p>{current.short}</p>
          <blockquote>{current.coreQuestion}</blockquote>
          <div className="operation-criteria" aria-label="Completion criteria">
            {assessment.criteria.map((criterion) => (
              <div key={criterion.id} className={criterion.complete ? 'complete' : ''}>
                <i>{criterion.complete ? '✓' : '○'}</i>
                <span>{criterion.label}</span>
              </div>
            ))}
          </div>
        </section>

        {current.level === 1 ? (
          <FocusTrainer map={props.map} onFocus={props.onFocus} />
        ) : (
          <div className="prompt-deck">
            <div className="deck-heading">
              <div><small>Active thought</small><strong>{props.activeNode.label}</strong></div>
              <span>{current.verb} move</span>
            </div>
            {current.prompts.map((prompt) => {
              const used = props.map.edges.some((edge) => edge.layer === current.level && edge.promptId === prompt.id)
              return (
                <button key={prompt.id} type="button" className={used ? 'used' : ''} onClick={() => props.onUsePrompt(prompt)}>
                  <span>{prompt.title}{used ? ' · practised' : ''}</span>
                  <strong>{prompt.question}</strong>
                  <small>{prompt.relation}</small>
                </button>
              )
            })}
          </div>
        )}

        <section className="progress-card">
          <div><span>{props.map.dimension}D structural fidelity</span><strong>{props.progress.percent}%</strong></div>
          <div className="progress-track"><i style={{ width: `${props.progress.percent}%` }} /></div>
          <p>{assessment.completed} of {assessment.required} requirements for this selected laboratory are currently visible in the map.</p>
          {props.progress.percent === 100 ? <b>Selected grammar completed. Continue for depth, contradiction testing and transfer.</b> : null}
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
  const viewRef = useRef<ViewState>(view)
  const gestureRef = useRef<CanvasGesture>(makeCanvasGesture())
  const [promptOffset, setPromptOffset] = useState(0)
  const activeNode = props.map.nodes.find((node) => node.id === props.activeNodeId) ?? props.map.nodes[0]
  const current = dimension(props.activeLevel)
  const experience = getDimensionExperience(props.activeLevel)
  const prompts = rotatePrompts(current.prompts, promptOffset).slice(0, 4)
  const nodeById = useMemo(() => new Map(props.map.nodes.map((node) => [node.id, node])), [props.map.nodes])

  useEffect(() => {
    const centred = { panX: 0, panY: 0, scale: 0.82 }
    viewRef.current = centred
    setView(centred)
    gestureRef.current = makeCanvasGesture()
  }, [props.map.id])

  function applyView(next: ViewState) {
    viewRef.current = next
    setView(next)
  }

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

  function beginCanvasGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target as Element
    if (event.button !== 0 || target.closest('button, .map-edge, input, textarea, select')) return
    const viewport = viewportRef.current
    if (!viewport) return
    viewport.setPointerCapture(event.pointerId)
    const gesture = gestureRef.current
    gesture.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (gesture.pointers.size === 1) {
      gesture.mode = 'pan'
      gesture.startView = { ...viewRef.current }
      gesture.startPoint = { x: event.clientX, y: event.clientY }
    } else if (gesture.pointers.size === 2) {
      beginPinchGesture(gesture)
    }
  }

  function beginPinchGesture(gesture: CanvasGesture) {
    const viewport = viewportRef.current
    if (!viewport) return
    const [first, second] = [...gesture.pointers.values()]
    const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
    gesture.mode = 'pinch'
    gesture.startView = { ...viewRef.current }
    gesture.startDistance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y))
    gesture.anchorWorld = worldPoint(midpoint.x, midpoint.y, viewRef.current)
  }

  function moveCanvasGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current
    if (!gesture.pointers.has(event.pointerId)) return
    gesture.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (gesture.pointers.size >= 2) {
      if (gesture.mode !== 'pinch') beginPinchGesture(gesture)
      const viewport = viewportRef.current
      if (!viewport || !gesture.anchorWorld || !gesture.startDistance) return
      const [first, second] = [...gesture.pointers.values()]
      const rect = viewport.getBoundingClientRect()
      const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
      const localX = midpoint.x - rect.left - rect.width / 2
      const localY = midpoint.y - rect.top - rect.height / 2
      const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y))
      const scale = clamp(gesture.startView.scale * (distance / gesture.startDistance), 0.35, 1.75)
      applyView({
        scale,
        panX: localX - (gesture.anchorWorld.x - WORLD_CENTRE.x) * scale,
        panY: localY - (gesture.anchorWorld.y - WORLD_CENTRE.y) * scale,
      })
      return
    }
    if (gesture.mode === 'pan' && gesture.startPoint) {
      applyView({
        ...gesture.startView,
        panX: gesture.startView.panX + event.clientX - gesture.startPoint.x,
        panY: gesture.startView.panY + event.clientY - gesture.startPoint.y,
      })
    }
  }

  function endCanvasGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current
    const gesture = gestureRef.current
    gesture.pointers.delete(event.pointerId)
    if (viewport?.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId)
    if (gesture.pointers.size === 1) {
      const remaining = [...gesture.pointers.values()][0]
      gesture.mode = 'pan'
      gesture.startView = { ...viewRef.current }
      gesture.startPoint = remaining
      gesture.anchorWorld = null
      gesture.startDistance = 0
    } else if (gesture.pointers.size === 0) {
      gestureRef.current = makeCanvasGesture()
    }
  }

  function zoom(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault()
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return
    const localX = event.clientX - rect.left - rect.width / 2
    const localY = event.clientY - rect.top - rect.height / 2
    const point = worldPoint(event.clientX, event.clientY, viewRef.current)
    const scale = clamp(viewRef.current.scale * Math.exp(-event.deltaY * 0.0012), 0.35, 1.75)
    applyView({
      scale,
      panX: localX - (point.x - WORLD_CENTRE.x) * scale,
      panY: localY - (point.y - WORLD_CENTRE.y) * scale,
    })
  }

  function beginNodeDrag(event: ReactPointerEvent<HTMLButtonElement>, node: LabNode) {
    if (event.button !== 0) return
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    props.onSelectNode(node.id)
    const pointerId = event.pointerId
    const start = { x: event.clientX, y: event.clientY, nodeX: node.x, nodeY: node.y }
    let moved = false
    let frame = 0
    let pending = { x: node.x, y: node.y }
    const flush = () => {
      frame = 0
      props.onMoveNode(node.id, pending.x, pending.y)
    }
    const move = (next: PointerEvent) => {
      if (next.pointerId !== pointerId) return
      const dx = (next.clientX - start.x) / viewRef.current.scale
      const dy = (next.clientY - start.y) / viewRef.current.scale
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true
      pending = {
        x: clamp(start.nodeX + dx, 100, WORLD_WIDTH - 100),
        y: clamp(start.nodeY + dy, 100, WORLD_HEIGHT - 100),
      }
      if (!frame) frame = window.requestAnimationFrame(flush)
    }
    const finish = (next: PointerEvent) => {
      if (next.pointerId !== pointerId) return
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      if (frame) {
        window.cancelAnimationFrame(frame)
        flush()
      }
      if (!moved) props.onSelectNode(node.id)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
  }

  const ghostPoints = prompts.map((prompt, index) => ({
    prompt,
    ...ghostPosition(activeNode, prompt.id, index, prompts.length, props.activeLevel),
  }))

  return (
    <section className={`canvas-column experience-canvas-d${props.activeLevel}`}>
      <div className="canvas-status">
        <span><b>{props.activeLevel}D</b> {experience.studio}</span>
        <strong>{current.coreQuestion}</strong>
        <span>{props.map.nodes.length} nodes · {props.map.edges.length} lines</span>
      </div>
      <div
        ref={viewportRef}
        className={`map-viewport experience-viewport-d${props.activeLevel}`}
        onPointerDown={beginCanvasGesture}
        onPointerMove={moveCanvasGesture}
        onPointerUp={endCanvasGesture}
        onPointerCancel={endCanvasGesture}
        onWheel={zoom}
      >
        <div
          className="map-world"
          style={{
            width: WORLD_WIDTH,
            height: WORLD_HEIGHT,
            left: '50%',
            top: '50%',
            transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.scale}) translate(${-WORLD_CENTRE.x}px, ${-WORLD_CENTRE.y}px)`,
          }}
        >
          <svg className="edge-layer" width={WORLD_WIDTH} height={WORLD_HEIGHT} viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`} aria-hidden="true">
            <defs>
              <marker id="line-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto-start-reverse" markerUnits="strokeWidth">
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
            </defs>
            <DimensionCanvasScaffold level={props.activeLevel} x={activeNode.x} y={activeNode.y} />
            {props.map.edges.map((edge) => {
              const from = nodeById.get(edge.from)
              const to = nodeById.get(edge.to)
              if (!from || !to) return null
              const geometry = edgeGeometry(from, to, edge.id)
              return (
                <g key={edge.id} className={`map-edge d${edge.layer} ${props.activeEdgeId === edge.id ? 'selected' : ''}`} onClick={() => props.onSelectEdge(edge.id)}>
                  <path className="edge-hit" d={geometry.path} />
                  <path className="edge-visible" d={geometry.path} markerStart={edge.bidirectional ? 'url(#line-arrow)' : undefined} markerEnd="url(#line-arrow)" />
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
                className={props.map.edges.some((edge) => edge.layer === props.activeLevel && edge.promptId === point.prompt.id) ? 'ghost-node used' : 'ghost-node'}
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
          <button type="button" onClick={() => applyView({ ...viewRef.current, scale: clamp(viewRef.current.scale + 0.12, 0.35, 1.75) })}>＋</button>
          <button type="button" onClick={() => applyView({ ...viewRef.current, scale: clamp(viewRef.current.scale - 0.12, 0.35, 1.75) })}>−</button>
          <button type="button" onClick={() => applyView({ panX: 0, panY: 0, scale: 0.82 })}>Centre</button>
          {current.prompts.length > 4 ? <button type="button" onClick={() => setPromptOffset((value) => value + 1)}>Rotate prompts</button> : null}
        </div>
        <div className="canvas-help">Drag nodes · drag empty space to pan · wheel, trackpad or two-finger pinch to zoom · select a dashed prompt to grow the map</div>
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
  const activeDimension = dimension(props.activeLevel)
  const activeExperience = getDimensionExperience(props.activeLevel)
  const [targetId, setTargetId] = useState('')
  const [relation, setRelation] = useState(activeDimension.prompts[0]?.relation ?? 'relates to')
  const [direction, setDirection] = useState<Direction>('out')

  useEffect(() => {
    const first = props.map.nodes.find((node) => node.id !== props.node.id)
    setTargetId(first?.id ?? '')
  }, [props.map.nodes, props.node.id])

  useEffect(() => {
    setRelation(activeDimension.prompts[0]?.relation ?? 'relates to')
  }, [activeDimension.prompts, props.activeLevel])

  if (props.edge) {
    const from = props.map.nodes.find((node) => node.id === props.edge?.from)
    const to = props.map.nodes.find((node) => node.id === props.edge?.to)
    return (
      <aside className="inspector-panel side-panel">
        <div className="panel-scroll">
          <div className="panel-kicker">Semantic line · {props.edge.layer}D</div>
          <h2>Relationship</h2>
          <div className="edge-summary"><b>{from?.label ?? 'Unknown'}</b><span>{props.edge.bidirectional ? '↔' : '→'}</span><b>{to?.label ?? 'Unknown'}</b></div>
          <label className="field-label">
            <span>Precise relationship</span>
            <input value={props.edge.relation} onChange={(event) => props.onUpdateEdge({ relation: event.target.value })} />
          </label>
          <label className="field-label">
            <span>Direction</span>
            <select value={props.edge.bidirectional ? 'both' : 'forward'} onChange={(event) => props.onUpdateEdge({ bidirectional: event.target.value === 'both' })}>
              <option value="forward">Directed →</option>
              <option value="both">Reciprocal / contrast ↔</option>
            </select>
          </label>
          <label className="field-label">
            <span>Dedicated reasoning mode</span>
            <input value={`${props.map.dimension}D · ${activeExperience.studio}`} readOnly />
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
          <div><span className="eyebrow">{activeDimension.verb} move · {activeExperience.studio}</span><h3>Connect existing nodes</h3></div>
          {connectable.length ? (
            <>
              <select value={targetId} onChange={(event) => setTargetId(event.target.value)}>
                {connectable.map((node) => <option key={node.id} value={node.id}>{node.label}</option>)}
              </select>
              <input value={relation} onChange={(event) => setRelation(event.target.value)} placeholder={`${activeDimension.verb.toLowerCase()} relationship`} />
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

function BranchComposer({
  composer,
  existingNodes,
  onCancel,
  onSubmit,
}: {
  composer: ComposerState
  existingNodes: LabNode[]
  onCancel: () => void
  onSubmit: (draft: { name: string; relation: string; context: string }) => void
}) {
  const [name, setName] = useState('')
  const [relation, setRelation] = useState(composer.prompt.relation)
  const [context, setContext] = useState('')
  const optionsId = `existing-nodes-${composer.key}`
  const reconnectable = existingNodes.filter((node) => node.id !== composer.fromId)
  const feedbackPrompt = composer.prompt.id === 'd4-feedback'
  const promptLevel = toDimension(Number(composer.prompt.id.match(/^d(\d+)/)?.[1] ?? 2))
  const promptExperience = getDimensionExperience(promptLevel)
  return (
    <div className="composer-backdrop" onPointerDown={(event) => {
      if (event.target === event.currentTarget) onCancel()
    }}>
      <form className="branch-composer" onSubmit={(event) => {
        event.preventDefault()
        onSubmit({ name, relation, context })
      }}>
        <button type="button" className="composer-close" onClick={onCancel} aria-label="Close">×</button>
        <span className="eyebrow">{promptLevel}D · {promptExperience.studio} · {composer.prompt.title}</span>
        <h2>{composer.prompt.question}</h2>
        <p className="composer-mode-explanation">{promptExperience.mentalMove}</p>
        <p className="composer-example"><b>Example:</b> {composer.prompt.example}</p>
        {feedbackPrompt ? (
          <p className="composer-guidance"><b>Feedback rule:</b> reconnect to an existing node so the returning consequence closes a real loop rather than merely extending a timeline.</p>
        ) : null}
        <label>
          <span>Node: the {titleCase(composer.prompt.kind)} this move requires</span>
          <input
            autoFocus
            list={reconnectable.length ? optionsId : undefined}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={feedbackPrompt ? 'Choose an existing node to close the loop…' : 'Name a new concept or choose an existing node…'}
          />
          {reconnectable.length ? (
            <datalist id={optionsId}>
              {reconnectable.map((node) => <option key={node.id} value={node.label} />)}
            </datalist>
          ) : null}
          <small className="composer-field-help">Typing an existing node name reconnects the line instead of creating a duplicate node.</small>
        </label>
        <label>
          <span>Line: the exact {composer.prompt.title.toLowerCase()} relationship</span>
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

interface LevelCriterion {
  id: string
  label: string
  complete: boolean
}

interface LevelAssessment {
  criteria: LevelCriterion[]
  completed: number
  required: number
  complete: boolean
}

function calculateProgress(map: LabMap): ProgressSummary {
  const assessment = assessLevel(map, map.dimension)
  return {
    percent: assessment.required ? Math.round((assessment.completed / assessment.required) * 100) : 0,
    completedLevels: assessment.complete ? 1 : 0,
  }
}

function assessLevel(map: LabMap, level: DimensionLevel): LevelAssessment {
  const criteria = levelCriteria(map, level)
  const completed = criteria.filter((criterion) => criterion.complete).length
  return { criteria, completed, required: criteria.length, complete: completed === criteria.length }
}

function levelCriteria(map: LabMap, level: DimensionLevel): LevelCriterion[] {
  const target = level === map.dimension
  if (level === 1) {
    const precise = (value: string) => value.trim().length >= 8
    const criteria: LevelCriterion[] = [
      { id: 'definition', label: 'Define the focal phenomenon precisely', complete: precise(map.focus.definition) },
      { id: 'boundary', label: 'Mark what belongs inside and outside its boundary', complete: precise(map.focus.boundary) },
    ]
    if (target) {
      criteria.push({ id: 'state', label: 'Describe its present state without adding relationships', complete: precise(map.focus.state) })
      criteria.push({ id: 'anchor', label: 'Anchor the representation in an observable example or evidence', complete: precise(map.focus.evidence) })
    }
    return criteria
  }

  const edges = map.edges.filter((edge) => edge.layer === level && edge.relation.trim().length >= 3)
  if (!target) {
    return [{ id: `gateway-${level}`, label: `Create one valid ${level}D ${dimension(level).verb.toLowerCase()} move`, complete: edges.length >= 1 }]
  }

  const has = (...promptIds: string[]) => edges.some((edge) => promptIds.includes(edge.promptId))
  const nodeKinds = (...kinds: NodeKind[]) => map.nodes.filter((node) => kinds.includes(node.kind)).length
  const topologyCrosslink = edges.some((edge) => edge.from !== map.rootId && edge.to !== map.rootId)
  const trajectoryBranches = new Map<string, number>()
  edges.filter((edge) => edge.promptId === 'd5-branch').forEach((edge) => trajectoryBranches.set(edge.from, (trajectoryBranches.get(edge.from) ?? 0) + 1))
  const hasSharedBranchPoint = [...trajectoryBranches.values()].some((branchCount) => branchCount >= 2)
  const criteriaByLevel: Record<number, LevelCriterion[]> = {
    2: [
      { id: 'volume', label: 'Create three precise pairwise relationships', complete: edges.length >= 3 },
      { id: 'influence', label: 'Map at least one direct cause or effect', complete: has('d2-influence-in', 'd2-influence-out') },
      { id: 'distinction', label: 'Add a dependence or contrast that clarifies the pair', complete: has('d2-dependence', 'd2-contrast') },
    ],
    3: [
      { id: 'volume', label: 'Create four interacting system relationships', complete: edges.length >= 4 },
      { id: 'mechanism', label: 'Represent a mediator or moderator', complete: has('d3-mediator', 'd3-moderator') },
      { id: 'pressure', label: 'Represent a constraint or competing force', complete: has('d3-constraint', 'd3-tension') },
      { id: 'crosslink', label: 'Cross-link beyond a root-centred list', complete: topologyCrosslink },
    ],
    4: [
      { id: 'sequence', label: 'Represent an earlier or next state', complete: has('d4-prior', 'd4-next') },
      {
        id: 'feedback',
        label: 'Close an explicit recursive feedback loop by reconnecting to an existing node',
        complete: edges.some((edge) => edge.promptId === 'd4-feedback' && edgeClosesCycle(map, edge)),
      },
      { id: 'temporal-dynamics', label: 'Represent delay or amplification across time', complete: has('d4-delay', 'd4-amplifier') },
      { id: 'volume', label: 'Build at least four transformation relationships', complete: edges.length >= 4 },
    ],
    5: [
      { id: 'branches', label: 'Generate at least two futures from the same branch point', complete: hasSharedBranchPoint },
      { id: 'selection', label: 'State a branch condition or counterfactual change', complete: has('d5-condition', 'd5-counterfactual') },
      { id: 'shape', label: 'Test convergence or irreversibility across paths', complete: has('d5-convergence', 'd5-irreversible') },
    ],
    6: [
      { id: 'generator', label: 'Expose a hidden assumption or operating rule', complete: has('d6-assumption', 'd6-rule') },
      { id: 'possibility-control', label: 'Show what permits or excludes a future', complete: has('d6-permission', 'd6-prohibition') },
      { id: 'objective', label: 'Identify what the system actually optimises for', complete: has('d6-objective') },
    ],
    7: [
      { id: 'plurality', label: 'Represent at least two alternative frameworks', complete: nodeKinds('framework') >= 2 },
      { id: 'translation', label: 'Translate or locate incompatibility between frameworks', complete: has('d7-translation', 'd7-incompatibility') },
      { id: 'integration', label: 'Attempt a higher-order integration', complete: has('d7-integration') },
    ],
    8: [
      { id: 'observers', label: 'Represent at least two observers or scales', complete: nodeKinds('observer') >= 2 },
      { id: 'blindness', label: 'Expose a scale shift or observer blind spot', complete: has('d8-scale', 'd8-blindspot') },
      { id: 'reflexivity', label: 'Show how observation changes the system', complete: has('d8-reflexive') },
    ],
    9: [
      { id: 'update', label: 'Model a genuine revision of the model', complete: has('d9-update') },
      { id: 'selection', label: 'Represent selection pressure or self-protection', complete: has('d9-selection', 'd9-immunity') },
      { id: 'invariant', label: 'Identify what survives across model revisions', complete: has('d9-invariant') },
    ],
    10: [
      { id: 'redesign', label: 'Propose an architectural or objective redesign', complete: has('d10-intervention', 'd10-objective') },
      { id: 'tradeoff', label: 'State the redesign’s real trade-off', complete: has('d10-tradeoff') },
      { id: 'governance', label: 'Add a process that can revise the architecture', complete: has('d10-governance') },
    ],
    11: [
      { id: 'coadaptation', label: 'Map co-adaptation or incentive reshaping', complete: has('d11-coadapt', 'd11-incentive') },
      { id: 'emergence', label: 'Represent an emergent pattern no actor chose alone', complete: has('d11-emergence') },
      { id: 'stability', label: 'Identify what stabilises recursive mutual change', complete: has('d11-stability') },
    ],
    12: [
      { id: 'axis', label: 'Invent a genuinely new representational axis', complete: has('d12-axis') },
      { id: 'visibility', label: 'Show what the new axis makes visible', complete: has('d12-visible') },
      { id: 'cost', label: 'Name what the new representation hides or distorts', complete: has('d12-blindness') },
      { id: 'revision', label: 'State what would force revision of the new dimension', complete: has('d12-recursion') },
    ],
  }
  return criteriaByLevel[level] ?? [{ id: 'valid', label: 'Create a valid reasoning move', complete: edges.length >= 1 }]
}

function dimension(level: DimensionLevel): DimensionDefinition {
  return DIMENSIONS[level - 1]
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
        layer: dimensionLevel,
        context: `Focal phenomenon · ${dimensionLevel}D mode`,
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
  if (!candidate.rootId || !Array.isArray(candidate.nodes) || !Array.isArray(candidate.edges)) return null
  const now = new Date().toISOString()
  const dimensionLevel = toDimension(finiteNumber(candidate.dimension, 2))
  const seenNodeIds = new Set<string>()
  const nodes = candidate.nodes.flatMap((raw) => {
    if (!raw || typeof raw !== 'object') return []
    const source = raw as Partial<LabNode>
    const id = typeof source.id === 'string' ? source.id.trim() : ''
    const label = typeof source.label === 'string' ? source.label.trim() : ''
    if (!id || !label || seenNodeIds.has(id)) return []
    seenNodeIds.add(id)
    const kind = NODE_KINDS.includes(source.kind as NodeKind) ? (source.kind as NodeKind) : 'concept'
    return [{
      id,
      label,
      kind,
      x: clamp(finiteNumber(source.x, WORLD_CENTRE.x), 100, WORLD_WIDTH - 100),
      y: clamp(finiteNumber(source.y, WORLD_CENTRE.y), 100, WORLD_HEIGHT - 100),
      layer: toDimension(Math.min(dimensionLevel, finiteNumber(source.layer, 1))),
      context: typeof source.context === 'string' ? source.context : '',
      notes: typeof source.notes === 'string' ? source.notes : '',
      confidence: clamp(finiteNumber(source.confidence, 50), 0, 100),
      createdAt: typeof source.createdAt === 'string' ? source.createdAt : now,
    } satisfies LabNode]
  })
  const rootId = String(candidate.rootId)
  if (!nodes.some((node) => node.id === rootId)) return null
  const modeNodes = nodes.map((node) =>
    node.id === rootId
      ? { ...node, layer: dimensionLevel, context: node.context || `Focal phenomenon · ${dimensionLevel}D mode` }
      : node,
  )
  const nodeIds = new Set(modeNodes.map((node) => node.id))
  const seenEdgeIds = new Set<string>()
  const edges = dimensionLevel === 1 ? [] : candidate.edges.flatMap((raw) => {
    if (!raw || typeof raw !== 'object') return []
    const source = raw as Partial<LabEdge>
    const from = typeof source.from === 'string' ? source.from : ''
    const to = typeof source.to === 'string' ? source.to : ''
    const relation = typeof source.relation === 'string' ? source.relation.trim() : ''
    if (!from || !to || from === to || !nodeIds.has(from) || !nodeIds.has(to) || !relation) return []
    const suppliedId = typeof source.id === 'string' ? source.id.trim() : ''
    const id = suppliedId && !seenEdgeIds.has(suppliedId) ? suppliedId : makeId('edge')
    seenEdgeIds.add(id)
    return [{
      id,
      from,
      to,
      relation,
      layer: toDimension(Math.min(dimensionLevel, finiteNumber(source.layer, 2))),
      promptId: typeof source.promptId === 'string' ? source.promptId : 'imported',
      bidirectional: Boolean(source.bidirectional),
      notes: typeof source.notes === 'string' ? source.notes : '',
    } satisfies LabEdge]
  })
  const title = typeof candidate.title === 'string' && candidate.title.trim() ? candidate.title.trim() : modeNodes.find((node) => node.id === rootId)?.label ?? 'Imported map'
  return {
    schemaVersion: 1,
    id: typeof candidate.id === 'string' && candidate.id ? candidate.id : makeId('map'),
    title,
    subject: typeof candidate.subject === 'string' && candidate.subject.trim() ? candidate.subject.trim() : title,
    dimension: dimensionLevel,
    rootId,
    nodes: modeNodes,
    edges,
    focus: {
      definition: typeof candidate.focus?.definition === 'string' ? candidate.focus.definition : '',
      boundary: typeof candidate.focus?.boundary === 'string' ? candidate.focus.boundary : '',
      state: typeof candidate.focus?.state === 'string' ? candidate.focus.state : '',
      evidence: typeof candidate.focus?.evidence === 'string' ? candidate.focus.evidence : '',
    },
    createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : now,
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : now,
  }
}

function edgeClosesCycle(map: LabMap, candidate: LabEdge): boolean {
  const adjacency = new Map<string, string[]>()
  const connect = (from: string, to: string) => adjacency.set(from, [...(adjacency.get(from) ?? []), to])
  map.edges.forEach((edge) => {
    if (edge.id === candidate.id) return
    connect(edge.from, edge.to)
    if (edge.bidirectional) connect(edge.to, edge.from)
  })
  const visited = new Set<string>()
  const pending = [candidate.to]
  while (pending.length) {
    const nodeId = pending.pop()
    if (!nodeId || visited.has(nodeId)) continue
    if (nodeId === candidate.from) return true
    visited.add(nodeId)
    pending.push(...(adjacency.get(nodeId) ?? []))
  }
  return false
}

function suggestedPosition(map: LabMap, activeNode: LabNode, level: DimensionLevel, seed: string) {
  const siblingCount = map.edges.filter((edge) => edge.from === activeNode.id || edge.to === activeNode.id).length
  const promptCount = Math.max(1, dimension(level).prompts.length)
  const offset = experiencePromptOffset(level, seed, siblingCount % promptCount, promptCount)
  const ring = 1 + Math.floor(siblingCount / promptCount) * 0.18
  const jitter = (hashNumber(`${seed}-${siblingCount}`) - 0.5) * 34
  return {
    x: clamp(activeNode.x + offset.dx * ring + jitter, 130, WORLD_WIDTH - 130),
    y: clamp(activeNode.y + offset.dy * ring - jitter * 0.35, 100, WORLD_HEIGHT - 100),
  }
}

function ghostPosition(
  node: LabNode,
  promptId: string,
  index: number,
  total: number,
  level: DimensionLevel,
) {
  const offset = experiencePromptOffset(level, promptId, index, total)
  return {
    x: clamp(node.x + offset.dx, 150, WORLD_WIDTH - 150),
    y: clamp(node.y + offset.dy, 120, WORLD_HEIGHT - 120),
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

interface CanvasGesture {
  pointers: Map<number, { x: number; y: number }>
  mode: 'idle' | 'pan' | 'pinch'
  startView: ViewState
  startPoint: { x: number; y: number } | null
  startDistance: number
  anchorWorld: { x: number; y: number } | null
}

function makeCanvasGesture(): CanvasGesture {
  return {
    pointers: new Map(),
    mode: 'idle',
    startView: { panX: 0, panY: 0, scale: 0.82 },
    startPoint: null,
    startDistance: 0,
    anchorWorld: null,
  }
}

function finiteNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
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
