"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CycleReviewSchema } from "@/lib/schemas"
import { saveCycleReview } from "@/lib/actions"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

interface CycleReviewerProps {
  cycleId: string
  open: boolean
  onComplete: () => void
}

export function CycleReviewer({ cycleId, open, onComplete }: CycleReviewerProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof CycleReviewSchema>>({
    resolver: zodResolver(CycleReviewSchema),
    defaultValues: {
      completedTarget: true,
      noteworthy: "",
      distractions: "",
      improvements: "",
    },
  })

  function onSubmit(values: z.infer<typeof CycleReviewSchema>) {
    startTransition(() => {
      saveCycleReview(cycleId, values).then((data) => {
        if (data?.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.error,
          })
        }
        if ((data as any)?.success) {
          onComplete()
        }
      })
    })
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Cycle Review</DialogTitle>
          <DialogDescription>Review your progress before taking a break.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="completedTarget"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Did you complete the cycle's target?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(val) => field.onChange(val === 'yes')}
                      defaultValue={field.value ? 'yes' : 'no'}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Yes
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          No
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="noteworthy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anything noteworthy?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="distractions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Any distractions?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="improvements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Improvements for next cycle?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
               <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Start Break"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
