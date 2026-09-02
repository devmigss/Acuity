/**
 * Acuity — Interactive Annotation Canvas (React-Konva)
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 3 — human-in-the-loop annotation
 * with soft deletes. AI baseline bounding boxes are immutable.
 *
 * Renders AI-detected and manually added colony annotations on a
 * simulated Petri dish background using React-Konva.
 *
 * Interaction model:
 * - SELECT   : click annotation to select; background click clears selection
 * - PAN      : click+drag canvas to pan; annotations are not draggable
 * - ADD      : click background to place a new manual annotation
 * - RESIZE   : annotations are draggable (move); background click deselects
 * - DELETE   : clicking annotation soft-deletes it
 * - Spacebar : temporarily activates PAN while held (Figma-style)
 * - Scroll   : zoom toward cursor position
 * - Keyboard : V=Select, H=Pan, A=Add, R=Resize, Del=Delete (see workspace page)
 *
 * IMPORTANT:
 * - No AI inference is performed here.
 * - No scientific calculations are performed here.
 * - All colony positions/sizes are mock demonstration data.
 * - The Python FastAPI / OpenCV service will provide real data.
 */

import { useRef, useCallback, useEffect, useState } from 'react'
import { Stage, Layer, Circle, Text, Rect, Ellipse } from 'react-konva'
import { useAnnotationStore, TOOLS, ANNOTATION_SOURCE } from '@/stores/annotationStore'

/* ── Canvas coordinate constants (normalised space) ── */
const CANVAS_W = 700
const CANVAS_H = 480
const PETRI_RX = 295
const PETRI_RY = 210

/* ── Zoom limits ── */
const MIN_ZOOM = 0.25
const MAX_ZOOM = 5.0
const ZOOM_FACTOR = 1.08

/* ─────────────────────────────────────────────────────────────
   AnnotationMark — a single colony circle on the canvas
   ───────────────────────────────────────────────────────────── */

function AnnotationMark({
  annotation,
  isSelected,
  activeTool,
  effectiveTool,   // pan overrides activeTool cursor
  onSelect,
  onDragEnd,
}) {
  const isManual = annotation.source === ANNOTATION_SOURCE.MANUAL

  // Annotations are only draggable in RESIZE tool (not pan, not select)
  const isDraggable = activeTool === TOOLS.RESIZE

  // Visual encoding
  const strokeColor  = isManual ? '#EF4444' : '#22C55E'
  const strokeWidth  = isSelected ? 3 : 2
  const strokeDash   = isManual ? [] : [6, 4]
  const fillColor    = isSelected
    ? (isManual ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)')
    : 'transparent'

  // Cursor per effective tool + hover context
  const getHoverCursor = () => {
    if (effectiveTool === TOOLS.PAN) return 'grab'
    if (effectiveTool === TOOLS.DELETE) return 'pointer'
    if (isDraggable) return 'move'
    if (effectiveTool === TOOLS.SELECT) return 'pointer'
    return 'default'
  }

  const handleClick = useCallback((e) => {
    // Consume the event so stage click-on-bg doesn't also fire
    e.cancelBubble = true

    if (effectiveTool === TOOLS.PAN) return   // pan mode never selects
    if (effectiveTool === TOOLS.ADD) return    // add mode never selects

    if (effectiveTool === TOOLS.DELETE) {
      // Soft-delete on annotation click in DELETE mode
      // We call the store action through onSelect with a sentinel
      onSelect(annotation.id, 'delete')
      return
    }

    onSelect(annotation.id)
  }, [annotation.id, effectiveTool, onSelect])

  const handleDragEnd = useCallback((e) => {
    onDragEnd(annotation.id, { x: e.target.x(), y: e.target.y() })
  }, [annotation.id, onDragEnd])

  const labelBg   = isManual ? '#EF4444' : '#1E293B'
  const labelText = annotation.confidence !== null
    ? annotation.confidence.toFixed(2)
    : 'manual'

  return (
    <>
      {/* Colony circle */}
      <Circle
        x={annotation.x}
        y={annotation.y}
        radius={annotation.radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        dash={strokeDash}
        draggable={isDraggable}
        onClick={handleClick}
        onTap={handleClick}
        onDragEnd={handleDragEnd}
        onMouseEnter={(e) => {
          const stage = e.target.getStage()
          if (stage) stage.container().style.cursor = getHoverCursor()
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage()
          if (!stage) return
          // Restore base cursor for current effective tool
          if (effectiveTool === TOOLS.PAN) {
            stage.container().style.cursor = 'grab'
          } else if (effectiveTool === TOOLS.ADD) {
            stage.container().style.cursor = 'crosshair'
          } else {
            stage.container().style.cursor = 'default'
          }
        }}
        perfectDrawEnabled={false}
      />

      {/* Selection ring */}
      {isSelected && (
        <Circle
          x={annotation.x}
          y={annotation.y}
          radius={annotation.radius + 6}
          stroke={isManual ? '#EF4444' : '#22C55E'}
          strokeWidth={1.5}
          dash={[3, 3]}
          listening={false}
          perfectDrawEnabled={false}
        />
      )}

      {/* Confidence / source badge */}
      <Rect
        x={annotation.x - annotation.radius}
        y={annotation.y - annotation.radius - 24}
        width={isManual ? 56 : 44}
        height={18}
        fill={labelBg}
        cornerRadius={4}
        listening={false}
        perfectDrawEnabled={false}
      />
      <Text
        x={annotation.x - annotation.radius}
        y={annotation.y - annotation.radius - 22}
        width={isManual ? 56 : 44}
        text={labelText}
        align="center"
        fontSize={10}
        fontStyle="bold"
        fill="#FFFFFF"
        listening={false}
        perfectDrawEnabled={false}
        fontFamily="Inter, monospace"
      />
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main AnnotationCanvas
   ───────────────────────────────────────────────────────────── */

export default function AnnotationCanvas({ onSpacebarPanChange }) {
  const {
    getVisibleAnnotations,
    selectedAnnotationId,
    activeTool,
    zoom,
    stageOffset,
    setZoom,
    setStageOffset,
    selectAnnotation,
    clearSelection,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
  } = useAnnotationStore()

  const stageRef    = useRef(null)
  const containerRef = useRef(null)
  const [stageSize, setStageSize] = useState({ w: CANVAS_W, h: CANVAS_H })

  // ── Spacebar temporary pan ──
  const [isSpacePanning, setIsSpacePanning] = useState(false)
  const spaceHeldRef = useRef(false)
  const prevToolRef  = useRef(null)

  // ── Canvas drag-pan state ──
  const isPanDragging  = useRef(false)
  const panStartPos    = useRef({ x: 0, y: 0 })
  const panStartOffset = useRef({ x: 0, y: 0 })

  // Effective tool: spacebar overrides to PAN temporarily
  const effectiveTool = isSpacePanning ? TOOLS.PAN : activeTool

  /* ── Responsive resize ── */
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        if (w > 0) setStageSize({ w, h: Math.max(320, w * 0.65) })
      }
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  /* ── Spacebar: temporary pan (Figma-style) ── */
  useEffect(() => {
    const onKeyDown = (e) => {
      // Only when the canvas container (or body) is focused; prevent browser scroll
      if (e.code === 'Space' && !spaceHeldRef.current && !e.target.matches('input, textarea, button')) {
        e.preventDefault()
        spaceHeldRef.current = true
        prevToolRef.current  = activeTool
        setIsSpacePanning(true)
        onSpacebarPanChange?.(true)
      }
    }
    const onKeyUp = (e) => {
      if (e.code === 'Space' && spaceHeldRef.current) {
        e.preventDefault()
        spaceHeldRef.current = false
        setIsSpacePanning(false)
        onSpacebarPanChange?.(false)
        // Tool automatically reverts because effectiveTool uses isSpacePanning,
        // and the store activeTool was never changed.
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [activeTool, onSpacebarPanChange])

  /* ── Stage cursor ── */
  const getBaseCursor = useCallback(() => {
    switch (effectiveTool) {
      case TOOLS.PAN:    return 'grab'
      case TOOLS.ADD:    return 'crosshair'
      case TOOLS.DELETE: return 'default'
      case TOOLS.RESIZE: return 'default'
      default:           return 'default'
    }
  }, [effectiveTool])

  // Keep the stage container cursor in sync whenever effectiveTool changes
  useEffect(() => {
    const stage = stageRef.current
    if (stage) stage.container().style.cursor = getBaseCursor()
  }, [effectiveTool, getBaseCursor])

  /* ── Wheel zoom (zoom toward cursor) ── */
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return

    const oldScale = zoom
    const pointer  = stage.getPointerPosition()

    const mousePointTo = {
      x: (pointer.x - stageOffset.x) / oldScale,
      y: (pointer.y - stageOffset.y) / oldScale,
    }

    const direction = e.evt.deltaY < 0 ? 1 : -1
    const newScale  = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, direction > 0
      ? oldScale * ZOOM_FACTOR
      : oldScale / ZOOM_FACTOR
    ))

    setZoom(newScale)
    setStageOffset({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    })
  }, [zoom, stageOffset, setZoom, setStageOffset])

  /* ── Stage pointer events for pan drag ── */
  const handleStageMouseDown = useCallback((e) => {
    if (effectiveTool !== TOOLS.PAN) return
    // Only start panning if clicking on background (not an annotation)
    const target = e.target
    const stage  = stageRef.current
    if (!stage) return

    isPanDragging.current  = true
    panStartPos.current    = stage.getPointerPosition()
    panStartOffset.current = { ...stageOffset }
    stage.container().style.cursor = 'grabbing'
  }, [effectiveTool, stageOffset])

  const handleStageMouseMove = useCallback(() => {
    if (!isPanDragging.current) return
    const stage = stageRef.current
    if (!stage) return

    const pos = stage.getPointerPosition()
    const dx  = pos.x - panStartPos.current.x
    const dy  = pos.y - panStartPos.current.y

    setStageOffset({
      x: panStartOffset.current.x + dx,
      y: panStartOffset.current.y + dy,
    })
  }, [setStageOffset])

  const handleStageMouseUp = useCallback(() => {
    if (!isPanDragging.current) return
    isPanDragging.current = false
    const stage = stageRef.current
    if (stage) stage.container().style.cursor = 'grab'
  }, [])

  /* ── Stage click (background) ── */
  const handleStageClick = useCallback((e) => {
    // Don't handle if we just finished a pan drag (mousedown+move+mouseup)
    if (isPanDragging.current) return

    const stage = e.target.getStage()
    const isBackgroundClick = e.target === stage || e.target.name() === 'bg'

    if (!isBackgroundClick) return

    if (effectiveTool === TOOLS.ADD) {
      const pos = stage.getPointerPosition()
      const x   = (pos.x - stageOffset.x) / zoom
      const y   = (pos.y - stageOffset.y) / zoom
      addAnnotation(x, y)
      return
    }

    if (effectiveTool === TOOLS.PAN) return  // pan doesn't clear selection

    clearSelection()
  }, [effectiveTool, zoom, stageOffset, addAnnotation, clearSelection])

  /* ── Annotation select / delete handler ── */
  const handleAnnotationSelect = useCallback((id, action) => {
    if (action === 'delete') {
      deleteAnnotation(id)
      return
    }
    selectAnnotation(id)
  }, [selectAnnotation, deleteAnnotation])

  const handleAnnotationDragEnd = useCallback((id, scaledPos) => {
    // Scale back from canvas px → normalised coordinates
    updateAnnotation(id, {
      x: scaledPos.x / (stageSize.w / CANVAS_W),
      y: scaledPos.y / (stageSize.h / CANVAS_H),
    })
  }, [updateAnnotation, stageSize])

  /* ── Derived values ── */
  const annotations  = getVisibleAnnotations()
  const canvasWidth  = stageSize.w
  const canvasHeight = stageSize.h
  const petriCX = canvasWidth  / 2
  const petriCY = canvasHeight / 2
  const petriRX = PETRI_RX * (canvasWidth  / CANVAS_W)
  const petriRY = PETRI_RY * (canvasHeight / CANVAS_H)

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden border border-surface-200 bg-[#E8EFF5] shadow-sm select-none"
      style={{ minHeight: 320, touchAction: 'none' }}
      // Prevent spacebar scroll on the wrapper div
      onKeyDown={(e) => { if (e.code === 'Space') e.preventDefault() }}
    >
      <Stage
        ref={stageRef}
        width={canvasWidth}
        height={canvasHeight}
        scaleX={zoom}
        scaleY={zoom}
        x={stageOffset.x}
        y={stageOffset.y}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onMouseLeave={handleStageMouseUp}  // end pan if cursor leaves canvas
        style={{ display: 'block', cursor: getBaseCursor() }}
      >
        {/* ── Background + Petri Dish Layer ── */}
        <Layer listening={false}>
          {/* Full canvas fill — prevents "gaps" when zoomed/panned */}
          <Rect
            x={(-stageOffset.x) / zoom - 2000}
            y={(-stageOffset.y) / zoom - 2000}
            width={canvasWidth / zoom + 4000}
            height={canvasHeight / zoom + 4000}
            fill="#E8EFF5"
            name="bg"
            perfectDrawEnabled={false}
          />

          {/* Petri dish outer plastic rim */}
          <Ellipse
            x={petriCX}
            y={petriCY}
            radiusX={petriRX}
            radiusY={petriRY}
            fill="transparent"
            stroke="#C4CEDB"
            strokeWidth={12}
            perfectDrawEnabled={false}
          />

          {/* Petri dish agar surface */}
          <Ellipse
            x={petriCX}
            y={petriCY}
            radiusX={petriRX - 8}
            radiusY={petriRY - 8}
            fill="#F0F4F8"
            stroke="#D0DCEA"
            strokeWidth={1.5}
            perfectDrawEnabled={false}
          />

          {/* Subtle agar texture rings */}
          {[0.6, 0.85].map((r, i) => (
            <Ellipse
              key={i}
              x={petriCX}
              y={petriCY}
              radiusX={(petriRX - 8) * r}
              radiusY={(petriRY - 8) * r}
              fill="transparent"
              stroke="#E4ECF3"
              strokeWidth={0.8}
              perfectDrawEnabled={false}
            />
          ))}
        </Layer>

        {/* ── Click-interceptor for background (ADD / PAN / deselect) ── */}
        <Layer>
          <Rect
            x={(-stageOffset.x) / zoom - 2000}
            y={(-stageOffset.y) / zoom - 2000}
            width={canvasWidth / zoom + 4000}
            height={canvasHeight / zoom + 4000}
            fill="transparent"
            name="bg"
            perfectDrawEnabled={false}
          />
        </Layer>

        {/* ── Annotation Layer ── */}
        <Layer>
          {annotations.map((annotation) => (
            <AnnotationMark
              key={annotation.id}
              annotation={{
                ...annotation,
                x:      annotation.x      * (canvasWidth  / CANVAS_W),
                y:      annotation.y      * (canvasHeight / CANVAS_H),
                radius: annotation.radius * Math.min(canvasWidth / CANVAS_W, canvasHeight / CANVAS_H),
              }}
              isSelected={selectedAnnotationId === annotation.id}
              activeTool={activeTool}
              effectiveTool={effectiveTool}
              onSelect={handleAnnotationSelect}
              onDragEnd={handleAnnotationDragEnd}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  )
}
