const fs = require('fs');
const content = fs.readFileSync('puppeteer_output.txt', 'utf16le');
const parts = content.split('Top Element Covering Screen:');
if(parts.length > 1) {
    const rawJSON = parts[1].split('Lock element class list:')[0].trim();
    fs.writeFileSync('top_element.json', rawJSON);
    console.log('Saved to top_element.json');
} else {
    fs.writeFileSync('top_element.json', JSON.stringify({error: "Not found", content: content.slice(-1000)}));
    console.log('Not found, saved last 1000 chars');
}
