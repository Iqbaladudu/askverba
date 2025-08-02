import React from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { formatContent } from '@/core/utils'

interface SectionProps {
  title: string
  content: string
  icon: React.ReactNode
  id: string
  isExpanded: boolean
  onToggle: (id: string) => void
  isHighlighted?: boolean
}

export const Section: React.FC<SectionProps> = ({
  title,
  content,
  icon,
  id,
  isExpanded,
  onToggle,
  isHighlighted = false,
}) => {
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => onToggle(id)}
      className={`mb-3 border rounded-lg overflow-hidden ${
        isHighlighted ? 'border-primary-500' : 'border-neutral-200 dark:border-neutral-800'
      }`}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-md ${
              isHighlighted
                ? 'bg-primary-500/10 text-primary-500'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
            }`}
          >
            {icon}
          </div>
          <span className="font-medium text-sm text-neutral-800 dark:text-neutral-200">
            {title}
          </span>
        </div>
        <ChevronDown
          className={`h-5 w-5 transition-transform text-neutral-500 dark:text-neutral-400 ${isExpanded ? 'transform rotate-180' : ''}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
        <div
          className="p-4 text-neutral-800 dark:text-neutral-200"
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
      </CollapsibleContent>
    </Collapsible>
  )
}
