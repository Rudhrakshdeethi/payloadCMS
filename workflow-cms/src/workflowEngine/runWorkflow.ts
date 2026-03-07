export const runWorkflow = async ({ payload, collection, docId, user }: any) => {
  // find workflows attached to this collection
  const workflows = await payload.find({
    collection: 'workflows',
    where: {
      collection: {
        equals: collection,
      },
    },
  })

  if (!workflows.docs.length) {
    console.log('No workflow found for collection')
    return
  }

  const workflow = workflows.docs[0]

  const firstStep = workflow.steps?.[0]

  if (!firstStep) return

  console.log(`Workflow started for ${collection} document ${docId}`)

  await payload.create({
    collection: 'workflowLogs',
    data: {
      workflow: workflow.id,
      step: firstStep.name,
      action: 'started',
      user: user?.id,
      documentId: docId,
      collection,
    },
  })
}
