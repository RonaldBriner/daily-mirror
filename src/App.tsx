/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  PenTool,
  BookOpen,
  ArrowUpRight,
  Gauge,
} from 'lucide-react';
import { BlogPost, INITIAL_BLOG_POSTS } from './data/blogData';
import { EditorialImage } from './components/EditorialImage';
import { ArticleReader } from './components/ArticleReader';
import { SeoToolsSuite, ToolTab } from './components/SeoToolsSuite';
import { PublishPostStudio } from './components/PublishPostStudio';
import { analyzeSeoContent } from './utils/seoEngine';

type ActiveView = 'tool-and-blogs' | 'article-detail' | 'publish';

const CATEGORIES = [
  'All Blogs',
  'Search Systems',
  'Content Architecture',
  'Technical SEO',
  'Digital Publishing',
] as const;

export default function App() {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [activeView, setActiveView] = useState<ActiveView>('tool-and-blogs');
  const [activeToolTab, setActiveToolTab] = useState<ToolTab>('seo-checker');
  const [selectedPost, setSelectedPost] = useState<BlogPost>(INITIAL_BLOG_POSTS[0]);
  const [auditTargetPost, setAuditTargetPost] = useState<BlogPost | null>(null);

  // Blog Filtering & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>('All Blogs');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All Blogs' || post.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.subtitle.toLowerCase().includes(q) ||
        post.focusKeyword.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.author.name.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const handleSelectToolFromNav = (tab: ToolTab) => {
    setActiveToolTab(tab);
    setActiveView('tool-and-blogs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToBlogSection = () => {
    if (activeView !== 'tool-and-blogs') {
      setActiveView('tool-and-blogs');
      setTimeout(() => {
        document.getElementById('dailymirror-blog-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      document.getElementById('dailymirror-blog-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenArticle = (post: BlogPost) => {
    setSelectedPost(post);
    setActiveView('article-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuditPostInSuite = (post: BlogPost) => {
    setAuditTargetPost(post);
    setActiveToolTab('seo-checker');
    setActiveView('tool-and-blogs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublishNewPost = (newPost: BlogPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setSelectedPost(newPost);
    setActiveView('article-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPostSeoScore = (post: BlogPost) => {
    const body = `${post.openingParagraph}\n\n${post.sections
      .map((s) => `${s.heading}\n\n${s.paragraphs.join('\n\n')}`)
      .join('\n\n')}`;
    return analyzeSeoContent({
      title: post.metaTitle || post.title,
      metaDescription: post.metaDescription || post.excerpt,
      slug: post.slug,
      focusKeyword: post.focusKeyword,
      secondaryKeywordsRaw: post.secondaryKeywords.join(', '),
      bodyText: body,
    }).overallScore;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#FBF9F5]/95 backdrop-blur-xs border-b border-stone-200">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('tool-and-blogs');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-serif text-2xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0"
          >
            DailyMirror
          </a>

          {/* Zone 2: 5 concise single-line navigation links for the Tool & Blog Section */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <button
              onClick={() => handleSelectToolFromNav('seo-checker')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeView === 'tool-and-blogs' && activeToolTab === 'seo-checker'
                  ? 'text-stone-900 border-b-2 border-[#1E3A8A]'
                  : ''
              }`}
            >
              SEO Checker
            </button>
            <button
              onClick={() => handleSelectToolFromNav('keyword-research')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeView === 'tool-and-blogs' && activeToolTab === 'keyword-research'
                  ? 'text-stone-900 border-b-2 border-[#1E3A8A]'
                  : ''
              }`}
            >
              Keyword Tool
            </button>
            <button
              onClick={() => handleSelectToolFromNav('meta-generator')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeView === 'tool-and-blogs' && activeToolTab === 'meta-generator'
                  ? 'text-stone-900 border-b-2 border-[#1E3A8A]'
                  : ''
              }`}
            >
              Meta &amp; SERP
            </button>
            <button
              onClick={() => handleSelectToolFromNav('word-counter')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeView === 'tool-and-blogs' && activeToolTab === 'word-counter'
                  ? 'text-stone-900 border-b-2 border-[#1E3A8A]'
                  : ''
              }`}
            >
              Word Counter
            </button>
            <button
              onClick={handleJumpToBlogSection}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeView === 'article-detail'
                  ? 'text-stone-900 border-b-2 border-[#1E3A8A]'
                  : ''
              }`}
            >
              Blog Section
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveView('publish');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172E6E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              + Write Blog
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW: FULL BLOG ARTICLE READER */}
        {activeView === 'article-detail' && (
          <ArticleReader
            post={selectedPost}
            allPosts={posts}
            onBack={() => setActiveView('tool-and-blogs')}
            onSelectPost={handleOpenArticle}
            onAuditInSeoTool={handleAuditPostInSuite}
          />
        )}

        {/* VIEW: WRITE & PUBLISH NEW BLOG POST */}
        {activeView === 'publish' && (
          <PublishPostStudio
            onPublish={handlePublishNewPost}
            onCancel={() => setActiveView('tool-and-blogs')}
          />
        )}

        {/* PRIMARY VIEW: DAILYMIRROR SEO TOOL (TOP) + BLOG SECTION (BELOW) */}
        {activeView === 'tool-and-blogs' && (
          <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-16">
            {/* PART 1: DAILYMIRROR MAIN SEO TOOL WORKSPACE (FRONT AND CENTER) */}
            <SeoToolsSuite
              posts={posts}
              initialAuditPost={auditTargetPost}
              activeTab={activeToolTab}
              onTabChange={setActiveToolTab}
            />

            {/* PART 2: DAILYMIRROR BLOG SECTION (BUILT RIGHT INTO THE TOOL) */}
            <section
              id="dailymirror-blog-section"
              className="scroll-mt-24 pt-12 border-t border-stone-300"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6">
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#1E3A8A] font-semibold mb-1.5">
                    DailyMirror Built-In Blog Section
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-stone-900">
                    SEO &amp; Digital Publishing Blogs
                  </h2>
                  <p className="text-sm text-stone-600 mt-1">
                    Read complete SEO guides below, load any blog into the DailyMirror SEO Tool
                    above, or publish your own blog post.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search blogs..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F4EE] border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setActiveView('publish');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172E6E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>+ Add New Blog</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EBE6DF] rounded-lg border border-stone-300">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-[#FBF9F5] text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-stone-500 font-mono tabular-nums">
                  Showing {filteredPosts.length} of {posts.length} Blogs
                </span>
              </div>

              {/* Blog Cards Grid */}
              {filteredPosts.length === 0 ? (
                <div className="p-10 text-center bg-[#F7F4EE] border border-stone-200 rounded-lg">
                  <BookOpen className="w-7 h-7 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm text-stone-700">
                    No blogs matched your search "{searchQuery}".
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All Blogs');
                      setSearchQuery('');
                    }}
                    className="mt-3 px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded-md cursor-pointer"
                  >
                    Show All Blogs
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {filteredPosts.map((post) => {
                    const postScore = getPostSeoScore(post);
                    return (
                      <article
                        key={post.id}
                        className="group flex flex-col sm:flex-row bg-[#F7F4EE] border border-stone-200 rounded-lg overflow-hidden hover:border-stone-400 transition-colors"
                      >
                        <div
                          onClick={() => handleOpenArticle(post)}
                          className="sm:w-48 md:w-52 aspect-[4/3] sm:aspect-auto shrink-0 overflow-hidden bg-[#EBE6DF] border-b sm:border-b-0 sm:border-r border-stone-200 cursor-pointer"
                        >
                          <EditorialImage
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                          />
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 mb-2">
                              <span className="font-medium text-stone-700">{post.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>{post.publishedAt}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{post.readingTimeMin} min read</span>
                            </div>

                            <h3
                              onClick={() => handleOpenArticle(post)}
                              className="font-serif text-lg font-medium text-stone-900 group-hover:text-[#1E3A8A] transition-colors leading-snug cursor-pointer"
                            >
                              {post.title}
                            </h3>

                            <p className="text-xs text-stone-600 mt-2 leading-relaxed line-clamp-2">
                              {post.excerpt}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between gap-2 text-xs">
                            <button
                              onClick={() => handleAuditPostInSuite(post)}
                              className="inline-flex items-center gap-1 text-stone-600 hover:text-[#1E3A8A] font-mono tabular-nums cursor-pointer whitespace-nowrap"
                            >
                              <Gauge className="w-3.5 h-3.5 text-[#1E3A8A]" />
                              <span>Test in Tool ({postScore}/100)</span>
                            </button>

                            <button
                              onClick={() => handleOpenArticle(post)}
                              className="inline-flex items-center gap-1 font-semibold text-[#1E3A8A] hover:underline cursor-pointer whitespace-nowrap"
                            >
                              <span>Read Full Blog</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-200 bg-[#F7F4EE]">
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-600">
          <div>
            <span className="font-serif text-base font-bold text-stone-900">DailyMirror</span>
            <span aria-hidden="true"> · </span>
            <span>All-in-One SEO Tool &amp; Blog Portal</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              onClick={() => handleSelectToolFromNav('seo-checker')}
              className="hover:text-stone-900 cursor-pointer whitespace-nowrap"
            >
              SEO Checker
            </button>
            <button
              onClick={() => handleSelectToolFromNav('keyword-research')}
              className="hover:text-stone-900 cursor-pointer whitespace-nowrap"
            >
              Keyword Tool
            </button>
            <button
              onClick={() => handleSelectToolFromNav('meta-generator')}
              className="hover:text-stone-900 cursor-pointer whitespace-nowrap"
            >
              Meta Generator
            </button>
            <button
              onClick={handleJumpToBlogSection}
              className="hover:text-stone-900 cursor-pointer whitespace-nowrap"
            >
              Blog Section
            </button>
            <button
              onClick={() => setActiveView('publish')}
              className="hover:text-stone-900 cursor-pointer whitespace-nowrap"
            >
              Write Blog
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
