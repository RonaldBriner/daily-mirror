import React, { useState, useMemo } from 'react';
import { CheckCircle2, AlertTriangle, Send, Sparkles } from 'lucide-react';
import { BlogPost } from '../data/blogData';
import { analyzeSeoContent } from '../utils/seoEngine';

interface PublishPostStudioProps {
  onPublish: (newPost: BlogPost) => void;
  onCancel: () => void;
}

const AVAILABLE_COVERS = [
  {
    label: 'Editorial Newsroom Desk',
    url: '/src/assets/images/hero_editorial_newsroom_1793203115719.jpg',
  },
  {
    label: 'Research Library Archive',
    url: '/src/assets/images/blog_search_algorithms_1793203117302.jpg',
  },
  {
    label: 'Typography & Layout Grid',
    url: '/src/assets/images/blog_content_strategy_1793203117906.jpg',
  },
  {
    label: 'Architectural Glass Atrium',
    url: '/src/assets/images/blog_technical_seo_1793203118545.jpg',
  },
];

export const PublishPostStudio: React.FC<PublishPostStudioProps> = ({ onPublish, onCancel }) => {
  const [title, setTitle] = useState('Zero-Click Search & Brand Authority in 2026');
  const [subtitle, setSubtitle] = useState(
    'How independent publishers structure original data and direct reader relationships to thrive alongside AI overviews.'
  );
  const [category, setCategory] = useState<BlogPost['category']>('Digital Publishing');
  const [authorName, setAuthorName] = useState('DailyMirror Editorial Desk');
  const [authorRole, setAuthorRole] = useState('Managing Editor');
  const [focusKeyword, setFocusKeyword] = useState('zero-click search strategy');
  const [secondaryKeywords, setSecondaryKeywords] = useState(
    'brand authority, direct traffic, structured schema, newsletter retention'
  );
  const [metaDescription, setMetaDescription] = useState(
    'Learn how a zero-click search strategy and strong brand authority help modern digital publications capture high-intent organic readers in 2026.'
  );
  const [coverUrl, setCoverUrl] = useState(AVAILABLE_COVERS[1].url);
  const [openingParagraph, setOpeningParagraph] = useState(
    'As search result pages answer simple factual queries directly on the snippet canvas, publishers can no longer rely on shallow definitions for traffic. Building a resilient zero-click search strategy requires shifting editorial energy toward deep analysis, proprietary benchmarks, and unmistakable brand authority.'
  );
  const [sectionHeading, setSectionHeading] = useState(
    '01. Designing Content That Requires a Click'
  );
  const [sectionBody, setSectionBody] = useState(
    'When a reader searches for a complex architectural decision or an interactive SEO calculator, a three-line summary is never enough. By embedding live datasets, downloadable frameworks, and nuanced case studies, publications create magnetic utility that compels users to click through.\n\nFurthermore, pairing every article with clean structured schema and memorable typographic presentation turns casual search visitors into loyal direct subscribers.'
  );
  const [pullQuote, setPullQuote] = useState(
    'Commodity facts belong to the search snippet; original perspective belongs to the publication.'
  );

  const generatedSlug = useMemo(() => {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 58) || 'new-editorial-dispatch'
    );
  }, [title]);

  const liveSeo = useMemo(() => {
    return analyzeSeoContent({
      title,
      metaDescription,
      slug: generatedSlug,
      focusKeyword,
      secondaryKeywordsRaw: secondaryKeywords,
      bodyText: `${openingParagraph}\n\n${sectionHeading}\n\n${sectionBody}`,
    });
  }, [title, metaDescription, generatedSlug, focusKeyword, secondaryKeywords, openingParagraph, sectionHeading, sectionBody]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !openingParagraph.trim()) return;

    const paragraphs = sectionBody
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const newPost: BlogPost = {
      id: `dm-${Date.now()}`,
      slug: generatedSlug,
      title: title.trim(),
      subtitle: subtitle.trim() || openingParagraph.slice(0, 120),
      category,
      author: {
        name: authorName.trim() || 'DailyMirror Editor',
        role: authorRole.trim() || 'Contributing Writer',
        desk: 'DailyMirror Newsroom',
      },
      publishedAt: 'October 28, 2026',
      readingTimeMin: liveSeo.readingTimeMinutes,
      featuredImage: coverUrl,
      figureCaption: `Fig. — Archival plate accompanying "${title.trim()}".`,
      focusKeyword: focusKeyword.trim() || 'digital publishing',
      secondaryKeywords: secondaryKeywords
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      metaTitle: `${title.trim()} | DailyMirror`,
      metaDescription: metaDescription.trim(),
      excerpt: subtitle.trim() || openingParagraph.slice(0, 140),
      openingParagraph: openingParagraph.trim(),
      sections: [
        {
          id: 'sec-1',
          heading: sectionHeading.trim() || '01. Core Editorial Analysis',
          paragraphs: paragraphs.length > 0 ? paragraphs : [sectionBody.trim()],
          pullQuote: pullQuote.trim()
            ? {
                quote: pullQuote.trim(),
                attribution: authorName.trim() || 'DailyMirror Editorial',
              }
            : undefined,
        },
      ],
      keyTakeaways: [
        `Optimized around primary entity "${focusKeyword.trim()}".`,
        'Verified for SERP title pixel width and Flesch readability cadence.',
        'Indexed automatically into the DailyMirror XML Sitemap.',
      ],
    };

    onPublish(newPost);
  };

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-stone-300">
        <div>
          <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-2">
            DailyMirror Editorial Desk · Live CMS & SEO Grader
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900">
            Compose & Publish New Blog Dispatch
          </h1>
          <p className="text-sm text-stone-600 mt-1.5">
            Draft your article below. Our built-in SEO engine grades keyword placement and
            readability before publishing to the front page.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-medium text-stone-700 bg-[#F7F4EE] border border-stone-300 rounded-lg hover:bg-stone-200/70 cursor-pointer whitespace-nowrap"
        >
          Return to Front Page
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Left 8 Cols: Editorial Composer */}
        <div className="lg:col-span-8 space-y-5">
          <div className="p-6 bg-[#F7F4EE] border border-stone-200 rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Article Headline (`H1` &amp; SERP Title)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Editorial Section
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BlogPost['category'])}
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md text-stone-900"
                >
                  <option value="Search Systems">Search Systems</option>
                  <option value="Content Architecture">Content Architecture</option>
                  <option value="Technical SEO">Technical SEO</option>
                  <option value="Digital Publishing">Digital Publishing</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Editorial Standfirst / Subtitle Deck
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md text-stone-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Author Role
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Archival Plate Image
                </label>
                <select
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded-md"
                >
                  {AVAILABLE_COVERS.map((c) => (
                    <option key={c.url} value={c.url}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Opening Lead Paragraph (Include Focus Keyword in First 100 Words)
              </label>
              <textarea
                rows={4}
                required
                value={openingParagraph}
                onChange={(e) => setOpeningParagraph(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Primary Section Sub-Heading (`H2`)
              </label>
              <input
                type="text"
                value={sectionHeading}
                onChange={(e) => setSectionHeading(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Main Section Prose (Separate paragraphs with a blank line)
              </label>
              <textarea
                rows={6}
                required
                value={sectionBody}
                onChange={(e) => setSectionBody(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Featured Editorial Pull Quote (Optional)
              </label>
              <input
                type="text"
                value={pullQuote}
                onChange={(e) => setPullQuote(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-md italic"
              />
            </div>
          </div>
        </div>

        {/* Right 4 Cols: SEO Metadata & Live Pre-Flight Score */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-6 bg-[#F7F4EE] border border-stone-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Live Pre-Press SEO Score
                </span>
              </div>
              <span className="font-mono text-2xl font-bold text-[#1E3A8A] tabular-nums">
                {liveSeo.overallScore}/100
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Focus Target Keyword
              </label>
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Secondary Entities (Comma-Separated)
              </label>
              <input
                type="text"
                value={secondaryKeywords}
                onChange={(e) => setSecondaryKeywords(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded-md"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-stone-700">SERP Meta Description</span>
                <span className="font-mono text-stone-500 tabular-nums">
                  {liveSeo.metaLength}/160
                </span>
              </div>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded-md"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-200">
              {liveSeo.checks.slice(0, 5).map((chk) => (
                <div key={chk.id} className="flex items-center justify-between text-xs py-1">
                  <span className="flex items-center gap-1.5 text-stone-700">
                    {chk.status === 'optimal' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    )}
                    <span className="truncate max-w-[180px]">{chk.label}</span>
                  </span>
                  <span className="font-mono text-[11px] text-stone-500 tabular-nums">
                    {chk.metricValue}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172E6E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Dispatch to DailyMirror</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
