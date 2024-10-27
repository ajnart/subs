import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

type Icon = {
  value: string
  label: string
}

interface IconSelectorProps {
  onIconSelect: (icon: Icon) => void
}

export function IconSelector({ onIconSelect }: IconSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedIcon, setSelectedIcon] = React.useState<Icon | null>(null)
  const [query, setQuery] = React.useState('')

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

  const options: Icon[] = React.useMemo(
    () =>
      icons?.icons.map((icon: string) => ({
        label: icon,
        value: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/${icon}.svg`,
      })) || [],
    [icons],
  )

  const filteredIcons = React.useMemo(
    () =>
      query === ''
        ? options
        : options.filter((icon) =>
            icon.label.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, '')),
          ),
    [options, query],
  )

  const handleSelect = (icon: Icon) => {
    setSelectedIcon(icon)
    onIconSelect(icon)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selectedIcon ? (
            <>
              <img src={selectedIcon.value} alt={selectedIcon.label} width={20} height={20} />
              <span className="ml-2">{selectedIcon.label}</span>
            </>
          ) : (
            'Select an icon...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Command>
          <CommandInput placeholder="Search icons..." onValueChange={(value) => setQuery(value)} />
          <CommandEmpty>
            <div className="flex flex-col items-center py-6">
              <Search className="h-10 w-10 text-muted-foreground" />
              <p className="text-center text-sm text-muted-foreground mt-2">
                No icons found. Try a different search term.
              </p>
            </div>
          </CommandEmpty>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <CommandGroup>
                {filteredIcons.slice(0, 10).map((icon) => (
                  <CommandItem key={icon.value} onSelect={() => handleSelect(icon)} className="flex items-center py-2">
                    <img src={icon.value} alt={icon.label} width={24} height={24} className="mr-2" />
                    <span>{icon.label}</span>
                    {selectedIcon?.value === icon.value && <Check className="ml-auto h-4 w-4 opacity-100" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
