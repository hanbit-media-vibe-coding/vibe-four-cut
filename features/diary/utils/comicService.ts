import { generateComicImage } from './imageGenerator';
import {
  createComicDocument,
  updateComicStatus,
} from './firestoreService';
import { Scene } from './scenarioGenerator';
import { ComicStyle } from '../types';

export interface ComicGenerationResult {
  comicId: string;
  imageUrl: string;  // 단일 이미지 URL
}

/**
 * 시나리오를 기반으로 네컷 만화 이미지 생성 및 저장
 */
export async function createComicFromScenario(
  scenarioId: string,
  diaryId: string,
  userId: string,
  scenes: Scene[],
  title?: string,
  style?: ComicStyle
): Promise<ComicGenerationResult> {
  let comicId: string;

  try {
    // 1. 만화 문서 생성 (pending 상태)
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { firestore } = await import('../../../shared/config/firebase');

    const comicRef = await addDoc(collection(firestore, 'comics'), {
      scenarioId,
      diaryId,
      userId,
      title,
      imageUrls: [],
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false,
    });
    comicId = comicRef.id;

    // 2. 상태를 processing으로 업데이트
    await updateComicStatus(comicId, 'processing');

    // 3. 4컷 만화 이미지 생성 및 업로드 (API 1회 호출)
    const imageUrl = await generateComicImage(userId, comicId, scenes, style || 'anime');

    // 4. 만화 문서 업데이트 (이미지 URL 저장, 상태를 completed로 변경)
    await updateComicStatus(comicId, 'completed', [imageUrl]);

    return {
      comicId,
      imageUrl,
    };
  } catch (error) {
    console.error('만화 생성 프로세스 실패:', error);

    // 에러 발생 시 상태 업데이트
    if (comicId) {
      await updateComicStatus(
        comicId,
        'failed',
        undefined,
        error instanceof Error ? error.message : '알 수 없는 오류'
      );
    }

    throw error;
  }
}

