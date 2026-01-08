# iOS 배포 가이드

바이브네컷 앱의 iOS 배포를 위한 EAS Build 설정 및 App Store Connect 제출 가이드입니다.

## 📋 사전 준비사항

### 1. Apple Developer Program 가입
- [Apple Developer Program](https://developer.apple.com/programs/) 가입 (연간 $99)
- Apple ID로 로그인하여 개발자 계정 활성화

### 2. App Store Connect 설정
- [App Store Connect](https://appstoreconnect.apple.com/) 접속
- 앱 등록 및 기본 정보 입력
  - 앱 이름: "바이브네컷"
  - 기본 언어: 한국어
  - 번들 ID: `com.vibefourcut.app`
  - SKU: 고유 식별자 (예: `vibe-four-cut-001`)

### 3. EAS CLI 설치 및 로그인
```bash
npm install -g eas-cli
eas login
```

### 4. Apple 계정 연결
```bash
# Apple 계정을 EAS에 연결
eas device:create
```

## 🔧 빌드 프로파일 설명

### Development
- 개발용 빌드
- Development Client 포함
- Ad Hoc 배포용
- 테스트 기기 등록 필요

### Preview
- 테스트용 빌드
- Development Client 포함
- Ad Hoc 배포용
- 테스트 기기 등록 필요

### Production
- 프로덕션 빌드
- App Store 및 TestFlight 제출용
- App Store Connect에 자동 업로드 가능

## 🚀 배포 단계별 가이드

### Step 1: App Store Connect에서 앱 등록

1. [App Store Connect](https://appstoreconnect.apple.com/) 접속
2. "내 앱" → "+" 버튼 클릭
3. 앱 정보 입력:
   - **플랫폼**: iOS
   - **이름**: 바이브네컷
   - **기본 언어**: 한국어
   - **번들 ID**: `com.vibefourcut.app` (이미 생성되어 있어야 함)
   - **SKU**: 고유 식별자 (예: `vibe-four-cut-001`)
4. "만들기" 클릭

### Step 2: Bundle ID 확인 및 생성

#### Bundle ID가 없는 경우:
1. [Apple Developer Portal](https://developer.apple.com/account/) 접속
2. "Certificates, Identifiers & Profiles" → "Identifiers"
3. "+" 버튼 클릭 → "App IDs" 선택
4. 다음 정보 입력:
   - **Description**: 바이브네컷
   - **Bundle ID**: `com.vibefourcut.app`
   - **Capabilities**: 필요한 기능 선택 (Push Notifications, Sign in with Apple 등)
5. "Continue" → "Register"

### Step 3: EAS Build로 iOS 빌드 생성

#### 프로덕션 빌드 생성
```bash
# 프로덕션 빌드 생성 (App Store Connect에 자동 업로드)
npm run build:ios:prod
# 또는
eas build --platform ios --profile production
```

#### 빌드 옵션
- **자동 업로드**: 빌드 완료 후 App Store Connect에 자동 업로드
- **수동 업로드**: 빌드만 생성하고 나중에 수동으로 업로드

#### 빌드 진행 상황 확인
```bash
# 빌드 목록 확인
eas build:list --platform ios

# 특정 빌드 상세 정보
eas build:view [BUILD_ID]
```

### Step 4: TestFlight에 업로드

#### 방법 1: EAS Submit 사용 (권장)
```bash
# 빌드 완료 후 자동으로 TestFlight에 업로드
npm run submit:ios
# 또는
eas submit --platform ios --profile production
```

#### 방법 2: App Store Connect에서 수동 업로드
1. EAS Build에서 생성된 `.ipa` 파일 다운로드
2. [App Store Connect](https://appstoreconnect.apple.com/) 접속
3. "내 앱" → 앱 선택 → "TestFlight" 탭
4. "iOS Build" 섹션에서 "+" 버튼 클릭
5. `.ipa` 파일 업로드
6. 업로드 완료 후 처리 대기 (보통 10-30분)

### Step 5: TestFlight 테스트

1. App Store Connect → TestFlight 탭
2. 빌드가 "처리 중"에서 "테스트 준비 완료"로 변경될 때까지 대기
3. "내부 테스트" 또는 "외부 테스트" 그룹에 빌드 추가
4. 테스터 초대 (이메일 또는 공개 링크)

## 📝 필수 설정 값

### app.json 설정

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.vibefourcut.app",  // App Store Connect와 일치해야 함
      "buildNumber": "1",  // 각 제출마다 증가 필요
      "googleServicesFile": "./GoogleService-Info.plist",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,  // 암호화 사용 여부
        "NSPhotoLibraryUsageDescription": "사진 라이브러리 접근 권한 설명",
        "NSPhotoLibraryAddUsageDescription": "사진 저장 권한 설명"
      }
    }
  }
}
```

### eas.json 설정

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",  // Apple ID 이메일
        "ascAppId": "1234567890",  // App Store Connect 앱 ID
        "appleTeamId": "ABCD123456"  // Apple Team ID
      }
    }
  }
}
```

### 중요 설정 값 찾기

#### App Store Connect App ID 찾기
1. App Store Connect → "내 앱" → 앱 선택
2. URL에서 숫자 확인: `https://appstoreconnect.apple.com/apps/[APP_ID]/appstore`
3. 또는 앱 정보 페이지에서 확인

#### Apple Team ID 찾기
1. [Apple Developer Portal](https://developer.apple.com/account/)
2. 우측 상단 계정 정보에서 "Team ID" 확인
3. 또는 Membership 페이지에서 확인

## ⚠️ 주의사항

### 1. 버전 관리
- **version**: `app.json`의 `version` 필드 (예: "1.0.0")
- **buildNumber**: `app.json`의 `ios.buildNumber` 필드 (예: "1")
- TestFlight에 새 빌드를 업로드할 때마다 `buildNumber`를 증가시켜야 함
- App Store에 제출할 때는 `version`도 증가시켜야 함

### 2. 빌드 번호 증가 방법
```json
{
  "expo": {
    "version": "1.0.1",  // App Store 제출 시 증가
    "ios": {
      "buildNumber": "2"  // TestFlight 업로드 시마다 증가
    }
  }
}
```

### 3. 암호화 수출 규정
- `ITSAppUsesNonExemptEncryption: false`로 설정
- 앱이 암호화를 사용하지 않거나 표준 암호화만 사용하는 경우

### 4. 권한 설명
- `NSPhotoLibraryUsageDescription`: 사진 라이브러리 읽기 권한 설명 (필수)
- `NSPhotoLibraryAddUsageDescription`: 사진 저장 권한 설명 (필수)
- 사용자가 권한을 요청할 때 표시되는 메시지

### 5. Google Services 파일
- `GoogleService-Info.plist` 파일이 프로젝트 루트에 있어야 함
- Firebase 프로젝트에서 다운로드한 파일 사용

## 🔍 빌드 완료 후 확인사항

### App Store Connect에서 확인

1. **TestFlight 탭**
   - 빌드가 업로드되었는지 확인
   - 빌드 상태: "처리 중" → "테스트 준비 완료"
   - 처리 시간: 보통 10-30분

2. **앱 정보 탭**
   - 앱 이름, 카테고리, 연령 등급 등 기본 정보 확인
   - 스크린샷, 설명, 키워드 등 메타데이터 입력

3. **가격 및 판매 가용성**
   - 무료 앱인 경우 "무료"로 설정
   - 판매 국가 선택

4. **앱 심사 정보**
   - 연락처 정보 입력
   - 개인정보 처리방침 URL (필요한 경우)
   - 데모 계정 정보 (필요한 경우)

### 빌드 로그 확인

```bash
# 빌드 로그 확인
eas build:view [BUILD_ID]

# 빌드 다운로드
eas build:download --platform ios --id [BUILD_ID]
```

## 🐛 문제 해결

### 빌드 실패 시

1. **인증서 문제**
   ```bash
   # 인증서 재생성
   eas credentials
   ```

2. **프로비저닝 프로파일 문제**
   - Apple Developer Portal에서 프로파일 확인
   - EAS가 자동으로 관리하지만, 수동 확인 필요 시:
     ```bash
     eas credentials
     ```

3. **Bundle ID 불일치**
   - `app.json`의 `bundleIdentifier`와 App Store Connect의 Bundle ID 일치 확인
   - Apple Developer Portal의 App ID 확인

### TestFlight 업로드 실패 시

1. **빌드 번호 중복**
   - `app.json`의 `ios.buildNumber` 증가
   - 이전 빌드 삭제 후 재업로드

2. **앱 심사 거부**
   - App Store Connect의 "앱 심사" 섹션에서 거부 사유 확인
   - 문제 해결 후 새 빌드 업로드

## 📚 참고 자료

- [EAS Build iOS 문서](https://docs.expo.dev/build/introduction/)
- [EAS Submit iOS 문서](https://docs.expo.dev/submit/ios/)
- [App Store Connect 가이드](https://developer.apple.com/app-store-connect/)
- [Apple Developer Portal](https://developer.apple.com/account/)

## 🎯 체크리스트

배포 전 확인사항:

- [ ] Apple Developer Program 가입 완료
- [ ] App Store Connect에서 앱 등록 완료
- [ ] Bundle ID 생성 및 확인 완료
- [ ] `app.json`의 `bundleIdentifier` 확인
- [ ] `app.json`의 `ios.buildNumber` 설정
- [ ] `eas.json`의 submit 설정 확인 (선택사항)
- [ ] Google Services 파일 확인
- [ ] 권한 설명 문구 확인
- [ ] 프로덕션 빌드 생성
- [ ] TestFlight 업로드
- [ ] 테스트 그룹에 빌드 추가
- [ ] 테스터 초대 완료


