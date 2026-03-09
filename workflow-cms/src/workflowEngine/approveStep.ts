import { Payload } from 'payload'

interface WorkflowStep {
  stepName: string
  order: number
  assignedUser?: string | number | null
}

interface Workflow {
  id: string | number
  steps: WorkflowStep[]
}

interface DocumentData {
  id: string | number
  currentStep?: string | null
  workflowStatus?: string | null
  assignedTo?: string | number | null
}

interface User {
  id: string | number
}

interface ApproveStepArgs {
  payload: Payload
  workflowId: string | number
  documentId: string | number
  collection: string
  user: User | null
}

export const approveStep = async ({
  payload,
  workflowId,
  documentId,
  collection,
  user,
}: ApproveStepArgs): Promise<void> => {
  // 1. Fetch Workflow
  const workflow = (await payload.findByID({
    collection: 'workflows',
    id: workflowId,
  })) as unknown as Workflow

  if (!workflow?.steps) {
    throw new Error('Workflow not found or has no steps')
  }

  // Sort steps - spreading to avoid mutating original array
  const sortedSteps = [...workflow.steps].sort((a, b) => a.order - b.order)

  // 2. Fetch Document
  const doc = (await payload.findByID({
    collection: collection as any, // Cast to any to allow dynamic collection names
    id: documentId,
  })) as unknown as DocumentData

  if (!doc) {
    throw new Error('Document not found')
  }

  const currentIndex = sortedSteps.findIndex((step) => step.stepName === doc.currentStep)

  const nextStep = sortedSteps[currentIndex + 1]

  // 3. Log approval
  await payload.create({
    collection: 'workflowLogs' as any,
    data: {
      workflow: workflowId,
      action: 'approved',
      performedBy: user?.id,
      step: doc.currentStep,
      documentId,
    } as any,
  })

  // 4. Handle Workflow Completion
  if (!nextStep) {
    await payload.update({
      collection: collection as any,
      id: documentId,
      data: {
        workflowStatus: 'approved',
        currentStep: null,
        assignedTo: null,
      } as any,
    })

    console.log('Workflow completed')
    return
  }

  // 5. Move to next step
  await payload.update({
    collection: collection as any,
    id: documentId,
    data: {
      currentStep: nextStep.stepName,
      assignedTo: nextStep.assignedUser,
    } as any,
  })

  console.log(`Moved to step: ${nextStep.stepName}`)
}
