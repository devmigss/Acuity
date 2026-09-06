/**
 * Acuity — Annotation Legend
 *
 * Explains the visual encoding of annotation types displayed on the canvas:
 * - Untouched AI-detected colonies
 * - Human-corrected AI colonies (repositioned / resized)
 * - Manually placed colonies
 * - Selected colony state with interactive resize handles
 */

export default function AnnotationLegend() {
  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-100">
        <h3 className="text-xs font-bold uppercase tracking-widest text-accent-600">
          Legend & Encoding
        </h3>
      </div>
      <div className="px-4 py-3 space-y-3">
        {/* AI-detected (Untouched) */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-full border-2 border-dashed border-emerald-500 bg-transparent flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
          </div>
          <div>
            <div className="text-xs font-semibold text-surface-900 flex items-center gap-1.5">
              <span>AI Detection (Untouched)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#0F172A] text-white leading-none font-medium">94%</span>
            </div>
            <div className="text-[11px] text-surface-500 leading-tight">SOD-YOLOv8 model detection baseline</div>
          </div>
        </div>

        {/* AI-detected (Corrected) */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-full border-2 border-solid border-amber-500 bg-amber-50/30 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
          </div>
          <div>
            <div className="text-xs font-semibold text-surface-900 flex items-center gap-1.5">
              <span>AI Colony (Corrected)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-600 text-white leading-none font-medium">Edited</span>
            </div>
            <div className="text-[11px] text-surface-500 leading-tight">Human-adjusted position or radius</div>
          </div>
        </div>

        {/* Manual */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-full border-2 border-solid border-red-500 bg-transparent flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
          </div>
          <div>
            <div className="text-xs font-semibold text-surface-900 flex items-center gap-1.5">
              <span>Manual Colony</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-500 text-white leading-none font-medium">Manual</span>
            </div>
            <div className="text-[11px] text-surface-500 leading-tight">Added directly by researcher</div>
          </div>
        </div>

        {/* Selected with Handles */}
        <div className="flex items-center gap-3 pt-1 border-t border-surface-100">
          <div className="relative flex-shrink-0 w-7 h-7 rounded-full border-2 border-dashed border-emerald-500 ring-2 ring-emerald-400 ring-offset-1 bg-emerald-50/50 flex items-center justify-center">
            {/* Cardinal handle dots indicator */}
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white border border-emerald-500 rounded-full" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white border border-emerald-500 rounded-full" />
            <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white border border-emerald-500 rounded-full" />
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white border border-emerald-500 rounded-full" />
          </div>
          <div>
            <div className="text-xs font-semibold text-surface-900">Selected & Active</div>
            <div className="text-[11px] text-surface-500 leading-tight">Drag to move · Cardinal handles to resize</div>
          </div>
        </div>
      </div>
    </div>
  )
}
