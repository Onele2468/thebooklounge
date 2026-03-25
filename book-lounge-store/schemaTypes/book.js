import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'book',
  title: 'Book',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Fiction', value: 'Fiction' },
          { title: 'Non-Fiction', value: 'Non-Fiction' },
          { title: 'Educational', value: 'Educational' },
          { title: 'Children', value: 'Children' }
        ]
      }
    }),
    defineField({
      name: 'genre',
      title: 'Genre',
      type: 'reference',
      to: {type: 'genre'}, // updated to match your renamed genre.js
    }),
    defineField({
      name: 'image',
      title: 'Book Image',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
    }),
    defineField({
      name: 'isbn',
      title: 'ISBN',
      type: 'string',
    }),
    defineField({
      name: 'publisher',
      title: 'Publisher',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'image',
    },
    prepare(selection) {
      const {author} = selection
      return {...selection, subtitle: author && `by ${author}`}
    },
  },
})
