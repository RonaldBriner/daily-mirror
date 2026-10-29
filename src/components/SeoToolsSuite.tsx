import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Sparkles,
  Download,
  RotateCcw,
  Search,
  Globe,
  Code2,
  FileSpreadsheet,
  FileText,
  Gauge,
} from 'lucide-react';
import { BlogPost } from '../data/blogData';
import { analyzeSeoContent, generateKeywordCluster } from '../utils/seoEngine';

export type ToolTab =
  | 'seo-checker'
  | 'keyword-research'
  | 'meta-generator'
  | 'word-counter'
  | 'sitemap-robots';

interface SeoToolsSuiteProps {
  posts: BlogPost[];
  initialAuditPost?: BlogPost | null;
  activeTab: ToolTab;
  onTabChange: (tab: ToolTab) => void;
}

export const SeoToolsSuite: React.FC<SeoToolsSuiteProps> = ({
  posts,
  initialAuditPost,
  activeTab,
  onTabChange,
}) => {
  const defaultPost = initialAuditPost || posts[0];
  const buildFullBody = (p: BlogPost) =>
    `${p.openingParagraph}\n\n${p.sections
      .map((s) => `${s.heading}\n\n${s.paragraphs.join('\n\n')}`)
      .join('\n\n')}`;

  const [selectedPresetId, setSelectedPresetId] = useState<string>(defaultPost.id);
  const [websiteUrl, setWebsiteUrl] = useState<string>('https://dailymirror.press');
  const [title, setTitle] = useState<string>(defaultPost.metaTitle || defaultPost.title);
  const [metaDescription, setMetaDescription] = useState<string>(
    defaultPost.metaDescription || defaultPost.excerpt
  );
  const [slug, setSlug] = useState<string>(defaultPost.slug);
  const [focusKeyword, setFocusKeyword] = useState<string>(defaultPost.focusKeyword);
  const [secondaryKeywordsRaw, setSecondaryKeywordsRaw] = useState<string>(
    defaultPost.secondaryKeywords.join(', ')
  );
  const [bodyText, setBodyText] = useState<string>(buildFullBody(defaultPost));
  const [authorName, setAuthorName] = useState<string>(defaultPost.author.name);
  const [schemaType, setSchemaType] = useState<'NewsArticle' | 'Article' | 'WebApplication'>(
    'NewsArticle'
  );
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (initialAuditPost) {
      setSelectedPresetId(initialAuditPost.id);
      setTitle(initialAuditPost.metaTitle || initialAuditPost.title);
      setMetaDescription(initialAuditPost.metaDescription || initialAuditPost.excerpt);
      setSlug(initialAuditPost.slug);
      setFocusKeyword(initialAuditPost.focusKeyword);
      setSecondaryKeywordsRaw(initialAuditPost.secondaryKeywords.join(', '));
      setBodyText(buildFullBody(initialAuditPost));
      setAuthorName(initialAuditPost.author.name);
      onTabChange('seo-checker');
    }
  }, [initialAuditPost]);

  const handleLoadPostPreset = (postId: string) => {
    setSelectedPresetId(postId);
    if (postId === 'custom') {
      setTitle('');
      setMetaDescription('');
      setSlug('my-new-blog-post');
      setFocusKeyword('');
      setSecondaryKeywordsRaw('');
      setBodyText('');
      return;
    }
    const found = posts.find((p) => p.id === postId);
    if (found) {
      setTitle(found.metaTitle || found.title);
      setMetaDescription(found.metaDescription || found.excerpt);
      setSlug(found.slug);
      setFocusKeyword(found.focusKeyword);
      setSecondaryKeywordsRaw(found.secondaryKeywords.join(', '));
      setBodyText(buildFullBody(found));
      setAuthorName(found.author.name);
    }
  };

  const handleAutoOptimizeMeta = () => {
    const kw = focusKeyword.trim() || 'SEO Strategy';
    const capitalizedKw = kw.replace(/\b\w/g, (c) => c.toUpperCase());

    if (!title.toLowerCase().includes(kw.toLowerCase()) || title.length < 40 || title.length > 62) {
      const candidateTitle = `${capitalizedKw}: Complete Guide & Best Practices | DailyMirror`;
      setTitle(candidateTitle.slice(0, 60));
    }

    if (
      !metaDescription.toLowerCase().includes(kw.toLowerCase()) ||
      metaDescription.length < 120 ||
      metaDescription.length > 160
    ) {
      const candidateMeta = `Learn everything about ${kw.toLowerCase()} on DailyMirror. Discover practical SEO tips, step-by-step ranking strategies, and free optimization tools.`;
      setMetaDescription(candidateMeta.slice(0, 158));
    }

    const cleanSlug = kw
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    if (cleanSlug && !slug.includes(cleanSlug)) {
      setSlug(`${cleanSlug}-guide`);
    }
  };

  const analysis = useMemo(() => {
    return analyzeSeoContent({
      title,
      metaDescription,
      slug,
      focusKeyword,
      secondaryKeywordsRaw,
      bodyText,
    });
  }, [title, metaDescription, slug, focusKeyword, secondaryKeywordsRaw, bodyText]);

  const topExtractedWords = useMemo(() => {
    const stopWords = new Set([
      'the', 'and', 'for', 'that', 'this', 'with', 'from', 'your', 'are', 'have', 'not',
      'but', 'what', 'all', 'were', 'when', 'we', 'there', 'can', 'an', 'which', 'their',
      'if', 'will', 'one', 'has', 'more', 'into', 'who', 'other', 'than', 'its', 'also',
      'how', 'our', 'about', 'they', 'been', 'only', 'over', 'such', 'after', 'most',
    ]);
    const words = bodyText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !stopWords.has(w));
    const freq: Record<string, number> = {};
    words.forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({
        word,
        count,
        pct: words.length > 0 ? ((count / words.length) * 100).toFixed(1) : '0.0',
      }));
  }, [bodyText]);

  const [seedKeyword, setSeedKeyword] = useState<string>('digital marketing blog');
  const [intentFilter, setIntentFilter] = useState<string>('All');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [disallowAdmin, setDisallowAdmin] = useState<boolean>(true);
  const [disallowSearchParams, setDisallowSearchParams] = useState<boolean>(true);

  const keywordCluster = useMemo(() => {
    const raw = generateKeywordCluster(seedKeyword);
    if (intentFilter === 'All') return raw;
    return raw.filter((item) => item.intent === intentFilter);
  }, [seedKeyword, intentFilter]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExportKeywordsCsv = () => {
    const headers = [
      'Keyword',
      'Search Intent',
      'Monthly Volume',
      'KD (%)',
      'CPC (USD)',
      'Recommended Format',
    ];
    const rows = keywordCluster.map((k) => [
      `"${k.keyword}"`,
      k.intent,
      k.monthlyVolume,
      k.difficulty,
      k.cpcUsd,
      `"${k.recommendedFormat}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dailymirror-keywords-${seedKeyword.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatedMetaHtml = useMemo(() => {
    const cleanBase = websiteUrl.replace(/\/$/, '') || 'https://dailymirror.press';
    const canonicalUrl = `${cleanBase}/articles/${slug || 'untitled'}`;
    return `<!-- DailyMirror SEO & OpenGraph Meta Tags -->
<title>${title}</title>
<meta name="description" content="${metaDescription}" />
<meta name="keywords" content="${[focusKeyword, secondaryKeywordsRaw].filter(Boolean).join(', ')}" />
<link rel="canonical" href="${canonicalUrl}" />

<!-- OpenGraph / Facebook / LinkedIn -->
<meta property="og:type" content="article" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${metaDescription}" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:site_name" content="DailyMirror" />

<!-- Twitter / X Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${metaDescription}" />`;
  }, [websiteUrl, title, metaDescription, slug, focusKeyword, secondaryKeywordsRaw]);

  const generatedJsonLd = useMemo(() => {
    const cleanBase = websiteUrl.replace(/\/$/, '') || 'https://dailymirror.press';
    const canonicalUrl = `${cleanBase}/articles/${slug || 'untitled'}`;
    const schemaObj = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      headline: title.slice(0, 110),
      description: metaDescription,
      author: {
        '@type': 'Person',
        name: authorName || 'DailyMirror Editorial Desk',
      },
      publisher: {
        '@type': 'Organization',
        name: 'DailyMirror',
        url: cleanBase,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      datePublished: '2026-10-28',
    };
    return JSON.stringify(schemaObj, null, 2);
  }, [websiteUrl, schemaType, title, metaDescription, slug, authorName]);

  const generatedRobotsTxt = useMemo(() => {
    const cleanBase = websiteUrl.replace(/\/$/, '') || 'https://dailymirror.press';
    const lines = ['User-agent: *', 'Allow: /'];
    if (disallowAdmin) {
      lines.push('Disallow: /admin/', 'Disallow: /wp-admin/', 'Disallow: /api/');
    }
    if (disallowSearchParams) {
      lines.push('Disallow: /*?sort=*', 'Disallow: /*?filter=*', 'Disallow: /search?q=*');
    }
    lines.push('', `Sitemap: ${cleanBase}/sitemap.xml`);
    return lines.join('\n');
  }, [websiteUrl, disallowAdmin, disallowSearchParams]);

  const generatedSitemapXml = useMemo(() => {
    const cleanBase = websiteUrl.replace(/\/$/, '') || 'https://dailymirror.press';
    const urls = posts
      .map(
        (p) => `  <url>
    <loc>${cleanBase}/articles/${p.slug}</loc>
    <lastmod>2026-10-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.isLeadStory ? '1.0' : '0.8'}</priority>
  </url>`
      )
      .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${cleanBase}/</loc>
    <lastmod>2026-10-28</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`;
  }, [websiteUrl, posts]);

  return (
    <section className="w-full">
      {/* Main Tool Workspace Header */}
      <div className="p-6 sm:p-8 bg-[#F7F4EE] border border-stone-200 rounded-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-300">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#1E3A8A] font-semibold mb-1.5">
              DailyMirror SEO Tool Suite · Live Analyzer &amp; Generator
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-stone-900 tracking-tight">
              DailyMirror All-in-One SEO Tool
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Check your on-page SEO score, find profitable keywords, preview Google SERP meta tags,
              calculate word &amp; keyword density, and generate XML sitemaps.
            </p>
          </div>

          {/* 4 Live Score / Quick Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="px-3.5 py-2.5 bg-[#FBF9F5] border border-stone-200 rounded-md text-center">
              <div className="text-[11px] text-stone-500">SEO Score</div>
              <div className="font-mono text-lg font-bold text-[#1E3A8A] tabular-nums">
                {analysis.overallScore}/100
              </div>
            </div>
            <div className="px-3.5 py-2.5 bg-[#FBF9F5] border border-stone-200 rounded-md text-center">
              <div className="text-[11px] text-stone-500">Words</div>
              <div className="font-mono text-lg font-bold text-stone-900 tabular-nums">
                {analysis.wordCount}
              </div>
            </div>
            <div className="px-3.5 py-2.5 bg-[#FBF9F5] border border-stone-200 rounded-md text-center">
              <div className="text-[11px] text-stone-500">Readability</div>
              <div className="font-mono text-lg font-bold text-stone-900 tabular-nums">
                {analysis.fleschScore}/100
              </div>
            </div>
            <div className="px-3.5 py-2.5 bg-[#FBF9F5] border border-stone-200 rounded-md text-center">
              <div className="text-[11px] text-stone-500">Title Width</div>
              <div className="font-mono text-lg font-bold text-stone-900 tabular-nums">
                {analysis.titlePixelWidth}px
              </div>
            </div>
          </div>
        </div>

        {/* 5 Interactive SEO Tool Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-5">
          <button
            onClick={() => onTabChange('seo-checker')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'seo-checker'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'bg-[#FBF9F5] text-stone-700 border border-stone-300 hover:bg-stone-200/60'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>1. On-Page SEO Checker</span>
          </button>

          <button
            onClick={() => onTabChange('keyword-research')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'keyword-research'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'bg-[#FBF9F5] text-stone-700 border border-stone-300 hover:bg-stone-200/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>2. Keyword Research Tool</span>
          </button>

          <button
            onClick={() => onTabChange('meta-generator')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'meta-generator'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'bg-[#FBF9F5] text-stone-700 border border-stone-300 hover:bg-stone-200/60'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>3. Meta Tag &amp; SERP Tool</span>
          </button>

          <button
            onClick={() => onTabChange('word-counter')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'word-counter'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'bg-[#FBF9F5] text-stone-700 border border-stone-300 hover:bg-stone-200/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>4. Word &amp; Density Counter</span>
          </button>

          <button
            onClick={() => onTabChange('sitemap-robots')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'sitemap-robots'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'bg-[#FBF9F5] text-stone-700 border border-stone-300 hover:bg-stone-200/60'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>5. Sitemap &amp; Robots.txt</span>
          </button>
        </div>
      </div>

      {/* TOOL 1: ON-PAGE SEO SCORE CHECKER */}
      {activeTab === 'seo-checker' && (
        <div className="mt-6 space-y-6">
          <div className="p-4 bg-[#F7F4EE] border border-stone-200 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="preset-select" className="text-xs font-semibold text-stone-700">
                Load Sample Blog or Paste Your Own Content:
              </label>
              <select
                id="preset-select"
                value={selectedPresetId}
                onChange={(e) => handleLoadPostPreset(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium bg-[#FBF9F5] border border-stone-300 rounded-md text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
              >
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    DailyMirror Blog: {p.title.slice(0, 50)}...
                  </option>
                ))}
                <option value="custom">Empty Workspace (Paste Your Own Article)</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleAutoOptimizeMeta}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#1E3A8A] rounded-md hover:bg-[#172E6E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Fix Title &amp; Meta</span>
              </button>
              <button
                onClick={() => handleLoadPostPreset('custom')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-[#FBF9F5] border border-stone-300 rounded-md hover:bg-stone-200/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4 p-6 bg-[#F7F4EE] border border-stone-200 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Focus Keyword (Target Keyword)
                  </label>
                  <input
                    type="text"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="e.g. semantic entity indexing"
                    className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Page URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-blog-post-url"
                    className="w-full px-3 py-2 text-sm font-mono bg-[#FBF9F5] border border-stone-300 rounded-md text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-semibold text-stone-700">Page SEO Title</label>
                  <span className="font-mono text-stone-500 tabular-nums">
                    {analysis.titleLength} / 60 chars ({analysis.titlePixelWidth}px)
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your blog or website title..."
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-semibold text-stone-700">Meta Description</label>
                  <span className="font-mono text-stone-500 tabular-nums">
                    {analysis.metaLength} / 160 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Write a 120-160 character summary for Google search results..."
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-semibold text-stone-700">Article / Page Content</label>
                  <span className="font-mono text-stone-500 tabular-nums">
                    {analysis.wordCount} words · {analysis.readingTimeMinutes} min read
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Paste your blog post or webpage content here to check SEO score..."
                  className="w-full px-3 py-2.5 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md text-stone-900 leading-relaxed focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 bg-[#F7F4EE] border border-stone-200 rounded-lg">
                <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
                      Live SEO Audit Report
                    </div>
                    <div className="font-serif text-xl font-medium text-stone-900 mt-0.5">
                      {analysis.gradeLabel}
                    </div>
                  </div>
                  <div className="font-mono text-4xl font-bold text-[#1E3A8A] tabular-nums">
                    {analysis.overallScore}
                    <span className="text-base font-normal text-stone-500">/100</span>
                  </div>
                </div>

                <div className="space-y-2.5 mt-4 max-h-[380px] overflow-y-auto pr-1">
                  {analysis.checks.map((chk) => (
                    <div
                      key={chk.id}
                      className="p-3 bg-[#FBF9F5] border border-stone-200 rounded-md"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {chk.status === 'optimal' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          )}
                          {chk.status === 'warning' && (
                            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                          )}
                          {chk.status === 'critical' && (
                            <XCircle className="w-4 h-4 text-red-700 shrink-0" />
                          )}
                          <span className="text-xs font-semibold text-stone-900">{chk.label}</span>
                        </div>
                        <span className="font-mono text-[11px] text-stone-600 tabular-nums">
                          {chk.metricValue}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 pl-6">{chk.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: KEYWORD RESEARCH TOOL */}
      {activeTab === 'keyword-research' && (
        <div className="mt-6 p-6 bg-[#F7F4EE] border border-stone-200 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-stone-200">
            <div className="flex-1 max-w-lg">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Enter Topic or Seed Keyword (Find High-Ranking Keywords)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={seedKeyword}
                  onChange={(e) => setSeedKeyword(e.target.value)}
                  placeholder="e.g. blogging tips, technical seo, online earning..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-[#EBE6DF] rounded-md">
                {['All', 'Informational', 'Commercial', 'Transactional'].map((intent) => (
                  <button
                    key={intent}
                    onClick={() => setIntentFilter(intent)}
                    className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer whitespace-nowrap ${
                      intentFilter === intent
                        ? 'bg-[#FBF9F5] text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {intent}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExportKeywordsCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded-md hover:bg-[#172E6E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-300 text-stone-500 uppercase tracking-wider">
                  <th className="py-3 pr-4 font-semibold">Suggested Keyword</th>
                  <th className="py-3 px-3 font-semibold">Intent</th>
                  <th className="py-3 px-3 font-semibold text-right">Monthly Searches</th>
                  <th className="py-3 px-3 font-semibold text-right">SEO Difficulty (KD)</th>
                  <th className="py-3 px-3 font-semibold text-right">CPC ($ USD)</th>
                  <th className="py-3 pl-3 font-semibold">Recommended Blog Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/80">
                {keywordCluster.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-200/30">
                    <td className="py-3 pr-4 font-medium text-stone-900">{item.keyword}</td>
                    <td className="py-3 px-3 text-stone-600">{item.intent}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-800">
                      {item.monthlyVolume.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <span
                        className={
                          item.difficulty < 30
                            ? 'text-emerald-700 font-semibold'
                            : item.difficulty < 50
                            ? 'text-amber-700 font-semibold'
                            : 'text-red-700 font-semibold'
                        }
                      >
                        {item.difficulty}/100 (
                        {item.difficulty < 30 ? 'Easy' : item.difficulty < 50 ? 'Medium' : 'Hard'})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-800">
                      ${item.cpcUsd.toFixed(2)}
                    </td>
                    <td className="py-3 pl-3 text-stone-600">{item.recommendedFormat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TOOL 3: META TAG & GOOGLE SERP GENERATOR */}
      {activeTab === 'meta-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          <div className="lg:col-span-6 p-6 bg-[#F7F4EE] border border-stone-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Google Search Result Preview
              </h3>
              <div className="flex items-center gap-1 p-1 bg-[#EBE6DF] rounded-md">
                <button
                  onClick={() => setSerpDevice('desktop')}
                  className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer ${
                    serpDevice === 'desktop'
                      ? 'bg-[#FBF9F5] text-stone-900 shadow-xs'
                      : 'text-stone-600'
                  }`}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setSerpDevice('mobile')}
                  className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer ${
                    serpDevice === 'mobile'
                      ? 'bg-[#FBF9F5] text-stone-900 shadow-xs'
                      : 'text-stone-600'
                  }`}
                >
                  Mobile
                </button>
              </div>
            </div>

            <div
              className={`p-5 bg-white border border-stone-200 rounded-lg ${
                serpDevice === 'mobile' ? 'max-w-[360px]' : 'w-full'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-serif font-bold text-[11px]">
                  DM
                </div>
                <div className="text-xs">
                  <div className="font-medium text-stone-900">DailyMirror</div>
                  <div className="text-stone-500 truncate max-w-[260px]">
                    {websiteUrl.replace(/\/$/, '')}/articles/{slug || 'post'}
                  </div>
                </div>
              </div>
              <h4 className="text-lg text-[#1a0dab] hover:underline font-normal leading-snug">
                {title || 'Enter Your Page Title'}
              </h4>
              <p className="text-xs text-[#4d5156] mt-1 leading-relaxed">
                {metaDescription || 'Enter your meta description to preview how Google displays it.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Website Domain URL
                </label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#FBF9F5] border border-stone-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Meta Title ({analysis.titleLength}/60 chars)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Meta Description ({analysis.metaLength}/160 chars)
                </label>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 bg-[#F7F4EE] border border-stone-200 rounded-lg">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="font-serif text-base font-medium text-stone-900">
                  Copy HTML Meta Tags
                </h3>
                <button
                  onClick={() => copyToClipboard(generatedMetaHtml, 'meta-html')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1E3A8A] rounded-md hover:bg-[#172E6E] cursor-pointer"
                >
                  {copiedCode === 'meta-html' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy HTML Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 bg-[#1C1917] text-stone-200 font-mono text-xs rounded-md overflow-x-auto leading-relaxed">
                {generatedMetaHtml}
              </pre>
            </div>

            <div className="p-6 bg-[#F7F4EE] border border-stone-200 rounded-lg">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="font-serif text-base font-medium text-stone-900">
                  Copy Schema.org JSON-LD Code
                </h3>
                <button
                  onClick={() => copyToClipboard(generatedJsonLd, 'json-ld')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-800 bg-[#FBF9F5] border border-stone-300 rounded-md hover:bg-stone-200/60 cursor-pointer"
                >
                  {copiedCode === 'json-ld' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Schema JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 bg-[#1C1917] text-stone-200 font-mono text-xs rounded-md overflow-x-auto leading-relaxed">
                {generatedJsonLd}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 4: WORD COUNTER & KEYWORD DENSITY CHECKER */}
      {activeTab === 'word-counter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          <div className="lg:col-span-7 p-6 bg-[#F7F4EE] border border-stone-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Paste Text or Blog Article
              </h3>
              <button
                onClick={() => setBodyText('')}
                className="text-xs text-stone-600 hover:text-stone-900 underline cursor-pointer"
              >
                Clear Text
              </button>
            </div>
            <textarea
              rows={12}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Type or paste your article here to count words, characters, sentences, reading time, and top repeated keywords..."
              className="w-full p-4 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md text-stone-900 leading-relaxed focus:outline-none focus:border-[#1E3A8A]"
            />
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-[#F7F4EE] border border-stone-200 rounded-lg">
                <div className="text-xs text-stone-500">Total Words</div>
                <div className="font-mono text-2xl font-bold text-[#1E3A8A] mt-1 tabular-nums">
                  {analysis.wordCount}
                </div>
              </div>
              <div className="p-4 bg-[#F7F4EE] border border-stone-200 rounded-lg">
                <div className="text-xs text-stone-500">Total Characters</div>
                <div className="font-mono text-2xl font-bold text-stone-900 mt-1 tabular-nums">
                  {analysis.charCount}
                </div>
              </div>
              <div className="p-4 bg-[#F7F4EE] border border-stone-200 rounded-lg">
                <div className="text-xs text-stone-500">Sentences &amp; Paragraphs</div>
                <div className="font-mono text-xl font-bold text-stone-900 mt-1 tabular-nums">
                  {analysis.sentenceCount} sents · {analysis.paragraphCount} paras
                </div>
              </div>
              <div className="p-4 bg-[#F7F4EE] border border-stone-200 rounded-lg">
                <div className="text-xs text-stone-500">Estimated Read Time</div>
                <div className="font-mono text-xl font-bold text-stone-900 mt-1 tabular-nums">
                  {analysis.readingTimeMinutes} min read
                </div>
              </div>
            </div>

            <div className="p-5 bg-[#F7F4EE] border border-stone-200 rounded-lg">
              <h4 className="font-serif text-base font-medium text-stone-900 mb-3">
                Top Repeated Keywords &amp; Density
              </h4>
              {topExtractedWords.length === 0 ? (
                <p className="text-xs text-stone-500">
                  Enter text on the left to see keyword frequency.
                </p>
              ) : (
                <div className="divide-y divide-stone-200 text-xs">
                  {topExtractedWords.map((item) => (
                    <div key={item.word} className="py-2 flex items-center justify-between">
                      <span className="font-medium text-stone-800">{item.word}</span>
                      <span className="font-mono text-stone-600 tabular-nums">
                        {item.count} times ({item.pct}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOOL 5: XML SITEMAP & ROBOTS.TXT GENERATOR */}
      {activeTab === 'sitemap-robots' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          <div className="p-6 bg-[#F7F4EE] border border-stone-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  Robots.txt Generator
                </h3>
                <p className="text-xs text-stone-500">
                  Control how Googlebot crawls your DailyMirror website.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(generatedRobotsTxt, 'robots')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1E3A8A] rounded-md hover:bg-[#172E6E] cursor-pointer"
              >
                {copiedCode === 'robots' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy robots.txt</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 my-3 text-xs text-stone-700">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={disallowAdmin}
                  onChange={(e) => setDisallowAdmin(e.target.checked)}
                />
                <span>Block /admin/ &amp; /wp-admin/</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={disallowSearchParams}
                  onChange={(e) => setDisallowSearchParams(e.target.checked)}
                />
                <span>Block Search Filter URLs</span>
              </label>
            </div>

            <pre className="p-4 bg-[#1C1917] text-stone-200 font-mono text-xs rounded-md overflow-x-auto leading-relaxed">
              {generatedRobotsTxt}
            </pre>
          </div>

          <div className="p-6 bg-[#F7F4EE] border border-stone-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  XML Sitemap Generator (`sitemap.xml`)
                </h3>
                <p className="text-xs text-stone-500">
                  Includes your homepage and all {posts.length} DailyMirror blog posts.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(generatedSitemapXml, 'sitemap')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1E3A8A] rounded-md hover:bg-[#172E6E] cursor-pointer"
              >
                {copiedCode === 'sitemap' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Copy sitemap.xml</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-[#1C1917] text-stone-200 font-mono text-xs rounded-md overflow-x-auto max-h-[240px] leading-relaxed">
              {generatedSitemapXml}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
};
