import { load } from 'cheerio';
import fs from 'fs';
const slugs = ['joseph-may', 'gourmet-food-parlour', 'capella', 'turnua', 'breast-cancer-ireland'];
for (const slug of slugs) {
  console.log(`\n###### ${slug} ######`);
  const html = fs.readFileSync(`/Users/connor/Code/client-projects/rooftoptwentytwo/_source/mirror/portfolio/${slug}/index.html`, 'utf8');
  const $ = load(html);
  const parents = $('.e-parent').toArray();
  parents.forEach((el, i) => {
    const headings = $(el).find('.elementor-heading-title').map((_, h) => $(h).text().trim()).get().filter(h => h && h.length < 200);
    if (headings.length) console.log(`[${i}] ${headings.slice(0, 5).map(h => `"${h.slice(0,60)}"`).join(', ')}`);
  });
  // Find hero bg image style
  const heroIdMatch = html.match(/elementor-element-(\w+):not\([^)]*background[^)]*\)[^{]*\{[^}]*background-image:url\(["']([^"')]+)["']\)/);
  console.log('hero bg:', heroIdMatch ? heroIdMatch[2] : 'NONE');
}
