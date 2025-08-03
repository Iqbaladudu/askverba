'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Download, 
  FileText, 
  Settings, 
  Info, 
  CheckCircle,
  AlertCircle,
  Copy
} from 'lucide-react'
import { toast } from 'sonner'

interface AnkiExportModalProps {
  isOpen: boolean
  onClose: () => void
  totalWords: number
}

interface ExportOptions {
  format: 'csv' | 'txt'
  includeDefinition: boolean
  includeExample: boolean
  includePronunciation: boolean
  includeTags: boolean
  deckName: string
  cardType: 'basic' | 'basic-reverse' | 'cloze'
}

export function AnkiExportModal({ isOpen, onClose, totalWords }: AnkiExportModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    includeDefinition: true,
    includeExample: true,
    includePronunciation: true,
    includeTags: true,
    deckName: 'AskVerba Vocabulary',
    cardType: 'basic',
  })
  
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<{
    content: string
    instructions: string
    filename: string
  } | null>(null)

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/vocabulary/export/anki', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const result = await response.json()
      
      if (result.success) {
        setExportResult(result.data)
        toast.success(`Successfully exported ${result.data.totalCards} cards!`)
      } else {
        throw new Error(result.error || 'Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export vocabulary')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownload = () => {
    if (!exportResult) return

    const blob = new Blob([exportResult.content], { 
      type: options.format === 'csv' ? 'text/csv' : 'text/plain' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportResult.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('File downloaded successfully!')
  }

  const handleCopyInstructions = () => {
    if (!exportResult) return
    
    navigator.clipboard.writeText(exportResult.instructions)
    toast.success('Instructions copied to clipboard!')
  }

  const handleReset = () => {
    setExportResult(null)
  }

  if (exportResult) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Export Complete
            </DialogTitle>
            <DialogDescription>
              Your vocabulary has been successfully exported to Anki format.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Download Section */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <h3 className="font-medium text-green-800">Ready to Download</h3>
                <p className="text-sm text-green-600">
                  {exportResult.filename} • {options.format.toUpperCase()} format
                </p>
              </div>
              <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-neutral-800">Import Instructions</h3>
                <Button variant="outline" size="sm" onClick={handleCopyInstructions}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={exportResult.instructions}
                readOnly
                className="h-40 text-sm font-mono"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Export Again
              </Button>
              <Button onClick={onClose} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            Export to Anki
          </DialogTitle>
          <DialogDescription>
            Export your vocabulary collection to Anki flashcard format.
            <Badge variant="secondary" className="ml-2">
              {totalWords} words available
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <Select
              value={options.format}
              onValueChange={(value: 'csv' | 'txt') => handleOptionChange('format', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Recommended)</SelectItem>
                <SelectItem value="txt">TXT (Tab-separated)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Card Type</Label>
            <Select
              value={options.cardType}
              onValueChange={(value: 'basic' | 'basic-reverse' | 'cloze') => 
                handleOptionChange('cardType', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (Front → Back)</SelectItem>
                <SelectItem value="basic-reverse">Basic + Reverse (Both directions)</SelectItem>
                <SelectItem value="cloze">Cloze (Fill in the blank)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deck Name */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Deck Name</Label>
            <Input
              value={options.deckName}
              onChange={(e) => handleOptionChange('deckName', e.target.value)}
              placeholder="Enter deck name"
            />
          </div>

          {/* Include Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Include in Export</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Definition</Label>
                  <p className="text-xs text-neutral-500">Add word definitions to cards</p>
                </div>
                <Switch
                  checked={options.includeDefinition}
                  onCheckedChange={(checked) => handleOptionChange('includeDefinition', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Example Sentences</Label>
                  <p className="text-xs text-neutral-500">Include example usage</p>
                </div>
                <Switch
                  checked={options.includeExample}
                  onCheckedChange={(checked) => handleOptionChange('includeExample', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Pronunciation</Label>
                  <p className="text-xs text-neutral-500">Add pronunciation guides</p>
                </div>
                <Switch
                  checked={options.includePronunciation}
                  onCheckedChange={(checked) => handleOptionChange('includePronunciation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Tags</Label>
                  <p className="text-xs text-neutral-500">Include difficulty and custom tags</p>
                </div>
                <Switch
                  checked={options.includeTags}
                  onCheckedChange={(checked) => handleOptionChange('includeTags', checked)}
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How to import into Anki:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Download the exported file</li>
                  <li>Open Anki and go to File → Import</li>
                  <li>Select your downloaded file</li>
                  <li>Configure field mapping and import</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export to Anki
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
