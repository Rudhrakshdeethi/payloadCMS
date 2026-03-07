export const approveStep = async ({
  payload,
  doc,
  workflow,
  user,
  collection
}) => {
  

  const steps = workflow.steps.sort((a,b)=>a.order-b.order)

  const currentIndex = steps.findIndex(
    step => step.stepName === doc.currentStep
  )

  const nextStep = steps[currentIndex + 1]

  // log action
  await payload.create({
    collection: 'workflowLogs',
    data: {
      workflow: workflow.id,
      collection,
      documentId: doc.id,
      stepName: doc.currentStep,
      user: user.id,
      action: 'approved'
    }
  })

  if(!nextStep){

    // workflow finished
    await payload.update({
      collection,
      id: doc.id,
      data: {
        workflowStatus: 'approved',
        currentStep: null,
        assignedTo: null
      }
    })

    console.log('Workflow completed')

  } else {

    // move to next step
    await payload.update({
      collection,
      id: doc.id,
      data: {
        currentStep: nextStep.stepName,
        assignedTo: nextStep.assignedUser
      }
    })

    console.log(`Moved to ${nextStep.stepName}`)
  }

}

export const rejectStep = async ({
  payload,
  doc,
  workflow,
  user,
  collection
}) => {

  await payload.create({
    collection: 'workflowLogs',
    data: {
      workflow: workflow.id,
      collection,
      documentId: doc.id,
      stepName: doc.currentStep,
      user: user.id,
      action: 'rejected'
    }
  })

  await payload.update({
    collection,
    id: doc.id,
    data: {
      workflowStatus: 'rejected'
    }
  })

  console.log('Workflow rejected')
}