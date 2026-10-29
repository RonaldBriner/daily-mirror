import React, { useMemo } from 'react';
import { ArrowLeft, ArrowUpRight, CheckCircle2, FileCode2, Share2 } from 'lucide-react';
import { BlogPost } from '../data/blogData';
import { analyzeSeoContent } from '../utils/seoEngine';
import { EditorialImage } from './EditorialImage';

interface ArticleReaderProps {
  post: BlogPost;
  allPosts: BlogPost[];
  onBack: () => void;
  onSelectPost: (post: BlogPost) => void;
  onAuditInSeoTool: (post: BlogPost) => void;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({
  post,
  allPosts,
  onBack,
  onSelectPost,
  onAuditInSeoTool,
}) => {
  const fullBodyText = useMemo(() => {
    const sectionText = post.sections
      .map((s) => `${s.heading}\n\n${s.paragraphs.join('\n\n')}`)
      .join('\n\n');
    return `${post.openingParagraph}\n\n${sectionText}`;
  }, [post]);

  const seoAudit = useMemo(() => {
    return analyzeSeoContent({
      title: post.metaTitle || post.title,
      metaDescription: post.metaDescription || post.excerpt,
      slug: post.slug,
      focusKeyword: post.focusKeyword,
      secondaryKeywordsRaw: post.secondaryKeywords.join(', '),
      bodyText: fullBodyText,
    });
  }, [post, fullBodyText]);

  const relatedPosts = useMemo(() => {
    return allPosts.filter((p) => p.id !== post.id).slice(0, 3);
  }, [allPosts, post.id]);

  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleCopyCanonical = () => {
    const url = `${window.location.origin}/articles/${post.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <article className="max-w-[1200px] mx-auto px-6 py-10">
      {/* Top Breadcrumb & Action Utility */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to DailyMirror Front Page</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyCanonical}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-[#F7F4EE] border border-stone-300 rounded-lg hover:bg-stone-200/70 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Canonical URL Copied' : 'Copy Canonical Link'}</span>
          </button>

          <button
            onClick={() => onAuditInSeoTool(post)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172E6E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Inspect in SEO Suite ({seoAudit.overallScore}/100)</span>
          </button>
        </div>
      </div>

      {/* Editorial Typographic Header */}
      <header className="pt-8 pb-8 border-b border-stone-300">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-stone-500 mb-4">
          <span>{post.category}</span>
          <span aria-hidden="true">·</span>
          <span>Published {post.publishedAt}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{post.readingTimeMin} min read</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-stone-600">
            SEO Grade: {seoAudit.overallScore}/100 ({seoAudit.gradeLabel})
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-stone-900 tracking-tight leading-[1.15] max-w-4xl">
          {post.title}
        </h1>

        <p className="mt-4 text-lg sm:text-xl text-stone-600 max-w-3xl leading-relaxed font-normal">
          {post.subtitle}
        </p>

        <div className="mt-6 pt-5 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-stone-900">{post.author.name}</span>
            <span aria-hidden="true">·</span>
            <span>{post.author.role}</span>
            <span aria-hidden="true">·</span>
            <span className="text-stone-500">{post.author.desk}</span>
          </div>
          <div className="font-mono text-xs text-stone-500 tabular-nums">
            Focus Entity: <span className="text-stone-800 font-medium">{post.focusKeyword}</span> ·{' '}
            {seoAudit.wordCount} words
          </div>
        </div>
      </header>

      {/* Hero Archival Plate */}
      <figure className="my-8">
        <div className="w-full aspect-[16/9] max-h-[500px] overflow-hidden rounded-lg border border-stone-200 bg-[#EBE6DF]">
          <EditorialImage
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
        <figcaption className="text-xs font-serif text-stone-500 italic mt-2.5">
          {post.figureCaption}
        </figcaption>
      </figure>

      {/* Pattern D: Asymmetric Reading Canvas (70% Main Essay / 30% Margin Notes & Live SEO Telemetry) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
        {/* Main Essay Narrative (8 columns -> constrained to optimal 65-75ch reading measure) */}
        <div className="lg:col-span-8">
          <div className="max-w-2xl">
            {/* Opening Paragraph with Editorial Drop Cap */}
            <p className="text-base sm:text-[17px] text-stone-800 leading-[1.8] mb-8 first-letter:text-5xl first-letter:font-serif first-letter:font-semibold first-letter:float-left first-letter:mr-3.5 first-letter:mt-1 first-letter: leading-none first-letter:text-stone-900">
              {post.openingParagraph}
            </p>

            {/* Sections */}
            {post.sections.map((section) => (
              <section key={section.id} id={section.id} className="mb-10 scroll-mt-24">
                <h2 className="font-serif text-2xl sm:text-[26px] font-medium text-stone-900 mb-4 leading-snug">
                  {section.heading}
                </h2>

                {section.paragraphs.map((para, pIdx) => (
                  <p
                    key={pIdx}
                    className="text-base sm:text-[17px] text-stone-800 leading-[1.8] mb-5"
                  >
                    {para}
                  </p>
                ))}

                {/* Editorial Pull Quote (Top & bottom hairline dividers, never thick left border) */}
                {section.pullQuote && (
                  <blockquote className="my-9 py-7 border-y border-stone-300 text-center px-4">
                    <p className="font-serif text-xl sm:text-2xl italic text-stone-800 leading-relaxed">
                      “{section.pullQuote.quote}”
                    </p>
                    <footer className="mt-3 text-xs uppercase tracking-widest text-stone-500 font-sans not-italic">
                      — {section.pullQuote.attribution}
                    </footer>
                  </blockquote>
                )}

                {/* Mobile-only Margin Note display */}
                {section.marginNote && (
                  <aside className="lg:hidden my-6 p-4 bg-[#F7F4EE] border border-stone-200 rounded-lg">
                    <div className="text-xs font-mono uppercase tracking-widest text-stone-500">
                      {section.marginNote.code} · {section.marginNote.title}
                    </div>
                    <p className="text-xs text-stone-700 mt-1.5 leading-relaxed">
                      {section.marginNote.detail}
                    </p>
                  </aside>
                )}
              </section>
            ))}

            {/* Key Editorial Takeaways */}
            {post.keyTakeaways.length > 0 && (
              <div className="mt-10 p-6 bg-[#F7F4EE] border border-stone-200 rounded-lg">
                <h3 className="font-serif text-lg font-medium text-stone-900 mb-3">
                  Executive Summary & Indexing Takeaways
                </h3>
                <ul className="space-y-2.5 text-sm text-stone-700">
                  {post.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Margin Rail (4 columns): Archival Margin Notes & Live Article SEO Specifications */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Live On-Page SEO Specification Sheet */}
          <div className="p-6 bg-[#F7F4EE] border border-stone-200 rounded-lg">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
              <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
                Dispatch SEO Telemetry
              </span>
              <span className="font-mono text-xs font-semibold text-[#1E3A8A] tabular-nums">
                {seoAudit.overallScore} / 100
              </span>
            </div>

            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-stone-200/70">
                <dt className="text-stone-500">Canonical Slug</dt>
                <dd className="font-mono text-stone-800 truncate max-w-[180px]" title={post.slug}>
                  /{post.slug}
                </dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200/70">
                <dt className="text-stone-500">Focus Entity</dt>
                <dd className="font-medium text-stone-900">{post.focusKeyword}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200/70">
                <dt className="text-stone-500">Title Length</dt>
                <dd className="font-mono text-stone-800 tabular-nums">
                  {seoAudit.titleLength} chars ({seoAudit.titlePixelWidth}px)
                </dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200/70">
                <dt className="text-stone-500">Meta Snippet</dt>
                <dd className="font-mono text-stone-800 tabular-nums">
                  {seoAudit.metaLength} / 160 chars
                </dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200/70">
                <dt className="text-stone-500">Flesch Readability</dt>
                <dd className="font-mono text-stone-800 tabular-nums">
                  {seoAudit.fleschScore}/100
                </dd>
              </div>
              <div className="pt-1">
                <dt className="text-stone-500 mb-1.5">Secondary Semantic Entities</dt>
                <dd className="text-stone-700 leading-relaxed">
                  {post.secondaryKeywords.join(' · ')}
                </dd>
              </div>
            </dl>

            <button
              onClick={() => onAuditInSeoTool(post)}
              className="mt-5 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172E6E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Open Full Analysis in SEO Suite</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Archival Margin Notes */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
              Curatorial Margin Notes
            </h3>
            {post.sections
              .filter((s) => s.marginNote)
              .map((s) => (
                <div
                  key={s.id}
                  className="p-4 bg-[#FBF9F5] border border-stone-200 rounded-lg"
                >
                  <div className="font-mono text-xs text-stone-500 uppercase tracking-wider">
                    {s.marginNote!.code} · {s.marginNote!.title}
                  </div>
                  <p className="text-xs text-stone-700 mt-1.5 leading-relaxed">
                    {s.marginNote!.detail}
                  </p>
                </div>
              ))}
          </div>
        </aside>
      </div>

      {/* Related Dispatches Footer */}
      <section className="mt-16 pt-10 border-t border-stone-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-medium text-stone-900">
            Further Reading in DailyMirror
          </h2>
          <button
            onClick={onBack}
            className="text-xs font-medium text-[#1E3A8A] hover:underline cursor-pointer whitespace-nowrap"
          >
            View Complete Archive →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedPosts.map((rel) => (
            <div
              key={rel.id}
              onClick={() => onSelectPost(rel)}
              className="group cursor-pointer flex flex-col justify-between p-5 bg-[#F7F4EE] border border-stone-200 rounded-lg hover:border-stone-400 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                  <span>{rel.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{rel.readingTimeMin} min read</span>
                </div>
                <h3 className="font-serif text-lg font-medium text-stone-900 group-hover:text-[#1E3A8A] transition-colors leading-snug">
                  {rel.title}
                </h3>
                <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                  {rel.excerpt}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
                <span>{rel.author.name}</span>
                <span className="font-medium text-stone-800 group-hover:text-[#1E3A8A]">
                  Read Dispatch →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
};
