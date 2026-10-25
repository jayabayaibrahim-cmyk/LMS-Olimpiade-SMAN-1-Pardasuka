import { SCHOLAR_REPOSITORY_DATA, ScholarArticle } from '../data/scholarRepositoryData';
import { OsnSubject, Question } from '../types';
import {
  fetchScholarArticlesFromFirestore,
  saveScholarArticleToFirestore,
  syncInitialScholarRepositoryToFirestore,
  subscribeScholarArticles,
} from './firebase';

export interface ScholarSearchParams {
  query?: string;
  subject?: string;
  level?: string;
}

// In-memory runtime cache merging baseline repository and Firestore updates
let activeScholarArticles: ScholarArticle[] = [...SCHOLAR_REPOSITORY_DATA];

/**
 * Returns articles from the Google Scholar OSN repository matching filters
 */
export function searchScholarArticles(
  params: ScholarSearchParams = {},
  customSource?: ScholarArticle[]
): ScholarArticle[] {
  const { query = '', subject = 'All', level = 'All' } = params;
  const qLower = query.toLowerCase().trim();
  const source = customSource || activeScholarArticles;

  return source.filter((item) => {
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
  let list = activeScholarArticles;
  if (subjectFilter) {
    list = list.filter((a) => a.subject === subjectFilter);
  }
  return list.flatMap((a) => a.questions);
}

/**
 * Sync repository directly to Firebase Firestore
 */
export async function pushScholarRepositoryToFirebase(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const count = await syncInitialScholarRepositoryToFirestore(activeScholarArticles);
    return { success: true, count };
  } catch (error: any) {
    console.warn('Firebase sync notice (fallback to static mode for GitHub Pages/Vercel):', error);
    return { success: false, count: 0, error: error?.message || 'Gagal tersambung ke Firebase' };
  }
}

/**
 * Load latest repository from Firebase Firestore with fallback to static curriculum data
 */
export async function loadScholarRepositoryFromFirebase(): Promise<ScholarArticle[]> {
  try {
    const firestoreArticles = await fetchScholarArticlesFromFirestore();
    if (firestoreArticles && firestoreArticles.length > 0) {
      // Merge unique articles
      const articleMap = new Map<string, ScholarArticle>();
      SCHOLAR_REPOSITORY_DATA.forEach((a) => articleMap.set(a.id, a));
      firestoreArticles.forEach((a) => articleMap.set(a.id, a));
      activeScholarArticles = Array.from(articleMap.values());
      return activeScholarArticles;
    }
  } catch (e) {
    console.warn('Loading from Firestore failed (using static repository data for GitHub Pages / Vercel):', e);
  }
  return activeScholarArticles;
}

/**
 * Subscribe to realtime updates from Firebase Firestore
 */
export function subscribeToScholarRepository(
  callback: (articles: ScholarArticle[]) => void
): () => void {
  try {
    return subscribeScholarArticles((updatedList) => {
      if (updatedList && updatedList.length > 0) {
        const articleMap = new Map<string, ScholarArticle>();
        SCHOLAR_REPOSITORY_DATA.forEach((a) => articleMap.set(a.id, a));
        updatedList.forEach((a) => articleMap.set(a.id, a));
        activeScholarArticles = Array.from(articleMap.values());
        callback(activeScholarArticles);
      }
    });
  } catch (err) {
    console.warn('Realtime subscription not active (static mode for GitHub/Vercel):', err);
    return () => {};
  }
}
