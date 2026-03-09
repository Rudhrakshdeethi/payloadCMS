import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import Workflows from './collectionsPage/Workflows'
import WorkflowLogs from './collectionsPage/WorkflowLogs'
import { Users } from './collectionsPage/Users'
import Posts from './collectionsPage/Posts'

import { workflowEndpoints } from './endpoints/workflowEndpoints'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  collections: [Users, Posts, Workflows, WorkflowLogs],

  endpoints: [...workflowEndpoints],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET as string,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: mongooseAdapter({
    url: process.env.DATABASE_URI as string,
  }),

  sharp,

  cors: ['http://localhost:3000'],
  csrf: ['http://localhost:3000'],
})
