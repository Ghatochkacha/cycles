"use client"

import { useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SessionPrepareSchema } from "@/lib/schemas"
import { createSession } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function PrepareForm() {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof SessionPrepareSchema>>({
    resolver: zodResolver(SessionPrepareSchema),
    defaultValues: {
      cycleDurationMinutes: 30,
      breakDurationMinutes: 10,
      totalCycles: 3,
      q1_accomplish: "",
      q2_importance: "",
      q3_completion: "",
      q4_hazards: "",
      q5_concrete: "",
      q6_noteworthy: "",
    },
  })

  function onSubmit(values: z.infer<typeof SessionPrepareSchema>) {
    startTransition(() => {
      createSession(values).then((data) => {
        if (data?.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.error,
          })
        }
        if ((data as any)?.sessionId) {
          toast({
            title: "Session Created",
            description: "Let's get started!",
          })
          // Redirect to Cycle 1 Plan
          router.push(`/session/${(data as any).sessionId}/work/cycle/1`)
        }
      })
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        form.handleSubmit(onSubmit)()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Session Settings</CardTitle>
            <CardDescription>Configure your work cycles.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="cycleDurationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cycle Duration (min)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="breakDurationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Break Duration (min)</FormLabel>
                  <FormControl>
                     <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalCycles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Cycles</FormLabel>
                  <FormControl>
                     <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preparation</CardTitle>
            <CardDescription>Answer these questions to set your intention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="q1_accomplish"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1. What am I trying to accomplish?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Define your main goal..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="q2_importance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>2. Why is this important and valuable?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Connect with the purpose..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="q3_completion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>3. How will I know this is complete?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Definition of done..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="q4_hazards"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>4. Any risks/hazards? (Optional)</FormLabel>
                  <FormDescription>Potential distractions, procrastination, etc.</FormDescription>
                  <FormControl>
                    <Textarea placeholder="Identify obstacles..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="q5_concrete"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>5. Is this concrete/measurable or subjective/ambiguous?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Clarify the nature of the task..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="q6_noteworthy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>6. Anything else noteworthy? (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional context..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" className="w-full" disabled={isPending}>
              {isPending ? "Starting Session..." : "Start Session"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
