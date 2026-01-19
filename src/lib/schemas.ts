import { z } from "zod"

export const RegisterSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

export const SessionPrepareSchema = z.object({
  // Settings
  cycleDurationMinutes: z.number().min(1),
  breakDurationMinutes: z.number().min(1),
  totalCycles: z.number().min(1),
  
  // Questions
  q1_accomplish: z.string().min(1, "Required"),
  q2_importance: z.string().min(1, "Required"),
  q3_completion: z.string().min(1, "Required"),
  q4_hazards: z.string().optional(),
  q5_concrete: z.string().min(1, "Required"),
  q6_noteworthy: z.string().optional(),
})

export const CyclePlanSchema = z.object({
  goal: z.string().min(1, "Required"),
  howToStart: z.string().min(1, "Required"),
  hazards: z.string().optional(),
  energyLevel: z.enum(["high", "medium", "low"]),
  moraleLevel: z.enum(["high", "medium", "low"]),
})

export const CycleReviewSchema = z.object({
  completedTarget: z.boolean(), 
  noteworthy: z.string().optional(),
  distractions: z.string().optional(),
  improvements: z.string().optional(),
})

export const SessionDebriefSchema = z.object({
  q1_done: z.string().min(1, "Required"),
  q2_compare: z.string().min(1, "Required"),
  q3_bogged: z.string().min(1, "Required"),
  q4_well: z.string().min(1, "Required"),
  q5_takeaways: z.string().optional(),
})
