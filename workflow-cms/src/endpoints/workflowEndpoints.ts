export const workflowEndpoints = [
  {
    access: {
      read: () => true,
      create: () => true,
      update: () => true,
      delete: () => true,
    },
    path: '/workflows/approve',
    method: 'post',
    handler: async (req: any) => {
      const { docId, collection } = req.body

      const payload = req.payload

      // get the document (post)
      const doc = await payload.findByID({
        collection,
        id: docId,
        depth: 2,
      })

      if (!doc.workflow) {
        return Response.json({ error: 'No workflow attached' })
      }

      const workflow = doc.workflow

      const steps = [...workflow.steps].sort((a: any, b: any) => a.order - b.order)

      const currentStepIndex = steps.findIndex((s: any) => s.stepName === doc.currentStep)

      if (currentStepIndex === -1) {
        return Response.json({ error: 'Current step not found' })
      }

      const nextStep = steps[currentStepIndex + 1]

      // FINAL STEP COMPLETED
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

      // MOVE TO NEXT STEP
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
    },
  },
]
