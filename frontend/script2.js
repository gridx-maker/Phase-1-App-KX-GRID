const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'src', 'pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
files.forEach(file => {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let changed = false;
  // Use a less restrictive regex, since we're only going to match specific ones
  // We want to match: <h1 className="...">Some Text</h1>
  const regex = /<h1 className="([^"]+)">([^<{}]+)<\/h1>/g;
  
  if (regex.test(content)) {
    console.log('Matched: ' + file);
    content = content.replace(regex, '<SplitText text="$2" tag="h1" className="$1" />');
    content = 'import SplitText from \'@/components/ui/SplitText\';\n' + content;
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
  }
});
