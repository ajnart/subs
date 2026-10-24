import { LockKeyIcon, StackIcon } from '@phosphor-icons/react'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useEffect, useState } from 'react'
import { DotPattern } from '@/components/magicui/dot-pattern'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { api, errorMessage } from '@/lib/api'
import { playFeedback } from '@/lib/sounds'
import { Notice } from './shared'
import './auth.css'

function Pin({
  id,
  value,
  onChange,
  masked = false,
  autoFocus = false,
  invalid = false,
  disabled = false,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  masked?: boolean
  autoFocus?: boolean
  invalid?: boolean
  disabled?: boolean
}) {
  return (
    <InputOTP
      id={id}
      type={masked ? 'password' : 'text'}
      autoFocus={autoFocus}
      aria-invalid={invalid}
      disabled={disabled}
      containerClassName="subs-pin"
      maxLength={6}
      minLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      value={value}
      onChange={onChange}
      autoComplete="off"
      pasteTransformer={(pasted) => pasted.replace(/[\s-]/g, '')}
      required
    >
      <InputOTPGroup aria-hidden="true" className="subs-pin-group">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <InputOTPSlot key={index} index={index} masked={masked} aria-invalid={invalid} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}

export function Auth({
  setup,
  onSuccess,
  ready = true,
}: {
  setup: boolean
  onSuccess: () => Promise<void>
  ready?: boolean
}) {
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (ready) document.getElementById(setup ? 'setup-token' : 'pin')?.focus()
  }, [ready, setup])
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!/^\d{6}$/.test(pin)) {
      setError('Enter a six-digit PIN.')
      playFeedback('error')
      return
    }
    if (setup && pin !== confirm) {
      setError('The PINs do not match. Please try again.')
      playFeedback('error')
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
      playFeedback('confirm')
    } catch (cause) {
      setError(errorMessage(cause))
      playFeedback('error')
    } finally {
      setBusy(false)
    }
  }
  return (
    <main
      className="subs-auth relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-x-clip bg-background px-4 py-10"
      inert={!ready}
    >
      <DotPattern width={24} height={24} cr={0.75} className="opacity-60" />
      <div className="relative flex items-center gap-2 text-xl font-semibold">
        <StackIcon weight="fill" aria-hidden="true" className="text-primary" />
        subs
      </div>
      <Card className="subs-auth-card relative w-full max-w-md gap-7">
        <CardHeader className="justify-items-center gap-3 text-center">
          <span className="subs-auth-lock">
            <LockKeyIcon aria-hidden="true" weight="duotone" />
          </span>
          <CardTitle className="text-2xl tracking-tight">{setup ? 'Create PIN' : 'Unlock Subs'}</CardTitle>
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
                    autoFocus
                    disabled={busy}
                  />
                  <FieldDescription>From server logs or SUBS_SETUP_TOKEN.</FieldDescription>
                </Field>
              )}
              <Field className="items-center text-center" data-invalid={Boolean(error)}>
                <FieldLabel htmlFor="pin" className="justify-center">
                  Six-digit PIN
                </FieldLabel>
                <Pin
                  id="pin"
                  value={pin}
                  onChange={setPin}
                  masked={!setup}
                  autoFocus={!setup}
                  invalid={Boolean(error)}
                  disabled={busy}
                />
              </Field>
              {setup && (
                <Field className="items-center text-center" data-invalid={Boolean(error)}>
                  <FieldLabel htmlFor="confirm-pin" className="justify-center">
                    Confirm PIN
                  </FieldLabel>
                  <Pin
                    id="confirm-pin"
                    value={confirm}
                    onChange={setConfirm}
                    invalid={Boolean(error)}
                    disabled={busy}
                  />
                </Field>
              )}
              {error && <Notice title="Unable to unlock">{error}</Notice>}
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="h-11 w-full" form="auth-form" disabled={busy}>
            {busy ? 'Please wait…' : setup ? 'Create PIN' : 'Unlock Subs'}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
