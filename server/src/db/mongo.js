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
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
)

export const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema, 'blog')

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    tags: { type: [String], default: [] },
    liveUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    image: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: () => Date.now() },
  },
  { timestamps: true }
)

export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema, 'projects')

export async function connectMongo(uri) {
  if (!uri) throw new Error('Missing MONGODB_URI')

  // Avoid re-connecting if already connected
  if (mongoose.connection.readyState === 1) return mongoose.connection

  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB_NAME || 'ParjadM',
  })
  return mongoose.connection
}

// --- Analytics ---
const AnalyticsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    pageviews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema, 'analytics')

const VisitorSchema = new mongoose.Schema(
  {
    visitorId: { type: String, unique: true, required: true },
    // optional: userAgent, ipHash etc. Skipped for simplicity
  },
  { timestamps: true }
)

VisitorSchema.index({ visitorId: 1 }, { unique: true })

export const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema, 'visitors')

// Daily stats per route
const DailyStatsSchema = new mongoose.Schema(
  {
    date: { type: String, index: true }, // YYYY-MM-DD
    route: { type: String, index: true },
    pageviews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
  },
  { timestamps: true }
)
DailyStatsSchema.index({ date: 1, route: 1 }, { unique: true })
export const DailyStats = mongoose.models.DailyStats || mongoose.model('DailyStats', DailyStatsSchema, 'daily_stats')

// Per-visit record to ensure per-day unique counting
const VisitSchema = new mongoose.Schema(
  {
    date: { type: String, index: true },
    route: { type: String, index: true },
    visitorId: { type: String, index: true },
  },
  { timestamps: true }
)
VisitSchema.index({ date: 1, route: 1, visitorId: 1 }, { unique: true })
export const Visit = mongoose.models.Visit || mongoose.model('Visit', VisitSchema, 'visits')

// Simple rate limit store (per key windows)
const RateLimitSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true },
    windowStart: { type: Date, default: () => new Date() },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
)
export const RateLimit = mongoose.models.RateLimit || mongoose.model('RateLimit', RateLimitSchema, 'rate_limits')

// Alternative schema set used by metrics routes (global + per-path daily)
const AnalyticsDailySchema = new mongoose.Schema(
  {
    date: { type: String, index: true },
    key: { type: String, index: true }, // 'global' or `path:/route`
    pageviews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
  },
  { timestamps: true }
)
AnalyticsDailySchema.index({ date: 1, key: 1 }, { unique: true })
export const AnalyticsDaily = mongoose.models.AnalyticsDaily || mongoose.model('AnalyticsDaily', AnalyticsDailySchema, 'analytics_daily')

const VisitorDaySchema = new mongoose.Schema(
  {
    date: { type: String, index: true },
    visitorId: { type: String, index: true },
  },
  { timestamps: true }
)
VisitorDaySchema.index({ date: 1, visitorId: 1 }, { unique: true })
export const VisitorDay = mongoose.models.VisitorDay || mongoose.model('VisitorDay', VisitorDaySchema, 'visitor_day')

const VisitorDayPathSchema = new mongoose.Schema(
  {
    date: { type: String, index: true },
    path: { type: String, index: true },
    visitorId: { type: String, index: true },
  },
  { timestamps: true }
)
VisitorDayPathSchema.index({ date: 1, path: 1, visitorId: 1 }, { unique: true })
export const VisitorDayPath = mongoose.models.VisitorDayPath || mongoose.model('VisitorDayPath', VisitorDayPathSchema, 'visitor_day_path')


