import { SCHOLAR_REPOSITORY_DATA, ScholarArticle } from '../data/scholarRepositoryData';
import { OsnSubject, Question } from '../types';

export interface ScholarSearchParams {
  query?: string;
  subject?: string;
  level?: string;
}

/**
 * Returns articles from the Google Scholar OSN repository matching filters
 */
export function searchScholarArticles(params: ScholarSearchParams = {}): ScholarArticle[] {
  const { query = '', subject = 'All', level = 'All' } = params;
  const qLower = query.toLowerCase().trim();

  return SCHOLAR_REPOSITORY_DATA.filter((item) => {
    const matchSubject = subject === 'All' || item.subject === subject;
    const matchLevel = level === 'All' || item.level.includes(level);
    const matchQuery =
      !qLower ||
      item.title.toLowerCase().includes(qLower) ||
      item.abstractText.toLowerCase().includes(qLower) ||
      item.authors.toLowerCase().includes(qLower) ||
      item.institution.toLowerCase().includes(qLower) ||
      item.keywords.some((k) => k.toLowerCase().includes(qLower)) ||
      item.questions.some(
        (q) =>
          q.questionText.toLowerCase().includes(qLower) ||
          q.explanation.toLowerCase().includes(qLower) ||
          q.topic.toLowerCase().includes(qLower)
      );

    return matchSubject && matchLevel && matchQuery;
  });
}

/**
 * Returns official Google Scholar live search URL for the given query
 */
export function buildGoogleScholarUrl(query: string): string {
  const cleanQuery = query.trim() || 'Olimpiade Sains Nasional OSN';
  return `https://scholar.google.com/scholar?hl=id&as_sdt=0%2C5&q=${encodeURIComponent(cleanQuery)}&btnG=`;
}

/**
 * Returns all questions across all scholar articles, or for a specific subject
 */
export function getAllScholarQuestions(subjectFilter?: OsnSubject): Question[] {
  let list = SCHOLAR_REPOSITORY_DATA;
  if (subjectFilter) {
    list = list.filter((a) => a.subject === subjectFilter);
  }
  return list.flatMap((a) => a.questions);
}
