import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '../../../shared/config/gemini';
import { firebaseConfig } from '../../../shared/config/firebase';
import * as FileSystem from 'expo-file-system/legacy';
import { ComicStyle, STYLE_PROMPTS } from '../types';

export interface Scene {
  order: number;
  description: string;
}

/**
 * 4컷 만화 이미지 생성 (하나의 이미지로 4컷 모두 포함)
 */
export async function generateFourPanelComic(
  scenes: Scene[],
  style: ComicStyle = 'anime',
  retryCount: number = 0,
  maxRetries: number = 3
): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
  });

  // 4개 장면을 하나의 프롬프트로 결합
  const sceneDescriptions = scenes
    .sort((a, b) => a.order - b.order)
    .map((scene) => `Panel ${scene.order}: ${scene.description}`)
    .join('\n');

  // 선택된 스타일에 맞는 프롬프트 추가
  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.anime;

  const prompt = `Create a 4-panel comic strip (2x2 grid layout) ${stylePrompt} based on the following scenes:

${sceneDescriptions}

Requirements:
- Layout: 2x2 grid (4 panels arranged in 2 rows, 2 columns)
- Style: ${stylePrompt}
- Each panel should clearly show the corresponding scene
- Panels should have clear borders/dividers
- Make it suitable for a diary comic strip
- The overall image should feel cohesive and tell a story`;

  try {
    console.log('4컷 만화 이미지 생성 중...');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
    });

    // 응답에서 이미지 데이터 추출
    let imageData: string | null = null;

    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            imageData = part.inlineData.data ?? null;
            if (imageData) {
              console.log(`4컷 만화 이미지 데이터 수신 (길이: ${imageData.length})`);
            }
            break;
          }
          if (part.text) {
            console.warn('응답 텍스트 (이미지가 아닌 텍스트):', part.text);
          }
        }
      }
    }

    if (!imageData) {
      console.error('이미지 데이터를 찾을 수 없습니다.');
      throw new Error('이미지 데이터를 받지 못했습니다. Gemini API가 이미지를 생성하지 못한 것 같습니다.');
    }

    return imageData;
  } catch (error: any) {
    // 할당량 초과 에러 (429)인 경우 재시도
    if (error?.error?.code === 429 && retryCount < maxRetries) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
      console.log(`할당량 초과, ${retryDelay}ms 후 재시도... (${retryCount + 1}/${maxRetries})`);
      
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return generateFourPanelComic(scenes, style, retryCount + 1, maxRetries);
    }

    if (error?.error?.code === 429) {
      const quotaError = new Error(
        'Gemini API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.'
      );
      quotaError.name = 'QuotaExceededError';
      throw quotaError;
    }

    console.error('4컷 만화 이미지 생성 실패:', error);
    throw error;
  }
}

/**
 * base64 이미지 데이터를 Firebase Storage에 업로드
 */
export async function uploadComicToStorage(
  userId: string,
  comicId: string,
  base64ImageData: string
): Promise<string> {
  try {
    // base64 데이터 정리 (data URL prefix 제거)
    let base64Data = base64ImageData;
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1];
    }

    // Storage 경로 생성 (단일 이미지)
    const storagePath = `comics/${userId}/${comicId}/comic.png`;
    const bucket = firebaseConfig.storageBucket;
    
    // 임시 파일 경로
    const tempFilePath = `${FileSystem.cacheDirectory}temp_comic_${Date.now()}.png`;
    
    // base64를 임시 파일로 저장
    await FileSystem.writeAsStringAsync(tempFilePath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('임시 파일 저장 완료');

    // Firebase Storage REST API 엔드포인트
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(storagePath)}`;

    console.log('Firebase Storage 업로드 시작...');

    // expo-file-system의 uploadAsync 사용
    const uploadResult = await FileSystem.uploadAsync(uploadUrl, tempFilePath, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        'Content-Type': 'image/png',
      },
    });

    // 임시 파일 삭제
    await FileSystem.deleteAsync(tempFilePath, { idempotent: true });

    if (uploadResult.status !== 200) {
      console.error('업로드 응답:', uploadResult.body);
      throw new Error(`업로드 실패: ${uploadResult.status}`);
    }

    // 응답에서 다운로드 토큰 추출
    const response = JSON.parse(uploadResult.body);
    const downloadToken = response.downloadTokens;
    
    // 다운로드 URL 생성
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;

    console.log('업로드 완료:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    throw error;
  }
}

/**
 * 네컷 만화 이미지 생성 및 업로드 (단일 이미지)
 */
export async function generateComicImage(
  userId: string,
  comicId: string,
  scenes: Scene[],
  style: ComicStyle = 'anime'
): Promise<string> {
  try {
    // 1. 4컷 만화 이미지 생성 (API 1회 호출)
    const base64ImageData = await generateFourPanelComic(scenes, style);

    // 2. Firebase Storage에 업로드
    const imageUrl = await uploadComicToStorage(userId, comicId, base64ImageData);

    return imageUrl;
  } catch (error) {
    console.error('만화 이미지 생성 실패:', error);
    throw error;
  }
}

// 하위 호환성을 위한 기존 함수 (배열 반환)
export async function generateComicImages(
  userId: string,
  comicId: string,
  scenes: Scene[],
  style: ComicStyle = 'anime'
): Promise<string[]> {
  const imageUrl = await generateComicImage(userId, comicId, scenes, style);
  // 단일 이미지 URL을 배열로 반환 (하위 호환성)
  return [imageUrl];
}
