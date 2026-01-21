"use client"

import { useTransition, useEffect, useState } from "react"
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
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

export function PrepareForm() {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  const [step, setStep] = useState(0)

  const steps = [
    { title: "Settings", description: "Configure your work cycles." },
    { title: "Goal", description: "What am I trying to accomplish?" },
    { title: "Importance", description: "Why is this important and valuable?" },
    { title: "Completion", description: "How will I know this is complete?" },
    { title: "Hazards", description: "Any risks or potential distractions?" },
    { title: "Clarity", description: "Is this concrete or subjective?" },
    { title: "Noteworthy", description: "Anything else noteworthy?" },
  ]

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
          router.push(`/session/${(data as any).sessionId}/work/cycle/1`)
        }
      })
    })
  }

  const nextStep = async () => {
    let isValid = false
    
    // Validate fields for current step
    switch(step) {
      case 0:
        isValid = await form.trigger(["cycleDurationMinutes", "breakDurationMinutes", "totalCycles"])
        break
      case 1:
        isValid = await form.trigger("q1_accomplish")
        break
      case 2:
        isValid = await form.trigger("q2_importance")
        break
      case 3:
        isValid = await form.trigger("q3_completion")
        break
      case 4:
        isValid = await form.trigger("q4_hazards")
        break
      case 5:
        isValid = await form.trigger("q5_concrete")
        break
      case 6:
        isValid = await form.trigger("q6_noteworthy")
        break
    }

    if (isValid) {
      if (step < steps.length - 1) {
        setStep(step + 1)
      } else {
        form.handleSubmit(onSubmit)()
      }
    }
  }

  const prevStep = () => {
    if (step > 0) setStep(step - 1)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Enter to go next (prevent default form submission unless it's textarea)
      if (e.key === 'Enter' && !e.shiftKey && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        nextStep()
      }
      
      // Cmd+Enter to submit on last step or go next
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
         e.preventDefault()
         nextStep()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step]) // Re-bind on step change

  return (
    <Form {...form}>
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
           <div className="flex gap-2">
             {steps.map((_, i) => (
               <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
             ))}
           </div>
           <span className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</span>
        </div>

        <Card className="min-h-[400px] flex flex-col justify-between">
          <CardHeader>
            <CardTitle>{steps[step].title}</CardTitle>
            <CardDescription>{steps[step].description}</CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1">
            {step === 0 && (
              <div className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="cycleDurationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cycle Duration (min)</FormLabel>
                      <FormControl>
                        <Input type="number" autoFocus {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
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
              </div>
            )}

            {step === 1 && (
               <FormField
                  control={form.control}
                  name="q1_accomplish"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea className="min-h-[200px] text-lg p-4" placeholder="I want to..." autoFocus {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}

            {step === 2 && (
               <FormField
                  control={form.control}
                  name="q2_importance"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea className="min-h-[200px] text-lg p-4" placeholder="Because..." autoFocus {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}

            {step === 3 && (
               <FormField
                  control={form.control}
                  name="q3_completion"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea className="min-h-[200px] text-lg p-4" placeholder="I will have..." autoFocus {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}

            {step === 4 && (
               <FormField
                  control={form.control}
                  name="q4_hazards"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea className="min-h-[200px] text-lg p-4" placeholder="Distractions, fatigue, etc..." autoFocus {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}

            {step === 5 && (
               <FormField
                  control={form.control}
                  name="q5_concrete"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea className="min-h-[200px] text-lg p-4" placeholder="It is measurable because..." autoFocus {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}

             {step === 6 && (
               <FormField
                  control={form.control}
                  name="q6_noteworthy"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea className="min-h-[200px] text-lg p-4" placeholder="Also..." autoFocus {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}

          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button type="button" variant="outline" onClick={prevStep} disabled={step === 0}>
               <ArrowLeft className="mr-2 w-4 h-4" /> Back
            </Button>
            
            <Button type="button" onClick={nextStep} disabled={isPending}>
               {step === steps.length - 1 ? (
                 <>
                   {isPending ? "Starting..." : "Start Session"} <Check className="ml-2 w-4 h-4" />
                 </>
               ) : (
                 <>
                   Next <ArrowRight className="ml-2 w-4 h-4" />
                 </>
               )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Form>
  )
}
