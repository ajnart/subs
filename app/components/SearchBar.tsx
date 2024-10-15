import { Search } from 'lucide-react'
import type React from 'react'
import { Input } from '~/components/ui/input'

interface SearchBarProps {
  onSearch: (query: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  return (
    <div className="relative rounded-lg bg-card">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search subscriptions..."
        autoFocus
        className="pl-10 pr-4 py-2 w-full"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  )
}

export default SearchBar
