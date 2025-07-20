const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Dixis Emergency Server</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(to br, #f0f9ff, #ecfdf5); }
            .container { max-width: 800px; margin: 0 auto; }
            h1 { color: #059669; font-size: 3rem; margin-bottom: 1rem; }
            p { color: #6b7280; font-size: 1.2rem; margin-bottom: 2rem; }
            .buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
            .btn { padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
            .btn-primary { background: #059669; color: white; }
            .btn-secondary { background: white; color: #059669; border: 2px solid #059669; }
            .status { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 2rem; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🌱 Dixis Fresh</h1>
            <p>Emergency Server Running!</p>
            
            <div class="buttons">
                <a href="http://localhost:8000/api/v1/products" class="btn btn-primary">Test Laravel API</a>
                <a href="#" onclick="location.reload()" class="btn btn-secondary">Refresh</a>
            </div>
            
            <div class="status">
                <h3>🔧 System Status</h3>
                <p>✅ Emergency HTTP Server: Running on port 3002</p>
                <p>🔧 Laravel Backend: http://localhost:8000</p>
                <p>❌ Next.js Frontend: Currently broken</p>
                <p>⚡ This emergency server proves your browser works!</p>
            </div>
            
            <div style="margin-top: 2rem; color: #6b7280;">
                <p>Claude is working on fixing the Next.js issue...</p>
                <p>Check back in a few minutes!</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`🚨 Emergency server running on http://localhost:${PORT}`);
  console.log('🎯 This proves your browser and network are working!');
  console.log('💡 The issue is with Next.js, not your system.');
});

server.on('error', (err) => {
  console.error('❌ Emergency server failed:', err.message);
});