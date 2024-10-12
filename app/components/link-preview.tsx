import type React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

interface LinkPreviewProps {
  href: string
  children: React.ReactNode
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({ href, children }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">Preview</h4>
          <iframe title="Preview for the link" src={href} className="w-full h-40 border rounded" />
        </div>
      </PopoverContent>
    </Popover>
  )
}
