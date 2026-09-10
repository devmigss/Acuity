/**
 * Acuity — Interactive Annotation Canvas (React-Konva)
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 3 — human-in-the-loop annotation
 * with soft deletes. AI baseline bounding boxes are immutable.
 *
 * Renders AI-detected, human-corrected, and manually added colony annotations
 * on a simulated Petri dish background using React-Konva.
 *
 * Key Interaction Capabilities:
 * - MOVING: Select or drag any colony (AI or manual) in SELECT or RESIZE mode.
 *   Entire colony group (circle, center point, badge, handles) moves in sync.
 * - RESIZING: 4 cardinal resize handles (E, S, W, N) with circular aspect ratio
 *   preservation (no rotation, no distortion), clamped to [10, 120] normalized units.
 * - VISUAL DISTINCTIONS:
 *   * AI Untouched: Emerald dashed border, dark slate badge, AI confidence %.
 *   * AI Corrected: Amber solid border, amber badge, confidence % + "Edited".
 *   * Manual: Red solid border, red badge, "Manual".
 * - TOOL ISOLATION:
 *   * Pan mode (or Spacebar held) disables dragging/resizing.
 *   * Add mode places manual colony at normalized coordinates without selecting.
 *   * Delete mode soft-deletes clicked colony.
 * - READ-ONLY: Supports `readOnly` prop for faculty review mode.
 */

import { useRef, useCallback, useEffect, useState } from 'react'
import { Stage, Layer, Circle, Text, Rect, Group } from 'react-konva'
import { useAnnotationStore, TOOLS, ANNOTATION_SOURCE } from '@/stores/annotationStore'

/* ── Canvas coordinate constants (normalised space — 1:1 square) ── */
const CANVAS_W = 700
const CANVAS_H = 700
const PETRI_R = 300

/* ── Geometry constraints (normalized units) ── */
const MIN_RADIUS = 10
const MAX_RADIUS = 120

/* ── Zoom limits ── */
const MIN_ZOOM = 0.25
const MAX_ZOOM = 5.0
const ZOOM_FACTOR = 1.08

/* ─────────────────────────────────────────────────────────────
   AnnotationMark — Grouped colony with synchronized dragging & handles
   ───────────────────────────────────────────────────────────── */

function AnnotationMark({
  annotation,
  layerX,
  layerY,
  layerRadius,
  isSelected,
  canDrag,
  canResize,
  effectiveTool,
  zoom,
  onSelect,
  onDragStart,
  onDragEnd,
  onResizeStart,
  getBaseCursor,
}) {
  const isManual = annotation.source === ANNOTATION_SOURCE.MANUAL
  const isCorrectedAI = !isManual && Boolean(annotation.corrected)

  // Visual color encoding
  let statusColor = '#10B981' // Emerald for Untouched AI
  let labelBg     = '#0F172A' // Dark Slate
  let strokeDash  = [6, 4]
  let labelText   = annotation.confidence !== null ? `${Math.round(annotation.confidence * 100)}%` : 'AI'
  let badgeWidth  = 46

  if (isManual) {
    statusColor = '#EF4444' // Red for Manual
    labelBg     = '#EF4444'
    strokeDash  = []
    labelText   = 'Manual'
    badgeWidth  = 54
  } else if (isCorrectedAI) {
    statusColor = '#F59E0B' // Amber for Corrected AI
    labelBg     = '#D97706'
    strokeDash  = []
    labelText   = `${Math.round(annotation.confidence * 100)}% • Edited`
    badgeWidth  = 84
  }

  const strokeWidth = isSelected ? 3 : 2
  const fillColor = isSelected
    ? isManual
      ? 'rgba(239,68,68,0.12)'
      : isCorrectedAI
      ? 'rgba(245,158,11,0.14)'
      : 'rgba(16,185,129,0.12)'
    : 'transparent'

  // Cursor per effective tool + hover context
  const getColonyCursor = () => {
    if (effectiveTool === TOOLS.PAN) return 'grab'
    if (effectiveTool === TOOLS.DELETE) return 'pointer'
    if (canDrag) return 'move'
    if (effectiveTool === TOOLS.SELECT) return 'pointer'
    return 'default'
  }

  const handleClick = useCallback((e) => {
    e.cancelBubble = true

    if (effectiveTool === TOOLS.PAN) return
    if (effectiveTool === TOOLS.ADD) return

    if (effectiveTool === TOOLS.DELETE) {
      onSelect(annotation.id, 'delete')
      return
    }

    onSelect(annotation.id)
  }, [annotation.id, effectiveTool, onSelect])

  const handleDragStart = useCallback((e) => {
    e.cancelBubble = true
    onDragStart?.(annotation.id)
  }, [annotation.id, onDragStart])

  const handleDragEnd = useCallback((e) => {
    e.cancelBubble = true
    onDragEnd(annotation.id, { x: e.target.x(), y: e.target.y() })
  }, [annotation.id, onDragEnd])

  // Resize handle radius — scales gently with zoom to remain easily clickable
  const handleRadius = Math.max(4.5, 6 / Math.sqrt(zoom))

  return (
    <Group
      x={layerX}
      y={layerY}
      draggable={canDrag}
      onClick={handleClick}
      onTap={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={(e) => {
        const stage = e.target.getStage()
        if (stage) stage.container().style.cursor = getColonyCursor()
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage()
        if (stage) stage.container().style.cursor = getBaseCursor()
      }}
    >
      {/* ── Colony Circle ── */}
      <Circle
        x={0}
        y={0}
        radius={layerRadius}
        fill={fillColor}
        stroke={statusColor}
        strokeWidth={strokeWidth}
        dash={strokeDash}
        perfectDrawEnabled={false}
      />

      {/* ── Selection Ring + Center Pivot Dot ── */}
      {isSelected && (
        <>
          <Circle
            x={0}
            y={0}
            radius={layerRadius + 5}
            stroke={statusColor}
            strokeWidth={1.5}
            dash={[3, 3]}
            listening={false}
            perfectDrawEnabled={false}
          />
          <Circle
            x={0}
            y={0}
            radius={2.5}
            fill={statusColor}
            listening={false}
            perfectDrawEnabled={false}
          />
        </>
      )}

      {/* ── Metadata Badge (Centered above colony) ── */}
      <Rect
        x={-badgeWidth / 2}
        y={-layerRadius - 23}
        width={badgeWidth}
        height={18}
        fill={labelBg}
        cornerRadius={4}
        listening={false}
        perfectDrawEnabled={false}
      />
      <Text
        x={-badgeWidth / 2}
        y={-layerRadius - 21}
        width={badgeWidth}
        text={labelText}
        align="center"
        fontSize={10}
        fontStyle="bold"
        fill="#FFFFFF"
        listening={false}
        perfectDrawEnabled={false}
        fontFamily="Inter, monospace"
      />

      {/* ── Cardinal Circular Resize Handles (E, S, W, N) ── */}
      {isSelected && canResize && (
        <>
          {/* East Handle */}
          <Circle
            x={layerRadius}
            y={0}
            radius={handleRadius}
            fill="#FFFFFF"
            stroke={statusColor}
            strokeWidth={2}
            shadowColor="rgba(0, 0, 0, 0.25)"
            shadowBlur={3}
            shadowOffset={{ x: 0, y: 1 }}
            onMouseDown={(e) => {
              e.cancelBubble = true
              onResizeStart(annotation.id, 'e', layerX, layerY, layerRadius)
            }}
            onMouseEnter={(e) => {
              const stage = e.target.getStage()
              if (stage) stage.container().style.cursor = 'ew-resize'
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage()
              if (stage) stage.container().style.cursor = getColonyCursor()
            }}
          />

          {/* South Handle */}
          <Circle
            x={0}
            y={layerRadius}
            radius={handleRadius}
            fill="#FFFFFF"
            stroke={statusColor}
            strokeWidth={2}
            shadowColor="rgba(0, 0, 0, 0.25)"
            shadowBlur={3}
            shadowOffset={{ x: 0, y: 1 }}
            onMouseDown={(e) => {
              e.cancelBubble = true
              onResizeStart(annotation.id, 's', layerX, layerY, layerRadius)
            }}
            onMouseEnter={(e) => {
              const stage = e.target.getStage()
              if (stage) stage.container().style.cursor = 'ns-resize'
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage()
              if (stage) stage.container().style.cursor = getColonyCursor()
            }}
          />

          {/* West Handle */}
          <Circle
            x={-layerRadius}
            y={0}
            radius={handleRadius}
            fill="#FFFFFF"
            stroke={statusColor}
            strokeWidth={2}
            shadowColor="rgba(0, 0, 0, 0.25)"
            shadowBlur={3}
            shadowOffset={{ x: 0, y: 1 }}
            onMouseDown={(e) => {
              e.cancelBubble = true
              onResizeStart(annotation.id, 'w', layerX, layerY, layerRadius)
            }}
            onMouseEnter={(e) => {
              const stage = e.target.getStage()
              if (stage) stage.container().style.cursor = 'ew-resize'
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage()
              if (stage) stage.container().style.cursor = getColonyCursor()
            }}
          />

          {/* North Handle */}
          <Circle
            x={0}
            y={-layerRadius}
            radius={handleRadius}
            fill="#FFFFFF"
            stroke={statusColor}
            strokeWidth={2}
            shadowColor="rgba(0, 0, 0, 0.25)"
            shadowBlur={3}
            shadowOffset={{ x: 0, y: 1 }}
            onMouseDown={(e) => {
              e.cancelBubble = true
              onResizeStart(annotation.id, 'n', layerX, layerY, layerRadius)
            }}
            onMouseEnter={(e) => {
              const stage = e.target.getStage()
              if (stage) stage.container().style.cursor = 'ns-resize'
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage()
              if (stage) stage.container().style.cursor = getColonyCursor()
            }}
          />
        </>
      )}
    </Group>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main AnnotationCanvas
   ───────────────────────────────────────────────────────────── */

export default function AnnotationCanvas({
  onSpacebarPanChange,
  readOnly = false,
}) {
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

  const stageRef     = useRef(null)
  const containerRef = useRef(null)
  const [stageSize, setStageSize] = useState({ w: CANVAS_W, h: CANVAS_H })

  // ── Spacebar temporary pan ──
  const [isSpacePanning, setIsSpacePanning] = useState(false)
  const spaceHeldRef = useRef(false)

  // ── Canvas drag-pan state ──
  const isPanDragging  = useRef(false)
  const panStartPos    = useRef({ x: 0, y: 0 })
  const panStartOffset = useRef({ x: 0, y: 0 })

  // ── Circular Resize state ──
  // resizing: { id, direction, colonyLayerX, colonyLayerY, initialRadiusPx }
  const [resizing, setResizing] = useState(null)
  const [previewRadius, setPreviewRadius] = useState(null)

  // Effective tool: spacebar overrides to PAN temporarily
  const effectiveTool = isSpacePanning ? TOOLS.PAN : activeTool

  /* ── Responsive resize (1:1 square Petri dish container) ── */
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        if (w > 0) setStageSize({ w, h: w })
      }
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  /* ── Spacebar: temporary pan (Figma-style) ── */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space' && !spaceHeldRef.current && !e.target.matches('input, textarea, button')) {
        e.preventDefault()
        spaceHeldRef.current = true
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
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [onSpacebarPanChange])

  /* ── Stage base cursor ── */
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

  /* ── Scale factors between normalized space (700x480) and canvas px ── */
  const canvasWidth  = stageSize.w
  const canvasHeight = stageSize.h
  const scaleXFactor = canvasWidth / CANVAS_W
  const scaleYFactor = canvasHeight / CANVAS_H
  const scaleRadius  = Math.min(scaleXFactor, scaleYFactor)

  /* ── Circular Resize Pointer Move & Up Handlers ── */
  useEffect(() => {
    if (!resizing) return

    const handleWindowMouseMove = () => {
      const stage = stageRef.current
      if (!stage) return
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      // Convert pointer from stage viewport space to layer space
      const layerPointerX = (pointer.x - stageOffset.x) / zoom
      const layerPointerY = (pointer.y - stageOffset.y) / zoom

      let newRadiusPx = resizing.initialRadiusPx
      if (resizing.direction === 'e') {
        newRadiusPx = layerPointerX - resizing.colonyLayerX
      } else if (resizing.direction === 'w') {
        newRadiusPx = resizing.colonyLayerX - layerPointerX
      } else if (resizing.direction === 's') {
        newRadiusPx = layerPointerY - resizing.colonyLayerY
      } else if (resizing.direction === 'n') {
        newRadiusPx = resizing.colonyLayerY - layerPointerY
      }

      // Convert px to normalized base radius and clamp
      const normRadius = newRadiusPx / scaleRadius
      const clampedRadius = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, Math.round(normRadius * 10) / 10))

      setPreviewRadius({ id: resizing.id, radius: clampedRadius })
    }

    const handleWindowMouseUp = () => {
      if (previewRadius && previewRadius.id === resizing.id) {
        updateAnnotation(resizing.id, { radius: previewRadius.radius })
      }
      setResizing(null)
      setPreviewRadius(null)
    }

    window.addEventListener('mousemove', handleWindowMouseMove)
    window.addEventListener('mouseup', handleWindowMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove)
      window.removeEventListener('mouseup', handleWindowMouseUp)
    }
  }, [resizing, previewRadius, stageOffset, zoom, scaleRadius, updateAnnotation])

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
  const handleStageMouseDown = useCallback(() => {
    if (effectiveTool !== TOOLS.PAN) return
    const stage = stageRef.current
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

  /* ── Stage click (background click) ── */
  const handleStageClick = useCallback((e) => {
    if (isPanDragging.current) return

    const stage = e.target.getStage()
    const isBackgroundClick = e.target === stage || e.target.name() === 'bg'

    if (!isBackgroundClick) return

    if (effectiveTool === TOOLS.ADD && !readOnly) {
      const pos = stage.getPointerPosition()
      const layerX = (pos.x - stageOffset.x) / zoom
      const layerY = (pos.y - stageOffset.y) / zoom
      const normX  = layerX / scaleXFactor
      const normY  = layerY / scaleYFactor
      addAnnotation(normX, normY)
      return
    }

    if (effectiveTool === TOOLS.PAN) return

    clearSelection()
  }, [effectiveTool, readOnly, zoom, stageOffset, scaleXFactor, scaleYFactor, addAnnotation, clearSelection])

  /* ── Annotation selection / deletion ── */
  const handleAnnotationSelect = useCallback((id, action) => {
    if (action === 'delete') {
      if (!readOnly) deleteAnnotation(id)
      return
    }
    selectAnnotation(id)
  }, [readOnly, selectAnnotation, deleteAnnotation])

  /* ── Drag start (auto-select) ── */
  const handleAnnotationDragStart = useCallback((id) => {
    if (selectedAnnotationId !== id) {
      selectAnnotation(id)
    }
  }, [selectedAnnotationId, selectAnnotation])

  /* ── Drag end (commit normalized coordinates) ── */
  const handleAnnotationDragEnd = useCallback((id, scaledPos) => {
    updateAnnotation(id, {
      x: Math.round((scaledPos.x / scaleXFactor) * 10) / 10,
      y: Math.round((scaledPos.y / scaleYFactor) * 10) / 10,
    })
  }, [updateAnnotation, scaleXFactor, scaleYFactor])

  /* ── Resize start callback ── */
  const handleResizeStart = useCallback((id, direction, colonyLayerX, colonyLayerY, initialRadiusPx) => {
    if (readOnly) return
    setResizing({
      id,
      direction,
      colonyLayerX,
      colonyLayerY,
      initialRadiusPx,
    })
  }, [readOnly])

  /* ── Tool permissions ── */
  // Colonies are draggable in SELECT and RESIZE modes when not in pan/spacebar pan and not read-only
  const canDragColonies = !readOnly &&
    effectiveTool !== TOOLS.PAN &&
    effectiveTool !== TOOLS.ADD &&
    effectiveTool !== TOOLS.DELETE &&
    (activeTool === TOOLS.SELECT || activeTool === TOOLS.RESIZE)

  const canResizeColonies = !readOnly &&
    effectiveTool !== TOOLS.PAN &&
    (activeTool === TOOLS.SELECT || activeTool === TOOLS.RESIZE)

  /* ── Derived Petri dimensions (1:1 circular ROI) ── */
  const annotations = getVisibleAnnotations()
  const petriCX = canvasWidth  / 2
  const petriCY = canvasHeight / 2
  const petriRadiusPx = PETRI_R * scaleRadius

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[620px] aspect-square mx-auto rounded-2xl overflow-hidden border border-surface-200 bg-[#E8EFF5] shadow-sm select-none relative"
      style={{ touchAction: 'none' }}
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
        onMouseLeave={handleStageMouseUp}
        style={{ display: 'block', cursor: getBaseCursor() }}
      >
        {/* ── Background + Petri Dish Layer ── */}
        <Layer listening={false}>
          <Rect
            x={(-stageOffset.x) / zoom - 2000}
            y={(-stageOffset.y) / zoom - 2000}
            width={canvasWidth / zoom + 4000}
            height={canvasHeight / zoom + 4000}
            fill="#E8EFF5"
            name="bg"
            perfectDrawEnabled={false}
          />

          {/* Petri dish outer rim (circular) */}
          <Circle
            x={petriCX}
            y={petriCY}
            radius={petriRadiusPx}
            fill="transparent"
            stroke="#C4CEDB"
            strokeWidth={12}
            perfectDrawEnabled={false}
          />

          {/* Petri dish agar surface (circular) */}
          <Circle
            x={petriCX}
            y={petriCY}
            radius={petriRadiusPx - 8}
            fill="#F0F4F8"
            stroke="#D0DCEA"
            strokeWidth={1.5}
            perfectDrawEnabled={false}
          />

          {/* Subtle agar rings (circular) */}
          {[0.6, 0.85].map((r, i) => (
            <Circle
              key={i}
              x={petriCX}
              y={petriCY}
              radius={(petriRadiusPx - 8) * r}
              fill="transparent"
              stroke="#E4ECF3"
              strokeWidth={0.8}
              perfectDrawEnabled={false}
            />
          ))}
        </Layer>

        {/* ── Click-interceptor for background ── */}
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
          {annotations.map((annotation) => {
            const isSelected = selectedAnnotationId === annotation.id
            const activeRadius = (previewRadius && previewRadius.id === annotation.id)
              ? previewRadius.radius
              : annotation.radius

            const layerX      = annotation.x * scaleXFactor
            const layerY      = annotation.y * scaleYFactor
            const layerRadius = activeRadius * scaleRadius

            return (
              <AnnotationMark
                key={annotation.id}
                annotation={annotation}
                layerX={layerX}
                layerY={layerY}
                layerRadius={layerRadius}
                isSelected={isSelected}
                canDrag={canDragColonies}
                canResize={canResizeColonies}
                effectiveTool={effectiveTool}
                zoom={zoom}
                onSelect={handleAnnotationSelect}
                onDragStart={handleAnnotationDragStart}
                onDragEnd={handleAnnotationDragEnd}
                onResizeStart={handleResizeStart}
                getBaseCursor={getBaseCursor}
              />
            )
          })}
        </Layer>
      </Stage>
    </div>
  )
}
