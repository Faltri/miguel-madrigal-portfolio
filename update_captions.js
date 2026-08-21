const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<div class="gallery-caption">[\s\S]*?<span>\d+<\/span>\s*<\/div>/g, (match) => {
    let car = "";
    if (match.includes('R33') && match.includes('Chaser')) car = "Nissan R33 GT-R & Toyota Chaser JZX100";
    else if (match.includes('GT-R R35')) car = "Nissan GT-R R35";
    else if (match.includes('935')) car = "Porsche 935 K3";
    else if (match.includes('GR86')) car = "Toyota GR86";
    else if (match.includes('350Z')) car = "Nissan 350Z (Z33)";
    else if (match.includes('Kremer')) car = "Porsche 935 K3";
    else if (match.includes('Tokyo Nights')) car = "Toyota GR86";
    else if (match.includes('Wheel Fitment')) car = "Nissan 350Z (Z33)";
    else if (match.includes('Chaser Dynamic')) car = "Toyota Chaser JZX100";
    else if (match.includes('Cockpit')) car = "Porsche 935 K3";
    else if (match.includes('Motion Blur')) car = "Toyota GR86";
    else if (match.includes('Tracking')) car = "Nissan R33 GT-R";
    
    return `<div class="gallery-caption">\n          ${car}\n        </div>`;
});

fs.writeFileSync('index.html', html);
console.log('Regex update complete!');
