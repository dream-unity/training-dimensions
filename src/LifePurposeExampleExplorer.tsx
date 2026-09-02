import { useEffect, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  getLifePurposeExampleMap,
  type LifePurposeExampleEdge,
  type LifePurposeExampleLevel,
  type LifePurposeExampleMap,
  type LifePurposeExampleNode,
} from './life-purpose-example-data'
import './life-purpose-examples.css'

type Selection =
  | { type: 'node'; id: string }
  | { type: 'edge'; id: string }

export function LifePurposeExampleExplorer({
  level,
  onOpenEditable,
}: {
  level: number
  onOpenEditable?: (level: LifePurposeExampleLevel) => void
}) {
  const example = getLifePurposeExampleMap(level)
  const [revealStage, setRevealStage] = useState(example.stages.length)
  const [selection, setSelection] = useState<Selection>({ type: 'node', id: example.rootId })
  const [showRelations, setShowRelations] = useState(true)

  useEffect(() => {
    setRevealStage(example.stages.length)
    setSelection({ type: 'node', id: example.rootId })
    setShowRelations(true)
  }, [example.level, example.rootId, example.stages.length])

  const nodeById = useMemo(
    () => new Map(example.nodes.map((node) => [node.id, node])),
    [example.nodes],
  )
  const visibleNodes = example.nodes.filter((node) => node.stage <= revealStage)
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id))
  const visibleEdges = example.edges.filter(
    (edge) =>
      edge.stage <= revealStage &&
      visibleNodeIds.has(edge.from) &&
      visibleNodeIds.has(edge.to),
  )
  const selectedNode =
    selection.type === 'node'
      ? nodeById.get(selection.id) ?? nodeById.get(example.rootId) ?? example.nodes[0]
      : null
  const selectedEdge =
    selection.type === 'edge'
      ? example.edges.find((edge) => edge.id === selection.id) ?? null
      : null
  const selectedStage =
    selectedEdge?.stage ?? selectedNode?.stage ?? Math.min(revealStage, example.stages.length)

  return (
    <section className={`life-purpose-example example-theme-d${example.level}`}>
      <header className="life-example-heading">
        <div>
          <span className="life-example-kicker">Complete worked mind map · one subject across every dimension</span>
          <h3>Life Purpose · {example.level}D</h3>
          <p>{example.title}</p>
        </div>
        <div className="life-example-metrics" aria-label="Example map size">
          <span><b>{example.nodes.length}</b> conceptual nodes</span>
          <span><b>{example.edges.length}</b> semantic relationships</span>
          <span><b>{example.stages.length}</b> construction stages</span>
        </div>
      </header>

      <p className="life-example-thesis">{example.thesis}</p>

      <div className="life-build-sequence">
        <div className="life-build-intro">
          <span>Build the map progressively</span>
          <p>Select a stage to see the reasoning structure accumulate. The final stage reveals the complete map.</p>
        </div>
        <div className="life-stage-buttons" role="group" aria-label="Reveal construction stage">
          {example.stages.map((stage, index) => {
            const stageNumber = index + 1
            const active = revealStage === stageNumber
            const revealed = revealStage >= stageNumber
            return (
              <button
                key={stage.title}
                type="button"
                className={`${active ? 'active' : ''} ${revealed ? 'revealed' : ''}`}
                onClick={() => {
                  setRevealStage(stageNumber)
                  const firstAtStage = example.nodes.find((node) => node.stage === stageNumber)
                  setSelection({ type: 'node', id: firstAtStage?.id ?? example.rootId })
                }}
              >
                <i>{stageNumber}</i>
                <span>
                  <b>{stage.title}</b>
                  <small>{stage.revelation}</small>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="life-example-workspace">
        <div className="life-map-shell">
          <div className="life-map-toolbar">
            <div>
              <span>{revealStage === example.stages.length ? 'Complete map' : `Stages 1–${revealStage}`}</span>
              <b>{example.subject}</b>
            </div>
            <div>
              <button
                type="button"
                className={showRelations ? 'active' : ''}
                onClick={() => setShowRelations((current) => !current)}
              >
                {showRelations ? 'Relationship labels on' : 'Relationship labels off'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRevealStage(example.stages.length)
                  setSelection({ type: 'node', id: example.rootId })
                }}
              >
                Show complete map
              </button>
            </div>
          </div>

          <div className="life-map-scroll">
            <svg
              className={`life-purpose-map life-map-d${example.level}`}
              viewBox={`0 0 ${example.viewBox.width} ${example.viewBox.height}`}
              role="img"
              aria-label={`${example.level}D comprehensive Life Purpose example mind map`}
            >
              <defs>
                <pattern id={`life-grid-${example.level}`} width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" />
                </pattern>
                <marker
                  id={`life-arrow-${example.level}`}
                  markerWidth="9"
                  markerHeight="9"
                  refX="7.5"
                  refY="4.5"
                  orient="auto-start-reverse"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L9,4.5 L0,9 z" />
                </marker>
                <filter id={`life-node-shadow-${example.level}`} x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="7" stdDeviation="8" floodOpacity="0.32" />
                </filter>
              </defs>

              <rect
                className="life-map-background"
                width={example.viewBox.width}
                height={example.viewBox.height}
                fill={`url(#life-grid-${example.level})`}
              />

              {example.level === 1 ? (
                <OneDimensionalFocusField example={example} revealStage={revealStage} />
              ) : null}

              <g className="life-edge-layer">
                {visibleEdges.map((edge) => {
                  const from = nodeById.get(edge.from)
                  const to = nodeById.get(edge.to)
                  if (!from || !to) return null
                  const geometry = exampleEdgeGeometry(from, to, edge)
                  const isSelected = selection.type === 'edge' && selection.id === edge.id
                  return (
                    <g
                      key={edge.id}
                      className={`life-example-edge weight-${edge.weight} ${edge.dashed ? 'dashed' : ''} ${isSelected ? 'selected' : ''}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${from.label} ${edge.relation} ${to.label}`}
                      onClick={() => setSelection({ type: 'edge', id: edge.id })}
                      onKeyDown={(event) => activateOnKeyboard(event, () => setSelection({ type: 'edge', id: edge.id }))}
                    >
                      <path className="life-edge-hit" d={geometry.path} />
                      <path
                        className="life-edge-visible"
                        d={geometry.path}
                        markerStart={edge.bidirectional ? `url(#life-arrow-${example.level})` : undefined}
                        markerEnd={`url(#life-arrow-${example.level})`}
                      />
                      {showRelations ? (
                        <g
                          className="life-edge-label"
                          transform={`translate(${geometry.labelX + edge.labelOffsetX} ${geometry.labelY + edge.labelOffsetY})`}
                        >
                          <rect
                            x={-relationLabelWidth(edge.relation) / 2}
                            y="-13"
                            width={relationLabelWidth(edge.relation)}
                            height="26"
                            rx="13"
                          />
                          <text textAnchor="middle" dominantBaseline="middle">
                            {truncateRelation(edge.relation)}
                          </text>
                        </g>
                      ) : null}
                    </g>
                  )
                })}
              </g>

              <g className="life-node-layer">
                {visibleNodes.map((node) => {
                  const width = node.width ?? (node.root ? 198 : 164)
                  const height = node.height ?? (node.root ? 82 : 68)
                  const isSelected = selection.type === 'node' && selection.id === node.id
                  const lines = wrapNodeLabel(node.label, Math.max(13, Math.floor(width / 8.2)), 3)
                  return (
                    <g
                      key={node.id}
                      className={`life-example-node kind-${node.kind} stage-${node.stage} ${node.root ? 'root' : ''} ${isSelected ? 'selected' : ''}`}
                      transform={`translate(${node.x} ${node.y})`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${node.label}: ${node.role}`}
                      onClick={() => setSelection({ type: 'node', id: node.id })}
                      onKeyDown={(event) => activateOnKeyboard(event, () => setSelection({ type: 'node', id: node.id }))}
                    >
                      <rect
                        x={-width / 2}
                        y={-height / 2}
                        width={width}
                        height={height}
                        rx={node.kind === 'observer' || node.kind === 'system' ? 25 : 13}
                        filter={`url(#life-node-shadow-${example.level})`}
                      />
                      <text className="life-node-kind" textAnchor="middle" x="0" y={-height / 2 + 14}>
                        {node.root ? `${example.level}D FOCUS` : `${node.kind.toUpperCase()} · ${node.stage}`}
                      </text>
                      <text className="life-node-title" textAnchor="middle">
                        {lines.map((line, index) => (
                          <tspan
                            key={`${node.id}-${line}-${index}`}
                            x="0"
                            y={nodeTitleY(lines.length, index, height)}
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  )
                })}
              </g>
            </svg>
          </div>

          <div className="life-map-caption">
            <span>Click any node or relationship for its reasoning role.</span>
            <div>
              <i className="legend-node" /> concept/state
              <i className="legend-root" /> focal structure
              <i className="legend-tension" /> tension/constraint
              <i className="legend-line" /> semantic relationship
            </div>
          </div>
        </div>

        <aside className="life-map-inspector" aria-live="polite">
          {selectedEdge ? (
            <EdgeInspector edge={selectedEdge} map={example} nodeById={nodeById} />
          ) : selectedNode ? (
            <NodeInspector node={selectedNode} map={example} />
          ) : null}

          <section className="life-stage-insight">
            <span>Construction stage {selectedStage}</span>
            <h4>{example.stages[Math.max(0, selectedStage - 1)]?.title}</h4>
            <p>{example.stages[Math.max(0, selectedStage - 1)]?.instruction}</p>
            <blockquote>{example.stages[Math.max(0, selectedStage - 1)]?.revelation}</blockquote>
          </section>
        </aside>
      </div>

      <div className="life-dimensional-comparison">
        <article>
          <span>What the lower dimension still misses</span>
          <p>{example.lowerDimensionBlindSpot}</p>
        </article>
        <article>
          <span>The {example.level}D leap</span>
          <p>{example.dimensionalLeap}</p>
        </article>
      </div>

      <div className="life-revelations">
        <div>
          <span>What this complete map makes newly thinkable</span>
          <h4>Conceptual revelations</h4>
        </div>
        <ol>
          {example.revelations.map((revelation, index) => (
            <li key={revelation}>
              <i>{String(index + 1).padStart(2, '0')}</i>
              <span>{revelation}</span>
            </li>
          ))}
        </ol>
      </div>

      <blockquote className="life-closing-question">
        <span>Question to carry into your own map</span>
        {example.closingQuestion}
      </blockquote>

      {onOpenEditable ? (
        <button
          type="button"
          className="life-open-editable"
          onClick={() => onOpenEditable(example.level)}
        >
          <span>
            <small>Learn by taking it apart</small>
            <b>Open an editable copy of this complete {example.level}D Life Purpose map</b>
          </span>
          <i>→</i>
        </button>
      ) : null}
    </section>
  )
}

function NodeInspector({
  node,
  map,
}: {
  node: LifePurposeExampleNode
  map: LifePurposeExampleMap
}) {
  return (
    <section className="life-selection-card">
      <span>{node.root ? 'Focal structure' : node.kind} · stage {node.stage}</span>
      <h4>{node.label}</h4>
      <b>{node.role}</b>
      <p>{node.explanation}</p>
      {node.context ? <small>{node.context}</small> : null}
      <div>
        <em>Model confidence</em>
        <strong>{node.confidence}%</strong>
      </div>
      <div className="life-confidence-track"><i style={{ width: `${node.confidence}%` }} /></div>
      {node.root ? <blockquote>{map.focus.definition}</blockquote> : null}
    </section>
  )
}

function EdgeInspector({
  edge,
  map,
  nodeById,
}: {
  edge: LifePurposeExampleEdge
  map: LifePurposeExampleMap
  nodeById: Map<string, LifePurposeExampleNode>
}) {
  const from = nodeById.get(edge.from)
  const to = nodeById.get(edge.to)
  return (
    <section className="life-selection-card edge-selection">
      <span>Semantic relationship · stage {edge.stage}</span>
      <h4>{edge.relation}</h4>
      <div className="life-edge-sentence">
        <b>{from?.label ?? edge.from}</b>
        <i>{edge.bidirectional ? '↔' : '→'}</i>
        <b>{to?.label ?? edge.to}</b>
      </div>
      <p>{edge.explanation}</p>
      <small>{edge.promptId.startsWith('manual') ? `${map.level}D supporting relation` : `Trains ${edge.promptId}`}</small>
    </section>
  )
}

function OneDimensionalFocusField({
  example,
  revealStage,
}: {
  example: LifePurposeExampleMap
  revealStage: number
}) {
  const cards = [
    { stage: 1, x: 55, y: 78, width: 330, height: 145, label: 'Operational definition', text: example.focus.definition },
    { stage: 2, x: 815, y: 78, width: 330, height: 145, label: 'Boundary', text: example.focus.boundary },
    { stage: 3, x: 55, y: 537, width: 330, height: 145, label: 'Present hypothesis', text: example.focus.state },
    { stage: 4, x: 815, y: 537, width: 330, height: 145, label: 'Evidence anchor', text: example.focus.evidence },
  ]
  return (
    <g className="life-focus-field">
      <ellipse cx="600" cy="380" rx="275" ry="210" />
      <ellipse cx="600" cy="380" rx="345" ry="275" />
      {cards.filter((card) => card.stage <= revealStage).map((card) => (
        <foreignObject
          key={card.label}
          x={card.x}
          y={card.y}
          width={card.width}
          height={card.height}
        >
          <div className={`life-focus-card focus-stage-${card.stage}`}>
            <span>{card.stage} · {card.label}</span>
            <p>{card.text}</p>
          </div>
        </foreignObject>
      ))}
    </g>
  )
}

function exampleEdgeGeometry(
  from: LifePurposeExampleNode,
  to: LifePurposeExampleNode,
  edge: LifePurposeExampleEdge,
) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.max(1, Math.hypot(dx, dy))
  const normalX = -dy / length
  const normalY = dx / length
  const controlX = (from.x + to.x) / 2 + normalX * edge.bend
  const controlY = (from.y + to.y) / 2 + normalY * edge.bend
  const labelX = 0.25 * from.x + 0.5 * controlX + 0.25 * to.x
  const labelY = 0.25 * from.y + 0.5 * controlY + 0.25 * to.y
  return {
    path: `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`,
    labelX,
    labelY,
  }
}

function wrapNodeLabel(label: string, maxCharacters: number, maxLines: number): string[] {
  const words = label.split(/\s+/)
  const lines: string[] = []
  let current = ''
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxCharacters || !current) {
      current = candidate
      return
    }
    lines.push(current)
    current = word
  })
  if (current) lines.push(current)
  if (lines.length <= maxLines) return lines
  const clipped = lines.slice(0, maxLines)
  clipped[maxLines - 1] = `${clipped[maxLines - 1].slice(0, Math.max(4, maxCharacters - 1))}…`
  return clipped
}

function nodeTitleY(lineCount: number, index: number, height: number): number {
  const lineHeight = 14
  const centre = Math.min(10, height * 0.12)
  return centre - ((lineCount - 1) * lineHeight) / 2 + index * lineHeight
}

function relationLabelWidth(relation: string): number {
  return Math.max(70, Math.min(182, relation.length * 5.7 + 18))
}

function truncateRelation(relation: string): string {
  return relation.length > 29 ? `${relation.slice(0, 28)}…` : relation
}

function activateOnKeyboard(
  event: ReactKeyboardEvent<SVGGElement>,
  action: () => void,
) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    action()
  }
}
