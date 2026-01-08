/**
 * Firestore 데이터 구조 타입 정의
 * 
 * 컬렉션 구조:
 * - users/{userId}
 * - diaries/{diaryId}
 * - scenarios/{scenarioId}
 * - comics/{comicId}
 */

import { Timestamp } from 'firebase/firestore';

// ==================== Users Collection ====================
export interface UserDocument {
  uid: string; // Firebase Auth UID (문서 ID와 동일)
  email: string;
  displayName: string; // Google 로그인 시 받은 이름
  nickname: string; // 사용자가 입력한 닉네임
  photoURL?: string; // Google 프로필 이미지 URL
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
}

// ==================== Diaries Collection ====================
export interface DiaryDocument {
  id: string; // 문서 ID
  userId: string; // users/{userId} 참조
  content: string; // 일기 내용
  date: Timestamp; // 일기 작성 날짜
  createdAt: Timestamp; // 문서 생성 시간
  updatedAt: Timestamp; // 문서 수정 시간
  isDeleted: boolean; // soft delete 플래그
  // 관계: diaries -> scenarios (1:N)
}

// ==================== Scenarios Collection ====================
export type ScenarioStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ScenarioDocument {
  id: string; // 문서 ID
  diaryId: string; // diaries/{diaryId} 참조
  userId: string; // users/{userId} 참조 (조회 최적화)
  scenarioText: string; // AI가 생성한 시나리오 텍스트
  status: ScenarioStatus; // 생성 상태
  createdAt: Timestamp; // 문서 생성 시간
  updatedAt: Timestamp; // 문서 수정 시간
  errorMessage?: string; // 실패 시 에러 메시지
  // 관계: scenarios -> comics (1:1 또는 1:0)
}

// ==================== Comics Collection ====================
export type ComicStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ComicDocument {
  id: string; // 문서 ID
  scenarioId: string; // scenarios/{scenarioId} 참조
  diaryId: string; // diaries/{diaryId} 참조 (조회 최적화)
  userId: string; // users/{userId} 참조 (조회 최적화)
  title?: string; // 만화 제목 (선택적)
  imageUrls: string[]; // Firebase Storage URL 배열 (4개)
  status: ComicStatus; // 생성 상태
  createdAt: Timestamp; // 문서 생성 시간
  updatedAt: Timestamp; // 문서 수정 시간
  errorMessage?: string; // 실패 시 에러 메시지
  isDeleted: boolean; // soft delete 플래그
  // Storage 경로: comics/{userId}/{comicId}/scene-{1-4}.jpg
}

// ==================== 컬렉션 간 관계 ====================
/**
 * 데이터 관계 구조:
 * 
 * users/{userId}
 *   └── diaries/{diaryId} (1:N)
 *         └── scenarios/{scenarioId} (1:1 또는 1:0)
 *               └── comics/{comicId} (1:1 또는 1:0)
 * 
 * 조회 패턴:
 * 1. 사용자별 일기 목록: diaries (userId로 필터링)
 * 2. 일기별 시나리오: scenarios (diaryId로 필터링)
 * 3. 시나리오별 만화: comics (scenarioId로 필터링)
 * 4. 사용자별 만화 목록: comics (userId로 필터링) - 갤러리 조회용
 */




