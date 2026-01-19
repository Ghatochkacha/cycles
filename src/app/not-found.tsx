import Link from 'next/link'
import { Button } from '@/components/ui/button'
 
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">
        <Button variant="outline">Return Home</Button>
      </Link>
    </div>
  )
}
