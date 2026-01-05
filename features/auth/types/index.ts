// Auth feature types

import { UserDocument } from '../../../shared/types/firestore';

// Firestore의 UserDocument를 재사용
export type User = UserDocument;

// Google 로그인 후 닉네임 입력 데이터
export interface NicknameInputData {
  nickname: string;
}

// Google 로그인 결과
export interface GoogleAuthResult {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  };
}

