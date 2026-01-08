# 안드로이드 배포 가이드

바이브네컷 앱의 안드로이드 배포를 위한 EAS Build 설정 및 배포 명령어 가이드입니다.

## 📋 사전 준비사항

### 1. EAS CLI 설치 및 로그인
```bash
npm install -g eas-cli
eas login
```

### 2. Google Play Console 설정
- [Google Play Console](https://play.google.com/console)에서 앱 등록
- 서비스 계정 키 생성 (선택사항, 자동 제출을 위해 필요)

## 🔧 빌드 프로파일 설명

### Development
- 개발용 빌드
- Development Client 포함
- APK 형식
- 내부 배포용

### Preview
- 테스트용 빌드
- Development Client 포함
- APK 형식
- 내부 배포용

### Production
- 프로덕션 빌드
- App Bundle (AAB) 형식
- Google Play Store 제출용

## 🚀 배포 명령어

### 1. 개발 빌드 (Development)
```bash
# 안드로이드 개발 빌드 생성
eas build --platform android --profile development

# 로컬에서 빌드 (더 빠름, 하지만 네이티브 모듈 변경 시 클라우드 빌드 필요)
eas build --platform android --profile development --local
```

### 2. 테스트 빌드 (Preview)
```bash
# 안드로이드 테스트 빌드 생성
eas build --platform android --profile preview

# 로컬에서 빌드
eas build --platform android --profile preview --local
```

### 3. 프로덕션 빌드 (Production)
```bash
# 안드로이드 프로덕션 빌드 생성 (App Bundle)
eas build --platform android --profile production

# 특정 버전으로 빌드 (app.json의 version과 versionCode 수정 후)
eas build --platform android --profile production
```

### 4. 빌드 상태 확인
```bash
# 진행 중인 빌드 목록 확인
eas build:list

# 특정 빌드 상세 정보 확인
eas build:view [BUILD_ID]
```

### 5. 빌드 다운로드
```bash
# 최신 빌드 다운로드
eas build:download --platform android --latest

# 특정 빌드 다운로드
eas build:download --platform android --id [BUILD_ID]
```

### 6. Google Play Store 제출 (자동)
```bash
# 프로덕션 빌드를 Google Play Store에 자동 제출
eas submit --platform android --profile production

# 서비스 계정 키 경로 지정
eas submit --platform android --profile production --service-account-key-path ./google-service-account.json
```

### 7. Google Play Store 제출 (수동)
1. EAS Build로 생성된 AAB 파일 다운로드
2. [Google Play Console](https://play.google.com/console) 접속
3. 앱 선택 → 프로덕션 → 새 버전 만들기
4. AAB 파일 업로드
5. 출시 노트 작성 및 제출

## 📝 버전 관리

### 버전 업데이트 방법
1. `app.json`에서 `version` 업데이트 (예: "1.0.0" → "1.0.1")
2. `app.json`에서 `android.versionCode` 증가 (예: 1 → 2)
3. 빌드 및 제출

```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

## 🔐 서비스 계정 키 설정 (자동 제출용)

### 1. Google Play Console에서 서비스 계정 생성
1. Google Play Console → 설정 → API 액세스
2. 서비스 계정 섹션에서 "서비스 계정 만들기" 클릭
3. Google Cloud Console에서 서비스 계정 생성
4. JSON 키 다운로드

### 2. 프로젝트에 키 파일 추가
```bash
# 프로젝트 루트에 저장 (git에 커밋하지 않도록 주의!)
# .gitignore에 추가되어 있는지 확인
mv ~/Downloads/google-service-account.json ./google-service-account.json
```

### 3. .gitignore 확인
`.gitignore`에 다음이 포함되어 있는지 확인:
```
google-service-account.json
```

## ⚠️ 주의사항

1. **서비스 계정 키 보안**: `google-service-account.json` 파일은 절대 Git에 커밋하지 마세요.
2. **버전 코드**: Google Play Store에 제출할 때마다 `versionCode`를 증가시켜야 합니다.
3. **테스트**: 프로덕션 빌드 전에 반드시 Preview 빌드로 테스트하세요.
4. **Google Services 파일**: `google-services.json` 파일이 최신 상태인지 확인하세요.

## 🐛 문제 해결

### 빌드 실패 시
```bash
# 빌드 로그 확인
eas build:view [BUILD_ID]

# 캐시 클리어 후 재빌드
eas build --platform android --profile production --clear-cache
```

### 로컬 빌드 문제
- 네이티브 모듈 변경 시 클라우드 빌드 필요
- 로컬 빌드는 네트워크와 디스크 공간이 필요함

## 📚 참고 자료

- [EAS Build 문서](https://docs.expo.dev/build/introduction/)
- [EAS Submit 문서](https://docs.expo.dev/submit/introduction/)
- [Google Play Console](https://play.google.com/console)


