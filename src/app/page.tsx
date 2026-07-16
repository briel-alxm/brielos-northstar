'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Atrium } from '@/components/brielos/atrium'
import { Gallery } from '@/components/brielos/gallery'
import { Corridor } from '@/components/brielos/corridor'
import { Flame, GalleryHorizontalEnd, Footprints } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  const [activeTab, setActiveTab] = useState('atrium')

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">B</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight leading-none">BrielOS</h1>
                <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Goal Tracker</p>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="atrium" className="gap-1.5 text-xs sm:text-sm">
                <Flame className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Atrium</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-1.5 text-xs sm:text-sm">
                <GalleryHorizontalEnd className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Gallery</span>
              </TabsTrigger>
              <TabsTrigger value="corridor" className="gap-1.5 text-xs sm:text-sm">
                <Footprints className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Corridor</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="atrium">
              <Atrium />
            </TabsContent>

            <TabsContent value="gallery">
              <Gallery />
            </TabsContent>

            <TabsContent value="corridor">
              <Corridor />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-center text-xs text-muted-foreground">
            BrielOS — High-level clarity, zero-friction maintenance.
          </p>
        </div>
      </footer>
    </div>
  )
}