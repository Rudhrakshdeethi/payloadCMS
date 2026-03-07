import { CollectionConfig } from 'payload'
import { runWorkflowEngine } from '../workflow/engine'

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

        const workflow = await req.payload.findByID({
          collection: 'workflows',
          id: doc.workflow,
        })

        const sortedSteps = workflow.steps.sort((a: any, b: any) => a.order - b.order)

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
