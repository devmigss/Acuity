/**
 * Acuity — Annotation Toolbar
 *
 * Tools: Select (V), Pan (H), Add Colony, Resize/Edit, Delete
 * Zoom controls: Zoom Out, percentage display, Zoom In, Fit View
 *
 * Features:
 * - Custom tooltip system (hover + keyboard focus, Acuity design style)
 * - Keyboard shortcut labels in tooltips
 * - Active tool highlight (navy fill)
 * - Delete button disabled when no annotation is selected
 * - Spacebar temporary pan is handled in AnnotationCanvas; toolbar reflects state
 */

import { useState, useRef, useCallback } from 'react'
import { TOOLS, useAnnotationStore } from '@/stores/annotationStore'

/* ─── Tooltip primitive ──────────────────────────────────── */

function Tooltip({ label, shortcut, children }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), 400)
  }, [])

  const hide = useCallback(() => {
    clearTimeout(timerRef.current)
    setVisible(false)
  }, [])

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className="
            pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
            whitespace-nowrap px-2.5 py-1.5 rounded-lg
            bg-[#0B1F3A] text-white text-xs font-medium
            shadow-lg flex items-center gap-2
          "
        >
          <span>{label}</span>
          {shortcut && (
            <kbd className="
              inline-flex items-center justify-center
              px-1.5 py-0.5 rounded text-[10px] font-mono font-bold
              bg-white/15 border border-white/25 text-white/80
              leading-none
            ">
              {shortcut}
            </kbd>
          )}
          {/* Tooltip arrow */}
          <span className="
            absolute top-full left-1/2 -translate-x-1/2
            border-4 border-transparent border-t-[#0B1F3A]
          " />
        </div>
      )}
    </div>
  )
}

/* ─── Tool definitions ───────────────────────────────────── */

const TOOL_DEFS = [
  {
    id: TOOLS.SELECT,
    label: 'Select Annotation',
    shortcut: 'V',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
      </svg>
    ),
  },
  {
    id: TOOLS.PAN,
    label: 'Pan Canvas',
    shortcut: 'H',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75v16.5M16.5 3.75v16.5M12 3.75v16.5M3.75 7.5h16.5M3.75 12h16.5M3.75 16.5h16.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75H7.5M9 12H7.5M9 17.25H7.5" />
        <path d="M9 6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6Z" />
      </svg>
    ),
    iconAlt: (
      // Hand / grab icon — a more recognisable pan icon
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    id: TOOLS.ADD,
    label: 'Add Colony',
    shortcut: 'A',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    id: TOOLS.RESIZE,
    label: 'Resize Annotation',
    shortcut: 'R',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
  },
  {
    id: TOOLS.DELETE,
    label: 'Delete Annotation',
    shortcut: 'Del',
    isDangerAction: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      </svg>
    ),
  },
]

/* ─── Main Toolbar Component ─────────────────────────────── */

export default function AnnotationToolbar({ onZoomIn, onZoomOut, onFitView, zoom, isSpacebarPanning }) {
  const { activeTool, setActiveTool, selectedAnnotationId, deleteAnnotation } = useAnnotationStore()

  const handleToolClick = (toolId) => {
    if (toolId === TOOLS.DELETE) {
      if (selectedAnnotationId) {
        deleteAnnotation(selectedAnnotationId)
      }
      return
    }
    setActiveTool(toolId)
  }

  // When Spacebar is held, visually show PAN as active but don't persist the tool change
  const displayActiveTool = isSpacebarPanning ? TOOLS.PAN : activeTool

  return (
    <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Annotation tools">

      {/* ── Primary Tool Group ── */}
      <div
        className="flex items-center gap-1 bg-surface-100 rounded-xl p-1.5"
        role="group"
        aria-label="Annotation tools"
      >
        {TOOL_DEFS.map((tool) => {
          const isActive = displayActiveTool === tool.id && !tool.isDangerAction
          const isDeleteDisabled = tool.isDangerAction && !selectedAnnotationId

          const baseClasses = `
            p-2.5 rounded-lg transition-all duration-150 cursor-pointer
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-1
            disabled:opacity-35 disabled:cursor-not-allowed
          `

          const variantClasses = isActive
            ? 'bg-[#0B1F3A] text-white shadow-sm'
            : tool.isDangerAction
            ? 'bg-transparent text-danger-500 hover:bg-danger-50 hover:text-danger-700'
            : 'bg-transparent text-surface-600 hover:bg-white hover:text-surface-900 hover:shadow-sm'

          // Pan tool gets a subtle teal tint to distinguish it from SELECT
          const panHighlight = tool.id === TOOLS.PAN && isSpacebarPanning && !isActive
            ? 'ring-1 ring-accent-400/50'
            : ''

          return (
            <Tooltip key={tool.id} label={tool.label} shortcut={tool.shortcut}>
              <button
                type="button"
                onClick={() => handleToolClick(tool.id)}
                disabled={isDeleteDisabled}
                className={`${baseClasses} ${variantClasses} ${panHighlight}`}
                aria-label={tool.label}
                aria-pressed={isActive}
                aria-keyshortcuts={tool.shortcut}
              >
                {/* Use the first icon; PAN uses a hand icon defined inline */}
                {tool.id === TOOLS.PAN ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M10.5 6h.008M10.5 6a1.5 1.5 0 1 0 0 3h.008a1.5 1.5 0 0 0 0-3ZM6 9.75A3.75 3.75 0 0 1 9.75 6h4.5A3.75 3.75 0 0 1 18 9.75v.75h-3v-.75a.75.75 0 0 0-.75-.75H9.75a.75.75 0 0 0-.75.75v.75H6v-.75Z
                      M6 10.5H3.75a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75H6M18 10.5h2.25c.414 0 .75.336.75.75v4.5a.75.75 0 0 1-.75.75H18
                      M6 10.5v6.75M18 10.5v6.75M6 17.25h12M6 17.25A2.25 2.25 0 0 0 8.25 19.5h7.5A2.25 2.25 0 0 0 18 17.25" />
                  </svg>
                ) : (
                  tool.icon
                )}
              </button>
            </Tooltip>
          )
        })}
      </div>

      {/* ── Divider ── */}
      <div className="h-8 w-px bg-surface-200 hidden sm:block" aria-hidden="true" />

      {/* ── Zoom Controls ── */}
      <div
        className="flex items-center gap-1 bg-surface-100 rounded-xl p-1.5"
        role="group"
        aria-label="Zoom controls"
      >
        <Tooltip label="Zoom Out" shortcut="−">
          <button
            type="button"
            onClick={onZoomOut}
            className="p-2 rounded-lg text-surface-600 hover:bg-white hover:text-surface-900 hover:shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            aria-label="Zoom out"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6" />
            </svg>
          </button>
        </Tooltip>

        <Tooltip label="Fit to View" shortcut="0">
          <button
            type="button"
            onClick={onFitView}
            className="px-2 py-1.5 rounded-lg text-xs font-bold text-surface-700 hover:bg-white hover:text-surface-900 hover:shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 tabular-nums min-w-[3.5rem] text-center"
            aria-label={`Current zoom: ${Math.round(zoom * 100)}%. Click to reset.`}
          >
            {Math.round(zoom * 100)}%
          </button>
        </Tooltip>

        <Tooltip label="Zoom In" shortcut="+">
          <button
            type="button"
            onClick={onZoomIn}
            className="p-2 rounded-lg text-surface-600 hover:bg-white hover:text-surface-900 hover:shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            aria-label="Zoom in"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
            </svg>
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
