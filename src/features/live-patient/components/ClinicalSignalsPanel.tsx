import { Card, CardHeader } from '@/components/ui/primitives'
import { ScoreMeter } from '@/components/common/Scores'
import { Brain } from 'lucide-react'
import type { CommSignals } from '../types'

export default function ClinicalSignalsPanel({ signals }: { signals: CommSignals }) {
  return (
    <Card>
      <CardHeader
        icon={<Brain size={18} />}
        title="Communication signals"
        subtitle="Your delivery, scored each turn"
      />
      <div className="space-y-3">
        <ScoreMeter label="Empathy" value={signals.empathy} tone="cyan" />
        <ScoreMeter label="Clarity" value={signals.clarity} tone="cyan" />
        <ScoreMeter label="Open-question quality" value={signals.openQuestionQuality} tone="success" />
        <ScoreMeter label="Listening" value={signals.listening} tone="violet" />
        <ScoreMeter label="Confidence" value={signals.confidence} tone="success" />
        <ScoreMeter label="Judgment risk" value={signals.judgmentRisk} tone="danger" />
        <ScoreMeter label="Clinical relevance" value={signals.clinicalRelevance} tone="cyan" />
      </div>
    </Card>
  )
}
