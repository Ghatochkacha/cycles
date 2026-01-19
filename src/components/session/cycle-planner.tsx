"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CyclePlanSchema } from "@/lib/schemas"
import { saveCyclePlan } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface CyclePlannerProps {
  sessionId: string
  cycleNumber: number
  onComplete: (cycleId: string) => void
}

export function CyclePlanner({ sessionId, cycleNumber, onComplete }: CyclePlannerProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof CyclePlanSchema>>({
    resolver: zodResolver(CyclePlanSchema),
    defaultValues: {
      goal: "",
      howToStart: "",
      hazards: "",
      energyLevel: "medium",
      moraleLevel: "medium",
    },
  })

  function onSubmit(values: z.infer<typeof CyclePlanSchema>) {
    startTransition(() => {
      saveCyclePlan(sessionId, cycleNumber, values).then((data) => {
        if (data?.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.error,
          })
        }
        if ((data as any)?.success && (data as any).cycleId) {
          onComplete((data as any).cycleId)
        }
      })
    })
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Plan Cycle {cycleNumber}</CardTitle>
        <CardDescription>Set your intention for this work block.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What am I trying to accomplish this cycle?</FormLabel>
                  <FormControl>
                    <Input placeholder="Specific goal..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="howToStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How will I get started?</FormLabel>
                  <FormControl>
                    <Input placeholder="First step..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hazards"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Any hazards present? (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Distractions, fatigue..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="energyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Energy Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select energy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="moraleLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Morale Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select morale" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              Start Cycle
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
