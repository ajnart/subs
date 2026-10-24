import {
  ArrowClockwiseIcon,
  ArrowUpRightIcon,
  CalendarDotsIcon,
  ChartBarIcon,
  CheckCircleIcon,
  GearSixIcon,
  HouseIcon,
  KeyboardIcon,
  LockKeyIcon,
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
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useSubs } from '@/hooks/use-subs'
import { useTheme } from '@/hooks/use-theme'
import { api, errorMessage, isRevisionConflict } from '@/lib/api'
import { convertAmount, monthlyAmount } from '@/lib/subscriptions'
import { templates } from '@/lib/templates'
import type { Subscription, SubscriptionInput } from '@/lib/types'
import { Auth } from './auth'
import { CalendarView } from './calendar-view'
import { Insights } from './insights'
import { Overview, Summary } from './overview'
import { Settings } from './settings'
import { Notice, ServiceMark } from './shared'
import { SubscriptionForm } from './subscription-form'

type Page = 'Overview' | 'Calendar' | 'Insights' | 'Settings'
type Editor =
  | { kind: 'new'; template?: (typeof templates)[number] }
  | { kind: 'edit'; subscription: Subscription }
  | null
const navigation = [
  { name: 'Overview', icon: HouseIcon },
  { name: 'Calendar', icon: CalendarDotsIcon },
  { name: 'Insights', icon: ChartBarIcon },
  { name: 'Settings', icon: GearSixIcon },
] as const
const descriptions: Record<Page, string> = {
  Overview: 'A clear view of what you pay for. And what’s coming next.',
  Calendar: 'No surprises. See your recurring payments, one month at a time.',
  Insights: 'Small recurring charges. A bigger picture worth knowing.',
  Settings: 'A few thoughtful defaults, and complete control of your data.',
}

export function SubsApp() {
  const store = useSubs()
  const [page, setPage] = useState<Page>('Overview')
  const [editor, setEditor] = useState<Editor>(null)
  const [starters, setStarters] = useState(false)
  const [shortcuts, setShortcuts] = useState(false)
  const [deleting, setDeleting] = useState<string[]>([])
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteConflict, setDeleteConflict] = useState(false)
  const deletionRevision = useRef<string | null>(null)
  const [locking, setLocking] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  useTheme(store.data?.preferences.theme)
  const unlocked = Boolean(store.data && (store.status?.authenticated || store.status?.authDisabled))
  useEffect(() => {
    if (!unlocked) {
      setEditor(null)
      setStarters(false)
      setDeleting([])
    }
  }, [unlocked])
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        !unlocked ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        editor ||
        starters ||
        shortcuts ||
        deleting.length
      )
        return
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.closest('input, textarea, select, [role="combobox"], [role="dialog"]'))
      )
        return
      if (event.key === 'a' || event.key === 'n') {
        event.preventDefault()
        setEditor({ kind: 'new' })
      }
      if (event.key === '/') {
        event.preventDefault()
        setPage('Overview')
        setTimeout(() => searchRef.current?.focus(), 0)
      }
      if (event.key === '?') {
        event.preventDefault()
        setShortcuts(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [unlocked, editor, starters, shortcuts, deleting.length])
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
    toast.success('Selected subscriptions paused')
  }
  const confirmDelete = async () => {
    if (deleteConflict) return
    setDeleteBusy(true)
    setDeleteError('')
    let remaining: string[] = []
    for (const [index, id] of deleting.entries()) {
      try {
        deletionRevision.current = await store.remove(id, deletionRevision.current)
      } catch (cause) {
        remaining = deleting.slice(index)
        setDeleteError(errorMessage(cause))
        setDeleteConflict(isRevisionConflict(cause))
        break
      }
    }
    if (!remaining.length) {
      setDeleting([])
      setEditor(null)
      toast.success('Subscriptions deleted')
    } else setDeleting(remaining)
    setDeleteBusy(false)
  }
  const requestDelete = (ids: string[], revision = store.revision) => {
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
          <Notice title="Could not connect to your server">
            <p>{store.error}</p>
            <Button variant="outline" onClick={() => void store.refresh()}>
              Try again
            </Button>
          </Notice>
        ) : (
          <>
            <p className="sr-only" role="status">
              Loading your space
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
    return <Auth setup={store.status.setupRequired} onSuccess={store.refresh} />
  if (!store.data)
    return (
      <main className="mx-auto max-w-xl p-8">
        <Notice title="Could not load your collection">
          <p>{store.error || 'The server did not return your data.'}</p>
          <Button variant="outline" onClick={() => void store.refresh()}>
            Try again
          </Button>
        </Notice>
      </main>
    )
  const { subscriptions, preferences } = store.data
  const missing = subscriptions.some(
    (item) =>
      item.status === 'active' &&
      convertAmount(monthlyAmount(item), item.currency, preferences.currency, store.rates) === null,
  )
  const save = async (input: SubscriptionInput, id?: string, revision?: string | null) => {
    await store.save(input, id, revision)
  }
  return (
    <div className="min-h-svh bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r bg-sidebar p-5 text-sidebar-foreground md:flex">
        <a
          href="/"
          aria-label="Subs home"
          className="mb-12 flex items-center gap-2 px-2 text-2xl font-bold tracking-tight"
        >
          <StackIcon weight="fill" className="size-7 text-primary" />
          subs<span className="-ml-2 text-primary">.</span>
        </a>
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Your workspace
        </p>
        <nav aria-label="Main navigation" className="flex flex-col gap-1">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant={page === item.name ? 'secondary' : 'ghost'}
              onClick={() => setPage(item.name)}
              aria-current={page === item.name ? 'page' : undefined}
              className="justify-start"
            >
              <item.icon weight={page === item.name ? 'fill' : 'regular'} data-icon="inline-start" />
              {item.name}
            </Button>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-md border bg-background p-4">
            <CheckCircleIcon className="size-5 text-primary" />
            <p className="text-xs font-medium">Less noise. More clarity.</p>
            <p className="text-xs leading-relaxed text-muted-foreground">A little awareness goes a long way.</p>
          </div>
          <Button variant="ghost" size="sm" className="justify-start" onClick={() => setShortcuts(true)}>
            <KeyboardIcon data-icon="inline-start" />
            Keyboard shortcuts<kbd className="ml-auto text-xs text-muted-foreground">?</kbd>
          </Button>
          {!store.status.authDisabled && (
            <Button variant="ghost" size="sm" className="justify-start" onClick={() => void lock()} disabled={locking}>
              <LockKeyIcon data-icon="inline-start" />
              {locking ? 'Locking…' : 'Lock workspace'}
            </Button>
          )}
          <Separator />
          <p className="px-2 text-[10px] text-muted-foreground">YOUR SUBSCRIPTIONS, SIMPLIFIED.</p>
        </div>
      </aside>
      <div className="md:pl-56">
        <header className="flex flex-col border-b md:hidden">
          <div className="flex items-center justify-between gap-3 p-4">
            <a href="/" className="flex items-center gap-2 text-xl font-bold">
              <StackIcon weight="fill" className="text-primary" />
              subs.
            </a>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" aria-label="Keyboard shortcuts" onClick={() => setShortcuts(true)}>
                <KeyboardIcon />
              </Button>
              {!store.status.authDisabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Lock workspace"
                  onClick={() => void lock()}
                  disabled={locking}
                >
                  <LockKeyIcon />
                </Button>
              )}
            </div>
          </div>
          <nav aria-label="Mobile navigation" className="grid grid-cols-4 gap-1 px-2 pb-2">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={page === item.name ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setPage(item.name)}
                aria-current={page === item.name ? 'page' : undefined}
                className="gap-1 px-1 text-xs"
              >
                <item.icon data-icon="inline-start" />
                {item.name}
              </Button>
            ))}
          </nav>
        </header>
        <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-7 sm:px-8 md:py-10 lg:px-12">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Workspace</span>
                <span>/</span>
                <span className="text-foreground">{page}</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {page === 'Overview' ? 'Everything, in perspective.' : page}
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground">{descriptions[page]}</p>
            </div>
            <Button onClick={() => setEditor({ kind: 'new' })}>
              <PlusIcon data-icon="inline-start" />
              Add subscription<kbd className="ml-2 hidden text-[10px] opacity-70 lg:inline">N</kbd>
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
          {missing && (
            <Notice title="Some currencies cannot be converted">
              Exchange rates are unavailable for part of your collection. Summary totals are partial; original
              subscription prices are still shown accurately.
            </Notice>
          )}
          {store.rates?.stale && (
            <Notice title={store.rates.updatedAt ? 'Using saved exchange rates' : 'Exchange rates unavailable'}>
              {store.rates.updatedAt
                ? 'Your exchange rates may be out of date. Estimates can differ from your actual charges.'
                : 'Converted totals are unavailable for mixed currencies. Original-currency amounts remain accurate.'}
            </Notice>
          )}
          {page !== 'Settings' && (
            <Summary subscriptions={subscriptions} currency={preferences.currency} rates={store.rates} />
          )}
          {page === 'Overview' && (
            <Overview
              subscriptions={subscriptions}
              currency={preferences.currency}
              rates={store.rates}
              onAdd={() => setEditor({ kind: 'new' })}
              onTemplates={() => setStarters(true)}
              onEdit={(subscription) => setEditor({ kind: 'edit', subscription })}
              onDelete={requestDelete}
              onPause={pause}
              searchRef={searchRef}
            />
          )}
          {page === 'Calendar' && (
            <CalendarView
              subscriptions={subscriptions}
              onEdit={(subscription) => setEditor({ kind: 'edit', subscription })}
            />
          )}
          {page === 'Insights' && <Insights data={store.data} rates={store.rates} />}
          {page === 'Settings' && (
            <Settings
              preferences={preferences}
              onSave={store.preferences}
              onReview={store.review}
              revision={store.revision}
              authDisabled={store.status.authDisabled}
              onLock={lock}
            />
          )}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-xs text-muted-foreground">
            <span>
              Thoughtfully tracked. Entirely yours.
              {store.rates?.updatedAt && ` · FX: Frankfurter, ${new Date(store.rates.updatedAt).toLocaleDateString()}`}
            </span>
            <Button variant="ghost" size="sm" onClick={() => void store.refresh()} disabled={store.loading}>
              <ArrowClockwiseIcon data-icon="inline-start" />
              {store.loading ? 'Refreshing…' : 'Refresh'}
            </Button>
          </footer>
        </main>
      </div>
      {editor && (
        <SubscriptionForm
          currency={preferences.currency}
          subscription={editor.kind === 'edit' ? editor.subscription : undefined}
          template={editor.kind === 'new' ? editor.template : undefined}
          onClose={() => setEditor(null)}
          onSave={save}
          revision={store.revision}
          onReview={store.review}
          onDelete={(id, revision) => {
            setEditor(null)
            requestDelete([id], revision)
          }}
        />
      )}
      {starters && (
        <Dialog open onOpenChange={setStarters}>
          <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>A familiar place to start</DialogTitle>
              <DialogDescription>
                Choose a service. You’ll add your own price and plan details. Nothing is added until you save.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 sm:grid-cols-2">
              {templates.map((item) => (
                <Button
                  key={item.name}
                  variant="outline"
                  className="h-auto justify-start gap-3 py-3"
                  onClick={() => {
                    setStarters(false)
                    setEditor({ kind: 'new', template: item })
                  }}
                >
                  <ServiceMark name={item.name} />
                  <span className="min-w-0 truncate">{item.name}</span>
                  <ArrowUpRightIcon data-icon="inline-end" className="ml-auto" />
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
      {shortcuts && (
        <Dialog open onOpenChange={setShortcuts}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>A little faster</DialogTitle>
              <DialogDescription>Shortcuts work when you’re not typing in a field.</DialogDescription>
            </DialogHeader>
            <dl className="flex flex-col gap-4">
              {[
                ['N or A', 'Add subscription'],
                ['/', 'Search subscriptions'],
                ['?', 'Show keyboard shortcuts'],
                ['Esc', 'Close dialog'],
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
          if (!open && !deleteBusy) setDeleting([])
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
                    await store.refresh()
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
