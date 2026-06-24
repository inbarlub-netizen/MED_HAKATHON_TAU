import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'

const Landing = lazy(() => import('./pages/Landing'))
const FlightDeck = lazy(() => import('./pages/FlightDeck'))
const Cockpit = lazy(() => import('./pages/Cockpit'))
const LivePatientRoom = lazy(() => import('./features/live-patient/LivePatientRoom'))
const Debrief = lazy(() => import('./pages/Debrief'))
const Progress = lazy(() => import('./pages/Progress'))
const Faculty = lazy(() => import('./pages/Faculty'))
const Instructor = lazy(() => import('./pages/Instructor'))
const Builder = lazy(() => import('./pages/Builder'))
const Rotation = lazy(() => import('./pages/Rotation'))
const Safety = lazy(() => import('./pages/Safety'))
const NotFound = lazy(() => import('./pages/NotFound'))

function Loader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-cyan-400" />
        <span className="text-xs text-slate-500">Loading…</span>
      </div>
    </div>
  )
}

export default function App() {
  const loc = useLocation()

  // Landing is full-bleed (its own chrome); everything else uses the app shell.
  if (loc.pathname === '/')
    return (
      <Suspense fallback={<Loader />}>
        <Landing />
      </Suspense>
    )

  return (
    <AppLayout>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/flight-deck" element={<FlightDeck />} />
          <Route path="/cockpit" element={<Cockpit />} />
          <Route path="/live-patient" element={<LivePatientRoom />} />
          <Route path="/debrief" element={<Debrief />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/instructor" element={<Instructor />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/rotation" element={<Rotation />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppLayout>
  )
}
