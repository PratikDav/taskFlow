const fs = require('fs');
const path = require('path');

const translationsFile = path.resolve(__dirname, 'client', 'src', 'lib', 'translations.ts');
console.log('Scanning translations file:', translationsFile);
const keys = new Set();

if (fs.existsSync(translationsFile)) {
  try {
    const txt = fs.readFileSync(translationsFile, 'utf8');
    // Extract all string keys from the translations object
    // Look for patterns like: key: "value", or 'key': "value", or key: 'value'
    const keyPatterns = [
      /(\w+): ['"`](.*?)['"`]/g,  // key: "value"
      /['"`](\w+)['"`]: ['"`](.*?)['"`]/g,  // "key": "value"
    ];

    for (const pattern of keyPatterns) {
      let m;
      while ((m = pattern.exec(txt))) {
        keys.add(m[1]);
        console.log('Found key:', m[1]);
      }
    }

    console.log('Total keys found:', keys.size);
    console.log('Keys:', Array.from(keys).sort());
  } catch (e) {
    console.error('Error reading translations file:', e);
  }
} else {
  console.error('Translations file not found');
}