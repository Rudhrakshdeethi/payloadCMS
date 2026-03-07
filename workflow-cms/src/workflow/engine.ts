export const runWorkflowEngine = async ({ payload, doc, collection, user }) => {
  if (!doc.workflow) return

  const workflow = await payload.findByID({
    collection: 'workflows',
    id: doc.workflow,
  })

  const sortedSteps = workflow.steps.sort((a, b) => a.order - b.order)

  const firstStep = sortedSteps[0]

  console.log(`Workflow started for ${doc.id}`)
  console.log(`Step: ${firstStep.stepName}`)

  await payload.update({
    collection,
    id: doc.id,
    data: {
      workflowStatus: 'in_review',
      currentStep: firstStep.stepName,
      assignedTo: firstStep.assignedUser,
    },
  })

  // log workflow start
  await payload.create({
    collection: 'workflowLogs',
    data: {
      workflow: workflow.id,
      action: 'workflow_started',
      performedBy: user?.id,
      step: firstStep.stepName,
      documentId: doc.id,
    },
  })
}
