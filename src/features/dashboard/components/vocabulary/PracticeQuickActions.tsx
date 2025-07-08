'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { 
  Play, 
  BookOpen, 
  MessageSquare, 
  PenTool, 
  Volume2, 
  Shuffle,
  ChevronDown
} from 'lucide-react'

export function PracticeQuickActions() {
  const router = useRouter()

  const practiceTypes = [
    {
      id: 'flashcard',
      name: 'Flashcards',
      description: 'Classic card-based learning',
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      id: 'multiple_choice',
      name: 'Multiple Choice',
      description: 'Quiz-style questions',
      icon: MessageSquare,
      color: 'text-green-600',
    },
    {
      id: 'fill_blank',
      name: 'Fill in Blanks',
      description: 'Complete the sentences',
      icon: PenTool,
      color: 'text-purple-600',
    },
    {
      id: 'listening',
      name: 'Listening',
      description: 'Audio pronunciation practice',
      icon: Volume2,
      color: 'text-orange-600',
    },
    {
      id: 'mixed',
      name: 'Mixed Review',
      description: 'All practice types combined',
      icon: Shuffle,
      color: 'text-pink-600',
    },
  ]

  const handlePracticeType = (type: string) => {
    router.push(`/dashboard/practice?type=${type}`)
  }

  const handleQuickPractice = () => {
    router.push('/dashboard/practice')
  }

  return (
    <div className="flex items-center gap-2">
      {/* Quick Practice Button */}
      <Button size="sm" onClick={handleQuickPractice}>
        <Play className="h-4 w-4 mr-2" />
        Practice
      </Button>

      {/* Practice Type Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Practice Types</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {practiceTypes.map((type) => (
            <DropdownMenuItem
              key={type.id}
              onClick={() => handlePracticeType(type.id)}
              className="flex items-start gap-3 p-3"
            >
              <type.icon className={`h-4 w-4 mt-0.5 ${type.color}`} />
              <div className="flex-1">
                <div className="font-medium text-sm">{type.name}</div>
                <div className="text-xs text-neutral-500">{type.description}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
