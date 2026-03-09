import { CollectionConfig } from 'payload'

const Posts: CollectionConfig = {
  slug: 'posts',

  admin: {
    useAsTitle: 'title',
  },

  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },

  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation !== 'create') return
        if (!doc.workflow) return

        try {
          const workflowId = typeof doc.workflow === 'object' ? doc.workflow.id : doc.workflow

          const workflow = await req.payload.findByID({
            collection: 'workflows',
            id: workflowId,
          })

          const sortedSteps = [...workflow.steps].sort((a: any, b: any) => a.order - b.order)

          const firstStep = sortedSteps[0]

          console.log(`Workflow started for post ${doc.id}`)
          console.log(`First step: ${firstStep.stepName}`)

          await req.payload.update({
            collection: 'posts',
            id: doc.id,
            data: {
              workflowStatus: 'in_review',
              currentStep: firstStep.stepName,
              assignedTo: firstStep.assignedUser,
            },
          })
        } catch (err) {
          console.error('Workflow hook error:', err)
        }
      },
    ],
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'workflow',
      type: 'relationship',
      relationTo: 'workflows',
    },
    {
      name: 'workflowStatus',
      type: 'select',
      defaultValue: 'pending',
      options: ['pending', 'in_review', 'approved', 'rejected'],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'currentStep',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
  ],
}

export default Posts
