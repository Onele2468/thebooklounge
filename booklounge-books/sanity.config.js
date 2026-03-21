import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Book Lounge Books',
  projectId: '8tul7kq9',
  dataset: 'bookstore',
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
})
