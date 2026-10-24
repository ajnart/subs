import { DownloadSimpleIcon, FloppyDiskIcon, ShieldCheckIcon, UploadSimpleIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { api, collectionApi, errorMessage, isRevisionConflict, revisionHeaders } from '@/lib/api'
import { mergeImportTargets } from '@/lib/import'
import { MAX_BACKUP_BYTES } from '@/lib/limits'
import { isDemo } from '@/lib/mode'
import type { AppData, ImportMatch, ImportPreview, Preferences, Subscription } from '@/lib/types'
import { Choice, currencies, Notice } from './shared'

type ImportState = {
  data: unknown
  preview: ImportPreview
  legacy: boolean
  revision: string
  rows: { key: string; subscription: Subscription; matches: ImportMatch[] }[]
}

export function Settings({
  preferences,
  onSave,
  onReview,
  revision,
  authDisabled,
  onLock,
}: {
  preferences: Preferences
  onSave: (preferences: Preferences, revision: string | null) => Promise<string>
  onReview: () => Promise<{ data: AppData; revision: string }>
  revision: string | null
  authDisabled: boolean
  onLock: () => Promise<void>
}) {
  const [currency, setCurrency] = useState(preferences.currency)
  const [budget, setBudget] = useState(String(preferences.monthlyBudget))
  const [theme, setTheme] = useState(preferences.theme)
  const [busy, setBusy] = useState(false)
  const [draftRevision, setDraftRevision] = useState(revision)
  const [preferencesConflict, setPreferencesConflict] = useState(false)
  const [preferencesReview, setPreferencesReview] = useState<{ preferences: Preferences; revision: string } | null>(
    null,
  )
  const [importConflict, setImportConflict] = useState(false)
  const [error, setError] = useState('')
  const [legacy, setLegacy] = useState(false)
  const [importing, setImporting] = useState<ImportState | null>(null)
  const [mode, setMode] = useState('skip')
  const [confirmed, setConfirmed] = useState(false)
  const [clearLegacy, setClearLegacy] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  let mergeError = ''
  if (importing && mode === 'merge') {
    try {
      mergeImportTargets(importing.preview)
    } catch (cause) {
      mergeError = errorMessage(cause)
    }
  }
  useEffect(() => {
    if (isDemo) return
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        if (localStorage.key(index) === 'subscription-storage') {
          setLegacy(true)
          break
        }
      }
    } catch (cause) {
      setError(`Browser storage is unavailable: ${errorMessage(cause)}`)
    }
  }, [])
  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    if (preferencesConflict) return
    setBusy(true)
    setError('')
    try {
      const savedRevision = await onSave({ currency, monthlyBudget: Number(budget), theme }, draftRevision)
      setDraftRevision(savedRevision)
      toast.success('Preferences saved')
    } catch (cause) {
      setError(errorMessage(cause))
      setPreferencesConflict(isRevisionConflict(cause))
    } finally {
      setBusy(false)
    }
  }
  const applyPreferences = (current: Preferences, currentRevision: string) => {
    setCurrency(current.currency)
    setBudget(String(current.monthlyBudget))
    setTheme(current.theme)
    setDraftRevision(currentRevision)
    setPreferencesReview(null)
    setPreferencesConflict(false)
    setError('')
  }
  const reviewPreferences = async () => {
    setBusy(true)
    try {
      const snapshot = await onReview()
      setPreferencesReview({ preferences: snapshot.data.preferences, revision: snapshot.revision })
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }
  const exportBackup = async () => {
    setBusy(true)
    setError('')
    try {
      const data = await api<unknown>('/export')
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `subs-backup-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success('Backup downloaded')
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }
  const preview = async (data: unknown, fromLegacy: boolean) => {
    const result = await collectionApi<ImportPreview>('/import/preview', {
      method: 'POST',
      body: JSON.stringify({ data }),
    })
    setMode('skip')
    setConfirmed(false)
    setClearLegacy(false)
    setImportConflict(false)
    const matches = new Map<number, ImportMatch[]>()
    for (const match of result.data.matches) {
      const candidates = matches.get(match.incomingIndex) ?? []
      candidates.push(match)
      matches.set(match.incomingIndex, candidates)
    }
    setImporting({
      data,
      preview: result.data,
      revision: result.revision,
      legacy: fromLegacy,
      rows: result.data.subscriptions.map((subscription, index) => ({
        key: `${subscription.id}-${index}`,
        subscription,
        matches: matches.get(index) ?? [],
      })),
    })
  }
  const readFile = async (selected?: File) => {
    if (!selected) return
    setBusy(true)
    setError('')
    try {
      if (selected.size > MAX_BACKUP_BYTES) throw new Error('Choose a JSON backup no larger than 2 MiB.')
      const data: unknown = JSON.parse(await selected.text())
      await preview(data, false)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy(false)
      if (file.current) file.current.value = ''
    }
  }
  const migrateLegacy = async () => {
    if (isDemo) return
    setBusy(true)
    setError('')
    try {
      const raw = localStorage.getItem('subscription-storage')
      if (!raw) throw new Error('No legacy subscriptions were found in this browser.')
      const data: Record<string, unknown> = { 'subscription-storage': raw }
      const savedPreferences = localStorage.getItem('preferences-storage')
      if (savedPreferences) data['preferences-storage'] = savedPreferences
      await preview(data, true)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }
  const importBackup = async () => {
    if (!importing || importConflict || mergeError) return
    setBusy(true)
    setError('')
    try {
      const result = await collectionApi<{ imported: number }>('/import', {
        method: 'POST',
        headers: revisionHeaders(importing.revision),
        body: JSON.stringify({ data: importing.data, mode }),
      })
      if (!isDemo && importing.legacy && clearLegacy) {
        try {
          localStorage.removeItem('subscription-storage')
          localStorage.removeItem('preferences-storage')
          setLegacy(false)
        } catch (cause) {
          toast.warning(`Imported, but the old browser copy could not be cleared: ${errorMessage(cause)}`)
        }
      }
      setImporting(null)
      toast.success(`Imported ${result.data.imported} subscriptions`)
      const snapshot = await onReview()
      applyPreferences(snapshot.data.preferences, snapshot.revision)
    } catch (cause) {
      setError(errorMessage(cause))
      setImportConflict(isRevisionConflict(cause))
    } finally {
      setBusy(false)
    }
  }
  const refreshPreview = async () => {
    if (!importing) return
    setBusy(true)
    setError('')
    try {
      await preview(importing.data, importing.legacy)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      {error && <Notice title="Action could not be completed">{error}</Notice>}
      {preferencesConflict && (
        <Notice title="Preferences changed while you were editing">
          <p>
            Your input is preserved and has not overwritten the server. Refresh the current preferences, review them,
            then explicitly load them before editing again.
          </p>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => void reviewPreferences()}>
            Refresh and review preferences
          </Button>
        </Notice>
      )}
      {preferencesReview && (
        <Notice title="Current server preferences">
          <p>
            Currency: {preferencesReview.preferences.currency}, monthly budget:{' '}
            {preferencesReview.preferences.monthlyBudget}, appearance: {preferencesReview.preferences.theme}
          </p>
          <p>Loading these preferences discards your unsaved settings draft.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreferences(preferencesReview.preferences, preferencesReview.revision)}
          >
            Load latest preferences
          </Button>
        </Notice>
      )}
      {!isDemo && legacy && (
        <Notice title="An older Subs collection is on this browser">
          <p>Browser data is read only when you preview it.</p>
          <Button variant="outline" size="sm" onClick={() => void migrateLegacy()} disabled={busy}>
            Read and preview browser collection
          </Button>
        </Notice>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Currency, budget and appearance.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="preferences-form" onSubmit={save}>
            <FieldGroup>
              <FieldGroup className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="display-currency">Display currency</FieldLabel>
                  <Input
                    id="display-currency"
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                    maxLength={3}
                    minLength={3}
                    list="settings-currencies"
                    required
                  />
                  <datalist id="settings-currencies">
                    {currencies.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                  <FieldDescription>Original prices stay unchanged.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="monthly-budget">Monthly budget</FieldLabel>
                  <Input
                    id="monthly-budget"
                    type="number"
                    min="0"
                    max="1000000000"
                    step="any"
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    required
                  />
                  <FieldDescription>In {currency}. Use 0 for no budget.</FieldDescription>
                </Field>
              </FieldGroup>
              <Field>
                <FieldLabel>Appearance</FieldLabel>
                <ToggleGroup
                  type="single"
                  value={theme}
                  variant="outline"
                  onValueChange={(value) => {
                    if (value === 'system' || value === 'light' || value === 'dark') setTheme(value)
                  }}
                  aria-label="Appearance"
                >
                  <ToggleGroupItem value="light">Light</ToggleGroupItem>
                  <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
                  <ToggleGroupItem value="system">System</ToggleGroupItem>
                </ToggleGroup>
                <FieldDescription>Applied when saved.</FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button form="preferences-form" disabled={busy || preferencesConflict}>
            <FloppyDiskIcon data-icon="inline-start" />
            {busy ? 'Saving…' : 'Save preferences'}
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Backups</CardTitle>
          <CardDescription>JSON import and export.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => void exportBackup()} disabled={busy}>
              <DownloadSimpleIcon data-icon="inline-start" />
              Export backup
            </Button>
            <Button id="backup-import" variant="outline" onClick={() => file.current?.click()} disabled={busy}>
              <UploadSimpleIcon data-icon="inline-start" />
              Import backup
            </Button>
            <input
              ref={file}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Choose backup file"
              onChange={(event) => void readFile(event.target.files?.[0])}
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Includes subscriptions and preferences, not PINs or recorded price history. Imports require a preview.
          </p>
        </CardContent>
      </Card>
      {!isDemo && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {authDisabled
                ? 'Authentication is disabled by your server operator. Anyone who can reach this server can access your collection.'
                : 'PIN protection is enabled.'}
            </p>
          </CardContent>
          {!authDisabled && (
            <CardFooter>
              <Button variant="outline" onClick={() => void onLock()} disabled={busy}>
                Lock this session
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
      {importing && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open && !busy) setImporting(null)
          }}
        >
          <DialogContent className="max-h-[90svh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Import preview</DialogTitle>
              <DialogDescription>Review your backup. No changes have been made yet.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Badge variant="secondary">{importing.preview.subscriptions.length} subscriptions</Badge>
                <Badge variant="outline">{importing.preview.duplicates} duplicates</Badge>
              </div>
              <div className="max-h-40 overflow-y-auto rounded-md border p-3">
                {importing.rows.map(({ key, subscription: item, matches }) => (
                  <div key={key} className="flex flex-col gap-1 py-2 text-sm">
                    <p>
                      {item.name}{' '}
                      <span className="text-muted-foreground">
                        {item.currency} {item.price} / {item.billingCycle}
                      </span>
                    </p>
                    {matches.map((match) => (
                      <p key={match.existingId} className="text-xs text-muted-foreground">
                        Matches <strong className="font-medium text-foreground">{match.existingName}</strong>
                        {match.reason === 'id' ? ' by ID' : ' by service'}
                        {match.conflict && ' — conflicting target'}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              {importing.preview.warnings.length > 0 && (
                <Notice title="Import notes">
                  <ul className="list-inside list-disc">
                    {[...new Set(importing.preview.warnings)].map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </Notice>
              )}
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="import-mode">How should duplicates be handled?</FieldLabel>
                  <Choice
                    id="import-mode"
                    label="Import mode"
                    value={mode}
                    onChange={(value) => {
                      setMode(value)
                      setConfirmed(false)
                    }}
                    options={['skip', 'new', 'merge', 'replace']}
                    optionLabels={{ new: 'Add as new' }}
                  />
                  <FieldDescription>
                    Skip keeps existing records. Add as new keeps both copies. Merge updates matching records. Replace
                    deletes your entire current collection before importing.
                  </FieldDescription>
                </Field>
                {mode === 'replace' && (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="confirm-replace"
                      checked={confirmed}
                      onCheckedChange={(value) => setConfirmed(value === true)}
                    />
                    <FieldLabel htmlFor="confirm-replace">I understand this replaces my entire collection.</FieldLabel>
                  </Field>
                )}
                {!isDemo && importing.legacy && (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="clear-legacy"
                      checked={clearLegacy}
                      onCheckedChange={(value) => setClearLegacy(value === true)}
                    />
                    <FieldLabel htmlFor="clear-legacy">
                      Remove the old browser copy after a successful import.
                    </FieldLabel>
                  </Field>
                )}
              </FieldGroup>
              {mergeError && <Notice title="Choose a different import mode">{mergeError}</Notice>}
              {error && <Notice>{error}</Notice>}
              {importConflict && (
                <Notice title="This import preview is out of date">
                  <p>
                    The collection changed after your preview. Nothing was imported. Refresh the preview and review
                    duplicates and warnings again before confirming.
                  </p>
                  <Button variant="outline" size="sm" disabled={busy} onClick={() => void refreshPreview()}>
                    Refresh import preview
                  </Button>
                </Notice>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setImporting(null)} disabled={busy}>
                Cancel
              </Button>
              <Button
                onClick={() => void importBackup()}
                disabled={busy || importConflict || Boolean(mergeError) || (mode === 'replace' && !confirmed)}
              >
                {busy ? 'Importing…' : 'Confirm import'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
