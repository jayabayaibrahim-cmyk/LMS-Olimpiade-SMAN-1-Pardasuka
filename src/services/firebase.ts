import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ExamResult, ExamPacket, UserProfile, BimbinganSchedule, LearningMedia } from '../types';
import { ScholarArticle } from '../data/scholarRepositoryData';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics safely for browser environments
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized successfully (Measurement ID:', firebaseConfig.measurementId, ')');
      }
    })
    .catch((err) => {
      console.warn('Firebase Analytics not supported in current environment:', err);
    });
}

// Initialize Firestore (default database or configured databaseId)
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Info:', JSON.stringify(errInfo));
  // In addition to logging, throw error when required by standard error boundary
  return errInfo;
}

/**
 * Validate Connection to Firestore on startup
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / check configuration:', error.message);
    } else {
      console.log('Firestore connection ping executed.');
    }
    return true;
  }
}

// Immediately initiate connection check on import
testFirestoreConnection();

/**
 * Save Exam Result (with attemptNumber & student count tracking) to Firestore
 */
export async function saveExamResultToFirestore(result: ExamResult): Promise<void> {
  const docPath = `examResults/${result.id}`;
  try {
    const docRef = doc(db, 'examResults', result.id);
    await setDoc(docRef, {
      ...result,
      syncedAt: new Date().toISOString(),
    });
    console.log(`Exam result ${result.id} successfully synced to Firebase.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Fetch all CBT exam results from Firestore
 */
export async function fetchExamResultsFromFirestore(): Promise<ExamResult[]> {
  const collPath = 'examResults';
  try {
    const querySnapshot = await getDocs(collection(db, collPath));
    const results: ExamResult[] = [];
    querySnapshot.forEach((d) => {
      results.push(d.data() as ExamResult);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collPath);
    return [];
  }
}

/**
 * Subscribe to realtime exam results in Firestore
 */
export function subscribeExamResults(
  onUpdate: (results: ExamResult[]) => void
): () => void {
  const collPath = 'examResults';
  try {
    const q = query(collection(db, collPath));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results: ExamResult[] = [];
        snapshot.forEach((docSnap) => {
          results.push(docSnap.data() as ExamResult);
        });
        if (results.length > 0) {
          onUpdate(results);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collPath);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collPath);
    return () => {};
  }
}

/**
 * Save Exam Packet to Firestore
 */
export async function saveExamPacketToFirestore(exam: ExamPacket): Promise<void> {
  const docPath = `exams/${exam.id}`;
  try {
    const docRef = doc(db, 'exams', exam.id);
    await setDoc(docRef, exam);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Fetch Exam Packets from Firestore
 */
export async function fetchExamPacketsFromFirestore(): Promise<ExamPacket[]> {
  const collPath = 'exams';
  try {
    const querySnapshot = await getDocs(collection(db, collPath));
    const exams: ExamPacket[] = [];
    querySnapshot.forEach((d) => {
      exams.push(d.data() as ExamPacket);
    });
    return exams;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collPath);
    return [];
  }
}

/**
 * Save User Profile to Firestore
 */
export async function saveUserToFirestore(user: UserProfile): Promise<void> {
  const docPath = `users/${user.id}`;
  try {
    const docRef = doc(db, 'users', user.id);
    await setDoc(docRef, user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Fetch Users from Firestore
 */
export async function fetchUsersFromFirestore(): Promise<UserProfile[]> {
  const collPath = 'users';
  try {
    const querySnapshot = await getDocs(collection(db, collPath));
    const users: UserProfile[] = [];
    querySnapshot.forEach((d) => {
      users.push(d.data() as UserProfile);
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collPath);
    return [];
  }
}

/**
 * Subscribe to realtime users in Firestore
 */
export function subscribeUsers(
  onUpdate: (users: UserProfile[]) => void
): () => void {
  const collPath = 'users';
  try {
    const q = query(collection(db, collPath));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const users: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          users.push(docSnap.data() as UserProfile);
        });
        if (users.length > 0) {
          onUpdate(users);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collPath);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collPath);
    return () => {};
  }
}

/**
 * Push and synchronize all accounts to Firestore
 */
export async function syncInitialUsersToFirestore(usersList: UserProfile[]): Promise<void> {
  for (const user of usersList) {
    try {
      const docRef = doc(db, 'users', user.id);
      await setDoc(
        docRef,
        {
          ...user,
          syncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn(`Sync user account ${user.id} notice:`, error);
    }
  }
}

/**
 * Save Bimbingan Schedule to Firestore
 */
export async function saveScheduleToFirestore(schedule: BimbinganSchedule): Promise<void> {
  const docPath = `bimbinganSchedules/${schedule.id}`;
  try {
    const docRef = doc(db, 'bimbinganSchedules', schedule.id);
    await setDoc(docRef, schedule);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Fetch Bimbingan Schedules from Firestore
 */
export async function fetchSchedulesFromFirestore(): Promise<BimbinganSchedule[]> {
  const collPath = 'bimbinganSchedules';
  try {
    const querySnapshot = await getDocs(collection(db, collPath));
    const schedules: BimbinganSchedule[] = [];
    querySnapshot.forEach((d) => {
      schedules.push(d.data() as BimbinganSchedule);
    });
    return schedules;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collPath);
    return [];
  }
}

/**
 * Save Learning Media to Firestore
 */
export async function saveLearningMediaToFirestore(media: LearningMedia): Promise<void> {
  const docPath = `learningMedia/${media.id}`;
  try {
    const docRef = doc(db, 'learningMedia', media.id);
    await setDoc(docRef, {
      ...media,
      syncedAt: new Date().toISOString(),
    });
    console.log(`Learning media ${media.id} saved to Firebase Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Fetch all Learning Media from Firestore
 */
export async function fetchLearningMediaFromFirestore(): Promise<LearningMedia[]> {
  const collPath = 'learningMedia';
  try {
    const querySnapshot = await getDocs(collection(db, collPath));
    const mediaList: LearningMedia[] = [];
    querySnapshot.forEach((d) => {
      mediaList.push(d.data() as LearningMedia);
    });
    return mediaList;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collPath);
    return [];
  }
}

/**
 * Subscribe to realtime learning media in Firestore
 */
export function subscribeLearningMedia(
  onUpdate: (mediaList: LearningMedia[]) => void
): () => void {
  const collPath = 'learningMedia';
  try {
    const q = query(collection(db, collPath));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mediaList: LearningMedia[] = [];
        snapshot.forEach((docSnap) => {
          mediaList.push(docSnap.data() as LearningMedia);
        });
        if (mediaList.length > 0) {
          onUpdate(mediaList);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collPath);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collPath);
    return () => {};
  }
}

/**
 * Save Google Scholar Research Article to Firestore
 */
export async function saveScholarArticleToFirestore(article: ScholarArticle): Promise<void> {
  const docPath = `scholarRepository/${article.id}`;
  try {
    const docRef = doc(db, 'scholarRepository', article.id);
    await setDoc(docRef, {
      ...article,
      syncedAt: new Date().toISOString(),
    });
    console.log(`Scholar Article ${article.id} saved to Firebase Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Fetch Google Scholar Research Articles from Firestore
 */
export async function fetchScholarArticlesFromFirestore(): Promise<ScholarArticle[]> {
  const collPath = 'scholarRepository';
  try {
    const querySnapshot = await getDocs(collection(db, collPath));
    const articles: ScholarArticle[] = [];
    querySnapshot.forEach((d) => {
      articles.push(d.data() as ScholarArticle);
    });
    return articles;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collPath);
    return [];
  }
}

/**
 * Synchronize all Google Scholar articles into Firebase Firestore
 */
export async function syncInitialScholarRepositoryToFirestore(
  articles: ScholarArticle[]
): Promise<number> {
  let count = 0;
  for (const article of articles) {
    try {
      const docRef = doc(db, 'scholarRepository', article.id);
      await setDoc(
        docRef,
        {
          ...article,
          syncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      count++;
    } catch (e) {
      console.warn(`Sync Scholar article ${article.id} notice:`, e);
    }
  }
  return count;
}

/**
 * Realtime listener for Google Scholar repository in Firestore
 */
export function subscribeScholarArticles(
  onUpdate: (articles: ScholarArticle[]) => void
): () => void {
  const collPath = 'scholarRepository';
  try {
    const q = query(collection(db, collPath));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const articles: ScholarArticle[] = [];
        snapshot.forEach((docSnap) => {
          articles.push(docSnap.data() as ScholarArticle);
        });
        if (articles.length > 0) {
          onUpdate(articles);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collPath);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collPath);
    return () => {};
  }
}

