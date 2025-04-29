import React from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { formatContent } from '@/lib/utils'

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
        isHighlighted ? 'border-[#FF5B9E]' : 'border-gray-200 dark:border-gray-800'
      }`}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-md ${
              isHighlighted
                ? 'bg-[#FF5B9E]/10 text-[#FF5B9E]'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}
          >
            {icon}
          </div>
          <span className="font-medium text-sm">{title}</span>
        </div>
        <ChevronDown
          className={`h-5 w-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="p-4" dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
      </CollapsibleContent>
    </Collapsible>
  )
}
