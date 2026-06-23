import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Card } from '@/components/ui/primitives'

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card className="max-w-md text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/5">
          <Compass size={26} className="text-cyan-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Off the flight path</h3>
        <p className="mt-2 text-sm text-slate-400">This route doesn’t exist. Let’s get you back to the deck.</p>
        <div className="mt-5 flex justify-center gap-2">
          <Link to="/" className="btn-ghost">Home</Link>
          <Link to="/flight-deck" className="btn-primary">Student Flight Deck</Link>
        </div>
      </Card>
    </div>
  )
}
