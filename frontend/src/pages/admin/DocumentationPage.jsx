/**
 * Acuity — System Administrator Documentation Page
 *
 * Technical reference for system administrators covering capstone system architecture.
 */

import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'

export default function DocumentationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Documentation"
        subtitle="Developer guides, microservice architecture diagrams, and capstone system specifications."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Microservice Architecture" subtitle="Overview of Node.js + Express, FastAPI AI, and PostgreSQL RDS.">
          <div className="space-y-2 text-xs text-surface-600">
            <p><strong>Primary API:</strong> Node.js Express server handling multi-tenant tenant isolation and WebSockets.</p>
            <p><strong>AI Microservice:</strong> Python 3.12 FastAPI microservice executing OpenCV preprocessing and SOD-YOLOv8.</p>
            <p><strong>Storage & Queue:</strong> Amazon S3 direct presigned uploads, Redis queue for worker jobs.</p>
          </div>
        </Card>

        <Card title="Spatial Calibration Reference" subtitle="Circular ROI extraction and pixel-to-millimeter translation.">
          <div className="space-y-2 text-xs text-surface-600">
            <p><strong>Standard Petri Dish:</strong> 90mm diameter reference baseline.</p>
            <p><strong>Formula:</strong> Ratio = 90mm / Dish Diameter in Pixels.</p>
            <p><strong>Authoritative Owner:</strong> Python OpenCV microservice calculates morphology metrics.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
