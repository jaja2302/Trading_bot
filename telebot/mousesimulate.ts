// mousesimulate.tsx
import { createServer } from 'http';
import { readFileSync } from 'fs';

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mouse Logger</title>
</head>
<body>
    <h1>Mouse Logger</h1>
    <script>
        let log = [];

        function logMouseEvent(event) {
            const { clientX, clientY, type } = event;
            const timestamp = new Date().toISOString();
            log.push({ type, clientX, clientY, timestamp });
            console.log(\`Event: \${type}, X: \${clientX}, Y: \${clientY}, Timestamp: \${timestamp}\`);
        }

        document.addEventListener('mousedown', logMouseEvent);
        document.addEventListener('mouseup', logMouseEvent);
        document.addEventListener('click', logMouseEvent);

        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download Log';
        downloadButton.onclick = () => {
            const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mouse-log.json';
            a.click();
            URL.revokeObjectURL(url);
        };
        document.body.appendChild(downloadButton);
    </script>
</body>
</html>
`;

const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
