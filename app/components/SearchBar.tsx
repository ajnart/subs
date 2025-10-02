import { Search } from 'lucide-react'
import { forwardRef } from 'react'
import { Input } from '~/components/ui/input'

interface SearchBarProps {
  onSearch: (query: string) => void
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ onSearch }, ref) => {
  return (
    <div className="relative rounded-lg bg-card">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={ref}
        type="text"
        placeholder="Search subscriptions..."
        autoFocus
        className="pl-10 pr-4 py-2 w-full"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  )
})

SearchBar.displayName = 'SearchBar'

export default SearchBar
