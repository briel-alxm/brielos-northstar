'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Target, Save, Pencil, Eye, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Manifesto {
  id: string
  goal: string
  purpose: string
  targetDate: string
  commitmentLevel: string
}

export function Atrium() {
  const [manifesto, setManifesto] = useState<Manifesto | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    goal: '',
    purpose: '',
    targetDate: '',
    commitmentLevel: 'Absolute',
  })

  const fetchManifesto = useCallback(async () => {
    try {
      const res = await fetch('/api/manifesto')
      const data = await res.json()
      setManifesto(data)
      setForm({
        goal: data.goal || '',
        purpose: data.purpose || '',
        targetDate: data.targetDate || '',
        commitmentLevel: data.commitmentLevel || 'Absolute',
      })
    } catch (err) {
      console.error('Failed to fetch manifesto', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchManifesto()
  }, [fetchManifesto])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/manifesto', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setManifesto(data)
      setEditing(false)
    } catch (err) {
      console.error('Failed to save manifesto', err)
    } finally {
      setSaving(false)
    }
  }

  const daysRemaining = manifesto?.targetDate
    ? Math.max(0, Math.ceil((new Date(manifesto.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

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
          <Flame className="h-4 w-4" />
          The Atrium
        </motion.div>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your North Star</h2>
        <p className="text-muted-foreground text-sm">
          This remains static and defines the &quot;Why&quot; — the big goal that anchors everything.
        </p>
      </div>

      {/* Manifesto Card */}
      <Card className="border-2 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-amber-500" />
              manifesto.yaml
            </CardTitle>
            <div className="flex items-center gap-2">
              {manifesto?.targetDate && (
                <Badge variant="secondary" className="text-xs font-normal">
                  {daysRemaining} days remaining
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (editing) {
                    setForm({
                      goal: manifesto?.goal || '',
                      purpose: manifesto?.purpose || '',
                      targetDate: manifesto?.targetDate || '',
                      commitmentLevel: manifesto?.commitmentLevel || 'Absolute',
                    })
                  }
                  setEditing(!editing)
                }}
              >
                {editing ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Goal</label>
                  <Input
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    placeholder="Define the Goal Here"
                    className="text-lg font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Purpose</label>
                  <Textarea
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="The 'Why' that survives the daily grind"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Date</label>
                    <Input
                      type="date"
                      value={form.targetDate}
                      onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Commitment Level</label>
                    <Input
                      value={form.commitmentLevel}
                      onChange={(e) => setForm({ ...form, commitmentLevel: e.target.value })}
                      placeholder="Absolute"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Manifesto'}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Goal</p>
                  <p className="text-xl sm:text-2xl font-semibold leading-tight">{manifesto?.goal || '—'}</p>
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Purpose</p>
                  <p className="text-muted-foreground leading-relaxed">{manifesto?.purpose || '—'}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Date</p>
                    <p className="font-medium">{manifesto?.targetDate || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Commitment</p>
                    <Badge variant="outline" className="mt-1">
                      {manifesto?.commitmentLevel || '—'}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}