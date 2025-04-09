import { useQuery } from '@tanstack/react-query'
import { Loader2, Search } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Icon = {
  value: string
  label: string
}

interface IconUrlInputProps {
  value: string
  onChange: (value: string) => void
  id?: string
  label?: string
  error?: boolean
  placeholder?: string
}

export function IconUrlInput({
  value,
  onChange,
  id = 'icon',
  label = 'Icon URL',
  error = false,
  placeholder = 'Enter icon URL or search',
}: IconUrlInputProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const { data: icons, isLoading } = useQuery({
    queryKey: ['Icons'],
    queryFn: async () => {
      const response = await fetch('/api/icons')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
  })

  const options = React.useMemo(
    () =>
      icons?.icons.map((icon: string) => ({
        label: icon,
        value: `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/${icon}.png`,
      })) || [],
    [icons],
  )

  const filteredIcons = React.useMemo(
    () =>
      searchQuery === ''
        ? options
        : options.filter((icon: Icon) =>
            icon.label.toLowerCase().replace(/\s+/g, '').includes(searchQuery.toLowerCase().replace(/\s+/g, '')),
          ),
    [options, searchQuery],
  )

  const handleSelect = (icon: Icon) => {
    onChange(icon.value)
    setOpen(false)
  }

  // Preview the current icon if it's a valid URL
  const isValidIconUrl = React.useMemo(() => {
    if (!value) return false
    try {
      return Boolean(new URL(value))
    } catch {
      return false
    }
  }, [value])

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={error ? 'border-red-500' : ''}
          />
        </div>

        <Button type="button" variant="outline" size="icon" onClick={() => setOpen(true)} title="Search for icons">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search icons</span>
        </Button>

        {isValidIconUrl && (
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border bg-background">
            <img
              src={value}
              alt="Icon preview"
              className="h-6 w-6 object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlLW9mZiI+PHBhdGggZD0iTTE4IDExdl0iLz48cGF0aCBkPSJtOS41IDE3LjVMNiAxNCIvPjxwYXRoIGQ9Im0xNCA2LTQuNSA0LjUiLz48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iMiIvPjxwb2x5Z29uIHBvaW50cz0iMTYgMTEgMTMgMTQgMTYgMTcgMTkgMTQiLz48cGF0aCBkPSM2IDIgSCAxOGM1IDAgNSA4IDAgOCIvPjxwYXRoIGQ9Ik0zIDEzLjJBOC4xIDguMSAwIDAgMCA4IDIyIi8+PHBhdGggZD0iTTIxIDl2OGEyIDIgMCAwIDEtMiAyaC04Ii8+PC9zdmc+'
              }}
            />
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogTitle>Select Icon</DialogTitle>

          <div className="relative my-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
              autoFocus
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredIcons.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <Search className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-center text-muted-foreground">No icons found. Try a different search term.</p>
            </div>
          ) : (
            <div className="grid h-[450px] grid-cols-8 gap-3 overflow-y-auto">
              {filteredIcons.map((icon: Icon) => (
                <button
                  key={icon.value}
                  onClick={() => handleSelect(icon)}
                  type="button"
                  aria-label={`Select ${icon.label} icon`}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-md p-2 transition-colors hover:bg-accent ${
                    value === icon.value ? 'bg-accent' : ''
                  }`}
                >
                  <img src={icon.value} alt={icon.label} width={32} height={32} />
                  <span className="mt-1 max-w-full truncate text-xs">{icon.label}</span>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
