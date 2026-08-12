const fs = require('fs');
const path = require('path');

// 1. Clean up index.html (Remove Celica & RX-7 cards)
let indexHtml = fs.readFileSync('index.html', 'utf8');

const celicaCardRegex = /<a href="shoot-toyota-celica\.html"[\s\S]*?<\/a>/;
const rx7CardRegex = /<a href="shoot-mazda-rx7\.html"[\s\S]*?<\/a>/;

indexHtml = indexHtml.replace(celicaCardRegex, '');
indexHtml = indexHtml.replace(rx7CardRegex, '');

fs.writeFileSync('index.html', indexHtml);
console.log('Removed Celica and RX-7 cards from index.html');

// 2. Extract Header and Footer from index.html
const headerRegex = /<header class="header">[\s\S]*?<\/header>/;
const footerRegex = /<footer class="footer">[\s\S]*?<\/footer>/;

let headerMatch = indexHtml.match(headerRegex);
let footerMatch = indexHtml.match(footerRegex);

if (!headerMatch || !footerMatch) {
    console.error('Could not find header or footer in index.html');
    process.exit(1);
}

let newHeader = headerMatch[0];
let newFooter = footerMatch[0];

// Modify header links for subpages
newHeader = newHeader.replace(/href="#home"/g, 'href="index.html#home"');
newHeader = newHeader.replace(/href="#about"/g, 'href="index.html#about"');
newHeader = newHeader.replace(/href="#portfolio"/g, 'href="index.html#portfolio"');
newHeader = newHeader.replace(/href="#pricing"/g, 'href="index.html#pricing"');
newHeader = newHeader.replace(/href="#contact"/g, 'href="index.html#contact"');

// 3. Inject into all article pages
const articleFiles = [
    'shoot-honda-nsx.html',
    'shoot-toyota-celica.html',
    'shoot-mazda-rx7.html',
    'shoot-toyota-gr86-tatsumi.html',
    'shoot-nissan-gtr.html',
    'shoot-toyota-gr86.html'
];

articleFiles.forEach(file => {
    let articleHtml = fs.readFileSync(file, 'utf8');
    
    articleHtml = articleHtml.replace(/<header class="header">[\s\S]*?<\/header>/, newHeader);
    articleHtml = articleHtml.replace(/<footer class="footer">[\s\S]*?<\/footer>/, newFooter);
    
    fs.writeFileSync(file, articleHtml);
    console.log(`Updated header and footer in ${file}`);
});

// 4. Rewrite Copywriting for 5 new articles
const copyRewrites = {
    'shoot-honda-nsx.html': {
        title: 'Honda NSX (NA1)',
        subtitleEN: 'Just a timeless legend doing its thing under the Tokyo lights.',
        subtitleJA: '東京の夜を走る、時代を超えた伝説。',
        para1EN: 'Man, getting to shoot this NA1 NSX was a dream. There’s something so raw and analog about these 90s JDM icons. We met up late at night, and I just knew we had to focus on those pop-up headlights. They just don’t make cars with this kind of character anymore.',
        para1JA: 'このNA1 NSXを撮影できたのは本当に夢みたいでした。90年代のJDMアイコンって、何かすごく生々しくてアナログな魅力があるんですよね。深夜に待ち合わせて、とにかくあのリトラクタブルヘッドライトにフォーカスしようって決めました。こんなキャラクターを持った車、今はもう作られないですからね。',
        para2EN: 'The way the shrine lights hit that classic red paint... it just felt right. The owner was super chill and we spent a good hour just talking about the history of the chassis before we even started snapping pics. Definitely a shoot I won’t forget.',
        para2JA: '神社の明かりがクラシックな赤いボディに反射する感じ…最高でした。オーナーさんもすごく気さくな方で、写真を撮り始める前に1時間くらいこのシャシーの歴史について語り合っちゃいました。絶対に忘れられない撮影になりました。'
    },
    'shoot-toyota-celica.html': {
        title: 'Toyota Celica RA21',
        subtitleEN: 'A mint green time machine rolling through the neon streets.',
        subtitleJA: 'ネオン街を走る、ミントグリーンのタイムマシン。',
        para1EN: 'Shooting this vintage Celica GT Liftback was a blast! You just don’t see this mint green color very often, and seeing it parked in a random Tokyo alleyway felt like stepping back into the 70s. The chrome accents just popped crazy hard against the city lights.',
        para1JA: 'このビンテージのセリカGTリフトバックの撮影は最高に楽しかったです！このミントグリーンって滅多にお目にかかれないし、東京の裏路地に停まっているのを見ると、まるで70年代にタイムスリップしたような気分になりました。街の明かりに反射するクロームパーツがめちゃくちゃ映えてました。',
        para2EN: 'The owner had these custom Sparco Martini Racing bucket seats inside, which just added so much flavor to the build. We just drove around Shinjuku looking for cool neon signs and let the car do all the talking. Good vibes all around.',
        para2JA: 'オーナーさんがスパルコのマルティニ・レーシングのバケットシートを入れてて、それがまたこの車に味を出してたんですよね。新宿周辺をドライブしながら、カッコいいネオンサインを探して、あとは車に語らせるだけでした。終始最高の雰囲気でした。'
    },
    'shoot-mazda-rx7.html': {
        title: 'Mazda RX-7 FD3S',
        subtitleEN: 'Rotary power and crazy red paint at Daikoku.',
        subtitleJA: '大黒でのロータリーパワーとクレイジーなレッド。',
        para1EN: 'You can’t talk about Tokyo car culture without mentioning the FD3S RX-7. When this vibrant red rotary beast rolled up to Daikoku PA, I had to grab my camera. The lines on the FD are just timeless, and getting those wide angles of it parked up was super fun.',
        para1JA: '東京のカーカルチャーを語る上で、FD3S RX-7は外せませんよね。この鮮やかな赤いロータリーの野獣が大黒PAにやってきた時、思わずカメラを手に取りました。FDのボディラインは本当に時代を超越していて、停まっている姿を広角で撮るのはめちゃくちゃ楽しかったです。',
        para2EN: 'We hung out at Daikoku for a bit and then took it over to Tatsumi to get some different lighting. The car is so loud and aggressive, I tried to capture that same energy in the photos. The owner really built something special here.',
        para2JA: '大黒で少し時間を過ごした後、光の雰囲気を変えたくて辰巳にも足を伸ばしました。車のサウンドもルックスもすごくアグレッシブなので、そのエネルギーを写真にも収めようと頑張りました。オーナーのこだわりが詰まった特別な一台ですね。'
    },
    'shoot-toyota-gr86-tatsumi.html': {
        title: 'Toyota GR86 (Sunset)',
        subtitleEN: 'Catching that golden hour magic at Tatsumi PA.',
        subtitleJA: '辰巳PAでのマジックアワー。',
        para1EN: 'Honestly, Tatsumi PA hits different when the sun goes down. I met up with the owner of this clean gray GR86 just as golden hour started. The way the sunset gradients reflected off the sleek paint and those aftermarket wheels was just insane.',
        para1JA: '正直、夕暮れ時の辰巳PAは別格です。ゴールデンアワーが始まるちょうどその時、このクリーンなグレーのGR86のオーナーさんと合流しました。夕焼けのグラデーションが、滑らかなボディや社外ホイールに反射する様子は、もう狂おしいほど美しかったです。',
        para2EN: 'We literally just chilled, talked about cars, and waited for the city lights to slowly turn on. The backdrop of the Tokyo skyline twilight made for some super moody, cinematic shots. Simple car, perfect lighting, great conversation. That’s what it’s all about.',
        para2JA: 'ただのんびりしながら車について語り合って、街の明かりがゆっくりと灯り始めるのを待ってました。東京の夕暮れのスカイラインを背景にすると、すごくムードのある映画のような写真が撮れるんです。シンプルな車に完璧な光、そして最高の会話。これに尽きますね。'
    },
    'shoot-nissan-gtr.html': {
        title: 'Nissan R35 GTR',
        subtitleEN: 'Late night cruising with the Midnight Godzilla.',
        subtitleJA: '真夜中のゴジラとのナイトクルージング。',
        para1EN: 'This blue R35 GTR is just a monster, pure and simple. We wanted to do something a little moody and cyberpunk, so we took it out super late when the streets were empty. The deep metallic blue paint looks completely black until the streetlights hit it just right.',
        para1JA: 'このブルーのR35 GTRは、純粋にただのモンスターです。ちょっとムーディーでサイバーパンクな雰囲気を狙いたくて、通りから人が消える深夜に引っ張り出しました。深みのあるメタリックブルーのボディは、街灯が綺麗に当たるまでは完全に真っ黒に見えるんですよ。',
        para2EN: 'Those iconic quad LED taillights glowing in the dark... it never gets old. We spent the night hunting for cool industrial spots and neon lights across Tokyo. It was freezing out, but the shots we got made it totally worth it.',
        para2JA: '暗闇に浮かび上がるあの象徴的な4灯のLEDテールライト…何度見ても飽きませんね。東京中のクールな工業地帯やネオンの光を探して一晩中走り回りました。外は凍えるほど寒かったですが、撮れた写真を見たらそんなの吹き飛びましたね。'
    }
};

for (const [file, rewrites] of Object.entries(copyRewrites)) {
    let articleHtml = fs.readFileSync(file, 'utf8');
    
    // Simple regex replacements for the paragraphs. We just replace everything inside the article-content section
    const contentRegex = /<div class="article-content reveal reveal-up">[\s\S]*?<\/div>/;
    
    const newContent = `<div class="article-content reveal reveal-up">
        <p lang="en">${rewrites.para1EN}</p>
        <p lang="ja" class="lang-hide">${rewrites.para1JA}</p>
        <p lang="en">${rewrites.para2EN}</p>
        <p lang="ja" class="lang-hide">${rewrites.para2JA}</p>
      </div>`;
      
    articleHtml = articleHtml.replace(contentRegex, newContent);
    
    // Also fix the subtitles if we can find them
    const subtitleRegexEN = /<p class="article-subtitle" lang="en">[\s\S]*?<\/p>/;
    const subtitleRegexJA = /<p class="article-subtitle lang-hide" lang="ja">[\s\S]*?<\/p>/;
    
    if (subtitleRegexEN.test(articleHtml)) {
        articleHtml = articleHtml.replace(subtitleRegexEN, `<p class="article-subtitle" lang="en">${rewrites.subtitleEN}</p>`);
    }
    if (subtitleRegexJA.test(articleHtml)) {
        articleHtml = articleHtml.replace(subtitleRegexJA, `<p class="article-subtitle lang-hide" lang="ja">${rewrites.subtitleJA}</p>`);
    }
    
    // Since Subagent used a custom title structure in nissan-gtr, let's just make sure we capture anything that looks like article-content
    if (!contentRegex.test(articleHtml)) {
       console.log("Could not find standard article-content in " + file);
       // We'll replace based on the first two <p> tags after <div class="article-content">
       const genericContentRegex = /<div class="article-content">[\s\S]*?(<img|<div class="image-grid)/;
       let genericMatch = articleHtml.match(genericContentRegex);
       if (genericMatch) {
            let prefix = `<div class="article-content">\n        <p lang="en">${rewrites.para1EN}</p>\n        <p lang="ja" class="lang-hide">${rewrites.para1JA}</p>\n        <p lang="en">${rewrites.para2EN}</p>\n        <p lang="ja" class="lang-hide">${rewrites.para2JA}</p>\n        \n        `;
            articleHtml = articleHtml.replace(genericContentRegex, prefix + '$1');
       }
    }

    fs.writeFileSync(file, articleHtml);
    console.log(`Rewrote copy in ${file}`);
}
