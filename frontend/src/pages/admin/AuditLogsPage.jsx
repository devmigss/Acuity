/**
 * Acuity — System Administrator Audit Logs Page
 *
 * Immutable, timestamped audit trail records stored in Amazon DynamoDB.
 */

import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'

const AUDIT_LOGS = [
  {
    id: 'log-01',
    timestamp: '2026-08-31 21:45:12 UTC',
    actor: 'Alex Rivera (student)',
    action: 'CANVAS_ANNOTATION_EDIT',
    details: 'Soft deleted AI detection box #14 on Plate_A2_24h_100x.png',
    ip: '120.29.74.11',
  },
  {
    id: 'log-02',
    timestamp: '2026-08-31 20:12:05 UTC',
    actor: 'Dr. Maria Santos (faculty)',
    action: 'FACULTY_REMARK_SUBMITTED',
    details: 'Added revision note on Trial 04 (Group 8)',
    ip: '112.198.88.42',
  },
  {
    id: 'log-03',
    timestamp: '2026-08-31 18:30:00 UTC',
    actor: 'SOD-YOLOv8 Worker (system)',
    action: 'AI_INFERENCE_COMPLETE',
    details: 'Completed macroscopic CFU detection on batch B-104 (56 colonies detected)',
    ip: 'internal-microservice',
  },
]

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable, timestamped audit trail records of human-in-the-loop annotations and system events."
      />

      <Card title="DynamoDB Event Trail" subtitle="Enforces research data integrity and traceability for academic validation.">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-surface-200 font-bold text-surface-500 uppercase tracking-wider">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Actor / Principal</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Event Details</th>
                <th className="py-3 px-3 text-right">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 font-mono">
              {AUDIT_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-surface-50">
                  <td className="py-3 px-3 text-surface-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-3 font-medium text-surface-900 font-sans">{log.actor}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-100 text-surface-700 font-semibold text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-surface-700 font-sans max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="py-3 px-3 text-right text-surface-400">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
