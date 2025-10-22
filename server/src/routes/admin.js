import { Router } from 'express'
import mongoose from 'mongoose'
import { BlogPost } from '../db/mongo.js'
import { currentEngine } from '../db/index.js'

const router = Router()

router.get('/db-status', async (req, res) => {
  if (currentEngine !== 'mongo') {
    return res.json({ engine: currentEngine, connected: false, info: 'Using in-memory store' })
  }
  const state = mongoose.connection.readyState
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  res.json({ engine: 'mongo', connected: state === 1, state: states[state] || state })
})

router.post('/create-collection/:name', async (req, res) => {
  if (currentEngine !== 'mongo') {
    return res.status(400).json({ error: 'Not using MongoDB. Set MONGODB_URI to enable.' })
  }
  try {
    const name = req.params.name
    await mongoose.connection.createCollection(name)
    res.status(201).json({ ok: true, collection: name })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/seed-blog', async (req, res) => {
  if (currentEngine !== 'mongo') {
    return res.status(400).json({ error: 'Not using MongoDB' })
  }
  try {
    const count = await BlogPost.countDocuments()
    if (count > 0) return res.json({ ok: true, seeded: false })
    const doc = await BlogPost.create({
      title: 'Hello, ParjadM.ca: The Journey From a Single Page',
      excerpt: "Join me as I trace the journey of this website from a single 'Hello, World!' post into the full-stack, dynamic portfolio you see today.",
      content: `Hello and welcome to my new portfolio website, ParjadM.ca! This site represents a significant milestone in my journey as a web developer, a journey that I'm excited to share with you through this new blog series. We'll be taking a deep dive into the projects, technologies, and experiences that have shaped my path. To truly appreciate how far this website has come, it's important to look back at where it all started: a simple, single-page blog post. This inaugural post marks the beginning of a series where I'll document my evolution from that humble beginning to the full-stack portfolio you see today.

The seed for this website was planted with a basic HTML page titled "Web Development Journal," hosted on GitHub Pages. This initial post was a "Hello, World!" to the web development community, a declaration of my intentions and a first step into a larger world. It was a simple, static page that introduced me as a web developer and discussed the significance of the "Hello, World!" program as a rite of passage for every programmer. The post was a testament to the foundational knowledge I had acquired and a promise of more to come. It was a starting point, a blank canvas with endless possibilities.

The transformation from that single blog post to this full-fledged website was a journey of immense learning and growth. I delved into the MERN stack, mastering MongoDB, Express.js, React, and Node.js. This allowed me to build a dynamic, interactive experience, a far cry from the static HTML of my first post. I designed and implemented a RESTful API to handle data, created a responsive front-end with React for a seamless user experience across all devices, and managed the database with MongoDB. Each line of code was a step forward, a new skill learned, and a challenge overcome.

Of course, building the application was only half the battle; the next challenge was deploying it to the world. This involved setting up a domain, configuring servers, and ensuring the application was secure, scalable, and performant. The process of taking a project from a local development environment to a live, publicly accessible website was a rewarding experience. It was the final piece of the puzzle, the moment when all the hard work and late nights of coding finally came to fruition. Seeing ParjadM.ca live on the web was a proud moment, a tangible representation of my dedication and passion for web development.

This website is more than just a portfolio; it's a living document of my journey as a developer. It's a platform where I can share my knowledge, showcase my work, and connect with other like-minded individuals. I invite you to explore the site, check out my projects, and follow along with this blog series as I continue to grow and evolve as a developer. The journey from a simple "Hello, World!" to a full-stack application has been an incredible one, and I'm excited to see where it takes me next. Thank you for joining me, and I look forward to sharing more with you in the posts to come.`,
      category: 'personal',
      date: '2024-01-05',
      readTime: '6 min read',
      tags: ['Career', 'Learning', 'Personal'],
    })
    res.json({ ok: true, seeded: true, id: doc._id.toString() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/set-latest-blog-date', async (req, res) => {
  if (currentEngine !== 'mongo') {
    return res.status(400).json({ error: 'Not using MongoDB' })
  }
  try {
    const desiredDate = (req.body && req.body.date) || req.query.date || new Date().toISOString().slice(0, 10)
    const doc = await BlogPost.findOne({}, null, { sort: { createdAt: -1 } })
    if (!doc) return res.status(404).json({ error: 'No blog posts found' })
    doc.date = desiredDate
    await doc.save()
    res.json({ ok: true, id: doc._id.toString(), date: doc.date })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router


