const { exec } = require('child_process');
const url = "https://www.google.com/search?q=TEST+EXPERT+PROMPT&foo=bar&baz=qux";
console.log("Testing URL:", url);
const cmd = `start "" "${url}"`;
console.log("Executing command:", cmd);

exec(cmd, (err, stdout, stderr) => {
    if (err) {
        console.error("Exec Error:", err);
        return;
    }
    console.log("Success (Check if browser opened with all params)");
    console.log("STDOUT:", stdout);
    console.log("STDERR:", stderr);
});
