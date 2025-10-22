import mongoose from 'mongoose'

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

export const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema)

const BlogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: 'personal' },
    date: { type: String, required: true },
    readTime: { type: String, default: '5 min read' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
)

export const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema, 'blog')

export async function connectMongo(uri) {
  if (!uri) throw new Error('Missing MONGODB_URI')

  // Avoid re-connecting if already connected
  if (mongoose.connection.readyState === 1) return mongoose.connection

  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB_NAME || 'ParjadM',
  })
  return mongoose.connection
}


