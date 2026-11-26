export const dynamic = 'force-static';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://arsenekit.vercel.app').replace(/\/$/, '');

export default function sitemap() {
  return [
    { url: `${siteUrl}/` },
    { url: `${siteUrl}/image-converter/` },
    { url: `${siteUrl}/live-code-editor/` },
    { url: `${siteUrl}/json-formatter/` },
  ];
}
