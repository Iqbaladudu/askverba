import { TranslationInterface } from '@/components/dashboard/TranslationInterface'
import { DashboardHistory } from '@/components/dashboard/DashboardHistory'

export const metadata = {
  title: 'Translation | AskVerba',
  description: 'Translate text with AskVerba',
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Main Translation Interface - Primary Focus */}
      <div className="max-w-5xl mx-auto">
        <TranslationInterface />
      </div>

      {/* History Section - Secondary Content */}
      <DashboardHistory />
    </div>
  )
}
