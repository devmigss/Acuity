/**
 * Acuity — Annotation Legend
 *
 * Explains the visual encoding of annotation types displayed on the canvas.
 */

export default function AnnotationLegend() {
  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-100">
        <h3 className="text-xs font-bold uppercase tracking-widest text-accent-600">
          Legend
        </h3>
      </div>
      <div className="px-4 py-4 space-y-3">
        {/* AI-detected */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-dashed border-emerald-500 bg-transparent" />
          <div>
            <div className="text-sm font-medium text-surface-900">AI-detected Colony</div>
            <div className="text-xs text-surface-500">SOD-YOLOv8 detection with confidence score</div>
          </div>
        </div>

        {/* Manual */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-solid border-red-500 bg-transparent" />
          <div>
            <div className="text-sm font-medium text-surface-900">Manually Added / Edited</div>
            <div className="text-xs text-surface-500">Human-in-the-loop correction (soft edit)</div>
          </div>
        </div>

        {/* Selected */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-dashed border-emerald-500 ring-2 ring-emerald-400 ring-offset-1 bg-emerald-50/50" />
          <div>
            <div className="text-sm font-medium text-surface-900">Selected Annotation</div>
            <div className="text-xs text-surface-500">Highlighted for editing or deletion</div>
          </div>
        </div>
      </div>
    </div>
  )
}
