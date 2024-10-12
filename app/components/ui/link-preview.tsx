import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

interface LinkPreviewProps {
  href: string;
  children: React.ReactNode;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({ href, children }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
          {children}
        </a>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <iframe src={href} className="w-full h-40 border-none rounded-md" />
      </PopoverContent>
    </Popover>
  );
};
