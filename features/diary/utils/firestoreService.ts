import {
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { firestore } from '../../../shared/config/firebase';
import {
  ScenarioDocument,
  ScenarioStatus,
  DiaryDocument,
  ComicDocument,
  ComicStatus,
} from '../../../shared/types/firestore';
import { Scenario } from './scenarioGenerator';

/**
 * Firestore에 시나리오 저장 (새 문서 생성)
 */
export async function saveScenarioToFirestore(
  diaryId: string,
  userId: string,
  scenario: Scenario
): Promise<string> {
  try {
    // 시나리오 문서 생성
    const scenarioData: Omit<ScenarioDocument, 'id'> = {
      diaryId,
      userId,
      scenarioText: JSON.stringify(scenario.scenes),
      status: 'completed' as ScenarioStatus,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(firestore, 'scenarios'), scenarioData);
    return docRef.id;
  } catch (error) {
    console.error('시나리오 저장 실패:', error);
    throw error;
  }
}

/**
 * 기존 시나리오 문서 업데이트
 */
export async function updateScenarioInFirestore(
  scenarioId: string,
  scenario: Scenario
): Promise<void> {
  try {
    const scenarioRef = doc(firestore, 'scenarios', scenarioId);
    await updateDoc(scenarioRef, {
      scenarioText: JSON.stringify(scenario.scenes),
      status: 'completed' as ScenarioStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('시나리오 업데이트 실패:', error);
    throw error;
  }
}

/**
 * 오늘 날짜의 시작과 끝 시간을 반환
 */
function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start, end };
}

/**
 * 오늘 이미 일기를 작성했는지 확인
 */
export async function checkTodayDiaryExists(userId: string): Promise<{
  exists: boolean;
  diaryId?: string;
}> {
  try {
    const { start, end } = getTodayRange();
    
    const diariesRef = collection(firestore, 'diaries');
    const q = query(
      diariesRef,
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(start)),
      where('date', '<=', Timestamp.fromDate(end)),
      where('isDeleted', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const firstDoc = querySnapshot.docs[0];
      return { exists: true, diaryId: firstDoc.id };
    }
    
    return { exists: false };
  } catch (error) {
    console.error('오늘 일기 확인 실패:', error);
    throw error;
  }
}

/**
 * 일기를 Firestore에 저장
 */
export async function saveDiaryToFirestore(
  userId: string,
  content: string,
  date: Date = new Date()
): Promise<string> {
  try {
    const diaryData: Omit<DiaryDocument, 'id'> = {
      userId,
      content,
      date: Timestamp.fromDate(date),
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      isDeleted: false,
    };

    const docRef = await addDoc(collection(firestore, 'diaries'), diaryData);
    return docRef.id;
  } catch (error) {
    console.error('일기 저장 실패:', error);
    throw error;
  }
}

/**
 * 시나리오 상태 업데이트
 */
export async function updateScenarioStatus(
  scenarioId: string,
  status: ScenarioStatus,
  errorMessage?: string
): Promise<void> {
  try {
    const scenarioRef = doc(firestore, 'scenarios', scenarioId);
    await updateDoc(scenarioRef, {
      status,
      updatedAt: serverTimestamp(),
      ...(errorMessage && { errorMessage }),
    });
  } catch (error) {
    console.error('시나리오 상태 업데이트 실패:', error);
    throw error;
  }
}

/**
 * 만화 문서 생성 (Firestore)
 */
export async function createComicDocument(
  scenarioId: string,
  diaryId: string,
  userId: string,
  imageUrls: string[],
  title?: string
): Promise<string> {
  try {
    const comicData: Omit<ComicDocument, 'id'> = {
      scenarioId,
      diaryId,
      userId,
      title,
      imageUrls,
      status: 'completed' as ComicStatus,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      isDeleted: false,
    };

    const docRef = await addDoc(collection(firestore, 'comics'), comicData);
    return docRef.id;
  } catch (error) {
    console.error('만화 문서 생성 실패:', error);
    throw error;
  }
}

/**
 * 만화 상태 업데이트
 */
export async function updateComicStatus(
  comicId: string,
  status: ComicStatus,
  imageUrls?: string[],
  errorMessage?: string
): Promise<void> {
  try {
    const comicRef = doc(firestore, 'comics', comicId);
    await updateDoc(comicRef, {
      status,
      updatedAt: serverTimestamp(),
      ...(imageUrls && { imageUrls }),
      ...(errorMessage && { errorMessage }),
    });
  } catch (error) {
    console.error('만화 상태 업데이트 실패:', error);
    throw error;
  }
}

