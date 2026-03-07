export const approveStep = async ({ payload, workflowId, documentId, collection, user }) => {
  const workflow = await payload.findByID({
    collection: 'workflows',
    id: workflowId,
  })

  const sortedSteps = workflow.steps.sort((a, b) => a.order - b.order)

  const doc = await payload.findByID({
    collection,
    id: documentId,
  })

  const currentIndex = sortedSteps.findIndex((step) => step.stepName === doc.currentStep)

  const nextStep = sortedSteps[currentIndex + 1]

  // Log approval
  await payload.create({
    collection: 'workflowLogs',
    data: {
      workflow: workflowId,
      action: 'approved',
      performedBy: user?.id,
      step: doc.currentStep,
      documentId,
    },
  })

  if (!nextStep) {
    await payload.update({
      collection,
      id: documentId,
      data: {
        workflowStatus: 'approved',
        currentStep: null,
        assignedTo: null,
      },
    })

    console.log('Workflow completed')

    return
  }

  await payload.update({
    collection,
    id: documentId,
    data: {
      currentStep: nextStep.stepName,
      assignedTo: nextStep.assignedUser,
    },
  })

  console.log(`Moved to step: ${nextStep.stepName}`)
}
