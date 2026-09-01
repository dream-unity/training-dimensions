import { useEffect, useState } from 'react'
import './dimension-experiences.css'

export type ExperienceLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

interface WorkedExample {
  subject: string
  map: string
  insight: string
}

export interface DimensionExperience {
  level: ExperienceLevel
  studio: string
  name: string
  verb: string
  mentalMove: string
  addsBeyondPrevious: string
  mapShape: string
  mission: string
  steps: string[]
  lineGrammar: string[]
  commonMistake: string
  passTest: string
  example: WorkedExample
}

export const DIMENSION_EXPERIENCES: DimensionExperience[] = [
  {
    level: 1,
    studio: 'Focus Chamber',
    name: 'Focus',
    verb: 'Isolate',
    mentalMove: 'Hold one phenomenon steady before explaining it through anything else.',
    addsBeyondPrevious: 'Creates the stable unit that every later relationship depends upon.',
    mapShape: 'One bounded field; no branches.',
    mission: 'Make the subject precise enough that two people would map the same thing rather than two different meanings hidden under one word.',
    steps: [
      'Name the exact phenomenon, not a broad topic.',
      'Write an operational definition in observable language.',
      'State what belongs inside the boundary and what does not.',
      'Describe its present state and give one evidence anchor.',
    ],
    lineGrammar: ['No relationship lines yet', 'Definition', 'Boundary', 'Present state', 'Evidence anchor'],
    commonMistake: 'Explaining causes or effects before the subject itself has been stabilised.',
    passTest: 'A stranger can distinguish this phenomenon from its nearest look-alikes using only your definition and boundary.',
    example: {
      subject: 'Fear of failure',
      map: 'Anticipated threat to self-worth under possible negative evaluation; ordinary task difficulty is outside the boundary.',
      insight: 'The map separates fear of failure from difficulty, caution and lack of skill.',
    },
  },
  {
    level: 2,
    studio: 'Relation Bridge',
    name: 'Relation',
    verb: 'Connect',
    mentalMove: 'Join two defined things with one directional, testable relationship.',
    addsBeyondPrevious: 'Moves from “what exists?” to “what does one thing do to another?”',
    mapShape: 'A — precise verb → B.',
    mission: 'Replace vague association with a sentence that has two nodes, a direction and an exact relational verb.',
    steps: [
      'Select the focal node and one genuinely relevant second node.',
      'Choose the direction of influence or dependence.',
      'Name the line with a verb that could be challenged.',
      'Add a contrast or dependency to sharpen the pair.',
    ],
    lineGrammar: ['shapes', 'influences', 'depends on', 'contrasts with'],
    commonMistake: 'Placing related words near each other without stating how they are related.',
    passTest: 'Every line can be read aloud as a meaningful sentence and reversing it would change the claim.',
    example: {
      subject: 'Fear of failure',
      map: 'Fear of failure — increases → avoidance.',
      insight: 'A loose association becomes a directional claim that can be examined.',
    },
  },
  {
    level: 3,
    studio: 'System Weave',
    name: 'System',
    verb: 'Integrate',
    mentalMove: 'Model several relationships acting together rather than collecting separate pairs.',
    addsBeyondPrevious: 'Adds interaction, mediation, constraint and cross-links.',
    mapShape: 'A web with at least one non-central cross-link.',
    mission: 'Build a mechanism-rich system in which changing one element alters several others, and identify where the system can be influenced.',
    steps: [
      'Add at least three interacting factors around the subject.',
      'Insert a mediator or moderator that changes how an influence travels.',
      'Add a constraint or competing force.',
      'Cross-link two non-root nodes and identify a leverage point.',
    ],
    lineGrammar: ['is mediated by', 'is moderated by', 'is constrained by', 'competes with', 'helps regulate'],
    commonMistake: 'Creating a radial list where every node touches only the centre.',
    passTest: 'The map contains a mechanism, a pressure and a cross-link that jointly explain the pattern.',
    example: {
      subject: 'Fear of failure',
      map: 'Evaluation threatens identity; shame mediates avoidance; avoidance blocks corrective experience; social support moderates the loop.',
      insight: 'The problem is no longer a single cause but an interacting system with leverage points.',
    },
  },
  {
    level: 4,
    studio: 'Time-Loop Laboratory',
    name: 'Transformation',
    verb: 'Track',
    mentalMove: 'Follow how states and relationships change through time, delay and recursive feedback.',
    addsBeyondPrevious: 'Turns a static system into a changing process with memory and path-dependence.',
    mapShape: 'Earlier state → transition → later state ↺ feedback.',
    mission: 'Show how the system becomes something different, then close at least one consequence back into an earlier condition.',
    steps: [
      'Name an earlier state and the transition that changed it.',
      'Map a later consequence rather than another static factor.',
      'Mark a delayed effect that could be misread in the present.',
      'Reconnect a consequence to an existing node to close a real loop.',
    ],
    lineGrammar: ['developed from', 'transforms into', 'changes after a delay through', 'feeds back into', 'amplifies over time through'],
    commonMistake: 'Adding dates to an unchanged network without showing transformation or feedback.',
    passTest: 'Freezing the map at one moment would remove essential meaning, and at least one directed cycle is visible.',
    example: {
      subject: 'Fear of failure',
      map: 'Avoidance reduces fear now → prevents corrective evidence later → strengthens future fear → increases later avoidance.',
      insight: 'The original condition becomes both a cause and a consequence of its history.',
    },
  },
  {
    level: 5,
    studio: 'Future-Fork Simulator',
    name: 'Trajectory Space',
    verb: 'Branch',
    mentalMove: 'Hold several plausible evolving histories in view at the same time.',
    addsBeyondPrevious: 'Expands one timeline into a structured possibility space.',
    mapShape: 'One branch point → multiple future lanes.',
    mission: 'Generate genuinely different futures from the same present, state what selects each path and compare convergence, divergence and irreversibility.',
    steps: [
      'Choose one present state as the shared branch point.',
      'Create at least two plausible futures from that exact node.',
      'State the condition or intervention selecting each path.',
      'Mark where paths converge, compound or become difficult to reverse.',
    ],
    lineGrammar: ['could branch into', 'occurs if', 'would differ if', 'may converge with', 'becomes hard to reverse after'],
    commonMistake: 'Listing unrelated goals rather than alternate histories emerging from one condition.',
    passTest: 'The futures share a starting point, differ because of explicit conditions and produce distinguishable later selves or systems.',
    example: {
      subject: 'Fear of failure',
      map: 'Public practice → calibrated confidence; private avoidance → narrowed identity; honest feedback selects the first path.',
      insight: 'A small present intervention is evaluated by the life trajectories it opens or closes.',
    },
  },
  {
    level: 6,
    studio: 'Rule Foundry',
    name: 'Generative Rules',
    verb: 'Expose',
    mentalMove: 'Move beneath visible futures to the assumptions, rules and objectives that generate them.',
    addsBeyondPrevious: 'Changes the possibility generator instead of merely choosing among its outputs.',
    mapShape: 'Visible trajectories above; hidden rules and objectives beneath.',
    mission: 'Identify why these futures appear possible at all, then alter a generator and show a new possibility landscape emerging.',
    steps: [
      'Locate a repeated pattern or set of futures already visible.',
      'Expose the hidden assumption or operating rule producing them.',
      'Identify what the system rewards, permits and prohibits.',
      'Rewrite one generator and map a future that was previously invisible.',
    ],
    lineGrammar: ['is generated by the assumption', 'is governed by the rule', 'becomes possible when', 'is excluded by', 'optimises for'],
    commonMistake: 'Calling another cause a “rule” without showing that it generates several downstream possibilities.',
    passTest: 'Changing one mapped rule reorganises more than one trajectory and creates or removes options.',
    example: {
      subject: 'Fear of failure',
      map: 'Avoidance and perfectionism are both generated by “mistakes determine my worth”; replacing it with “mistakes update my model” opens experimentation.',
      insight: 'The learner redesigns the source of the option set rather than selecting within it.',
    },
  },
  {
    level: 7,
    studio: 'Framework Translator',
    name: 'Framework Plurality',
    verb: 'Reframe',
    mentalMove: 'Model several coherent rule-generating frameworks without collapsing one into another.',
    addsBeyondPrevious: 'Adds alternative ontologies, translation and incompatibility.',
    mapShape: 'Framework A ⇄ translation bridge ⇄ Framework B.',
    mission: 'Show how the same evidence becomes a different problem under another framework, then translate terms and test whether a higher integration is possible.',
    steps: [
      'Represent two coherent frameworks, not merely two opinions.',
      'Map how each defines the subject and what each treats as evidence.',
      'Translate functionally similar concepts across vocabularies.',
      'State one incompatibility and attempt a higher-order integration.',
    ],
    lineGrammar: ['is interpreted differently by', 'translates into', 'cannot preserve simultaneously with', 'can be integrated through'],
    commonMistake: 'Treating frameworks as preferences while leaving their underlying rules implicit.',
    passTest: 'You can explain each framework fairly, translate between them and identify what cannot be preserved unchanged.',
    example: {
      subject: 'Fear of failure',
      map: 'A performance frame reads failure as status loss; a learning frame reads it as information; both can be integrated through calibrated challenge.',
      insight: 'The same event generates different realities because the organising framework changes.',
    },
  },
  {
    level: 8,
    studio: 'Observer Orbit',
    name: 'Observer Relativity',
    verb: 'Rotate',
    mentalMove: 'Treat observer, standpoint and scale as active variables inside the model.',
    addsBeyondPrevious: 'Adds blind spots, reflexivity and perspective-dependent visibility.',
    mapShape: 'One phenomenon surrounded by observer and scale orbits.',
    mission: 'Rotate through observers, show what becomes visible or invisible from each position and map how being observed changes the system itself.',
    steps: [
      'Choose at least two observers or scales with genuinely different access.',
      'Map what each can see, cannot see and values differently.',
      'Shift from person to relationship, institution, species or planet where relevant.',
      'Show how measurement, anticipation or judgement alters behaviour.',
    ],
    lineGrammar: ['appears differently to', 'changes meaning at the scale of', 'is invisible from', 'changes when observed by'],
    commonMistake: 'Adding viewpoints as comments without allowing them to transform the map.',
    passTest: 'Changing observer changes at least one relation, one blind spot and one system response.',
    example: {
      subject: 'Fear of failure',
      map: 'Present self sees protection; future self sees lost possibility; a mentor sees under-sampling; public judgement intensifies the fear being observed.',
      insight: 'Perspective is no longer outside the map; it participates in producing the phenomenon.',
    },
  },
  {
    level: 9,
    studio: 'Model-Evolution Lab',
    name: 'Model Evolution',
    verb: 'Evolve',
    mentalMove: 'Track how the frameworks doing the explaining learn, compete, protect themselves and change.',
    addsBeyondPrevious: 'Makes the map-maker’s models historical and selectable rather than fixed.',
    mapShape: 'Model v1 → anomaly/evidence → response → model v2.',
    mission: 'Represent a model before and after evidence, distinguish genuine updating from self-protection and identify what valuable structure survives revision.',
    steps: [
      'Name the current model and the predictions it makes.',
      'Add evidence or an anomaly that places pressure on it.',
      'Map whether it updates, competes, merges or immunises itself.',
      'Identify an invariant worth preserving across revisions.',
    ],
    lineGrammar: ['updates into', 'is selected for by', 'protects itself from revision through', 'retains across revisions'],
    commonMistake: 'Changing conclusions while leaving the model’s update rule untouched.',
    passTest: 'The map distinguishes honest revision from a self-sealing explanation and shows why one model survives.',
    example: {
      subject: 'Fear of failure',
      map: '“Failure proves incapacity” predicts rejection; repeated safe failures pressure it; a revised model becomes “performance is trainable,” while sensitivity to standards remains.',
      insight: 'The learner maps not only beliefs, but the evolutionary dynamics of belief systems.',
    },
  },
  {
    level: 10,
    studio: 'Architecture Studio',
    name: 'Architecture Design',
    verb: 'Redesign',
    mentalMove: 'Deliberately construct the system that will produce better rules, models and possibilities.',
    addsBeyondPrevious: 'Moves from understanding model evolution to engineering its conditions.',
    mapShape: 'Objective + inputs + feedback + constraints + governance.',
    mission: 'Design an intervention architecture, state its objective and feedback loop, then expose its trade-off and the process that can later revise the design.',
    steps: [
      'Specify what the current architecture actually optimises for.',
      'Redesign an objective, interface, feedback loop or constraint.',
      'Trace several downstream changes the intervention should produce.',
      'State the cost, failure mode and governance process for revising it.',
    ],
    lineGrammar: ['can be redesigned through', 'would improve by optimising for', 'gains at the cost of', 'is kept adaptive by'],
    commonMistake: 'Proposing a tactic without modelling the architecture that repeatedly generates behaviour.',
    passTest: 'The redesign changes multiple downstream rules, names a real trade-off and contains its own revision mechanism.',
    example: {
      subject: 'Fear of failure',
      map: 'A weekly exposure-and-feedback architecture optimises for calibration, not appearing flawless; it gains learning speed at the cost of short-term comfort.',
      insight: 'Personal development becomes deliberate system design rather than episodic willpower.',
    },
  },
  {
    level: 11,
    studio: 'Co-evolution Arena',
    name: 'Co-evolving Architectures',
    verb: 'Coordinate',
    mentalMove: 'Model several adaptive architectures recursively changing one another.',
    addsBeyondPrevious: 'Adds reciprocal adaptation, emergence and meta-stability across systems.',
    mapShape: 'System A ↔ System B ↔ System C → emergent pattern.',
    mission: 'Track how people, institutions or intelligences alter one another’s incentives and redesigns, then identify an emergent outcome and what stabilises mutual adaptation.',
    steps: [
      'Represent at least three adaptive systems with distinct objectives.',
      'Map how one system changes another’s incentives or models.',
      'Follow the response back so adaptation becomes reciprocal.',
      'Name an emergent pattern and a condition that keeps co-evolution constructive.',
    ],
    lineGrammar: ['co-adapts with', 'reshapes the incentives of', 'jointly produces', 'stabilises mutual change through'],
    commonMistake: 'Mapping a one-way influence chain where the other systems never learn or respond.',
    passTest: 'At least two systems change their own future behaviour because of one another, producing an outcome no single actor selected.',
    example: {
      subject: 'Fear of failure',
      map: 'Personal avoidance, family expectations and workplace metrics co-adapt; each rewards caution until a culture of low experimentation emerges.',
      insight: 'The personal state is understood as part of a recursively adapting ecology.',
    },
  },
  {
    level: 12,
    studio: 'Axis Forge',
    name: 'Dimension Invention',
    verb: 'Reconstitute',
    mentalMove: 'Question and redesign the axes through which the problem can be represented at all.',
    addsBeyondPrevious: 'Changes the language and dimensional structure of the possibility space itself.',
    mapShape: 'Existing axes + invented axis → new visibility + new blindness.',
    mission: 'Find a distinction the current map cannot express, invent an accountable new axis, show what it reveals and hides, then specify what would force revision of the axis.',
    steps: [
      'Name the existing axes or categories organising the problem.',
      'Identify two states those axes incorrectly collapse together.',
      'Invent a new representational axis and remap the problem through it.',
      'State its visibility gain, representational cost and falsifier.',
    ],
    lineGrammar: ['becomes newly representable through', 'makes visible', 'makes harder to perceive', 'requires revising the dimension'],
    commonMistake: 'Inventing a new label that does not change what can be represented or predicted.',
    passTest: 'The new axis separates previously conflated states, changes at least one decision and includes a condition under which it must be redesigned.',
    example: {
      subject: 'Fear of failure',
      map: 'Add recoverability as an axis: reversible experiments separate from identity-defining commitments, revealing that many feared failures are cheaply recoverable.',
      insight: 'The learner changes the representational geometry that made the original problem seem inevitable.',
    },
  },
]

export function getDimensionExperience(level: number): DimensionExperience {
  const safe = Math.max(1, Math.min(12, Math.round(level))) as ExperienceLevel
  return DIMENSION_EXPERIENCES[safe - 1]
}

export function FrontPageDimensionGuide({
  selectedLevel,
  onSelect,
}: {
  selectedLevel: number
  onSelect: (level: ExperienceLevel) => void
}) {
  const [guideLevel, setGuideLevel] = useState<ExperienceLevel>(getDimensionExperience(selectedLevel).level)

  useEffect(() => {
    setGuideLevel(getDimensionExperience(selectedLevel).level)
  }, [selectedLevel])

  const experience = getDimensionExperience(guideLevel)

  function chooseForTraining() {
    onSelect(experience.level)
    window.requestAnimationFrame(() => {
      document.getElementById('start-a-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <section className={`front-dimension-guide guide-theme-d${experience.level}`} id="dimension-guide">
      <div className="front-guide-heading">
        <div>
          <span className="eyebrow">Interactive field guide</span>
          <h2>How to map every dimension</h2>
        </div>
        <p>
          Each dimension is now a different laboratory—not the same map with a different number. Select a level to learn its mental operation, required map shape and completion test before training.
        </p>
      </div>

      <div className="front-guide-shell">
        <nav className="front-guide-tabs" aria-label="Dimension guide">
          {DIMENSION_EXPERIENCES.map((item) => (
            <button
              key={item.level}
              type="button"
              className={guideLevel === item.level ? 'active' : ''}
              onClick={() => setGuideLevel(item.level)}
            >
              <span>{item.level}D</span>
              <b>{item.studio}</b>
              <small>{item.verb}</small>
            </button>
          ))}
        </nav>

        <article className="front-guide-lesson">
          <div className="front-guide-visual">
            <DimensionGlyph level={experience.level} />
            <div>
              <span className="guide-dimension-label">{experience.level}D · {experience.name}</span>
              <h3>{experience.studio}</h3>
              <p>{experience.mentalMove}</p>
            </div>
          </div>

          <div className="guide-contrast">
            <div>
              <small>What this level adds</small>
              <strong>{experience.addsBeyondPrevious}</strong>
            </div>
            <div>
              <small>Required map shape</small>
              <strong>{experience.mapShape}</strong>
            </div>
          </div>

          <div className="guide-lesson-grid">
            <section>
              <span className="guide-section-label">How to do it</span>
              <ol>
                {experience.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </section>
            <section className="guide-example-card">
              <span className="guide-section-label">Worked example · {experience.example.subject}</span>
              <blockquote>{experience.example.map}</blockquote>
              <p>{experience.example.insight}</p>
            </section>
          </div>

          <div className="guide-quality-grid">
            <div className="guide-trap">
              <small>Does not count</small>
              <strong>{experience.commonMistake}</strong>
            </div>
            <div className="guide-pass">
              <small>Completion test</small>
              <strong>{experience.passTest}</strong>
            </div>
          </div>

          <div className="guide-line-language">
            <small>Relationship language this laboratory trains</small>
            <div>{experience.lineGrammar.map((line) => <span key={line}>{line}</span>)}</div>
          </div>

          <button className="choose-dimension-button" type="button" onClick={chooseForTraining}>
            Use {experience.level}D · {experience.studio} <span>→</span>
          </button>
        </article>
      </div>
    </section>
  )
}

export function DimensionExperiencePanel({
  level,
  subject,
}: {
  level: number
  subject: string
}) {
  const experience = getDimensionExperience(level)
  return (
    <section className={`dimension-experience-panel experience-panel-d${experience.level}`}>
      <header>
        <DimensionGlyph level={experience.level} compact />
        <div>
          <span>Dedicated {experience.level}D laboratory</span>
          <h3>{experience.studio}</h3>
        </div>
      </header>
      <p className="experience-mission"><b>Your mission with “{subject}”:</b> {experience.mission}</p>
      <div className="experience-shape">
        <small>Build this shape</small>
        <strong>{experience.mapShape}</strong>
      </div>
      <ol className="experience-steps">
        {experience.steps.map((step, index) => (
          <li key={step}><i>{index + 1}</i><span>{step}</span></li>
        ))}
      </ol>
      <div className="experience-quality">
        <div><small>Avoid</small><span>{experience.commonMistake}</span></div>
        <div><small>Pass when</small><span>{experience.passTest}</span></div>
      </div>
    </section>
  )
}

export function DimensionGlyph({ level, compact = false }: { level: number; compact?: boolean }) {
  const safe = getDimensionExperience(level).level
  const common = { fill: 'none', vectorEffect: 'non-scaling-stroke' as const }
  return (
    <svg
      className={`dimension-glyph glyph-d${safe} ${compact ? 'compact' : ''}`}
      viewBox="0 0 320 180"
      role="img"
      aria-label={`${safe}D map shape`}
    >
      <g className="glyph-lines" {...common}>
        {safe === 1 ? (
          <>
            <circle cx="160" cy="90" r="52" />
            <circle cx="160" cy="90" r="27" />
            <path d="M160 23v21M160 136v21M93 90h21M206 90h21" />
          </>
        ) : null}
        {safe === 2 ? (
          <>
            <circle cx="72" cy="90" r="26" /><circle cx="248" cy="90" r="26" />
            <path d="M99 90h119" /><path d="m207 79 15 11-15 11" />
          </>
        ) : null}
        {safe === 3 ? (
          <>
            <circle cx="160" cy="33" r="21" /><circle cx="72" cy="140" r="21" /><circle cx="248" cy="140" r="21" />
            <path d="M146 49 86 123M174 49l60 74M94 140h132M160 54v67M93 126l48-66M179 60l48 66" />
          </>
        ) : null}
        {safe === 4 ? (
          <>
            <circle cx="48" cy="92" r="18" /><circle cx="160" cy="92" r="18" /><circle cx="272" cy="92" r="18" />
            <path d="M67 92h73M179 92h73M248 79l19 13-19 13" />
            <path d="M272 72C264 15 91 15 52 72" />
          </>
        ) : null}
        {safe === 5 ? (
          <>
            <circle cx="62" cy="90" r="22" /><circle cx="258" cy="38" r="19" /><circle cx="258" cy="90" r="19" /><circle cx="258" cy="142" r="19" />
            <path d="M85 90h42M127 90C174 90 185 38 238 38M127 90h111M127 90c47 0 58 52 111 52" />
          </>
        ) : null}
        {safe === 6 ? (
          <>
            <circle cx="72" cy="45" r="18" /><circle cx="160" cy="32" r="18" /><circle cx="248" cy="45" r="18" />
            <rect x="58" y="116" width="92" height="34" rx="9" /><rect x="170" y="116" width="92" height="34" rx="9" />
            <path d="M72 64 103 116M160 51l-55 65M160 51l55 65M248 64l-31 52" />
          </>
        ) : null}
        {safe === 7 ? (
          <>
            <rect x="28" y="34" width="102" height="112" rx="14" /><rect x="190" y="34" width="102" height="112" rx="14" />
            <circle cx="79" cy="90" r="21" /><circle cx="241" cy="90" r="21" />
            <path d="M101 90h118M145 76l15 14-15 14M175 76l-15 14 15 14" />
          </>
        ) : null}
        {safe === 8 ? (
          <>
            <circle cx="160" cy="90" r="23" /><circle cx="160" cy="90" r="53" /><circle cx="160" cy="90" r="81" />
            <circle cx="160" cy="9" r="10" /><circle cx="241" cy="90" r="10" /><circle cx="103" cy="147" r="10" />
          </>
        ) : null}
        {safe === 9 ? (
          <>
            <rect x="25" y="63" width="70" height="54" rx="12" /><rect x="125" y="63" width="70" height="54" rx="12" /><rect x="225" y="63" width="70" height="54" rx="12" />
            <path d="M96 90h29M196 90h29M112 80l13 10-13 10M212 80l13 10-13 10" />
            <path d="M260 62C247 18 75 18 60 62" />
          </>
        ) : null}
        {safe === 10 ? (
          <>
            <rect x="45" y="20" width="230" height="140" rx="15" />
            <path d="M160 20v140M45 90h230" />
            <circle cx="102" cy="55" r="12" /><circle cx="218" cy="55" r="12" /><circle cx="102" cy="125" r="12" /><circle cx="218" cy="125" r="12" />
          </>
        ) : null}
        {safe === 11 ? (
          <>
            <circle cx="78" cy="58" r="34" /><circle cx="242" cy="58" r="34" /><circle cx="160" cy="139" r="34" />
            <path d="M112 58h96M101 84l36 35M219 84l-36 35M124 48l-12 10 12 10M196 48l12 10-12 10" />
            <path d="m160 76 13 18-13 18-13-18Z" />
          </>
        ) : null}
        {safe === 12 ? (
          <>
            <path d="M45 145h230M160 160V20M63 157 257 23" />
            <path d="m264 137 11 8-11 8M152 31l8-11 8 11M247 22h14v14" />
            <ellipse cx="160" cy="90" rx="74" ry="36" transform="rotate(-28 160 90)" />
          </>
        ) : null}
      </g>
      <text x="160" y="171" textAnchor="middle">{getDimensionExperience(safe).mapShape}</text>
    </svg>
  )
}

export function DimensionCanvasScaffold({ level, x, y }: { level: number; x: number; y: number }) {
  const safe = getDimensionExperience(level).level
  const label = (text: string, tx: number, ty: number) => <text x={tx} y={ty} textAnchor="middle">{text}</text>
  return (
    <g className={`dimension-canvas-scaffold scaffold-d${safe}`} pointerEvents="none">
      {safe === 1 ? (
        <>
          <circle cx={x} cy={y} r="190" /><circle cx={x} cy={y} r="280" />
          {label('DEFINE · BOUND · ANCHOR', x, y - 225)}
        </>
      ) : null}
      {safe === 2 ? (
        <>
          <path d={`M ${x - 390} ${y} H ${x + 390}`} />
          <circle cx={x - 390} cy={y} r="52" /><circle cx={x + 390} cy={y} r="52" />
          {label('THING A', x - 390, y + 86)}{label('RELATIONAL VERB', x, y - 35)}{label('THING B', x + 390, y + 86)}
        </>
      ) : null}
      {safe === 3 ? (
        <>
          <path d={`M ${x} ${y - 350} L ${x - 350} ${y + 250} L ${x + 350} ${y + 250} Z`} />
          <path d={`M ${x} ${y - 350} L ${x} ${y + 250} M ${x - 350} ${y + 250} L ${x + 210} ${y - 110} M ${x + 350} ${y + 250} L ${x - 210} ${y - 110}`} />
          {label('MECHANISM', x, y - 385)}{label('PRESSURE', x - 360, y + 300)}{label('FUNCTION', x + 360, y + 300)}
        </>
      ) : null}
      {safe === 4 ? (
        <>
          <path d={`M ${x - 500} ${y} H ${x + 500}`} />
          <path d={`M ${x + 500} ${y} C ${x + 440} ${y - 430}, ${x - 430} ${y - 430}, ${x - 500} ${y - 45}`} />
          <circle cx={x - 500} cy={y} r="38" /><circle cx={x} cy={y} r="38" /><circle cx={x + 500} cy={y} r="38" />
          {label('T₀', x - 500, y + 78)}{label('TRANSFORMATION', x, y - 45)}{label('T₂', x + 500, y + 78)}{label('FEEDBACK', x, y - 360)}
        </>
      ) : null}
      {safe === 5 ? (
        <>
          <path d={`M ${x - 460} ${y} H ${x - 160} M ${x - 160} ${y} C ${x + 20} ${y}, ${x + 90} ${y - 310}, ${x + 430} ${y - 310} M ${x - 160} ${y} H ${x + 430} M ${x - 160} ${y} C ${x + 20} ${y}, ${x + 90} ${y + 310}, ${x + 430} ${y + 310}`} />
          {label('SHARED PRESENT', x - 445, y - 45)}{label('BRANCH CONDITION', x - 75, y - 45)}{label('FUTURE A', x + 430, y - 350)}{label('FUTURE B', x + 430, y - 40)}{label('FUTURE C', x + 430, y + 365)}
        </>
      ) : null}
      {safe === 6 ? (
        <>
          <rect x={x - 520} y={y - 390} width="1040" height="280" rx="36" />
          <rect x={x - 520} y={y + 110} width="1040" height="280" rx="36" />
          <path d={`M ${x - 330} ${y - 110} L ${x - 250} ${y + 110} M ${x} ${y - 110} V ${y + 110} M ${x + 330} ${y - 110} L ${x + 250} ${y + 110}`} />
          {label('VISIBLE POSSIBILITY LANDSCAPE', x, y - 330)}{label('HIDDEN GENERATORS · ASSUMPTIONS · OBJECTIVES', x, y + 170)}
        </>
      ) : null}
      {safe === 7 ? (
        <>
          <rect x={x - 560} y={y - 360} width="390" height="720" rx="38" />
          <rect x={x + 170} y={y - 360} width="390" height="720" rx="38" />
          <path d={`M ${x - 170} ${y} H ${x + 170} M ${x - 45} ${y - 28} L ${x} ${y} L ${x - 45} ${y + 28} M ${x + 45} ${y - 28} L ${x} ${y} L ${x + 45} ${y + 28}`} />
          {label('FRAMEWORK A', x - 365, y - 300)}{label('TRANSLATION', x, y - 55)}{label('FRAMEWORK B', x + 365, y - 300)}
        </>
      ) : null}
      {safe === 8 ? (
        <>
          <circle cx={x} cy={y} r="190" /><circle cx={x} cy={y} r="340" /><circle cx={x} cy={y} r="500" />
          {label('SELF', x, y - 210)}{label('RELATION / SOCIETY', x, y - 360)}{label('SPECIES / PLANET', x, y - 520)}
        </>
      ) : null}
      {safe === 9 ? (
        <>
          <rect x={x - 560} y={y - 115} width="250" height="230" rx="35" />
          <rect x={x - 125} y={y - 115} width="250" height="230" rx="35" />
          <rect x={x + 310} y={y - 115} width="250" height="230" rx="35" />
          <path d={`M ${x - 310} ${y} H ${x - 125} M ${x + 125} ${y} H ${x + 310} M ${x + 435} ${y - 115} C ${x + 340} ${y - 390}, ${x - 420} ${y - 390}, ${x - 435} ${y - 115}`} />
          {label('MODEL V1', x - 435, y + 155)}{label('ANOMALY / EVIDENCE', x, y + 155)}{label('MODEL V2', x + 435, y + 155)}{label('UPDATE OR IMMUNITY?', x, y - 330)}
        </>
      ) : null}
      {safe === 10 ? (
        <>
          <rect x={x - 520} y={y - 380} width="1040" height="760" rx="40" />
          <path d={`M ${x} ${y - 380} V ${y + 380} M ${x - 520} ${y} H ${x + 520}`} />
          {label('OBJECTIVE', x - 260, y - 315)}{label('FEEDBACK', x + 260, y - 315)}{label('CONSTRAINTS / TRADE-OFFS', x - 260, y + 335)}{label('GOVERNANCE / REVISION', x + 260, y + 335)}
        </>
      ) : null}
      {safe === 11 ? (
        <>
          <circle cx={x - 360} cy={y - 190} r="190" /><circle cx={x + 360} cy={y - 190} r="190" /><circle cx={x} cy={y + 300} r="190" />
          <path d={`M ${x - 170} ${y - 190} H ${x + 170} M ${x - 250} ${y - 35} L ${x - 85} ${y + 135} M ${x + 250} ${y - 35} L ${x + 85} ${y + 135}`} />
          <path d={`M ${x} ${y - 95} l 70 95 -70 95 -70 -95 Z`} />
          {label('ADAPTIVE SYSTEM A', x - 360, y - 420)}{label('ADAPTIVE SYSTEM B', x + 360, y - 420)}{label('ADAPTIVE SYSTEM C', x, y + 535)}{label('EMERGENCE', x, y + 10)}
        </>
      ) : null}
      {safe === 12 ? (
        <>
          <path d={`M ${x - 560} ${y + 340} H ${x + 560} M ${x} ${y + 470} V ${y - 470} M ${x - 430} ${y + 430} L ${x + 430} ${y - 430}`} />
          <ellipse cx={x} cy={y} rx="390" ry="170" transform={`rotate(-32 ${x} ${y})`} />
          {label('INHERITED AXIS', x + 470, y + 390)}{label('SECOND AXIS', x + 70, y - 430)}{label('INVENTED AXIS', x + 360, y - 365)}{label('WHAT BECOMES VISIBLE?', x, y + 235)}
        </>
      ) : null}
    </g>
  )
}

const PROMPT_OFFSETS: Record<number, Record<string, [number, number]>> = {
  2: {
    'd2-influence-in': [-360, 0],
    'd2-influence-out': [360, 0],
    'd2-dependence': [0, 300],
    'd2-contrast': [0, -300],
  },
  3: {
    'd3-mediator': [0, -340],
    'd3-moderator': [340, -110],
    'd3-constraint': [290, 270],
    'd3-tension': [-290, 270],
    'd3-function': [-340, -110],
  },
  4: {
    'd4-prior': [-460, 0],
    'd4-next': [460, 0],
    'd4-feedback': [0, -370],
    'd4-delay': [230, 285],
    'd4-amplifier': [-230, 285],
  },
  5: {
    'd5-branch': [380, -300],
    'd5-condition': [465, -85],
    'd5-counterfactual': [465, 155],
    'd5-convergence': [320, 350],
    'd5-irreversible': [-360, 0],
  },
  6: {
    'd6-assumption': [-300, 300],
    'd6-rule': [0, 380],
    'd6-permission': [380, -125],
    'd6-prohibition': [-380, -125],
    'd6-objective': [300, 300],
  },
  7: {
    'd7-frame': [-410, 0],
    'd7-translation': [0, -350],
    'd7-incompatibility': [410, 0],
    'd7-integration': [0, 350],
  },
  8: {
    'd8-observer': [-340, -285],
    'd8-scale': [360, -260],
    'd8-blindspot': [390, 260],
    'd8-reflexive': [-360, 285],
  },
  9: {
    'd9-update': [430, 0],
    'd9-selection': [-345, -260],
    'd9-immunity': [-370, 260],
    'd9-invariant': [0, 360],
  },
  10: {
    'd10-intervention': [-330, -285],
    'd10-objective': [330, -285],
    'd10-tradeoff': [-330, 285],
    'd10-governance': [330, 285],
  },
  11: {
    'd11-coadapt': [-385, -220],
    'd11-incentive': [385, -220],
    'd11-emergence': [0, 360],
    'd11-stability': [0, -390],
  },
  12: {
    'd12-axis': [0, -410],
    'd12-visible': [430, 0],
    'd12-blindness': [0, 410],
    'd12-recursion': [-430, 0],
  },
}

export function experiencePromptOffset(
  level: number,
  promptId: string,
  index: number,
  total: number,
): { dx: number; dy: number } {
  const safe = getDimensionExperience(level).level
  const specific = PROMPT_OFFSETS[safe]?.[promptId]
  if (specific) return { dx: specific[0], dy: specific[1] }
  if (safe === 1) return { dx: 0, dy: 0 }
  const count = Math.max(1, total)
  const angle = -Math.PI / 2 + (index / count) * Math.PI * 2
  const radius = 300 + safe * 8
  return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius }
}
