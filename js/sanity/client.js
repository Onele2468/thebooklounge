import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: '8tul7kq9', // find this in sanity.json or sanity.config.js in your studio
  dataset: 'bookstore', // or the name of your dataset, usually 'production'
  apiVersion: '2023-05-03', // use a UTC date string like "2023-05-03"
  useCdn: true, // set to false for fresh data
})