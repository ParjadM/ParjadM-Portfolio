import { Router } from 'express';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { BlogPost } from '../db/mongo.js';
import { currentEngine } from '../db/index.js';
import { SITE_URL, SITE_NAME } from '../config/site.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let fontData = null;

function loadFont() {
    if (fontData) return fontData;
    const candidates = [
        path.join(__dirname, '../../assets/outfit-latin-600.woff'),
        path.join(__dirname, '../../../node_modules/@fontsource/outfit/files/outfit-latin-600-normal.woff'),
    ];
    for (const p of candidates) {
        if (existsSync(p)) {
            fontData = readFileSync(p);
            return fontData;
        }
    }
    throw new Error('Outfit font not found for OG image generation');
}

function truncate(str, max = 90) {
    const s = String(str ?? '').trim();
    if (s.length <= max) return s;
    return `${s.slice(0, max - 1).trim()}…`;
}

async function renderPostOg({ title, category, date }) {
    const font = loadFont();
    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)',
                    padding: '72px 80px',
                    fontFamily: 'Outfit',
                },
                children: [
                    {
                        type: 'div',
                        props: {
                            style: { display: 'flex', alignItems: 'center', gap: '16px' },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            background: 'rgba(16,185,129,0.2)',
                                            color: '#6ee7b7',
                                            fontSize: 22,
                                            fontWeight: 600,
                                            padding: '8px 20px',
                                            borderRadius: 999,
                                            textTransform: 'capitalize',
                                        },
                                        children: category || 'blog',
                                    },
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: { color: '#94a3b8', fontSize: 22 },
                                        children: date || '',
                                    },
                                },
                            ],
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            style: {
                                color: '#ffffff',
                                fontSize: 56,
                                fontWeight: 800,
                                lineHeight: 1.15,
                                letterSpacing: '-0.02em',
                                maxWidth: '920px',
                            },
                            children: truncate(title, 85),
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderTop: '2px solid rgba(16,185,129,0.4)',
                                paddingTop: '28px',
                            },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: { color: '#6ee7b7', fontSize: 28, fontWeight: 600 },
                                        children: SITE_NAME,
                                    },
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: { color: '#64748b', fontSize: 24 },
                                        children: SITE_URL.replace(/^https?:\/\//, ''),
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            width: 1200,
            height: 630,
            fonts: [{ name: 'Outfit', data: font, weight: 600, style: 'normal' }],
        }
    );

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
    return resvg.render().asPng();
}

// GET /api/og/:id — dynamic Open Graph card for a blog post
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.redirect(302, `${SITE_URL}/og-image.jpg`);
        }

        if (currentEngine !== 'mongo') {
            return res.redirect(302, `${SITE_URL}/og-image.jpg`);
        }

        const now = new Date();
        const doc = await BlogPost.findOne(
            { _id: id, status: 'published', publishAt: { $lte: now } },
            { title: 1, category: 1, date: 1 }
        ).lean();

        if (!doc) {
            return res.redirect(302, `${SITE_URL}/og-image.jpg`);
        }

        const png = await renderPostOg({
            title: doc.title,
            category: doc.category,
            date: doc.date,
        });

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
        res.send(png);
    } catch (err) {
        console.error('OG image error:', err);
        res.redirect(302, `${SITE_URL}/og-image.jpg`);
    }
});

export default router;
