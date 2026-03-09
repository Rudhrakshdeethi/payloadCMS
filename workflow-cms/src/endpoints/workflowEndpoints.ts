import type { PayloadHandler } from 'payload'

export const workflowEndpoints: {
  path: string
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  handler: PayloadHandler
}[] = [
  {
    path: '/workflows/approve',
    method: 'post',
    handler: async (req) => {
      // FIX: Check if req.json exists before invoking (fixes ts2722 & 18048)
      if (!req.json) {
        return Response.json({ error: 'Invalid request' }, { status: 400 })
      }

      try {
        const body = await req.json()
        const { docId, collection } = body

        if (!docId || !collection) {
          return Response.json({ error: 'docId and collection required' }, { status: 400 })
        }

        const payload = req.payload

        const doc = await payload.findByID({
          collection,
          id: docId,
          depth: 2,
        })

        if (!doc?.workflow) {
          return Response.json({ error: 'No workflow attached' }, { status: 400 })
        }

        const workflow = doc.workflow

        // FIX: Ensure workflow.steps is treated as an array
        const steps = [...(workflow.steps || [])].sort((a: any, b: any) => a.order - b.order)

        const currentStepIndex = steps.findIndex((s: any) => s.stepName === doc.currentStep)

        if (currentStepIndex === -1) {
          return Response.json({ error: 'Current step not found' }, { status: 400 })
        }

        const nextStep = steps[currentStepIndex + 1]

        if (!nextStep) {
          await payload.update({
            collection,
            id: docId,
            data: {
              workflowStatus: 'approved',
              currentStep: null,
              assignedTo: null,
            },
          })

          await payload.create({
            collection: 'workflowLogs',
            data: {
              workflow: workflow.id,
              action: 'completed',
              step: steps[currentStepIndex].stepName,
            },
          })

          return Response.json({
            message: 'Workflow completed',
          })
        }

        await payload.update({
          collection,
          id: docId,
          data: {
            currentStep: nextStep.stepName,
            assignedTo: nextStep.assignedUser,
          },
        })

        await payload.create({
          collection: 'workflowLogs',
          data: {
            workflow: workflow.id,
            action: 'approved',
            step: steps[currentStepIndex].stepName,
          },
        })

        return Response.json({
          message: `Moved to ${nextStep.stepName}`,
        })
      } catch (err: any) {
        return Response.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
      }
    },
  },
]
