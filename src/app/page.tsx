import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Cycles</h1>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/auth/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>

      <div className="mt-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">Master Your Work Cycles</h2>
        <p className="max-w-xl mx-auto text-muted-foreground">
          Transform your productivity with structured work cycles. 
          Plan, Execute, Review, and Debrief.
        </p>
      </div>
    </main>
  )
}