'use server'

import { z } from "zod"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { RegisterSchema, LoginSchema, SessionPrepareSchema, CyclePlanSchema, CycleReviewSchema, SessionDebriefSchema } from "@/lib/schemas"
import { signIn, auth } from "@/auth"
import { AuthError } from "next-auth"

export async function completeSession(sessionId: string, values: z.infer<typeof SessionDebriefSchema>) {
  const validated = SessionDebriefSchema.safeParse(values)
  if (!validated.success) return { error: "Invalid fields" }

  try {
    await db.session.update({
        where: { id: sessionId },
        data: {
            status: 'completed',
            completedAt: new Date(),
            debriefAnswers: validated.data
        }
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to complete session:", error)
    return { error: "Failed to complete session" }
  }
}

export async function saveCyclePlan(sessionId: string, cycleNumber: number, values: z.infer<typeof CyclePlanSchema>) {
  const validated = CyclePlanSchema.safeParse(values)
  if (!validated.success) return { error: "Invalid fields" }

  try {
    // Check if cycle already exists to avoid duplicates if user refreshes
    const existingCycle = await db.cycle.findFirst({
        where: { sessionId, cycleNumber }
    })

    if (existingCycle) {
        // Update plan if it exists
        await db.cyclePlan.upsert({
            where: { cycleId: existingCycle.id },
            create: { ...validated.data, cycleId: existingCycle.id },
            update: validated.data
        })
        return { success: true, cycleId: existingCycle.id }
    }

    const cycle = await db.cycle.create({
      data: {
        sessionId,
        cycleNumber,
        scheduledStartTime: new Date(),
        status: 'in_progress',
        plan: {
          create: validated.data
        }
      }
    })
    return { success: true, cycleId: cycle.id }
  } catch (error) {
     console.error("Failed to save plan:", error)
     return { error: "Failed to save plan" }
  }
}

export async function saveCycleReview(cycleId: string, values: z.infer<typeof CycleReviewSchema>) {
  const validated = CycleReviewSchema.safeParse(values)
  if (!validated.success) return { error: "Invalid fields" }

  try {
    await db.cycleReview.create({
        data: {
            cycleId,
            ...validated.data
        }
    })
    await db.cycle.update({
        where: { id: cycleId },
        data: { status: 'completed', actualEndTime: new Date() }
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to save review:", error)
    return { error: "Failed to save review" }
  }
}

export async function createSession(values: z.infer<typeof SessionPrepareSchema>) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  const validatedFields = SessionPrepareSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { 
    cycleDurationMinutes, 
    breakDurationMinutes, 
    totalCycles, 
    ...answers 
  } = validatedFields.data

  try {
    const newSession = await db.session.create({
      data: {
        userId: session.user.id,
        startTime: new Date(),
        cycleDurationMinutes,
        breakDurationMinutes,
        totalCycles,
        status: 'in_progress', 
        preparationAnswers: answers,
      }
    })
    return { success: true, sessionId: newSession.id }
  } catch (error) {
    console.error("Failed to create session:", error)
    return { error: "Failed to create session" }
  }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid fields!" }
  }

  const { email, password, name } = validatedFields.data
  const hashedPassword = await bcrypt.hash(password, 10)

  const existingUser = await db.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "Email already in use!" }
  }

  await db.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
    },
  })
  
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" }
        default:
          return { error: "Something went wrong!" }
      }
    }
    throw error
  }
  
  return { success: "User created!" }
}

export async function authenticate(values: z.infer<typeof LoginSchema>) {
  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid fields!" }
  }

  const { email, password } = validatedFields.data

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" }
        default:
          return { error: "Something went wrong!" }
      }
    }
    throw error
  }
}
