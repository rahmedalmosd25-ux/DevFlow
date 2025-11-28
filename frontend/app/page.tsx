import Header from "@/components/header"
import Hero from "@/components/hero"
import LatestEvents from "@/components/latest-events"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <LatestEvents />
    </main>
  )
}
