"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SessionDebriefSchema } from "@/lib/schemas"
import { completeSession } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface DebriefFormProps {
    sessionId: string
}

export function DebriefForm({ sessionId }: DebriefFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof SessionDebriefSchema>>({
    resolver: zodResolver(SessionDebriefSchema),
    defaultValues: {
      q1_done: "",
      q2_compare: "",
      q3_bogged: "",
      q4_well: "",
      q5_takeaways: "",
    },
  })

  function onSubmit(values: z.infer<typeof SessionDebriefSchema>) {
    startTransition(() => {
      completeSession(sessionId, values).then((data) => {
        if (data?.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.error,
          })
        }
        if ((data as any)?.success) {
           toast({
            title: "Session Completed",
            description: "Great job!",
          })
          router.push('/dashboard')
        }
      })
    })
  }

  return (
    <Card className="max-w-2xl mx-auto my-10">
      <CardHeader>
        <CardTitle>Session Debrief</CardTitle>
        <CardDescription>Reflect on your work session.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="q1_done"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1. What did I get done this past session?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="q2_compare"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>2. How did this compare to my normal work output?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="q3_bogged"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>3. Did I get bogged down? Where?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="q4_well"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>4. What went well? How can I replicate this in the future?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="q5_takeaways"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>5. Any other takeaways? Lessons to share?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="w-full" disabled={isPending}>
              Complete Session
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
