import fs from 'fs';
import path from 'path';
import https from 'https';

const FISH_LIST = [
  { slug: 'colour-widow-tetra', search: 'Black tetra' },
  { slug: 'emperor-tetra', search: 'Emperor tetra' },
  { slug: 'rummynose-tetra', search: 'Rummy-nose tetra' },
  { slug: 'congo-tetra', search: 'Congo tetra' },
  { slug: 'lemon-tetra', search: 'Lemon tetra' },
  { slug: 'cherry-barb', search: 'Cherry barb' },
  { slug: 'rosy-barb', search: 'Rosy barb' },
  { slug: 'tiger-barb', search: 'Tiger barb' },
  { slug: 'full-red-guppy', search: 'Guppy' },
  { slug: 'purple-berry-guppy', search: 'Guppy' },
  { slug: 'yellow-tuxedo-guppy', search: 'Guppy' },
  { slug: 'purple-guppy', search: 'Guppy' },
  { slug: 'big-ear-guppy', search: 'Guppy' },
  { slug: 'full-black-guppy', search: 'Guppy' },
  { slug: 'full-gold-guppy', search: 'Guppy' },
  { slug: 'black-oscar', search: 'Oscar (fish)' },
  { slug: 'medium-oscar', search: 'Oscar (fish)' },
  { slug: 'copper-oscar', search: 'Oscar (fish)' },
  { slug: 'thailand-oscar', search: 'Oscar (fish)' },
  { slug: 'yellow-parrot', search: 'Blood parrot cichlid' },
  { slug: 'discus-fish', search: 'Discus (fish)' },
  { slug: 'fighter-female', search: 'Siamese fighting fish' },
  { slug: 'sucker-fish', search: 'Hypostomus plecostomus' },
  { slug: 'severum-fish', search: 'Banded cichlid' },
  { slug: 'silver-dollar', search: 'Silver dollar (fish)' },
  { slug: 'red-colisa', search: 'Dwarf gourami' },
  { slug: 'yellow-ram', search: 'Ram cichlid' },
  { slug: 'polar-parrot', search: 'Blood parrot cichlid' },
  { slug: 'peacock-bass', search: 'Peacock bass' },
  { slug: 'texas-cichlid', search: 'Texas cichlid' },
  { slug: 'knife-fish', search: 'Chitala ornata' }
];

const DIR = "C:/Users/aanandab/Desktop/Work/public/images/fish";

async function fetchWikiImage(searchTerm) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(searchTerm)}&pithumbsize=800&format=json`;
    https.get(url, { headers: { 'User-Agent': 'NodeJS/AquariumScript' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== "-1" && pages[pageId].thumbnail) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve(null);
          }
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, filepath).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  
  for (const fish of FISH_LIST) {
    const filepath = path.join(DIR, `${fish.slug}.jpg`);
    if (fs.existsSync(filepath)) {
      console.log(`Skipping ${fish.slug}, exists.`);
      continue;
    }
    
    console.log(`Searching Wikipedia for: ${fish.search}...`);
    const imgUrl = await fetchWikiImage(fish.search);
    
    if (imgUrl) {
      console.log(`Downloading ${imgUrl} -> ${fish.slug}.jpg`);
      await downloadFile(imgUrl, filepath);
    } else {
      console.log(`Not found on Wiki: ${fish.search}, using placeholder.`);
      // Download a generic fish placeholder
      await downloadFile('https://placehold.co/800x600/004c4c/FFFFFF/jpeg?text=' + encodeURIComponent(fish.slug), filepath);
    }
    // Small delay to be polite to Wikipedia API
    await new Promise(r => setTimeout(r, 500));
  }
  console.log("All done!");
}

main();
