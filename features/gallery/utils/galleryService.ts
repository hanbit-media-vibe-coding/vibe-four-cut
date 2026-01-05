import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '../../../shared/config/firebase';
import { ComicDocument } from '../../../shared/types/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ComicListItem {
  id: string;
  title?: string;
  imageUrl: string; // 단일 이미지 URL
  imageUrls?: string[]; // 하위 호환성
  createdAt: Date;
  diaryId?: string;
}

const CACHE_KEY_PREFIX = '@vibe_four_cut_comics_';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5분

/**
 * 캐시 키 생성
 */
function getCacheKey(userId: string): string {
  return `${CACHE_KEY_PREFIX}${userId}`;
}

/**
 * 캐시된 만화 목록 가져오기
 */
async function getCachedComics(userId: string): Promise<ComicListItem[] | null> {
  try {
    const cacheKey = getCacheKey(userId);
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (!cachedData) {
      return null;
    }
    
    const { comics, timestamp } = JSON.parse(cachedData);
    
    // 캐시 만료 확인 (5분)
    if (Date.now() - timestamp > CACHE_EXPIRY_MS) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }
    
    // Date 객체로 변환
    return comics.map((comic: any) => ({
      ...comic,
      createdAt: new Date(comic.createdAt),
    }));
  } catch (error) {
    console.error('캐시 읽기 실패:', error);
    return null;
  }
}

/**
 * 만화 목록 캐시 저장
 */
async function setCachedComics(userId: string, comics: ComicListItem[]): Promise<void> {
  try {
    const cacheKey = getCacheKey(userId);
    const cacheData = {
      comics,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('캐시 저장 실패:', error);
  }
}

/**
 * Firestore에서 사용자의 만화 목록 가져오기
 */
export async function getUserComics(userId: string): Promise<ComicListItem[]> {
  try {
    // 먼저 캐시 확인
    const cachedComics = await getCachedComics(userId);
    if (cachedComics) {
      console.log('캐시에서 만화 목록 로드:', cachedComics.length, '개');
      return cachedComics;
    }
    
    // Firestore에서 조회
    const comicsRef = collection(firestore, 'comics');
    const q = query(
      comicsRef,
      where('userId', '==', userId),
      where('isDeleted', '==', false),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const comics: ComicListItem[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as ComicDocument;
      
      // 단일 이미지 URL 또는 배열의 첫 번째 이미지 사용
      const imageUrl = data.imageUrls?.[0] || '';
      
      comics.push({
        id: doc.id,
        title: data.title,
        imageUrl,
        imageUrls: data.imageUrls, // 하위 호환성
        createdAt: (data.createdAt as Timestamp).toDate(),
        diaryId: data.diaryId,
      });
    });
    
    // 캐시에 저장
    await setCachedComics(userId, comics);
    
    console.log('Firestore에서 만화 목록 로드:', comics.length, '개');
    return comics;
  } catch (error) {
    console.error('만화 목록 조회 실패:', error);
    throw error;
  }
}

/**
 * 캐시 무효화 (새 만화 생성 시 호출)
 */
export async function invalidateComicsCache(userId: string): Promise<void> {
  try {
    const cacheKey = getCacheKey(userId);
    await AsyncStorage.removeItem(cacheKey);
    console.log('만화 캐시 무효화 완료');
  } catch (error) {
    console.error('캐시 무효화 실패:', error);
  }
}

/**
 * 만화 삭제 (Soft Delete)
 */
export async function deleteComic(comicId: string, userId: string): Promise<void> {
  try {
    const comicRef = doc(firestore, 'comics', comicId);
    await updateDoc(comicRef, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
    });
    
    // 캐시 무효화
    await invalidateComicsCache(userId);
    
    console.log('만화 삭제 완료:', comicId);
  } catch (error) {
    console.error('만화 삭제 실패:', error);
    throw error;
  }
}

