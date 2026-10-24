import {
  ArrowClockwiseIcon,
  ArrowUpRightIcon,
  CalendarDotsIcon,
  ChartBarIcon,
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useSubs } from '@/hooks/use-subs'
import { useTheme } from '@/hooks/use-theme'
import { api, errorMessage, isRevisionConflict } from '@/lib/api'
import { isDemo } from '@/lib/mode'
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
const resetDemo = () => window.dispatchEvent(new Event('subs:demo-reset'))

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
    return <Auth setup={store.status.setupRequired} onSuccess={store.refresh} />
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
  const missing = subscriptions.some(
    (item) =>
      item.status === 'active' &&
      convertAmount(monthlyAmount(item), item.currency, preferences.currency, store.rates) === null,
  )
  const save = async (input: SubscriptionInput, id?: string, revision?: string | null) => {
    await store.save(input, id, revision)
  }
  return (
    <div className="subs-app min-h-svh bg-background">
      <a href="#main" className="subs-skip">
        Skip to content
      </a>
      <header className="border-b bg-background/95">
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
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={page === item.name ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setPage(item.name)}
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
                    setEditor(null)
                    setDeleting([])
                    setPage('Overview')
                    window.dispatchEvent(new Event('subs:demo-reset'))
                  }}
                >
                  Reset demo
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Refresh"
              title="Refresh"
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
        <main id="main" className="subs-container flex flex-col gap-7 py-7 sm:py-10">
          <div className="flex items-center justify-between gap-3">
            <h1 className="min-w-0 break-words text-2xl font-semibold tracking-tight">
              {page === 'Overview' ? 'Subscriptions' : page}
            </h1>
            <Button aria-label="Add subscription" onClick={() => setEditor({ kind: 'new' })}>
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
          {missing && (
            <Notice title="Some currencies cannot be converted">
              Converted estimates are partial. Native-currency totals are shown below.
            </Notice>
          )}
          {store.rates?.stale && !missing && !isDemo && (
            <Notice title={store.rates.updatedAt ? 'Using saved exchange rates' : 'Exchange rates unavailable'}>
              {store.rates.updatedAt
                ? 'Converted estimates use older rates.'
                : 'Native-currency totals are shown without conversion.'}
            </Notice>
          )}
          {page !== 'Settings' && subscriptions.length > 0 && (
            <Summary subscriptions={subscriptions} currency={preferences.currency} rates={store.rates} />
          )}
          {page === 'Overview' && (
            <Overview
              subscriptions={subscriptions}
              currency={preferences.currency}
              rates={store.rates}
              onAdd={() => setEditor({ kind: 'new' })}
              onTemplates={() => setStarters(true)}
              onTemplate={(template) => setEditor({ kind: 'new', template })}
              onImport={() => {
                setPage('Settings')
                setTimeout(() => document.getElementById('backup-import')?.click(), 0)
              }}
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
              <DialogTitle>Choose a service</DialogTitle>
              <DialogDescription>Add your own plan and price.</DialogDescription>
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
              <DialogTitle>Keyboard shortcuts</DialogTitle>
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
