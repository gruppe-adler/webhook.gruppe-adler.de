import express from 'express';
import morgan from 'morgan';
import fetch, { Request } from 'node-fetch';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';

const { json } = bodyParser;

const app = express();

app.set('trust proxy', 1);

app.use(morgan('tiny'))
app.use(json());
app.use(rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100
}));

app.post('/github', async (req, res) => {
    if (req.query.url === undefined) {
        res.status(400).json({ error: 'Query "url" expected.' });
        return;
    }

    if (typeof req.query.url !==  'string') {
        res.status(400).json({ error: 'Query "url" should be only one string.' });
        return;
    }

    let url;
    try {
        url = new URL(req.query.url);
    } catch (err) {
        res.status(400).json({ error: 'Query "url" should be a valid url.' });
        return;
    }

    const payload = req.body;
    if (typeof payload !== 'object') {
        res.status(400).json({ error: 'Couldn\'t parse request body.' });
        return;
    }


    if (Object.prototype.hasOwnProperty.call(payload, 'repository')) {
        if (payload.repository.private === true) {
            res.status(202).end();
            return;
        }
    }

    // collect all custom headers so we can pass them on the
    // webhook request
    const customHeaders = {};
    for (const h in req.headers) {
        // skip any headers non-custom headers
        if (!h.toLowerCase().startsWith('x-')) continue;
        customHeaders[h] = req.get(h);
    }

    const request = new Request(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            ...customHeaders
        },
        body: JSON.stringify(payload)
    })

    try {
        const response = await fetch(request);

        if (!response.ok) {
            console.error(`Received non-ok response from endpoint.`);
            console.log(`\nRequest URL: ${request.url}`)
            console.log('\nRequest-Headers:');
            for (const header of request.headers) {
                console.log(`${header[0]}: ${header[1]}`);
            }

            console.log('\nRequest Payload:');
            console.log(request.text());

            console.log('\nResponse Headers:');
            for (const header of response.headers) {
                console.log(`${header[0]}: ${header[1]}`);
            }

            console.log('\nResponse Payload:');
            console.log(await response.text());

            res.status(502).end();
            return;
        }

        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(502).end();
        return;
    }

});

const {
    PORT = '80'
} = process.env;

app.listen(PORT, () => {
    console.log(`listening on http://127.0.0.1:${PORT}`)
});