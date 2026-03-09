import { CollectionConfig } from 'payload'

const Workflows: CollectionConfig = {
  slug: 'workflows',

  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },

    {
      name: 'steps',
      type: 'array',
      required: true,

      fields: [
        {
          name: 'stepName',
          type: 'text',
          required: true,
        },

        {
          name: 'type',
          type: 'select',
          options: ['approval', 'review', 'signoff', 'comment'],
          required: true,
        },

        {
          name: 'assignedUser',
          type: 'relationship',
          relationTo: 'users',
        },

        {
          name: 'order',
          type: 'number',
          required: true,
        },

        {
          name: 'condition',
          type: 'text',
        },
      ],
    },
  ],
}

export default Workflows
