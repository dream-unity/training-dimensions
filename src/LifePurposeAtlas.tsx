import { useEffect, useMemo, useState } from 'react'
import {
  getLifePurposeAtlas,
  type AtlasEdge,
  type AtlasNode,
  type LifePurposeAtlasMap,
} from './life-purpose-atlas-data'
import './life-purpose-atlas.css'

interface LifePurposeAtlasProps {
  level: number
}

function wrapLabel(label: string, max = 20): string[] {
  const words = label.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length > max && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  if (lines.length <= 3) return lines
  return [lines[0], lines[1], `${lines.slice(2).join(' ').slice(0, max - 1)}…`]
}

function maxY(map: LifePurposeAtlasMap): number {
  return Math.max(720, ...map.nodes.map((node) => node.y + 95))
}

function edgeKey(edge: AtlasEdge, index: number): string {
  return `${edge.from}-${edge.to}-${index}`
}

function edgePath(from: AtlasNode, to: AtlasNode, index: number): string {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.hypot(dx, dy)
  if (distance < 190) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
  const bend = ((index % 3) - 1) * Math.min(38, distance * 0.06)
  const mx = (from.x + to.x) / 2 - (dy / distance) * bend
  const my = (from.y + to.y) / 2 + (dx / distance) * bend
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`
}

function edgeMidpoint(from: AtlasNode, to: AtlasNode, index: number) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.max(1, Math.hypot(dx, dy))
  const bend = ((index % 3) - 1) * Math.min(38, distance * 0.06)
  return {
    x: (from.x + to.x) / 2 - (dy / distance) * bend * 0.5,
    y: (from.y + to.y) / 2 + (dx / distance) * bend * 0.5,
  }
}

function stageLabel(stage: number, map: LifePurposeAtlasMap) {
  return map.stages[stage - 1] ?? `Stage ${stage}`
}

export function LifePurposeAtlas({ level }: LifePurposeAtlasProps) {
  const map = useMemo(() => getLifePurposeAtlas(level), [level])
  const [stage, setStage] = useState(4)
  const [selectedNodeId, setSelectedNodeId] = useState<string>('')
  const [selectedEdgeKey, setSelectedEdgeKey] = useState<string>('')

  useEffect(() => {
    setStage(4)
    setSelectedNodeId('')
    setSelectedEdgeKey('')
  }, [map.level])

  const visibleNodes = map.nodes.filter((node) => node.stage <= stage)
  const nodeById = new Map(visibleNodes.map((node) => [node.id, node]))
  const visibleEdges = map.edges
    .map((edge, originalIndex) => ({ edge, originalIndex }))
    .filter(({ edge }) => edge.stage <= stage && nodeById.has(edge.from) && nodeById.has(edge.to))
  const selectedNode = map.nodes.find((node) => node.id === selectedNodeId) ?? null
  const selectedEdgeEntry = map.edges
    .map((edge, originalIndex) => ({ edge, originalIndex }))
    .find(({ edge, originalIndex }) => edgeKey(edge, originalIndex) === selectedEdgeKey)
  const selectedEdge = selectedEdgeEntry?.edge ?? null
  const viewHeight = maxY(map)

  function selectNode(node: AtlasNode) {
    setSelectedNodeId(node.id)
    setSelectedEdgeKey('')
  }

  function selectEdge(edge: AtlasEdge, index: number) {
    setSelectedNodeId('')
    setSelectedEdgeKey(edgeKey(edge, index))
  }

  return (
    <section className={`life-purpose-atlas atlas-d${map.level}`} aria-label={`${map.level}D worked Life Purpose mind map`}>
      <header className="atlas-header">
        <div>
          <span className="atlas-kicker">Worked example · same subject through every dimension</span>
          <h3><strong>{map.level}D</strong> Life Purpose</h3>
          <p>{map.title}</p>
        </div>
        <div className="atlas-counts">
          <span><b>{map.nodes.length}</b> concepts</span>
          <span><b>{map.edges.length}</b> semantic relationships</span>
        </div>
      </header>

      <div className="atlas-thesis">
        <small>What this map is actually reasoning about</small>
        <p>{map.thesis}</p>
      </div>

      <div className="atlas-stage-builder" aria-label="Build the worked map progressively">
        <div>
          <small>Build the map</small>
          <strong>Reveal the reasoning in the order you would construct it</strong>
        </div>
        <div className="atlas-stage-buttons">
          {map.stages.map((label, index) => {
            const value = index + 1
            return (
              <button
                key={label}
                type="button"
                className={stage === value ? 'active' : ''}
                onClick={() => setStage(value)}
                title={label}
              >
                <span>{value}</span>{label}
              </button>
            )
          })}
        </div>
        <p><b>Stage {stage}:</b> {stageLabel(stage, map)}</p>
      </div>

      <div className="atlas-map-shell">
        <div className="atlas-map-scroll">
          <svg
            className="atlas-map"
            viewBox={`0 0 1100 ${viewHeight}`}
            role="img"
            aria-label={`${map.title}. Select any concept or relationship for an explanation.`}
          >
            <defs>
              <marker id={`atlas-arrow-${map.level}`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto-start-reverse" markerUnits="strokeWidth">
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
              <filter id={`atlas-glow-${map.level}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <g className="atlas-edges">
              {visibleEdges.map(({ edge, originalIndex }) => {
                const from = nodeById.get(edge.from)!
                const to = nodeById.get(edge.to)!
                const midpoint = edgeMidpoint(from, to, originalIndex)
                const selected = edgeKey(edge, originalIndex) === selectedEdgeKey
                const labelWidth = Math.max(66, Math.min(172, edge.label.length * 6.1 + 18))
                return (
                  <g
                    key={edgeKey(edge, originalIndex)}
                    className={`atlas-edge ${edge.tension ? 'tension' : ''} ${selected ? 'selected' : ''}`}
                    onClick={() => selectEdge(edge, originalIndex)}
                  >
                    <path className="atlas-edge-hit" d={edgePath(from, to, originalIndex)} />
                    <path
                      className="atlas-edge-line"
                      d={edgePath(from, to, originalIndex)}
                      markerEnd={`url(#atlas-arrow-${map.level})`}
                      markerStart={edge.bidirectional ? `url(#atlas-arrow-${map.level})` : undefined}
                    />
                    <g className="atlas-edge-label" transform={`translate(${midpoint.x} ${midpoint.y})`}>
                      <rect x={-labelWidth / 2} y="-13" width={labelWidth} height="26" rx="13" />
                      <text textAnchor="middle" dominantBaseline="middle">{edge.label}</text>
                    </g>
                  </g>
                )
              })}
            </g>

            <g className="atlas-nodes">
              {visibleNodes.map((node) => {
                const lines = wrapLabel(node.label)
                const width = node.kind === 'focus' ? 186 : 164
                const height = 48 + Math.max(0, lines.length - 1) * 15
                const selected = node.id === selectedNodeId
                return (
                  <g
                    key={node.id}
                    className={`atlas-node kind-${node.kind} ${selected ? 'selected' : ''}`}
                    transform={`translate(${node.x} ${node.y})`}
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.label}: ${node.explanation}`}
                    onClick={() => selectNode(node)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') selectNode(node)
                    }}
                  >
                    <rect x={-width / 2} y={-height / 2} width={width} height={height} rx={node.kind === 'focus' ? 18 : 13} />
                    <text textAnchor="middle" dominantBaseline="middle">
                      {lines.map((line, index) => (
                        <tspan key={line} x="0" dy={index === 0 ? `${-(lines.length - 1) * 7}px` : '15px'}>{line}</tspan>
                      ))}
                    </text>
                    <circle className="atlas-stage-dot" cx={width / 2 - 9} cy={-height / 2 + 9} r="7" />
                    <text className="atlas-stage-number" x={width / 2 - 9} y={-height / 2 + 9} textAnchor="middle" dominantBaseline="central">{node.stage}</text>
                  </g>
                )
              })}
            </g>
          </svg>
        </div>

        <aside className="atlas-inspector">
          <span className="atlas-inspector-kicker">Click the map to understand the move</span>
          {selectedNode ? (
            <>
              <small>Concept · {selectedNode.kind}</small>
              <h4>{selectedNode.label}</h4>
              <p>{selectedNode.explanation}</p>
              <div className="atlas-inspector-stage"><b>Introduced at stage {selectedNode.stage}</b><span>{stageLabel(selectedNode.stage, map)}</span></div>
            </>
          ) : selectedEdge ? (
            <>
              <small>Semantic relationship</small>
              <h4>{selectedEdge.label}</h4>
              <p>{selectedEdge.explanation}</p>
              <div className="atlas-inspector-stage"><b>Introduced at stage {selectedEdge.stage}</b><span>{stageLabel(selectedEdge.stage, map)}</span></div>
              {selectedEdge.tension ? <em>This is deliberately marked as a tension, constraint or challenge.</em> : null}
            </>
          ) : (
            <>
              <small>Reading the worked map</small>
              <h4>{map.title}</h4>
              <p>Select any node or relationship label. The panel will explain why it belongs in this dimensional map rather than merely telling you what the words mean.</p>
              <div className="atlas-inspector-stage"><b>{visibleNodes.length} concepts visible</b><span>{visibleEdges.length} relationships visible at construction stage {stage}</span></div>
            </>
          )}
        </aside>
      </div>

      {map.level === 1 ? (
        <div className="atlas-one-d-facets">
          {map.insights.map((insight, index) => (
            <article key={insight}><span>0{index + 1}</span><p>{insight}</p></article>
          ))}
        </div>
      ) : null}

      <div className="atlas-dimensional-comparison">
        <article className="blind-spot">
          <small>What the lower-dimensional representation misses</small>
          <p>{map.blindSpot}</p>
        </article>
        <article className="dimensional-leap">
          <small>The new cognitive move at {map.level}D</small>
          <p>{map.leap}</p>
        </article>
      </div>

      <div className="atlas-revelations">
        <div className="atlas-revelations-heading">
          <small>What becomes thinkable at this level</small>
          <strong>Conceptual revelations from the worked map</strong>
        </div>
        <div>
          {map.insights.map((insight, index) => (
            <article key={`${map.level}-${index}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{insight}</p>
            </article>
          ))}
        </div>
      </div>

      <footer className="atlas-closing-question">
        <span>Now apply the operation to your own map</span>
        <strong>{map.question}</strong>
      </footer>
    </section>
  )
}
