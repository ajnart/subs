import { LockKeyIcon, StackIcon } from '@phosphor-icons/react'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useState } from 'react'
import { DotPattern } from '@/components/magicui/dot-pattern'
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
      minLength={6}
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
    if (!/^\d{6}$/.test(pin)) {
      setError('Enter a six-digit PIN.')
      return
    }
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
    <main className="subs-auth relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-x-clip bg-background px-4 py-10">
      <DotPattern width={24} height={24} cr={0.75} className="opacity-60" />
      <div className="relative flex items-center gap-2 text-xl font-semibold">
        <StackIcon weight="fill" aria-hidden="true" className="text-primary" />
        subs
      </div>
      <Card className="relative w-full max-w-sm gap-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LockKeyIcon aria-hidden="true" className="size-4 text-muted-foreground" />
            {setup ? 'Create PIN' : 'Unlock Subs'}
          </CardTitle>
          <CardDescription>{setup ? 'Set up this installation.' : 'Enter your PIN to continue.'}</CardDescription>
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
                  <FieldDescription>From server logs or SUBS_SETUP_TOKEN.</FieldDescription>
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="pin">Six-digit PIN</FieldLabel>
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
          <Button className="w-full" form="auth-form" disabled={busy}>
            {busy ? 'Please wait…' : setup ? 'Create PIN' : 'Unlock Subs'}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
