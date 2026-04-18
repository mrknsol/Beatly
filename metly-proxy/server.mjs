import http from 'http';

/**
 * Try to get a non-empty play URL (NetEase often returns "" until song() is called or another bitrate works).
 */
async function resolvePlayUrl(meting, id, preferredBr) {
    const brs = [preferredBr, 320, 192, 128, 999].filter((b, i, a) => b > 0 && a.indexOf(b) === i);

    try {
        await meting.song(id);
    } catch {
        /* ignore — not all providers need this */
    }

    let last = '{"url":"","size":0,"br":-1}';
    for (const br of brs) {
        try {
            const raw = await meting.url(id, br);
            last = raw;
            const parsed = JSON.parse(raw);
            const u = parsed?.url;
            if (typeof u === 'string' && u.trim()) {
                return raw;
            }
        } catch (e) {
            console.error('meting.url failed', id, br, e.message);
        }
    }
    return last;
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/search') {
        const query = url.searchParams.get('q');
        const source = url.searchParams.get('source') || 'netease';

        if (!query) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Query is empty' }));
            return;
        }

        try {
            const Meting = (await import('@meting/core')).default;
            const meting = new Meting(source);

            await meting.format(true);
            const limit = Math.min(
                Math.max(parseInt(url.searchParams.get('limit') || '25', 10) || 25, 1),
                50
            );
            const result = await meting.search(query, { limit, page: 1 });
            res.end(result);
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
        }
    } else if (url.pathname === '/url') {
        const id = url.searchParams.get('id');
        const source = url.searchParams.get('source') || 'netease';
        const br = parseInt(url.searchParams.get('br') || '128', 10) || 128;

        if (!id) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'id is required' }));
            return;
        }

        try {
            const Meting = (await import('@meting/core')).default;
            const meting = new Meting(source);
            await meting.format(true);
            const result = await resolvePlayUrl(meting, id, br);
            res.end(result);
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
        }
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`✅ Proxy running on http://localhost:${PORT}`);
    console.log(`🔗 Test: http://localhost:${PORT}/search?q=Luffy`);
});
