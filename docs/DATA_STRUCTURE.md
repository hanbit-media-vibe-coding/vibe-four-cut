# 바이브네컷 데이터 구조 설계

## 개요

바이브네컷 앱에서 관리하는 데이터 구조와 Firestore 컬렉션, Firebase Storage 경로 구조를 정의합니다.

## Firestore 컬렉션 구조

### 1. users 컬렉션

**경로**: `users/{userId}`

**설명**: 사용자 정보를 저장하는 컬렉션. Google 로그인 시 자동으로 생성되며, 닉네임을 입력받아 저장합니다.

**문서 구조**:
```typescript
{
  uid: string;              // Firebase Auth UID (문서 ID와 동일)
  email: string;            // 이메일 주소
  displayName: string;      // Google 로그인 시 받은 이름
  nickname: string;         // 사용자가 입력한 닉네임
  photoURL?: string;        // Google 프로필 이미지 URL
  createdAt: Timestamp;     // 계정 생성 시간
  updatedAt: Timestamp;     // 정보 수정 시간
  lastLoginAt: Timestamp;   // 마지막 로그인 시간
}
```

**생성 시점**: Google 로그인 후 첫 로그인 시 또는 닉네임 입력 완료 시

**보안 규칙**: 본인만 읽기/쓰기 가능

---

### 2. diaries 컬렉션

**경로**: `diaries/{diaryId}`

**설명**: 사용자가 작성한 일기를 저장하는 컬렉션.

**문서 구조**:
```typescript
{
  id: string;               // 문서 ID
  userId: string;           // users/{userId} 참조
  content: string;          // 일기 내용
  date: Timestamp;          // 일기 작성 날짜
  createdAt: Timestamp;    // 문서 생성 시간
  updatedAt: Timestamp;     // 문서 수정 시간
  isDeleted: boolean;      // soft delete 플래그
}
```

**관계**: 
- `users/{userId}` → `diaries` (1:N)
- `diaries/{diaryId}` → `scenarios` (1:1 또는 1:0)

**보안 규칙**: 본인 일기만 읽기/쓰기 가능

---

### 3. scenarios 컬렉션

**경로**: `scenarios/{scenarioId}`

**설명**: 일기 내용을 기반으로 AI가 생성한 네컷 만화 시나리오를 저장하는 컬렉션.

**문서 구조**:
```typescript
{
  id: string;                    // 문서 ID
  diaryId: string;               // diaries/{diaryId} 참조
  userId: string;                // users/{userId} 참조 (조회 최적화)
  scenarioText: string;          // AI가 생성한 시나리오 텍스트
  status: 'pending' |           // 생성 상태
          'processing' |
          'completed' |
          'failed';
  createdAt: Timestamp;          // 문서 생성 시간
  updatedAt: Timestamp;          // 문서 수정 시간
  errorMessage?: string;         // 실패 시 에러 메시지
}
```

**상태 설명**:
- `pending`: 시나리오 생성 요청 대기 중
- `processing`: AI가 시나리오 생성 중
- `completed`: 시나리오 생성 완료
- `failed`: 시나리오 생성 실패

**관계**: 
- `diaries/{diaryId}` → `scenarios` (1:1 또는 1:0)
- `scenarios/{scenarioId}` → `comics` (1:1 또는 1:0)

**보안 규칙**: 본인 시나리오만 읽기/쓰기 가능

---

### 4. comics 컬렉션

**경로**: `comics/{comicId}`

**설명**: 시나리오를 기반으로 생성된 네컷 만화 이미지 정보를 저장하는 컬렉션.

**문서 구조**:
```typescript
{
  id: string;                    // 문서 ID
  scenarioId: string;             // scenarios/{scenarioId} 참조
  diaryId: string;               // diaries/{diaryId} 참조 (조회 최적화)
  userId: string;                // users/{userId} 참조 (조회 최적화)
  title?: string;                 // 만화 제목 (선택적)
  imageUrls: string[];           // Firebase Storage URL 배열 (4개)
  status: 'pending' |           // 생성 상태
          'processing' |
          'completed' |
          'failed';
  createdAt: Timestamp;          // 문서 생성 시간
  updatedAt: Timestamp;          // 문서 수정 시간
  errorMessage?: string;         // 실패 시 에러 메시지
  isDeleted: boolean;            // soft delete 플래그
}
```

**상태 설명**:
- `pending`: 만화 이미지 생성 요청 대기 중
- `processing`: AI가 만화 이미지 생성 중
- `completed`: 만화 이미지 생성 완료 (4개 이미지 모두 생성됨)
- `failed`: 만화 이미지 생성 실패

**관계**: 
- `scenarios/{scenarioId}` → `comics` (1:1 또는 1:0)
- `users/{userId}` → `comics` (1:N) - 갤러리 조회용

**보안 규칙**: 인증된 사용자는 모든 만화 읽기 가능, 본인 만화만 쓰기 가능

---

## 데이터 관계도

```
users/{userId}
  │
  ├── diaries/{diaryId} (1:N)
  │     │
  │     └── scenarios/{scenarioId} (1:1 또는 1:0)
  │           │
  │           └── comics/{comicId} (1:1 또는 1:0)
  │
  └── comics/{comicId} (1:N) - 갤러리 조회용 직접 참조
```

### 조회 패턴

1. **사용자별 일기 목록**: `diaries` 컬렉션에서 `userId`로 필터링
2. **일기별 시나리오**: `scenarios` 컬렉션에서 `diaryId`로 필터링
3. **시나리오별 만화**: `comics` 컬렉션에서 `scenarioId`로 필터링
4. **사용자별 만화 목록 (갤러리)**: `comics` 컬렉션에서 `userId`로 필터링, `status = 'completed'` 조건

---

## Firebase Storage 경로 구조

### 1. 사용자 프로필 이미지

**경로**: `users/{userId}/profile/avatar.jpg`

**설명**: 사용자의 프로필 이미지를 저장합니다. Google 로그인 시 받은 프로필 이미지를 사용하거나, 사용자가 직접 업로드할 수 있습니다.

**접근 권한**: 본인만 읽기/쓰기 가능

---

### 2. 만화 이미지

**경로**: `comics/{userId}/{comicId}/scene-{1-4}.jpg`

**설명**: 네컷 만화의 각 씬 이미지를 저장합니다. 각 만화마다 4개의 이미지 파일이 생성됩니다.

**파일명 규칙**:
- `scene-1.jpg`: 첫 번째 씬
- `scene-2.jpg`: 두 번째 씬
- `scene-3.jpg`: 세 번째 씬
- `scene-4.jpg`: 네 번째 씬

**예시**:
```
comics/
  └── user123/
      └── comic456/
          ├── scene-1.jpg
          ├── scene-2.jpg
          ├── scene-3.jpg
          └── scene-4.jpg
```

**접근 권한**: 
- 읽기: 인증된 모든 사용자 (갤러리 공유 기능 대비)
- 쓰기: 본인만 가능

---

## 데이터 흐름

### 1. 사용자 등록 흐름

```
1. Google 로그인
   ↓
2. Firebase Auth에서 사용자 정보 획득
   ↓
3. Firestore users 컬렉션에 문서 생성/업데이트
   - uid, email, displayName, photoURL 저장
   ↓
4. 닉네임 입력 화면 표시
   ↓
5. 닉네임 입력 후 users 문서 업데이트
   - nickname 필드 추가
```

### 2. 일기 작성 → 만화 생성 흐름

```
1. 사용자가 일기 작성
   ↓
2. diaries 컬렉션에 문서 생성
   ↓
3. AI 시나리오 생성 요청
   ↓
4. scenarios 컬렉션에 문서 생성 (status: 'pending')
   ↓
5. AI 처리 중 (status: 'processing')
   ↓
6. 시나리오 생성 완료 (status: 'completed')
   - scenarioText 필드에 시나리오 텍스트 저장
   ↓
7. 만화 이미지 생성 요청
   ↓
8. comics 컬렉션에 문서 생성 (status: 'pending')
   ↓
9. AI 처리 중 (status: 'processing')
   ↓
10. 각 씬별 이미지 생성 및 Storage 업로드
    - comics/{userId}/{comicId}/scene-1.jpg
    - comics/{userId}/{comicId}/scene-2.jpg
    - comics/{userId}/{comicId}/scene-3.jpg
    - comics/{userId}/{comicId}/scene-4.jpg
   ↓
11. 만화 생성 완료 (status: 'completed')
    - imageUrls 배열에 4개 URL 저장
```

---

## 추가 고려사항

### 1. 인덱스 설정

다음 필드 조합에 대한 복합 인덱스가 필요할 수 있습니다:

- `diaries`: `userId` + `createdAt` (사용자별 일기 목록 조회)
- `scenarios`: `diaryId` + `createdAt` (일기별 시나리오 조회)
- `comics`: `userId` + `status` + `createdAt` (갤러리 조회)
- `comics`: `scenarioId` + `createdAt` (시나리오별 만화 조회)

### 2. 데이터 삭제 정책

- **Soft Delete**: `isDeleted` 플래그를 사용하여 논리적 삭제
- **Cascade Delete**: 만화 삭제 시 관련 Storage 파일도 함께 삭제
- **일기 삭제**: 관련 시나리오와 만화도 함께 삭제 (또는 soft delete)

### 3. 데이터 백업

- 정기적인 Firestore 데이터 백업 설정 권장
- Storage 이미지 파일은 별도 백업 정책 수립

### 4. 확장 가능성

향후 추가 가능한 기능을 위한 필드:
- `comics.likes`: 좋아요 수
- `comics.shares`: 공유 수
- `comics.isPublic`: 공개 여부
- `comics.tags`: 태그 배열

---

## 타입 정의 위치

모든 타입 정의는 다음 파일에 있습니다:

- `shared/types/firestore.ts`: Firestore 문서 타입
- `shared/types/storage.ts`: Storage 경로 유틸리티
- `features/auth/types/index.ts`: 인증 관련 타입
- `features/diary/types/index.ts`: 일기 관련 타입
- `features/gallery/types/index.ts`: 갤러리 관련 타입

