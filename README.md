# 바이브네컷 (Vibe Four Cut)

일기를 네컷 만화로 바꿔주는 모바일 앱

## 프로젝트 구조

이 프로젝트는 **Feature-Sliced Design (FSD)** 아키텍처를 기반으로 구성되어 있습니다.

```
vibe-four-cut/
├── app/                    # 앱 초기화 및 설정
│   ├── providers/          # 전역 프로바이더 (Context, Theme 등)
│   └── router/             # 라우팅 설정
│
├── processes/              # 비즈니스 프로세스 (선택적)
│
├── pages/                  # 페이지 레벨 컴포지션
│   ├── home/               # 홈 페이지
│   ├── auth/               # 인증 페이지
│   ├── diary/              # 일기 페이지
│   └── gallery/            # 갤러리 페이지
│
├── widgets/                # 독립적인 UI 블록
│
├── features/               # 기능 단위
│   ├── home/               # 홈 기능
│   │   ├── screens/        # 화면 컴포넌트
│   │   ├── components/     # UI 컴포넌트
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── store/          # 상태 관리
│   │   ├── types/          # 타입 정의
│   │   └── utils/          # 유틸리티 함수
│   │
│   ├── auth/               # 인증 기능
│   │   ├── screens/        # LoginScreen, RegisterScreen
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── diary/              # 일기 기능
│   │   ├── screens/        # DiaryWriteScreen, ScenarioGenerateScreen
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── gallery/            # 갤러리 기능
│       ├── screens/        # GalleryScreen, ComicDetailScreen
│       ├── components/
│       ├── hooks/
│       ├── store/
│       ├── types/
│       └── utils/
│
├── entities/               # 비즈니스 엔티티
│
└── shared/                 # 공유 리소스
    ├── ui/                 # 공유 UI 컴포넌트
    ├── utils/              # 공유 유틸리티
    ├── config/             # 설정
    └── types/              # 공유 타입
├── firebase.json           # Firebase 프로젝트 설정
├── .firebaserc             # Firebase 프로젝트 연결 정보
├── firestore.rules         # Firestore 보안 규칙
├── firestore.indexes.json  # Firestore 인덱스 설정
└── storage.rules           # Storage 보안 규칙
```

## 주요 기능

- **home**: 앱 메인 화면 (일기 작성 시작, 갤러리 이동 진입점)
- **auth**: 로그인 및 사용자 인증 관련
- **diary**: 일기 작성, AI 시나리오 생성 흐름
- **gallery**: 생성된 네컷 만화를 모아보는 화면

## 기술 스택

- React Native
- Expo
- TypeScript
- Feature-Sliced Design (FSD)
- Firebase (Authentication, Firestore, Storage, Analytics)

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start

# iOS 실행
npm run ios

# Android 실행
npm run android

# Web 실행
npm run web
```

## Firebase 설정

Firebase는 `shared/config/firebase.ts`에서 초기화됩니다. 다음 서비스들이 설정되어 있습니다:

- **Authentication**: 사용자 인증
- **Firestore**: 데이터베이스
- **Storage**: 파일 저장소
- **Analytics**: 분석 (웹 플랫폼)

### 사용 예시

```typescript
import { auth, firestore, storage } from '@/shared/config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

// Authentication 사용
const user = await signInWithEmailAndPassword(auth, email, password);

// Firestore 사용
const querySnapshot = await getDocs(collection(firestore, 'diaries'));

// Storage 사용
import { ref, uploadBytes } from 'firebase/storage';
const storageRef = ref(storage, 'images/comic.jpg');
```

### Firebase CLI 사용법

프로젝트는 Firebase CLI로 초기화되어 있으며, 다음 명령어를 사용할 수 있습니다:

```bash
# Firestore 규칙 배포
firebase deploy --only firestore:rules

# Storage 규칙 배포
firebase deploy --only storage

# Firestore 인덱스 배포
firebase deploy --only firestore:indexes

# 모든 규칙 배포
firebase deploy --only firestore,storage

# Firestore 에뮬레이터 실행
firebase emulators:start --only firestore

# Storage 에뮬레이터 실행
firebase emulators:start --only storage
```

### Firebase 보안 규칙

- **Firestore**: `firestore.rules`에 정의된 규칙으로 사용자별 데이터 접근 제어
- **Storage**: `storage.rules`에 정의된 규칙으로 파일 업로드/다운로드 제어

주요 컬렉션:
- `users/{userId}`: 사용자 정보 (Google 로그인, 닉네임)
- `diaries/{diaryId}`: 일기 데이터 (내용, 날짜)
- `scenarios/{scenarioId}`: AI 생성 시나리오 (일기 ID 참조)
- `comics/{comicId}`: 네컷 만화 데이터 (시나리오 ID 참조, 이미지 URL 4개)

**상세한 데이터 구조는 [데이터 구조 문서](./docs/DATA_STRUCTURE.md)를 참고하세요.**

