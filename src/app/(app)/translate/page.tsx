import { Navbar } from '@/components/organisms'
import Translator from '@/features/translation/components/translator'

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Translator />
      </main>
    </>
  )
}
