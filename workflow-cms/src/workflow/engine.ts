export const runWorkflowEngine = async ({ doc, req }: any) => {
  if (!doc.workflow) return

  const workflowId = typeof doc.workflow === 'object' ? doc.workflow.id : doc.workflow

  const workflow = await req.payload.findByID({
    collection: 'workflows',
    id: workflowId,
  })

  const steps = [...workflow.steps].sort((a: any, b: any) => a.order - b.order)

  const firstStep = steps[0]

  await req.payload.update({
    collection: 'posts',
    id: doc.id,
    data: {
      workflowStatus: 'in_review',
      currentStep: firstStep.stepName,
      assignedTo: firstStep.assignedUser,
    },
  })
}
