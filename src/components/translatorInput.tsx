import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CornerDownLeft, Eraser, Volume2, Loader2 } from 'lucide-react'
import { TranslationMode } from '@/types/translator'
import { handleSpeak } from '@/lib/utils'

interface TranslatorInputProps {
  inputText: string
  setInputText: (text: string) => void
  characterCount: number
  maxInputLength: number
  translationMode: TranslationMode
  setTranslationMode: (mode: TranslationMode) => void
  handleTranslate: () => void
  handleClear: () => void
  isLoading: boolean
}

export const TranslatorInput: React.FC<TranslatorInputProps> = ({
  inputText,
  setInputText,
  characterCount,
  maxInputLength,
  translationMode,
  setTranslationMode,
  handleTranslate,
  handleClear,
  isLoading,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-950">
      <div className="relative">
        <Textarea
          placeholder="Masukkan teks dalam Bahasa Inggris..."
          className="min-h-[120px] w-full p-4 resize-y text-base border-gray-200 dark:border-gray-800 focus:ring-[#FF5B9E] focus:border-[#FF5B9E]"
          value={inputText}
          onChange={handleInputChange}
          maxLength={maxInputLength}
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          <span className="text-xs text-gray-500">
            {characterCount}/{maxInputLength}
          </span>
        </div>
      </div>

      {/* Translation mode selector */}
      <div className="mt-3 mb-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Mode Terjemahan
        </Label>
        <RadioGroup
          value={translationMode}
          onValueChange={(value) => setTranslationMode(value as TranslationMode)}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="simple"
              id="mode-simple"
              className="text-[#FF5B9E] border-[#FF5B9E]"
            />
            <Label htmlFor="mode-simple" className="cursor-pointer flex items-center gap-2">
              <span className="font-medium">Singkat</span>
              <span className="text-xs text-gray-500">(Terjemahan langsung)</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="detailed"
              id="mode-detailed"
              className="text-[#FF5B9E] border-[#FF5B9E]"
            />
            <Label htmlFor="mode-detailed" className="cursor-pointer flex items-center gap-2">
              <span className="font-medium">Detail</span>
              <span className="text-xs text-gray-500">(Dengan analisis mendalam)</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <Button
          onClick={handleTranslate}
          disabled={!inputText.trim() || isLoading}
          className="bg-gradient-to-r from-[#FF5B9E] to-[#FFBD83] text-white hover:opacity-90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menerjemahkan...
            </>
          ) : (
            <>
              Terjemahkan
              <CornerDownLeft className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleClear}
          disabled={!inputText}
          className="border-gray-200 dark:border-gray-800"
        >
          <Eraser className="mr-2 h-4 w-4" />
          Bersihkan
        </Button>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSpeak(inputText, 'en-US')}
                disabled={!inputText}
                className="rounded-full h-9 w-9"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dengar teks (English)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
