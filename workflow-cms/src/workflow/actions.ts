import { Payload } from 'payload'

type WorkflowStep = {
  stepName: string
  order: number
  assignedUser: string | null
}

type Workflow = {
  id: string
  steps: WorkflowStep[]
}

type User = {
  id: string
}

type Document = {
  id: string
  currentStep: string | null
  workflowStatus?: string
  assignedTo?: string | null // Added this to match your update logic
}

type ApproveRejectParams = {
  payload: Payload
  doc: Document
  workflow: Workflow
  user: User
  collection: string
}

export const approveStep = async ({
  payload,
  doc,
  workflow,
  user,
  collection,
}: ApproveRejectParams): Promise<void> => {
  // FIX: Spread into a new array before sorting to avoid mutating read-only props
  const steps: WorkflowStep[] = [...(workflow.steps || [])].sort((a, b) => a.order - b.order)

  const currentIndex: number = steps.findIndex(
    (step: WorkflowStep) => step.stepName === doc.currentStep,
  )

  const nextStep: WorkflowStep | undefined = steps[currentIndex + 1]

  // log action
  await payload.create({
    collection: 'workflowLogs' as any,
    data: {
      workflow: workflow.id,
      collection,
      documentId: doc.id,
      stepName: doc.currentStep,
      user: user.id,
      action: 'approved',
    } as any,
  })

  if (!nextStep) {
    // workflow finished
    await payload.update({
      collection: collection as any,
      id: doc.id,
      data: {
        workflowStatus: 'approved',
        currentStep: null,
        assignedTo: null,
      } as any,
    })

    console.log('Workflow completed')
  } else {
    // move to next step
    await payload.update({
      collection: collection as any,
      id: doc.id,
      data: {
        currentStep: nextStep.stepName,
        assignedTo: nextStep.assignedUser,
      } as any,
    })

    console.log(`Moved to ${nextStep.stepName}`)
  }
}

export const rejectStep = async ({
  payload,
  doc,
  workflow,
  user,
  collection,
}: ApproveRejectParams): Promise<void> => {
  await payload.create({
    collection: 'workflowLogs' as any,
    data: {
      workflow: workflow.id,
      collection,
      documentId: doc.id,
      stepName: doc.currentStep,
      user: user.id,
      action: 'rejected',
    } as any,
  })

  await payload.update({
    collection: collection as any,
    id: doc.id,
    data: {
      workflowStatus: 'rejected',
    } as any,
  })

  console.log('Workflow rejected')
}
