import { Navbar } from '@/components/common'
import Translator from '@/components/translation/translator'

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
