'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Footprints,
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Routine {
  id: string
  text: string
  done: boolean
}

interface PulseEntry {
  id: string
  date: string
  focus: string
  routines: string // JSON string of Routine[]
  friction: string
  committed: boolean
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function parseRoutines(json: string): Routine[] {
  try {
    return JSON.parse(json)
  } catch {
    return []
  }
}

function stringifyRoutines(routines: Routine[]): string {
  return JSON.stringify(routines)
}

export function Corridor() {
  const [entries, setEntries] = useState<PulseEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(getToday())
  const [saving, setSaving] = useState(false)
  const [newRoutine, setNewRoutine] = useState('')

  // Form state
  const [focus, setFocus] = useState('')
  const [routines, setRoutines] = useState<Routine[]>([])
  const [friction, setFriction] = useState('')
  const [committed, setCommitted] = useState(false)

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/pulse')
      const data = await res.json()
      setEntries(data)
    } catch (err) {
      console.error('Failed to fetch pulses', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Load current entry when date or entries change
  useEffect(() => {
    const entry = entries.find((e) => e.date === currentDate)
    if (entry) {
      setFocus(entry.focus)
      setRoutines(parseRoutines(entry.routines))
      setFriction(entry.friction)
      setCommitted(entry.committed)
    } else {
      setFocus('')
      setRoutines([])
      setFriction('')
      setCommitted(false)
    }
  }, [currentDate, entries])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/pulse', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: currentDate,
          focus,
          routines: stringifyRoutines(routines),
          friction,
          committed,
        }),
      })
      const data = await res.json()
      // Update local state
      setEntries((prev) => {
        const idx = prev.findIndex((e) => e.date === currentDate)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = data
          return updated
        }
        return [data, ...prev].sort((a, b) => b.date.localeCompare(a.date))
      })
    } catch (err) {
      console.error('Failed to save pulse', err)
    } finally {
      setSaving(false)
    }
  }

  const addRoutine = () => {
    if (!newRoutine.trim()) return
    setRoutines([...routines, { id: crypto.randomUUID(), text: newRoutine.trim(), done: false }])
    setNewRoutine('')
  }

  const toggleRoutine = (id: string) => {
    setRoutines(routines.map((r) => (r.id === id ? { ...r, done: !r.done } : r)))
  }

  const removeRoutine = (id: string) => {
    setRoutines(routines.filter((r) => r.id !== id))
  }

  const navigateDate = (direction: number) => {
    const d = new Date(currentDate + 'T00:00:00')
    d.setDate(d.getDate() + direction)
    setCurrentDate(d.toISOString().split('T')[0])
  }

  const goToToday = () => setCurrentDate(getToday())

  const isToday = currentDate === getToday()
  const currentEntry = entries.find((e) => e.date === currentDate)
  const hasUnsaved =
    currentEntry
      ? currentEntry.focus !== focus ||
        currentEntry.routines !== stringifyRoutines(routines) ||
        currentEntry.friction !== friction ||
        currentEntry.committed !== committed
      : focus || routines.length > 0 || friction || committed

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 text-muted-foreground text-sm uppercase tracking-widest"
        >
          <Footprints className="h-4 w-4" />
          The Corridor
        </motion.div>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Daily Pulse</h2>
        <p className="text-muted-foreground text-sm">
          Your execution layer — answer four questions for your daily &quot;Git-commit&quot; of life.
        </p>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigateDate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center min-w-[200px]">
          <p className="text-sm font-medium">{formatDate(currentDate)}</p>
          {isToday && <Badge variant="secondary" className="mt-1 text-xs">Today</Badge>}
          {!isToday && (
            <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-0.5" onClick={goToToday}>
              Go to today
            </Button>
          )}
        </div>
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigateDate(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Pulse Card */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Footprints className="h-5 w-5 text-amber-500" />
              daily-pulse.md
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasUnsaved && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">Unsaved</Badge>}
              <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1">
                <Save className="h-3 w-3" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 01 | Focus */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded dark:text-amber-400 dark:bg-amber-950">
                01
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Focus</h3>
            </div>
            <p className="text-xs text-muted-foreground italic">What one action brings me closer to the Atrium today?</p>
            <Textarea
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Your one focus for today..."
              rows={2}
              className="resize-none"
            />
          </div>

          <Separator />

          {/* 02 | Routine */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded dark:text-amber-400 dark:bg-amber-950">
                02
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Routine</h3>
            </div>
            <p className="text-xs text-muted-foreground italic">Non-negotiable daily routines.</p>

            <div className="space-y-2">
              {routines.map((routine) => (
                <div key={routine.id} className="flex items-center gap-2 group">
                  <Checkbox
                    checked={routine.done}
                    onCheckedChange={() => toggleRoutine(routine.id)}
                  />
                  <span className={`flex-1 text-sm ${routine.done ? 'line-through text-muted-foreground' : ''}`}>
                    {routine.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeRoutine(routine.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  value={newRoutine}
                  onChange={(e) => setNewRoutine(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addRoutine()}
                  placeholder="Add a routine..."
                  className="h-8 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0"
                  onClick={addRoutine}
                  disabled={!newRoutine.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* 03 | Friction */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded dark:text-amber-400 dark:bg-amber-950">
                03
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Friction</h3>
            </div>
            <p className="text-xs text-muted-foreground italic">What obstacle am I clearing today?</p>
            <Textarea
              value={friction}
              onChange={(e) => setFriction(e.target.value)}
              placeholder="Today's obstacle and how you'll clear it..."
              rows={2}
              className="resize-none"
            />
          </div>

          <Separator />

          {/* 04 | Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded dark:text-amber-400 dark:bg-amber-950">
                04
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Status</h3>
            </div>
            <button
              onClick={() => setCommitted(!committed)}
              className={`flex items-center gap-3 w-full rounded-lg border-2 p-4 transition-all cursor-pointer ${
                committed
                  ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              {committed ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground shrink-0" />
              )}
              <div className="text-left">
                <p className="text-sm font-medium">Commit to system</p>
                <p className="text-xs text-muted-foreground">
                  {committed ? 'You have committed to today\'s pulse.' : 'Mark as committed when ready.'}
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Past Entries */}
      {entries.filter((e) => e.date !== currentDate).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground">Past Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2 pr-4">
                {entries
                  .filter((e) => e.date !== currentDate)
                  .slice(0, 10)
                  .map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => setCurrentDate(entry.date)}
                      className="flex items-center gap-3 w-full text-left rounded-lg p-3 transition-colors hover:bg-muted/50 cursor-pointer"
                    >
                      {entry.committed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{formatDate(entry.date)}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {entry.focus || 'No focus set'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {parseRoutines(entry.routines).filter((r: Routine) => r.done).length}/
                        {parseRoutines(entry.routines).length}
                      </Badge>
                    </button>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}