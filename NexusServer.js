const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000; // Mantener el puerto estándar del proyecto

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    // Manejo de CORS simplificado para entorno local
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- LIMPIEZA DE URL (Eliminar query parameters para fs.readFile) ---
    const parsedUrl = req.url.split('?')[0];

    // --- API DE PERSISTENCIA ---
    if (parsedUrl.startsWith('/api/')) {
        if (req.method === 'GET') {
            const rawPath = parsedUrl.split('/api/')[1];
            const fileName = rawPath + '.json';
            const filePath = path.join(__dirname, 'src', 'data', fileName);
            
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Archivo no encontrado' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
            return;
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const payload = JSON.parse(body);
                    const target = parsedUrl.split('/api/')[1]; // vault, database, procedures
                    const filePath = path.join(__dirname, 'src', 'data', `${target}.json`);

                    fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8', (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Error al escribir en disco' }));
                            return;
                        }
                        console.log(`[NEXUS] Base de datos '${target}' actualizada.`);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    });
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'JSON Inválido' }));
                }
            });
            return;
        }

        if (parsedUrl === '/api/open-search' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const { url } = JSON.parse(body);
                    // Comando 'start' en Windows para abrir el navegador predeterminado
                    exec(`start "" "${url}"`, (err) => {
                        if (err) {
                            console.error("[NEXUS] Error al abrir búsqueda:", err);
                        }
                    });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } catch (e) {
                    res.writeHead(400); res.end();
                }
            });
            return;
        }
    }

    // --- PROXY OLLAMA (evita CORS del navegador) ---
    if (parsedUrl === '/api/ollama' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const ollamaReq = http.request({
                hostname: '127.0.0.1',
                port: 11434,
                path: '/api/generate',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, (ollamaRes) => {
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                ollamaRes.pipe(res);
            });
            ollamaReq.on('error', () => {
                res.writeHead(503);
                res.end(JSON.stringify({ error: 'Ollama offline' }));
            });
            ollamaReq.write(body);
            ollamaReq.end();
        });
        return;
    }

    // OPTIONS preflight (CORS)
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // --- SERVIDOR DE ARCHIVOS ESTÁTICOS ---
    let filePath = path.join(__dirname, parsedUrl === '/' ? 'index.html' : parsedUrl);
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                fs.readFile(path.join(__dirname, '404.html'), (err404, content404) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content404 || '404: Archivo No Encontrado', 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end(`Error de servidor: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`
    Nexus Desktop Bridge v8.0 (The Specialist Edition) 🧙‍♂️🔮
    -------------------------
    Puerto: ${PORT}
    Estado: [ ACTIVO ]
    Persistencia real habilitada en /src/data/
    -------------------------
    `);
});
