import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  backendId: z.string().optional(),
  draft: z.boolean().default(false)
});

const projectSchema = z.object({
  name: z.string(),
  description: z.string().default(''),
  githubUrl: z.string().url().optional(),
  url: z.string().url().optional(),
  image: z.string().optional(),
  language: z.string().optional(),
  stars: z.number().default(0),
  forks: z.number().default(0),
  order: z.number().default(0)
});

export const collections = {
  blogs: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blogs' }),
    schema: postSchema
  }),
  stories: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/stories' }),
    schema: postSchema
  }),
  projects: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
    schema: projectSchema
  })
};
