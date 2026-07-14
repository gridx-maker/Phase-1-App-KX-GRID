const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'src', 'pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let changed = false;

  // Simple ones: pure text
  const regex = /<h1 className="([^"{}]+)">([^<{}]+)<\/h1>/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, '<SplitText text="$2" tag="h1" className="$1" />');
    changed = true;
  }
  
  if (changed && !content.includes('SplitText')) {
    content = content.replace(/(import .*?;\n)/, '$1import SplitText from \'@/components/ui/SplitText\';\n');
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log('Updated ' + file);
  }
});
