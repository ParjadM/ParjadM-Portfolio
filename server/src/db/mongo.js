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
    image: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    category: { type: String, default: 'personal' },
    date: { type: String, required: true },
    readTime: { type: String, default: '5 min read' },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishAt: { type: Date, default: () => new Date() },
    aiTldr: { type: String, default: '' },
    aiJuniorExplain: { type: String, default: '' },
    aiExplainVersion: { type: String, default: '' },
  },
  { timestamps: true }
)
// Public list: published + featured-first + publishAt, with _id tie-break.
BlogPostSchema.index({ status: 1, featured: -1, publishAt: -1, _id: -1 })
BlogPostSchema.index({ status: 1, category: 1, featured: -1, publishAt: -1, _id: -1 })

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
// Public list / admin reorder: featured first, then order.
ProjectSchema.index({ featured: -1, order: 1, _id: 1 })

export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema, 'projects')

export async function connectMongo(uri) {
  if (!uri) throw new Error('Missing MONGODB_URI')

  // Avoid re-connecting if already connected
  if (mongoose.connection.readyState === 1) return mongoose.connection

  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB_NAME || 'ParjadM',
    serverSelectionTimeoutMS: 5000,
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

// ClickUp - fun interactive counter (anyone who clicks adds +1)
const ClickUpSchema = new mongoose.Schema(
  { key: { type: String, unique: true, default: 'global' }, count: { type: Number, default: 0 } },
  { timestamps: true }
)
export const ClickUp = mongoose.models.ClickUp || mongoose.model('ClickUp', ClickUpSchema, 'clickup')

const AiKnowledgeSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'global' },
    content: { type: String, default: '' },
  },
  { timestamps: true }
)

export const AiKnowledge = mongoose.models.AiKnowledge || mongoose.model('AiKnowledge', AiKnowledgeSchema, 'ai_knowledge')

const AiCacheSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    value: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
)
export const AiCache = mongoose.models.AiCache || mongoose.model('AiCache', AiCacheSchema, 'ai_cache')

const AiUsageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    windowKey: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
)
AiUsageSchema.index({ key: 1, windowKey: 1 }, { unique: true })
export const AiUsage = mongoose.models.AiUsage || mongoose.model('AiUsage', AiUsageSchema, 'ai_usage')

const AiAnalyticsDailySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    feature: { type: String, required: true },
    source: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
)
AiAnalyticsDailySchema.index({ date: 1, feature: 1, source: 1 }, { unique: true })
export const AiAnalyticsDaily = mongoose.models.AiAnalyticsDaily
  || mongoose.model('AiAnalyticsDaily', AiAnalyticsDailySchema, 'ai_analytics_daily')

const AiTopicDailySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    feature: { type: String, required: true },
    topicSlug: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
)
AiTopicDailySchema.index({ date: 1, feature: 1, topicSlug: 1 }, { unique: true })
export const AiTopicDaily = mongoose.models.AiTopicDaily
  || mongoose.model('AiTopicDaily', AiTopicDailySchema, 'ai_topic_daily')

// Premium Analytics Schemas
const DeviceStatsSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['browser', 'os'], required: true },
    name: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
)
DeviceStatsSchema.index({ type: 1, name: 1 }, { unique: true })
export const DeviceStats = mongoose.models.DeviceStats || mongoose.model('DeviceStats', DeviceStatsSchema, 'device_stats')

const HourlyStatsSchema = new mongoose.Schema(
  {
    date: { type: String, index: true, required: true }, // YYYY-MM-DD
    hour: { type: Number, index: true, required: true }, // 0-23
    pageviews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
  },
  { timestamps: true }
)
HourlyStatsSchema.index({ date: 1, hour: 1 }, { unique: true })
export const HourlyStats = mongoose.models.HourlyStats || mongoose.model('HourlyStats', HourlyStatsSchema, 'hourly_stats')

// Client-side JS errors reported from the browser (capped to stay small).
const ClientErrorSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    stack: { type: String, default: '' },
    source: { type: String, default: '' },
    url: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    count: { type: Number, default: 1 },
    resolved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    capped: { size: 5242880, max: 500 },
  }
)
export const ClientError = mongoose.models.ClientError
  || mongoose.model('ClientError', ClientErrorSchema, 'client_errors')

// Community App Store: user-submitted web apps, gated behind admin approval.
const CommunityAppSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, required: true, trim: true, maxlength: 300 },
    url: { type: String, required: true, trim: true, maxlength: 500 },
    iconUrl: { type: String, default: '', trim: true, maxlength: 500 },
    author: { type: String, required: true, trim: true, maxlength: 60 },
    authorEmail: { type: String, default: '', trim: true, maxlength: 120 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    rejectionReason: { type: String, default: '' },
    submittedIp: { type: String, default: '' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
)
CommunityAppSchema.index({ status: 1, approvedAt: -1 })
export const CommunityApp = mongoose.models.CommunityApp
  || mongoose.model('CommunityApp', CommunityAppSchema, 'community_apps')

const AccessLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: () => new Date(), index: true },
    path: { type: String, required: true },
    method: { type: String, default: 'GET' },
    visitorId: { type: String },
    userAgent: { type: String },
    browser: { type: String },
    os: { type: String },
  },
  { 
    timestamps: true,
    capped: { size: 5242880, max: 1000 } // Capped at ~5MB or 1000 docs for live logs
  }
)
export const AccessLog = mongoose.models.AccessLog || mongoose.model('AccessLog', AccessLogSchema, 'access_logs')

// Core Web Vitals samples from real users (capped).
const WebVitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, enum: ['CLS', 'INP', 'LCP', 'FCP', 'TTFB'] },
    value: { type: Number, required: true },
    rating: { type: String, default: '' },
    path: { type: String, default: '/' },
    visitorId: { type: String, default: '' },
  },
  {
    timestamps: true,
    capped: { size: 5242880, max: 2000 },
  }
)
export const WebVital = mongoose.models.WebVital
  || mongoose.model('WebVital', WebVitalSchema, 'web_vitals')

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    ip: { type: String, default: '' },
  },
  { timestamps: true }
)
export const ContactMessage = mongoose.models.ContactMessage
  || mongoose.model('ContactMessage', ContactMessageSchema, 'contact_messages')

const AuditLogSchema = new mongoose.Schema(
  {
    username: { type: String, default: 'admin' },
    action: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: '' },
  },
  {
    timestamps: true,
    capped: { size: 2097152, max: 1000 },
  }
)
export const AuditLog = mongoose.models.AuditLog
  || mongoose.model('AuditLog', AuditLogSchema, 'audit_logs')

const MediaAssetSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    folder: { type: String, default: 'uploads' },
    publicId: { type: String, default: '' },
    filename: { type: String, default: '' },
    bytes: { type: Number, default: 0 },
  },
  { timestamps: true }
)
export const MediaAsset = mongoose.models.MediaAsset
  || mongoose.model('MediaAsset', MediaAssetSchema, 'media_assets')

const ALGORITHM_CATEGORIES = [
  'arrays-strings',
  'searching',
  'sorting',
  'linked-lists',
  'stacks-queues',
  'trees-bst',
  'heaps',
  'graphs',
  'recursion-backtracking',
  'dynamic-programming',
  'greedy',
  'bit-manipulation',
]

const AlgorithmTestCaseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: '' },
    visible: { type: Boolean, default: true },
    expression: { type: String, required: true },
    expected: { type: String, required: true },
  },
  { _id: false }
)

const AlgorithmSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true, enum: ALGORITHM_CATEGORIES },
    difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    skeleton: { type: String, default: '' },
    reference: { type: String, default: '' },
    testCases: { type: [AlgorithmTestCaseSchema], default: [] },
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
    enabled: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
)
AlgorithmSchema.index({ category: 1, order: 1 })
export const Algorithm = mongoose.models.Algorithm
  || mongoose.model('Algorithm', AlgorithmSchema, 'algorithms')
export { ALGORITHM_CATEGORIES }

const AlgorithmAttemptSchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, index: true },
    algorithmId: { type: String, required: true, index: true },
    difficultyMode: { type: String, required: true, enum: ['easy', 'hard'] },
    elapsedMilliseconds: { type: Number, required: true, min: 0 },
    passed: { type: Boolean, required: true },
    testResults: { type: mongoose.Schema.Types.Mixed, default: [] },
    attemptedAt: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)
AlgorithmAttemptSchema.index({ visitorId: 1, algorithmId: 1, difficultyMode: 1, attemptedAt: -1 })
AlgorithmAttemptSchema.index(
  { visitorId: 1, algorithmId: 1, difficultyMode: 1, elapsedMilliseconds: 1 },
  { partialFilterExpression: { passed: true } }
)
export const AlgorithmAttempt = mongoose.models.AlgorithmAttempt
  || mongoose.model('AlgorithmAttempt', AlgorithmAttemptSchema, 'algorithm_attempts')
