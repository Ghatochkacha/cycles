"use client"

import { useTransition, useEffect, useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

interface CyclePlannerProps {
  sessionId: string
  cycleNumber: number
  onComplete: (cycleId: string) => void
}

export function CyclePlanner({ sessionId, cycleNumber, onComplete }: CyclePlannerProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const [step, setStep] = useState(0)

  const steps = [
    { title: "Goal", description: "What is your main focus for this cycle?" },
    { title: "Strategy", description: "How will you execute this?" },
    { title: "Check-in", description: "Current state assessment." },
  ]

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

  const nextStep = async () => {
    let isValid = false
    switch(step) {
      case 0:
        isValid = await form.trigger("goal")
        break
      case 1:
        isValid = await form.trigger(["howToStart", "hazards"])
        break
      case 2:
        isValid = await form.trigger(["energyLevel", "moraleLevel"])
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
      // Allow Enter to go next (prevent default unless textarea)
      if (e.key === 'Enter' && !e.shiftKey && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        nextStep()
      }
      
      // Cmd+Enter to go next/submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
         e.preventDefault()
         nextStep()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step]) 

  return (
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
          <CardTitle>Cycle {cycleNumber}: {steps[step].title}</CardTitle>
          <CardDescription>{steps[step].description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <Form {...form}>
            <div className="space-y-6">
              {step === 0 && (
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Goal</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="min-h-[200px] text-lg p-4" 
                          placeholder="What exactly are you trying to accomplish?" 
                          autoFocus 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {step === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="howToStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How will I get started?</FormLabel>
                        <FormControl>
                          <Textarea placeholder="First step..." autoFocus {...field} />
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
                        <FormLabel>Any hazards? (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Distractions, fatigue..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {step === 2 && (
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
              )}
            </div>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button type="button" variant="outline" onClick={prevStep} disabled={step === 0}>
             <ArrowLeft className="mr-2 w-4 h-4" /> Back
          </Button>
          
          <Button type="button" onClick={nextStep} disabled={isPending}>
             {step === steps.length - 1 ? (
               <>
                 {isPending ? "Starting..." : "Start Cycle"} <Check className="ml-2 w-4 h-4" />
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
  )
}
