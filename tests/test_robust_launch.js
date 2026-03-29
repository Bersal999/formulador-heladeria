const { spawn } = require('child_process');
const url = "https://www.google.com/search?q=TEST+EXPERT+PROMPT&foo=bar&baz=qux";

console.log("Testing Robust Launch for:", url);

// Usar spawn para emitir el comando directamente
const child = spawn('cmd.exe', ['/c', 'start', '""', url], {
    detached: true,
    stdio: 'ignore'
});

child.unref();

console.log("Spawn order sent. Check if browser opened.");
setTimeout(() => process.exit(0), 1000);
