export interface SeoCheckItem {
  id: string;
  category: 'Title & Meta' | 'Keyword Prominence' | 'Readability & Structure' | 'Technical URL';
  label: string;
  status: 'optimal' | 'warning' | 'critical';
  statusText: 'Optimal' | 'Needs Refinement' | 'Action Required';
  detail: string;
  metricValue: string;
}

export interface KeywordMetric {
  keyword: string;
  type: 'Focus' | 'Secondary';
  count: number;
  densityPercent: number;
  inTitle: boolean;
  inMeta: boolean;
  inFirstParagraph: boolean;
  inSlug: boolean;
  status: 'optimal' | 'warning' | 'critical';
}

export interface SeoAnalysisResult {
  overallScore: number;
  gradeLabel: 'Optimal Authority' | 'Needs Refinement' | 'Action Required';
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTimeMinutes: number;
  avgWordsPerSentence: number;
  fleschScore: number;
  readabilityLevel: string;
  titleLength: number;
  titlePixelWidth: number;
  metaLength: number;
  metaPixelWidth: number;
  keywordMetrics: KeywordMetric[];
  checks: SeoCheckItem[];
}

export interface KeywordSuggestion {
  id: string;
  keyword: string;
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  monthlyVolume: number;
  difficulty: number;
  cpcUsd: number;
  recommendedFormat: string;
}

function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  if (clean.length <= 3) return 1;
  const withoutSilentE = clean.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const matches = withoutSilentE.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

function countOccurrences(text: string, phrase: string): number {
  const cleanPhrase = phrase.trim().toLowerCase();
  if (!cleanPhrase) return 0;
  const escaped = cleanPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
  const matches = text.toLowerCase().match(regex);
  return matches ? matches.length : 0;
}

export function analyzeSeoContent(params: {
  title: string;
  metaDescription: string;
  slug: string;
  focusKeyword: string;
  secondaryKeywordsRaw: string;
  bodyText: string;
}): SeoAnalysisResult {
  const { title, metaDescription, slug, focusKeyword, secondaryKeywordsRaw, bodyText } = params;

  const cleanBody = bodyText.trim();
  const words = cleanBody
    ? cleanBody
        .replace(/[#*>`_~-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 0)
    : [];
  const wordCount = words.length;
  const charCount = cleanBody.length;

  const sentences = cleanBody
    ? cleanBody.split(/[.!?]+/).filter((s) => s.trim().length > 2)
    : [];
  const sentenceCount = Math.max(1, sentences.length);

  const paragraphs = cleanBody
    ? cleanBody.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    : [];
  const paragraphCount = paragraphs.length;

  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 210));
  const avgWordsPerSentence = wordCount > 0 ? Number((wordCount / sentenceCount).toFixed(1)) : 0;

  const totalSyllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
  const asl = wordCount > 0 ? wordCount / sentenceCount : 0;
  const asw = wordCount > 0 ? totalSyllables / wordCount : 0;
  const rawFlesch = wordCount > 0 ? 206.835 - 1.015 * asl - 84.6 * asw : 0;
  const fleschScore = Math.max(0, Math.min(100, Math.round(rawFlesch)));

  let readabilityLevel = 'Standard Editorial (Grade 8–10)';
  if (fleschScore >= 70) readabilityLevel = 'Effortless Broadsheet (Grade 6–8)';
  else if (fleschScore >= 55) readabilityLevel = 'Standard Editorial (Grade 8–10)';
  else if (fleschScore >= 35) readabilityLevel = 'Academic & Technical (College)';
  else readabilityLevel = 'Dense Monograph (Post-Graduate)';

  const titleLength = title.trim().length;
  const titlePixelWidth = Math.round(titleLength * 9.4);
  const metaLength = metaDescription.trim().length;
  const metaPixelWidth = Math.round(metaLength * 6.1);

  const first100Words = words.slice(0, 100).join(' ').toLowerCase();
  const cleanSlug = slug.trim().toLowerCase();

  const secondaryList = secondaryKeywordsRaw
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  const allKeywords: { kw: string; type: 'Focus' | 'Secondary' }[] = [];
  if (focusKeyword.trim()) {
    allKeywords.push({ kw: focusKeyword.trim(), type: 'Focus' });
  }
  secondaryList.forEach((kw) => {
    allKeywords.push({ kw, type: 'Secondary' });
  });

  const keywordMetrics: KeywordMetric[] = allKeywords.map(({ kw, type }) => {
    const count = countOccurrences(cleanBody, kw);
    const phraseWordLen = kw.split(/\s+/).length;
    const densityPercent =
      wordCount > 0 ? Number((((count * phraseWordLen) / wordCount) * 100).toFixed(2)) : 0;
    const lowerKw = kw.toLowerCase();
    const slugKw = lowerKw.replace(/\s+/g, '-');

    const inTitle = title.toLowerCase().includes(lowerKw);
    const inMeta = metaDescription.toLowerCase().includes(lowerKw);
    const inFirstParagraph = first100Words.includes(lowerKw);
    const inSlug = cleanSlug.includes(slugKw) || cleanSlug.includes(lowerKw.split(' ')[0]);

    let status: 'optimal' | 'warning' | 'critical' = 'optimal';
    if (type === 'Focus') {
      if (count === 0 || !inTitle) status = 'critical';
      else if (densityPercent < 0.5 || densityPercent > 2.8 || !inMeta) status = 'warning';
    } else {
      if (count === 0) status = 'warning';
    }

    return {
      keyword: kw,
      type,
      count,
      densityPercent,
      inTitle,
      inMeta,
      inFirstParagraph,
      inSlug,
      status,
    };
  });

  const checks: SeoCheckItem[] = [];
  const focusMetric = keywordMetrics.find((m) => m.type === 'Focus');

  // 1. Title Tag Length
  if (titleLength >= 40 && titleLength <= 62) {
    checks.push({
      id: 'chk-title-len',
      category: 'Title & Meta',
      label: 'SERP Title Tag Length & Pixel Fit',
      status: 'optimal',
      statusText: 'Optimal',
      detail: 'Title sits comfortably inside the 600px Google desktop snippet boundary without ellipsis truncation.',
      metricValue: `${titleLength} chars (${titlePixelWidth}px)`,
    });
  } else if (titleLength >= 25 && titleLength <= 70) {
    checks.push({
      id: 'chk-title-len',
      category: 'Title & Meta',
      label: 'SERP Title Tag Length & Pixel Fit',
      status: 'warning',
      statusText: 'Needs Refinement',
      detail: 'Aim for 45–60 characters (under 580px) to maximize click-through rate without truncation.',
      metricValue: `${titleLength} chars (${titlePixelWidth}px)`,
    });
  } else {
    checks.push({
      id: 'chk-title-len',
      category: 'Title & Meta',
      label: 'SERP Title Tag Length & Pixel Fit',
      status: 'critical',
      statusText: 'Action Required',
      detail: titleLength < 25 ? 'Title is too short and underutilizes SERP real estate.' : 'Title exceeds 70 characters and will be truncated in search results.',
      metricValue: `${titleLength} chars (${titlePixelWidth}px)`,
    });
  }

  // 2. Meta Description Length
  if (metaLength >= 120 && metaLength <= 160) {
    checks.push({
      id: 'chk-meta-len',
      category: 'Title & Meta',
      label: 'Meta Description Snippet Window',
      status: 'optimal',
      statusText: 'Optimal',
      detail: 'Meta description fills the 120–160 character sweet spot with full snippet visibility.',
      metricValue: `${metaLength} / 160 chars`,
    });
  } else if (metaLength >= 80 && metaLength <= 175) {
    checks.push({
      id: 'chk-meta-len',
      category: 'Title & Meta',
      label: 'Meta Description Snippet Window',
      status: 'warning',
      statusText: 'Needs Refinement',
      detail: 'Adjust description to 120–160 characters so search engines do not rewrite or clip your summary.',
      metricValue: `${metaLength} / 160 chars`,
    });
  } else {
    checks.push({
      id: 'chk-meta-len',
      category: 'Title & Meta',
      label: 'Meta Description Snippet Window',
      status: 'critical',
      statusText: 'Action Required',
      detail: 'Meta description is missing or outside standard search snippet thresholds (120–160 chars).',
      metricValue: `${metaLength} / 160 chars`,
    });
  }

  // 3. Focus Keyword in Title & Meta
  if (focusMetric) {
    if (focusMetric.inTitle && focusMetric.inMeta) {
      checks.push({
        id: 'chk-kw-placement',
        category: 'Keyword Prominence',
        label: 'Focus Keyword in Title & Meta Description',
        status: 'optimal',
        statusText: 'Optimal',
        detail: `Primary phrase "${focusMetric.keyword}" is present in both the title tag and meta description.`,
        metricValue: '2 / 2 Matched',
      });
    } else if (focusMetric.inTitle || focusMetric.inMeta) {
      checks.push({
        id: 'chk-kw-placement',
        category: 'Keyword Prominence',
        label: 'Focus Keyword in Title & Meta Description',
        status: 'warning',
        statusText: 'Needs Refinement',
        detail: `Include "${focusMetric.keyword}" in both your title tag and meta description for bolded SERP terms.`,
        metricValue: '1 / 2 Matched',
      });
    } else {
      checks.push({
        id: 'chk-kw-placement',
        category: 'Keyword Prominence',
        label: 'Focus Keyword in Title & Meta Description',
        status: 'critical',
        statusText: 'Action Required',
        detail: `Primary keyword "${focusMetric.keyword}" is missing from both the title and meta description.`,
        metricValue: '0 / 2 Matched',
      });
    }

    // 4. First 100 Words Lead-In
    if (focusMetric.inFirstParagraph) {
      checks.push({
        id: 'chk-kw-lead',
        category: 'Keyword Prominence',
        label: 'Focus Entity in Opening 100 Words',
        status: 'optimal',
        statusText: 'Optimal',
        detail: 'Topic thesis appears immediately in the opening lead paragraph.',
        metricValue: 'Verified in Lead',
      });
    } else {
      checks.push({
        id: 'chk-kw-lead',
        category: 'Keyword Prominence',
        label: 'Focus Entity in Opening 100 Words',
        status: 'warning',
        statusText: 'Needs Refinement',
        detail: `Introduce "${focusMetric.keyword}" within the first 100 words to establish immediate topical relevance.`,
        metricValue: 'Not in First 100w',
      });
    }

    // 5. Keyword Density Balance
    if (focusMetric.densityPercent >= 0.5 && focusMetric.densityPercent <= 2.5) {
      checks.push({
        id: 'chk-kw-density',
        category: 'Keyword Prominence',
        label: 'Focus Keyword Density Cadence',
        status: 'optimal',
        statusText: 'Optimal',
        detail: 'Natural editorial distribution without over-optimization or keyword stuffing.',
        metricValue: `${focusMetric.densityPercent}% (${focusMetric.count}x)`,
      });
    } else if (focusMetric.count > 0) {
      checks.push({
        id: 'chk-kw-density',
        category: 'Keyword Prominence',
        label: 'Focus Keyword Density Cadence',
        status: 'warning',
        statusText: 'Needs Refinement',
        detail: focusMetric.densityPercent < 0.5 ? 'Frequency is slightly low; weave the focus phrase 1–2 more times.' : 'Density exceeds 2.5%; replace repetitive instances with semantic synonyms.',
        metricValue: `${focusMetric.densityPercent}% (${focusMetric.count}x)`,
      });
    } else {
      checks.push({
        id: 'chk-kw-density',
        category: 'Keyword Prominence',
        label: 'Focus Keyword Density Cadence',
        status: 'critical',
        statusText: 'Action Required',
        detail: `Focus keyword "${focusMetric.keyword}" does not appear in the body copy.`,
        metricValue: '0.00% (0x)',
      });
    }
  }

  // 6. Content Depth & Word Count
  if (wordCount >= 250) {
    checks.push({
      id: 'chk-word-depth',
      category: 'Readability & Structure',
      label: 'Editorial Depth & Passage Volume',
      status: 'optimal',
      statusText: 'Optimal',
      detail: 'Substantive prose depth supports multi-passage indexing and semantic coverage.',
      metricValue: `${wordCount} words`,
    });
  } else if (wordCount >= 120) {
    checks.push({
      id: 'chk-word-depth',
      category: 'Readability & Structure',
      label: 'Editorial Depth & Passage Volume',
      status: 'warning',
      statusText: 'Needs Refinement',
      detail: 'Expand analysis beyond 250 words to cover secondary sub-questions and entities.',
      metricValue: `${wordCount} words`,
    });
  } else {
    checks.push({
      id: 'chk-word-depth',
      category: 'Readability & Structure',
      label: 'Editorial Depth & Passage Volume',
      status: 'critical',
      statusText: 'Action Required',
      detail: 'Thin content alert: add comprehensive sections, examples, and supporting evidence.',
      metricValue: `${wordCount} words`,
    });
  }

  // 7. Sentence Rhythm & Readability
  if (avgWordsPerSentence > 0 && avgWordsPerSentence <= 22) {
    checks.push({
      id: 'chk-readability',
      category: 'Readability & Structure',
      label: 'Sentence Cadence & Flesch Readability',
      status: 'optimal',
      statusText: 'Optimal',
      detail: `${readabilityLevel}. Crisp sentence pacing prevents reader fatigue.`,
      metricValue: `${avgWordsPerSentence} w/sent · ${fleschScore}/100`,
    });
  } else {
    checks.push({
      id: 'chk-readability',
      category: 'Readability & Structure',
      label: 'Sentence Cadence & Flesch Readability',
      status: 'warning',
      statusText: 'Needs Refinement',
      detail: 'Break long compound clauses into shorter sentences (under 22 words on average).',
      metricValue: `${avgWordsPerSentence} w/sent · ${fleschScore}/100`,
    });
  }

  // 8. URL Slug Hygiene
  const isCleanSlug = /^[a-z0-9-]+$/.test(cleanSlug) && cleanSlug.length >= 8 && cleanSlug.length <= 65;
  if (isCleanSlug) {
    checks.push({
      id: 'chk-slug',
      category: 'Technical URL',
      label: 'Canonical URL Slug Taxonomy',
      status: 'optimal',
      statusText: 'Optimal',
      detail: 'Lowercase, hyphen-separated slug without parameter clutter or stop-word bloat.',
      metricValue: `/${cleanSlug}`,
    });
  } else {
    checks.push({
      id: 'chk-slug',
      category: 'Technical URL',
      label: 'Canonical URL Slug Taxonomy',
      status: 'warning',
      statusText: 'Needs Refinement',
      detail: 'Use lowercase hyphenated words between 10 and 60 characters for clean canonical URLs.',
      metricValue: `/${cleanSlug || 'untitled'}`,
    });
  }

  // Compute deterministic overall score out of 100
  const pointsPerCheck = 100 / checks.length;
  const rawScore = checks.reduce((sum, item) => {
    if (item.status === 'optimal') return sum + pointsPerCheck;
    if (item.status === 'warning') return sum + pointsPerCheck * 0.58;
    return sum + pointsPerCheck * 0.15;
  }, 0);

  const overallScore = Math.round(rawScore);
  let gradeLabel: 'Optimal Authority' | 'Needs Refinement' | 'Action Required' = 'Optimal Authority';
  if (overallScore < 55) gradeLabel = 'Action Required';
  else if (overallScore < 80) gradeLabel = 'Needs Refinement';

  return {
    overallScore,
    gradeLabel,
    wordCount,
    charCount,
    sentenceCount,
    paragraphCount,
    readingTimeMinutes,
    avgWordsPerSentence,
    fleschScore,
    readabilityLevel,
    titleLength,
    titlePixelWidth,
    metaLength,
    metaPixelWidth,
    keywordMetrics,
    checks,
  };
}

export function generateKeywordCluster(seedTopic: string): KeywordSuggestion[] {
  const cleanSeed = (seedTopic.trim() || 'technical seo').toLowerCase();
  const hash = cleanSeed.split('').reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 1), 0);

  const templates: {
    suffix: string;
    prefix?: string;
    intent: KeywordSuggestion['intent'];
    volBase: number;
    kdBase: number;
    cpcBase: number;
    format: string;
  }[] = [
    {
      suffix: 'complete architecture guide',
      intent: 'Informational',
      volBase: 5400,
      kdBase: 34,
      cpcBase: 3.2,
      format: 'Pillar Broadsheet Essay (2,200w)',
    },
    {
      prefix: 'how to audit',
      suffix: 'step by step',
      intent: 'Informational',
      volBase: 3800,
      kdBase: 26,
      cpcBase: 2.85,
      format: 'Interactive Checklist & Tutorial',
    },
    {
      suffix: 'vs traditional keyword optimization',
      intent: 'Commercial',
      volBase: 2100,
      kdBase: 41,
      cpcBase: 5.4,
      format: 'Empirical Comparison Matrix',
    },
    {
      prefix: 'best',
      suffix: 'tools and software 2026',
      intent: 'Commercial',
      volBase: 6900,
      kdBase: 58,
      cpcBase: 8.75,
      format: 'Lab Benchmark Review',
    },
    {
      suffix: 'case study traffic metrics',
      intent: 'Informational',
      volBase: 1650,
      kdBase: 19,
      cpcBase: 4.1,
      format: 'Original Data Investigation',
    },
    {
      suffix: 'audit template download',
      intent: 'Transactional',
      volBase: 2900,
      kdBase: 29,
      cpcBase: 6.2,
      format: 'Interactive Calculator / Tool Page',
    },
    {
      suffix: 'common indexing mistakes',
      intent: 'Informational',
      volBase: 1900,
      kdBase: 22,
      cpcBase: 3.5,
      format: 'Diagnostic Teardown Article',
    },
    {
      suffix: 'enterprise implementation service',
      intent: 'Transactional',
      volBase: 1150,
      kdBase: 64,
      cpcBase: 14.6,
      format: 'Solution Architecture Brief',
    },
    {
      suffix: 'schema json-ld examples',
      intent: 'Navigational',
      volBase: 3200,
      kdBase: 24,
      cpcBase: 2.4,
      format: 'Code Reference & Snippet Generator',
    },
  ];

  return templates.map((tpl, idx) => {
    const variance = ((hash + idx * 37) % 29) - 14;
    const monthlyVolume = Math.max(250, Math.round((tpl.volBase + variance * 90) / 50) * 50);
    const difficulty = Math.max(12, Math.min(89, tpl.kdBase + (variance % 11)));
    const cpcUsd = Number(Math.max(0.8, tpl.cpcBase + variance * 0.12).toFixed(2));
    const fullKw = [tpl.prefix, cleanSeed, tpl.suffix].filter(Boolean).join(' ');

    return {
      id: `kw-${idx + 1}`,
      keyword: fullKw,
      intent: tpl.intent,
      monthlyVolume,
      difficulty,
      cpcUsd,
      recommendedFormat: tpl.format,
    };
  });
}
