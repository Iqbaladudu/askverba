'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ClipboardCopy, Volume2, Check } from 'lucide-react'
import { handleCopy, handleSpeak } from '@/lib/utils'

interface OutputActionsProps {
  textToCopy: string
  textToSpeak: string
  speakLang?: string
  copyTooltip?: string
  speakTooltip?: string
}

export const OutputActions: React.FC<OutputActionsProps> = ({
  textToCopy,
  textToSpeak,
  speakLang = 'id-ID',
  copyTooltip = 'Salin',
  speakTooltip = 'Dengar',
}) => {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    const success = await handleCopy(textToCopy)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const onSpeak = () => {
    handleSpeak(textToSpeak, speakLang)
  }

  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onCopy}>
              {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? 'Disalin!' : copyTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onSpeak}
              disabled={!textToSpeak}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{speakTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
