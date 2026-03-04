#!/usr/bin/env node
/**
 * Mini crawl SEO – récupère URLs via sitemap, puis pour chaque URL :
 * status, title, meta description, H1, canonical, wordcount.
 * Détecte : pages < 300 mots, titles dupliqués, meta manquantes.
 *
 * Usage: node scripts/crawl-seo.mjs [URL_SITEMAP]
 * Exemple: node scripts/crawl-seo.mjs https://salledeculte.com/sitemap.xml
 *
 * Nécessite Node 18+ (fetch natif). Aucune dépendance externe.
 */

const sitemapUrl = process.argv[2] || "https://salledeculte.com/sitemap.xml";

async function fetchText(url, redirectCount = 0) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "SEO-Crawl/1.0 (audit)" },
  });
  const text = await res.text();
  return { status: res.status, finalUrl: res.url, text };
}

function extractLocFromSitemap(text) {
  const locs = [];
  const re = /<loc>\s*([^<]+)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(text)) !== null) locs.push(m[1].trim());
  return locs;
}

async function getUrlsFromSitemap(url) {
  const { text } = await fetchText(url);
  const locs = extractLocFromSitemap(text);
  if (locs.length > 0) return locs;
  // Sitemap index: follow child sitemaps
  const re = /<loc>\s*([^<]+)\s*<\/loc>/gi;
  const childSitemaps = [];
  let m;
  while ((m = re.exec(text)) !== null) childSitemaps.push(m[1].trim());
  const all = [];
  for (const sm of childSitemaps) {
    if (/\.xml$/i.test(sm)) all.push(...(await getUrlsFromSitemap(sm)));
  }
  return all;
}

function extractData(html, status, url) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
  const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
    html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  const metaDesc = metaMatch ? metaMatch[1].trim() : "";
  const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i) ||
    html.match(/<link\s+href=["']([^"']*)["']\s+rel=["']canonical["']/i);
  const canonical = canonMatch ? canonMatch[1].trim() : "";
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : "";
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyText = bodyMatch ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
  const wordcount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;
  return { url, status, title, metaDesc, canonical, h1, wordcount };
}

function escapeCsv(val) {
  const s = String(val ?? "").replace(/"/g, '""');
  return `"${s}"`;
}

async function main() {
  console.log("Fetching sitemap:", sitemapUrl);
  const urls = await getUrlsFromSitemap(sitemapUrl);
  console.log("Found", urls.length, "URLs\n");

  const results = [];
  for (const url of urls) {
    try {
      const { status, finalUrl, text } = await fetchText(url);
      const data = extractData(text, status, finalUrl);
      results.push(data);
      process.stdout.write(`  ${status} ${url}\n`);
    } catch (e) {
      console.error("  ERR", url, e.message);
      results.push({ url, status: 0, title: "", metaDesc: "", canonical: "", h1: "", wordcount: 0 });
    }
  }

  const outPath = "crawl-seo.csv";
  const fs = await import("node:fs");
  const header = ["url", "status", "title", "metaDesc", "canonical", "h1", "wordcount"];
  const lines = [header.map(escapeCsv).join(",")];
  for (const r of results) {
    lines.push(header.map((k) => escapeCsv(r[k])).join(","));
  }
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log("\nCSV written to", outPath);

  const shortPages = results.filter((r) => r.wordcount > 0 && r.wordcount < 300);
  const missingMeta = results.filter((r) => !(r.metaDesc && r.metaDesc.length >= 50));
  const missingTitle = results.filter((r) => !r.title || r.title.length < 10);
  const titleCount = new Map();
  for (const r of results) {
    const key = (r.title || "(no title)").toLowerCase();
    if (!titleCount.has(key)) titleCount.set(key, []);
    titleCount.get(key).push(r.url);
  }
  const duplicateTitles = [...titleCount.entries()].filter(([, urls]) => urls.length > 1);

  console.log("\n--- Pages < 300 mots ---");
  shortPages.forEach((r) => console.log(" ", r.url, "→", r.wordcount, "mots"));
  console.log("\n--- Meta description manquante ou trop courte (< 50 car) ---");
  missingMeta.forEach((r) => console.log(" ", r.url));
  console.log("\n--- Title manquant ou trop court (< 10 car) ---");
  missingTitle.forEach((r) => console.log(" ", r.url, "→", (r.title || "").slice(0, 50)));
  console.log("\n--- Titres dupliqués ---");
  duplicateTitles.forEach(([title, urls]) => {
    console.log(" ", title.slice(0, 60) + (title.length > 60 ? "…" : ""));
    urls.forEach((u) => console.log("   -", u));
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
