import { ArrowRightIcon, LockKeyIcon, StackIcon } from '@phosphor-icons/react'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { api, errorMessage } from '@/lib/api'
import { Notice } from './shared'

function Pin({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <InputOTP
      id={id}
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      value={value}
      onChange={onChange}
      autoComplete="off"
      required
    >
      <InputOTPGroup>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}

export function Auth({ setup, onSuccess }: { setup: boolean; onSuccess: () => Promise<void> }) {
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (setup && pin !== confirm) {
      setError('The PINs do not match. Please try again.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await api(setup ? '/setup' : '/login', {
        method: 'POST',
        body: JSON.stringify({ pin, ...(setup && { setupToken: token }) }),
      })
      await onSuccess()
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted/30 px-5 py-12">
      <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <StackIcon weight="fill" className="text-primary" />
        subs<span className="text-primary">.</span>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-muted">
            <LockKeyIcon className="size-5" />
          </div>
          <CardTitle>{setup ? 'A little setup. A lot of clarity.' : 'Welcome back.'}</CardTitle>
          <CardDescription>
            {setup
              ? 'Create your private subscription space. Your six-digit PIN keeps your spending yours.'
              : 'Unlock your subscriptions and pick up where you left off.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="auth-form" onSubmit={submit}>
            <FieldGroup>
              {setup && (
                <Field>
                  <FieldLabel htmlFor="setup-token">Operator setup token</FieldLabel>
                  <Input
                    id="setup-token"
                    type="password"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    required
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Find this in the server logs or SUBS_SETUP_TOKEN environment setting.
                  </FieldDescription>
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="pin">{setup ? 'Choose a six-digit PIN' : 'Your six-digit PIN'}</FieldLabel>
                <Pin id="pin" value={pin} onChange={setPin} />
              </Field>
              {setup && (
                <Field data-invalid={Boolean(error)}>
                  <FieldLabel htmlFor="confirm-pin">Confirm PIN</FieldLabel>
                  <Pin id="confirm-pin" value={confirm} onChange={setConfirm} />
                </Field>
              )}
              {error && <Notice title="Unable to unlock">{error}</Notice>}
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            form="auth-form"
            disabled={busy || pin.length !== 6 || (setup && (confirm.length !== 6 || !token))}
          >
            {busy ? 'Please wait…' : setup ? 'Create my space' : 'Unlock Subs'}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </CardFooter>
      </Card>
      <p className="text-xs text-muted-foreground">Self-hosted. No tracking. Just your subscriptions.</p>
    </main>
  )
}
