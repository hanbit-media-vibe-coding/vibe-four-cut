import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, firestore } from '../../../shared/config/firebase';

// 사용자 데이터 타입
export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  nickname?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastLoginAt?: Timestamp;
}

// Google OAuth 클라이언트 ID 설정
// Firebase Console > 프로젝트 설정 > 일반 > 웹 API 키 아래에서 확인
// 또는 Google Cloud Console > API 및 서비스 > 사용자 인증 정보
export const GOOGLE_CONFIG = {
  // Web Client ID (Firebase Console > 프로젝트 설정 > 일반 > 웹 앱에서 확인)
  // 또는 Google Cloud Console > API 및 서비스 > 사용자 인증 정보 > "Web client (auto created by Google Service)"
  webClientId: '36747452338-m5kiqhddvejs5nvit749cc1vm0bdku7i.apps.googleusercontent.com',
  // iOS Client ID (GoogleService-Info.plist의 CLIENT_ID)
  iosClientId: '36747452338-5dafav2uuhnsijb6nj4gv0fe9l545nf8.apps.googleusercontent.com',
  // Android Client ID (google-services.json에서 확인)
  androidClientId: '36747452338-m5kiqhddvejs5nvit749cc1vm0bdku7i.apps.googleusercontent.com',
};

/**
 * Google ID Token으로 Firebase 로그인
 */
export async function signInWithGoogleIdToken(idToken: string): Promise<{
  user: UserData;
  isNewUser: boolean;
}> {
  try {
    // Google 자격 증명 생성
    const credential = GoogleAuthProvider.credential(idToken);
    
    // Firebase Auth로 로그인
    const userCredential = await signInWithCredential(auth, credential);
    const firebaseUser = userCredential.user;
    
    console.log('Firebase 로그인 성공:', firebaseUser.email);
    
    // Firestore에서 기존 사용자 확인
    const existingUser = await getUserFromFirestore(firebaseUser.uid);
    
    if (existingUser && existingUser.nickname) {
      // 기존 사용자 - 마지막 로그인 시간 업데이트
      await updateLastLogin(firebaseUser.uid);
      return { user: existingUser, isNewUser: false };
    } else {
      // 새 사용자 - 기본 정보 저장
      const newUser: UserData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
      };
      
      await createUserInFirestore(newUser);
      return { user: newUser, isNewUser: true };
    }
  } catch (error: any) {
    console.error('Google 로그인 실패:', error);
    
    // 에러 메시지 개선
    if (error.code === 'auth/invalid-credential') {
      throw new Error('인증 정보가 유효하지 않습니다. 다시 시도해주세요.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('이 계정은 비활성화되었습니다.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('네트워크 연결을 확인해주세요.');
    }
    
    throw error;
  }
}

/**
 * Firestore에서 사용자 정보 가져오기
 */
export async function getUserFromFirestore(uid: string): Promise<UserData | null> {
  try {
    const userRef = doc(firestore, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { uid, ...userSnap.data() } as UserData;
    }
    
    return null;
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    throw error;
  }
}

/**
 * Firestore에 새 사용자 생성
 */
export async function createUserInFirestore(userData: UserData): Promise<void> {
  try {
    const userRef = doc(firestore, 'users', userData.uid);
    await setDoc(userRef, {
      email: userData.email,
      displayName: userData.displayName || '',
      photoURL: userData.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    console.log('새 사용자 생성 완료:', userData.email);
  } catch (error) {
    console.error('사용자 생성 실패:', error);
    throw error;
  }
}

/**
 * 사용자 닉네임 저장
 */
export async function saveUserNickname(uid: string, nickname: string): Promise<void> {
  try {
    const userRef = doc(firestore, 'users', uid);
    await updateDoc(userRef, {
      nickname,
      updatedAt: serverTimestamp(),
    });
    console.log('닉네임 저장 완료:', nickname);
  } catch (error) {
    console.error('닉네임 저장 실패:', error);
    throw error;
  }
}

/**
 * 마지막 로그인 시간 업데이트
 */
export async function updateLastLogin(uid: string): Promise<void> {
  try {
    const userRef = doc(firestore, 'users', uid);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('마지막 로그인 시간 업데이트 실패:', error);
    // 실패해도 로그인 프로세스는 계속 진행
  }
}

/**
 * 로그아웃
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    console.log('로그아웃 완료');
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
}
