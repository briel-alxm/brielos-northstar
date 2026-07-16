'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { GalleryHorizontalEnd, Plus, Trash2, GripVertical, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Milestone {
  id: string
  order: number
  title: string
  description: string
  completed: boolean
}

export function Gallery() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchMilestones = useCallback(async () => {
    try {
      const res = await fetch('/api/milestones')
      const data = await res.json()
      setMilestones(data)
    } catch (err) {
      console.error('Failed to fetch milestones', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMilestones()
  }, [fetchMilestones])

  const completedCount = milestones.filter((m) => m.completed).length
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0

  const handleToggle = async (id: string) => {
    const updated = milestones.map((m) =>
      m.id === id ? { ...m, completed: !m.completed } : m
    )
    setMilestones(updated)
    try {
      await fetch('/api/milestones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated.map((m) => ({ id: m.id, completed: m.completed, order: m.order }))),
      })
    } catch (err) {
      console.error('Failed to update', err)
      fetchMilestones()
    }
  }

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim() }),
      })
      const data = await res.json()
      setMilestones([...milestones, data])
      setNewTitle('')
      setNewDesc('')
      setAdding(false)
    } catch (err) {
      console.error('Failed to add milestone', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const updated = milestones.filter((m) => m.id !== id).map((m, i) => ({ ...m, order: i }))
    setMilestones(updated)
    try {
      await fetch(`/api/milestones?id=${id}`, { method: 'DELETE' })
      // Reorder remaining
      await fetch('/api/milestones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated.map((m) => ({ id: m.id, order: m.order }))),
      })
    } catch (err) {
      console.error('Failed to delete', err)
      fetchMilestones()
    }
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const arr = [...milestones]
    ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
    const updated = arr.map((m, i) => ({ ...m, order: i }))
    setMilestones(updated)
    fetch('/api/milestones', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated.map((m) => ({ id: m.id, order: m.order }))),
    }).catch(() => fetchMilestones())
  }

  const handleMoveDown = (index: number) => {
    if (index === milestones.length - 1) return
    const arr = [...milestones]
    ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
    const updated = arr.map((m, i) => ({ ...m, order: i }))
    setMilestones(updated)
    fetch('/api/milestones', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated.map((m) => ({ id: m.id, order: m.order }))),
    }).catch(() => fetchMilestones())
  }

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
          <GalleryHorizontalEnd className="h-4 w-4" />
          The Gallery
        </motion.div>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Milestones</h2>
        <p className="text-muted-foreground text-sm">
          The intermediate architecture — your Project Issues map to reach the Atrium.
        </p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedCount} / {milestones.length} completed
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2 text-right">{progressPercent}%</p>
        </CardContent>
      </Card>

      {/* Milestones List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <GalleryHorizontalEnd className="h-5 w-5 text-amber-500" />
              milestones.md
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdding(!adding)}
              className="gap-1"
            >
              {adding ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {adding ? 'Cancel' : 'Add'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Add Form */}
          <AnimatePresence>
            {adding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 p-4 space-y-3 dark:border-amber-800 dark:bg-amber-950/20">
                  <Input
                    placeholder="Milestone title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    autoFocus
                  />
                  <Input
                    placeholder="Brief description (optional)"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAdd} disabled={saving || !newTitle.trim()} size="sm" className="gap-1">
                      <Plus className="h-3 w-3" />
                      {saving ? 'Adding...' : 'Add Milestone'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Separator />

          {/* Milestone Items */}
          <div className="max-h-[500px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {milestones.length === 0 && !adding && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                <p>No milestones yet.</p>
                <p className="mt-1">Click &quot;Add&quot; to create your first milestone.</p>
              </div>
            )}

            <AnimatePresence>
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.02 }}
                  className={`group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50 ${
                    milestone.completed ? 'opacity-60' : ''
                  }`}
                >
                  <GripVertical className="h-4 w-4 mt-1 text-muted-foreground/40 shrink-0 cursor-grab" />

                  <Checkbox
                    checked={milestone.completed}
                    onCheckedChange={() => handleToggle(milestone.id)}
                    className="mt-0.5 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs text-muted-foreground tabular-nums shrink-0`}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className={`text-sm font-medium leading-tight ${milestone.completed ? 'line-through' : ''}`}>
                        {milestone.title}
                      </p>
                    </div>
                    {milestone.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 ml-7">{milestone.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <span className="text-xs">&#8593;</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === milestones.length - 1}
                    >
                      <span className="text-xs">&#8595;</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this milestone?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove &quot;{milestone.title}&quot;. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(milestone.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}