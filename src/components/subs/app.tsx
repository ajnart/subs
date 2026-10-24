import {
  ArrowClockwiseIcon,
  CalendarDotsIcon,
  ChartBarIcon,
  GearSixIcon,
  HouseIcon,
  KeyboardIcon,
  LockKeyIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  StackIcon,
} from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useKeyboard } from '@/hooks/use-keyboard'
import { useSubs } from '@/hooks/use-subs'
import { useTheme } from '@/hooks/use-theme'
import { api, errorMessage, isRevisionConflict } from '@/lib/api'
import { isDemo } from '@/lib/mode'
import { playFeedback, useInteractionFeedback } from '@/lib/sounds'
import type { templates } from '@/lib/templates'
import type { Subscription, SubscriptionInput } from '@/lib/types'
import { transitionView } from '@/lib/view-transitions'
import '@/styles/keyboard.css'
import { Auth } from './auth'
import { CalendarView } from './calendar-view'
import { type AppPage, CommandPalette } from './command-palette'
import { Insights } from './insights'
import { Overview, Summary } from './overview'
import { QuickSetup, type QuickSetupSeed } from './quick-setup'
import { ReminderController } from './reminders'
import { Settings } from './settings'
import { Notice } from './shared'
import { SoundToggle } from './sound-toggle'
import { SubscriptionForm } from './subscription-form'

type Editor =
  | { kind: 'new'; revision: string | null; opening: number }
  | { kind: 'edit'; subscription: Subscription; revision: string | null; opening: number }
  | { kind: 'quick-setup'; initialDraft?: QuickSetupSeed; revision: string | null; opening: number }
  | null
const navigation = [
  { name: 'Overview', icon: HouseIcon },
  { name: 'Calendar', icon: CalendarDotsIcon },
  { name: 'Insights', icon: ChartBarIcon },
  { name: 'Settings', icon: GearSixIcon },
] as const
const resetDemo = () => window.dispatchEvent(new Event('subs:demo-reset'))

export function SubsApp() {
  const store = useSubs()
  const [hydrated, setHydrated] = useState(false)
  const [page, setPage] = useState<AppPage>('Overview')
  const requestedPage = useRef<AppPage>('Overview')
  const [editor, setEditor] = useState<Editor>(null)
  const dialogOpening = useRef(0)
  const mounted = useRef(false)
  const [shortcuts, setShortcuts] = useState(false)
  const [command, setCommand] = useState(false)
  const [deleting, setDeleting] = useState<string[]>([])
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteConflict, setDeleteConflict] = useState(false)
  const deletionRevision = useRef<string | null>(null)
  const deletionOpening = useRef(0)
  const [locking, setLocking] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  useTheme(store.data?.preferences.theme)
  useInteractionFeedback()
  useEffect(() => setHydrated(true), [])
  const unlocked = Boolean(store.data && (store.status?.authenticated || store.status?.authDisabled))
  useEffect(() => {
    mounted.current = true
    const closeDialogs = () => {
      dialogOpening.current += 1
      setEditor(null)
      setDeleting([])
      setDeleteBusy(false)
      setShortcuts(false)
      setCommand(false)
    }
    if (!unlocked) closeDialogs()
    window.addEventListener('subs:locked', closeDialogs)
    window.addEventListener('subs:demo-reset', closeDialogs)
    return () => {
      mounted.current = false
      dialogOpening.current += 1
      window.removeEventListener('subs:locked', closeDialogs)
      window.removeEventListener('subs:demo-reset', closeDialogs)
    }
  }, [unlocked])
  const isCurrentDialog = (opening: number) => mounted.current && dialogOpening.current === opening
  const closeEditor = (opening: number) => {
    if (!isCurrentDialog(opening)) return
    dialogOpening.current += 1
    setEditor(null)
  }
  const navigate = (next: AppPage, after?: () => void) => {
    if (next === page && next === requestedPage.current) {
      after?.()
      return
    }
    requestedPage.current = next
    playFeedback('navigate')
    transitionView(() => {
      setPage(next)
      if (after) setTimeout(after, 0)
    })
  }
  const add = () => {
    if (!unlocked) return
    setEditor({ kind: 'new', revision: store.revision, opening: ++dialogOpening.current })
  }
  const edit = (subscription: Subscription) => {
    if (!unlocked) return
    setEditor({ kind: 'edit', subscription, revision: store.revision, opening: ++dialogOpening.current })
  }
  const openQuickSetup = (initialDraft?: QuickSetupSeed, revision = store.revision) => {
    if (!unlocked) return
    setEditor({ kind: 'quick-setup', initialDraft, revision, opening: ++dialogOpening.current })
  }
  const chooseServices = () => openQuickSetup()
  const chooseTemplate = (template: (typeof templates)[number]) => {
    if (!store.data) return
    openQuickSetup({
      input: {
        ...template,
        price: 0,
        currency: store.data.preferences.currency,
        billingCycle: 'monthly',
        nextPaymentDate: '',
        status: 'active',
        trialEndsAt: null,
        notes: '',
      },
      price: '',
    })
  }
  const editCurrent = (id: string) => {
    const subscription = store.data?.subscriptions.find((item) => item.id === id)
    if (subscription) edit(subscription)
    else toast.error('This subscription is no longer in your collection.')
  }
  const importBackup = () => {
    navigate('Settings', () => document.getElementById('backup-import')?.click())
  }
  const focusSearch = () => {
    navigate('Overview', () => {
      const tools = searchRef.current?.closest('details')
      if (tools) tools.open = true
      searchRef.current?.focus()
    })
  }
  const hints = useKeyboard({
    enabled: hydrated && unlocked,
    modal: Boolean(editor || shortcuts || command || deleting.length),
    commandOpen: command,
    onCommand: () => setCommand((open) => !open),
    actions: [
      { key: 'n', run: add },
      { key: 'a', run: add },
      { key: '/', run: focusSearch },
      { key: '?', run: () => setShortcuts(true) },
      ...navigation.map((item, index) => ({ key: `mod+${index + 1}`, run: () => navigate(item.name) })),
      { key: 'mod+,', run: () => navigate('Settings') },
      { key: 't', run: chooseServices },
      { key: 'i', run: importBackup },
      {
        key: 'r',
        run: () => {
          if (!store.loading) void store.refresh()
        },
      },
      {
        key: 'l',
        run: () => {
          if (!store.status?.authDisabled && !locking) void lock()
        },
      },
    ],
  })
  const lock = async () => {
    setLocking(true)
    try {
      await api('/logout', { method: 'POST' })
      window.dispatchEvent(new Event('subs:locked'))
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setLocking(false)
    }
  }
  const pause = async (ids: string[]) => {
    if (!store.data) return
    let paused = 0
    let expectedRevision = store.revision
    for (const id of ids) {
      try {
        expectedRevision = await store.save({ status: 'paused' }, id, expectedRevision)
        paused += 1
      } catch (cause) {
        toast.error(
          `${paused} paused; ${ids.length - paused} not changed. ${errorMessage(cause)} Refresh to review before trying again.`,
        )
        return
      }
    }
  }
  const confirmDelete = async () => {
    const opening = deletionOpening.current
    if (deleteConflict || deleteBusy || !isCurrentDialog(opening)) return
    setDeleteBusy(true)
    setDeleteError('')
    let remaining: string[] = []
    for (const [index, id] of deleting.entries()) {
      try {
        const revision = await store.remove(id, deletionRevision.current)
        if (!isCurrentDialog(opening)) return
        deletionRevision.current = revision
      } catch (cause) {
        if (!isCurrentDialog(opening)) return
        remaining = deleting.slice(index)
        setDeleteError(errorMessage(cause))
        setDeleteConflict(isRevisionConflict(cause))
        break
      }
    }
    if (!remaining.length) {
      dialogOpening.current += 1
      setDeleting([])
    } else setDeleting(remaining)
    setDeleteBusy(false)
  }
  const requestDelete = (ids: string[], revision = store.revision) => {
    deletionOpening.current = ++dialogOpening.current
    setEditor(null)
    setDeleteBusy(false)
    setDeleteError('')
    setDeleteConflict(false)
    deletionRevision.current = revision
    setDeleting(ids)
  }
  if (!store.status || (!store.data && store.loading))
    return (
      <main className="mx-auto flex min-h-svh max-w-5xl flex-col gap-8 p-8">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <StackIcon className="text-primary" />
          subs.
        </div>
        {store.error ? (
          <Notice title={isDemo ? 'Could not load demo' : 'Could not connect to your server'}>
            <p>{store.error}</p>
            <Button variant="outline" onClick={() => void store.refresh()}>
              Try again
            </Button>
            {isDemo && (
              <Button variant="outline" onClick={resetDemo}>
                Reset demo
              </Button>
            )}
          </Notice>
        ) : (
          <>
            <p className="sr-only" role="status">
              Loading subscriptions
            </p>
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-28 w-full" />
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-48 w-full" />
              ))}
            </div>
          </>
        )}
      </main>
    )
  if (!store.status.authenticated && !store.status.authDisabled)
    return <Auth setup={store.status.setupRequired} onSuccess={store.refresh} ready={hydrated} />
  if (!store.data)
    return (
      <main className="mx-auto max-w-xl p-8">
        <Notice title="Could not load your collection">
          <p>{store.error || 'The server did not return your data.'}</p>
          <Button variant="outline" onClick={() => void store.refresh()}>
            Try again
          </Button>
          {isDemo && (
            <Button variant="outline" onClick={resetDemo}>
              Reset demo
            </Button>
          )}
        </Notice>
      </main>
    )
  const { subscriptions, preferences } = store.data
  const save = async (opening: number, input: SubscriptionInput, id: string | undefined, revision: string | null) => {
    try {
      await store.save(input, id, revision)
      if (isCurrentDialog(opening)) playFeedback('confirm')
    } catch (cause) {
      if (isCurrentDialog(opening)) playFeedback('error')
      throw cause
    }
  }
  const saveBatch = async (opening: number, inputs: SubscriptionInput[], revision: string | null) => {
    try {
      await store.saveBatch(inputs, revision)
      if (!isCurrentDialog(opening)) return
      playFeedback('confirm')
      toast.success('Subscriptions saved.')
      closeEditor(opening)
    } catch (cause) {
      if (isCurrentDialog(opening)) playFeedback('error')
      throw cause
    }
  }
  return (
    <div
      className="subs-app min-h-svh bg-background"
      data-keyboard-hints={hints}
      data-hydrated={hydrated}
      inert={!hydrated}
    >
      <ReminderController subscriptions={subscriptions} />
      <a href="#main" className="subs-skip">
        Skip to content
      </a>
      <header className="subs-header border-b bg-background/95">
        <div className="subs-container flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:gap-x-8">
          <a
            href="/"
            aria-label="Subs home"
            className="subs-wordmark flex shrink-0 items-center gap-2 text-xl font-semibold"
          >
            <StackIcon weight="fill" aria-hidden="true" className="size-6 text-primary" />
            subs
          </a>
          <nav
            aria-label="Main navigation"
            className="order-3 flex min-w-0 w-full items-center gap-1 sm:order-none sm:w-auto"
          >
            {navigation.map((item, index) => (
              <Button
                key={item.name}
                variant={page === item.name ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => navigate(item.name)}
                data-keyhint={`⌘/Ctrl ${index + 1}`}
                aria-keyshortcuts={`Meta+${index + 1} Control+${index + 1}`}
                aria-current={page === item.name ? 'page' : undefined}
                className="min-w-0 flex-1 gap-1 px-1.5 text-xs sm:flex-none sm:px-2.5 sm:text-sm"
              >
                <item.icon
                  weight={page === item.name ? 'fill' : 'regular'}
                  data-icon="inline-start"
                  className="hidden min-[400px]:inline-block"
                />
                {item.name}
              </Button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            {isDemo && (
              <>
                <Badge variant="outline">Demo</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate('Overview')
                    window.dispatchEvent(new Event('subs:demo-reset'))
                  }}
                >
                  Reset demo
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              aria-label="Search commands and subscriptions"
              aria-keyshortcuts="Meta+k Control+k"
              title="Search commands and subscriptions (⌘/Ctrl K)"
              data-keyhint="⌘/Ctrl K"
              onClick={() => setCommand(true)}
            >
              <MagnifyingGlassIcon data-icon="inline-start" />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden text-xs text-muted-foreground lg:inline">⌘/Ctrl K</kbd>
            </Button>
            <SoundToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Refresh"
              title="Refresh"
              data-keyhint="R"
              aria-keyshortcuts="r"
              onClick={() => void store.refresh()}
              disabled={store.loading}
            >
              <ArrowClockwiseIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
              data-keyhint="?"
              aria-keyshortcuts="Shift+/"
              onClick={() => setShortcuts(true)}
              className="hidden sm:inline-flex"
            >
              <KeyboardIcon />
            </Button>
            {!store.status.authDisabled && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Lock workspace"
                title="Lock workspace"
                data-keyhint="L"
                aria-keyshortcuts="l"
                onClick={() => void lock()}
                disabled={locking}
              >
                <LockKeyIcon />
              </Button>
            )}
          </div>
        </div>
      </header>
      <div>
        <main id="main" tabIndex={-1} className="subs-page subs-container flex flex-col gap-7 py-7 sm:py-10">
          <div className="flex items-center justify-between gap-3">
            <h1 className="min-w-0 break-words text-2xl font-semibold tracking-tight">
              {page === 'Overview' ? 'Subscriptions' : page}
            </h1>
            <Button aria-label="Add subscription" data-keyhint="N / A" aria-keyshortcuts="n a" onClick={add}>
              <PlusIcon data-icon="inline-start" />
              <span className="hidden sm:inline">Add subscription</span>
              <span className="sm:hidden">Add</span>
              <kbd className="ml-2 hidden text-xs opacity-70 lg:inline">N</kbd>
            </Button>
          </div>
          {store.error && (
            <Notice title="Could not refresh">
              <p>{store.error}</p>
              <Button variant="outline" size="sm" onClick={() => void store.refresh()}>
                Retry
              </Button>
            </Notice>
          )}
          {(page === 'Calendar' || page === 'Insights') && subscriptions.length > 0 && (
            <Summary subscriptions={subscriptions} currency={preferences.currency} rates={store.rates} />
          )}
          {page === 'Overview' && (
            <Overview
              subscriptions={subscriptions}
              currency={preferences.currency}
              rates={store.rates}
              onAdd={add}
              onTemplates={chooseServices}
              onTemplate={chooseTemplate}
              onImport={importBackup}
              onEdit={edit}
              onDelete={requestDelete}
              onPause={pause}
              searchRef={searchRef}
            />
          )}
          {page === 'Calendar' && <CalendarView subscriptions={subscriptions} onEdit={edit} />}
          {page === 'Insights' && <Insights data={store.data} rates={store.rates} />}
          {page === 'Settings' && (
            <Settings
              subscriptions={subscriptions}
              preferences={preferences}
              onSave={store.preferences}
              onReview={store.review}
              revision={store.revision}
              authDisabled={store.status.authDisabled}
              onLock={lock}
            />
          )}
        </main>
      </div>
      <CommandPalette
        open={command}
        onOpenChange={setCommand}
        subscriptions={subscriptions}
        onNavigate={navigate}
        onAdd={add}
        onTemplates={chooseServices}
        onTemplate={chooseTemplate}
        onRefresh={() => void store.refresh()}
        refreshing={store.loading}
        onLock={store.status.authDisabled ? undefined : () => void lock()}
        locking={locking}
        onImport={importBackup}
        onShortcuts={() => setShortcuts(true)}
        onEdit={editCurrent}
      />
      {editor && editor.kind !== 'quick-setup' && (
        <SubscriptionForm
          key={editor.opening}
          currency={preferences.currency}
          subscription={editor.kind === 'edit' ? editor.subscription : undefined}
          onClose={() => closeEditor(editor.opening)}
          onSave={(input, id, revision = editor.revision) => save(editor.opening, input, id, revision)}
          revision={editor.revision}
          onReview={store.review}
          onQuickSetup={
            editor.kind === 'new'
              ? (draft: QuickSetupSeed | undefined, revision: string | null) => {
                  if (isCurrentDialog(editor.opening)) openQuickSetup(draft, revision)
                }
              : undefined
          }
          onDelete={(id, revision) => {
            if (isCurrentDialog(editor.opening)) requestDelete([id], revision)
          }}
        />
      )}
      {editor?.kind === 'quick-setup' && (
        <QuickSetup
          key={editor.opening}
          currency={preferences.currency}
          subscriptions={subscriptions}
          revision={editor.revision}
          initialDraft={editor.initialDraft}
          onClose={() => closeEditor(editor.opening)}
          onSave={(inputs: SubscriptionInput[], revision: string | null) => saveBatch(editor.opening, inputs, revision)}
          onReview={store.review}
        />
      )}
      {shortcuts && (
        <Dialog open onOpenChange={setShortcuts}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keyboard shortcuts</DialogTitle>
              <DialogDescription>Shortcuts work when you’re not typing in a field.</DialogDescription>
            </DialogHeader>
            <dl className="flex flex-col gap-4">
              {[
                ['⌘ / Ctrl K', 'Search commands and subscriptions'],
                ['⌘ / Ctrl 1–4', 'Navigate pages'],
                ['T', 'Quick setup: add several subscriptions'],
                ['I', 'Import backup'],
                ['R', 'Refresh collection'],
                ...(!store.status.authDisabled ? [['L', 'Lock collection']] : []),
                ['N or A', 'Add subscription'],
                ['/', 'Search subscriptions'],
                ['↑ ↓ ← → / J K', 'Move between subscriptions'],
                ['Enter', 'Manage focused subscription'],
                ['Space', 'Select focused subscription when available'],
                ['?', 'Show keyboard shortcuts'],
                ['Esc', 'Close dialog'],
                ['Hold ⌘ or Ctrl', 'Reveal keyboard hints'],
              ].map(([key, description]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <dt className="text-sm">{description}</dt>
                  <dd>
                    <kbd className="rounded border bg-muted px-2 py-1 text-xs">{key}</kbd>
                  </dd>
                </div>
              ))}
            </dl>
          </DialogContent>
        </Dialog>
      )}
      <AlertDialog
        open={deleting.length > 0}
        onOpenChange={(open) => {
          if (!open && !deleteBusy) {
            dialogOpening.current += 1
            setDeleting([])
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleting.length === 1 ? 'this subscription' : `${deleting.length} subscriptions`}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the selected records from Subs. It does not cancel your plans with the service
              providers. Export a backup first if you might need these records later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <Notice title="Some records could not be deleted">
              <p>
                {deleteError}{' '}
                {deleteConflict
                  ? 'The collection changed. Refresh and select the records again before confirming deletion.'
                  : 'You can retry the remaining records.'}
              </p>
              {deleteConflict && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const opening = deletionOpening.current
                    await store.refresh()
                    if (!isCurrentDialog(opening)) return
                    dialogOpening.current += 1
                    setDeleting([])
                  }}
                >
                  Refresh collection and choose again
                </Button>
              )}
            </Notice>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Keep subscriptions</AlertDialogCancel>
            <Button variant="destructive" onClick={() => void confirmDelete()} disabled={deleteBusy || deleteConflict}>
              {deleteBusy ? 'Deleting…' : 'Delete permanently'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
