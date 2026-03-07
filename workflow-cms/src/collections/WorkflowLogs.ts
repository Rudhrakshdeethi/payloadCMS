import { CollectionConfig } from 'payload'

const WorkflowLogs: CollectionConfig = {
  slug: 'workflowLogs',

  admin: {
    useAsTitle: 'action',
  },

  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },

  fields: [
    {
      name: 'workflow',
      type: 'relationship',
      relationTo: 'workflows',
    },

    {
      name: 'step',
      type: 'text',
    },

    {
      name: 'action',
      type: 'text',
    },

    {
      name: 'collection',
      type: 'text',
    },

    {
      name: 'documentId',
      type: 'text',
    },

    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
}

export default WorkflowLogs
