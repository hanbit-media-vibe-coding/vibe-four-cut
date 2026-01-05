// Gallery feature types

import { ComicDocument } from '../../../shared/types/firestore';

// Firestore 문서 타입 재사용
export type FourCutComic = ComicDocument;

// 만화 생성 요청 데이터
export interface ComicGenerateRequest {
  scenarioId: string;
  scenarioText: string;
  title?: string;
}

// 만화 생성 응답
export interface ComicGenerateResponse {
  comicId: string;
  imageUrls: string[];
  status: ComicDocument['status'];
}

// 갤러리 조회 필터
export interface GalleryFilter {
  userId?: string;
  status?: ComicDocument['status'];
  startDate?: Date;
  endDate?: Date;
}

