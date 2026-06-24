import { Card, CardHeader } from '@/components/ui/primitives'
import { ScoreMeter } from '@/components/common/Scores'
import { HeartPulse } from 'lucide-react'
import type { PatientMeters } from '../types'

export default function PatientStatePanel({
  meters,
  trustDelta,
}: {
  meters: PatientMeters
  trustDelta: number
}) {
  return (
    <Card>
      <CardHeader
        icon={<HeartPulse size={18} />}
        title="Patient state"
        subtitle="How David feels right now"
      />
      <div className="space-y-3">
        <ScoreMeter label="Trust" value={meters.trust} tone="cyan" delta={trustDelta} />
        <ScoreMeter label="Openness" value={meters.openness} tone="success" />
        <ScoreMeter label="Anxiety" value={meters.anxiety} tone="warning" />
        <ScoreMeter label="Pain / distress" value={meters.painDistress} tone="danger" />
        <ScoreMeter label="Confusion" value={meters.confusion} tone="violet" />
        <div className="pt-1">
          <ScoreMeter
            label="Hidden concern progress"
            value={meters.hiddenConcernProgress}
            tone={meters.hiddenConcernRevealed ? 'success' : 'violet'}
          />
        </div>
      </div>
    </Card>
  )
}
