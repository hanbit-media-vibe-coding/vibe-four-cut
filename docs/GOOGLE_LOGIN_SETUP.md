# Google 로그인 설정 가이드 (EAS Build)

## 개요
바이브네컷 앱에서 Firebase Authentication + Google Provider를 사용한 로그인 설정 가이드입니다.

> ⚠️ **중요**: Google 로그인은 Expo Go에서 동작하지 않습니다. EAS Build로 빌드된 앱에서만 테스트 가능합니다.

---

## 1. Firebase Console 설정

### 1.1 Google 로그인 활성화
1. [Firebase Console](https://console.firebase.google.com) 접속
2. `vibe-four-cut` 프로젝트 선택
3. **Authentication** > **Sign-in method** 이동
4. **Google** 클릭 > **사용 설정** 활성화
5. **프로젝트 지원 이메일** 선택 후 저장

### 1.2 Web Client ID 확인
1. Firebase Console > **프로젝트 설정** (톱니바퀴 아이콘)
2. **일반** 탭에서 웹 앱 확인
3. 또는 [Google Cloud Console](https://console.cloud.google.com) > **API 및 서비스** > **사용자 인증 정보**
4. **Web client (auto created by Google Service)** 클릭
5. **클라이언트 ID** 복사

---

## 2. Android 설정

### 2.1 google-services.json 다운로드
1. Firebase Console > **프로젝트 설정**
2. **Android 앱** 선택 (없으면 추가)
   - 패키지 이름: `com.vibefourcut.app`
3. `google-services.json` 다운로드
4. 프로젝트 루트에 저장

### 2.2 SHA-1 지문 추가 (EAS Build용)
```bash
# EAS credentials 확인
eas credentials

# 또는 직접 생성된 keystore에서 확인
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android
```

Firebase Console > 프로젝트 설정 > Android 앱 > **SHA 인증서 지문** 추가

---

## 3. iOS 설정

### 3.1 GoogleService-Info.plist 다운로드
1. Firebase Console > **프로젝트 설정**
2. **iOS 앱** 선택 (없으면 추가)
   - 번들 ID: `com.vibefourcut.app`
3. `GoogleService-Info.plist` 다운로드
4. 프로젝트 루트에 저장

### 3.2 URL Scheme 설정 (자동)
`expo-auth-session`이 자동으로 처리합니다.

---

## 4. 코드 설정

### 4.1 Client ID 설정
`features/auth/utils/authService.ts` 파일에서 Client ID 업데이트:

```typescript
export const GOOGLE_CONFIG = {
  // Firebase Console > 프로젝트 설정 > 일반 > Web Client ID
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  
  // GoogleService-Info.plist의 CLIENT_ID
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  
  // google-services.json의 client > oauth_client > client_id (type: 3)
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
};
```

### 4.2 Client ID 찾는 방법

**Web Client ID:**
- Google Cloud Console > API 및 서비스 > 사용자 인증 정보
- "Web client (auto created by Google Service)" 선택

**iOS Client ID:**
- `GoogleService-Info.plist` 파일 열기
- `CLIENT_ID` 값 확인

**Android Client ID:**
- `google-services.json` 파일 열기
- `client` > `oauth_client` 배열에서 `client_type: 3` 찾기
- `client_id` 값 확인

---

## 5. EAS Build 설정

### 5.1 eas.json 생성
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 5.2 EAS 프로젝트 연결
```bash
# EAS CLI 설치
npm install -g eas-cli

# 로그인
eas login

# 프로젝트 설정
eas build:configure
```

### 5.3 개발 빌드 생성
```bash
# iOS 개발 빌드
eas build --platform ios --profile development

# Android 개발 빌드
eas build --platform android --profile development

# 또는 둘 다
eas build --platform all --profile development
```

---

## 6. 테스트

### 6.1 개발 빌드 설치
1. EAS 빌드 완료 후 QR 코드 스캔 또는 링크 클릭
2. 앱 설치
3. Google 로그인 테스트

### 6.2 문제 해결

**"Invalid Credentials" 에러:**
- Web Client ID가 올바른지 확인
- Firebase Console에서 Google 로그인이 활성화되어 있는지 확인

**"Network Error" 에러:**
- 인터넷 연결 확인
- Firebase 프로젝트 설정 확인

**Android SHA-1 문제:**
- EAS Build에서 생성된 SHA-1을 Firebase Console에 추가했는지 확인
- `eas credentials`로 SHA-1 확인

**iOS Bundle ID 문제:**
- `app.json`의 `ios.bundleIdentifier`와 Firebase Console의 번들 ID가 일치하는지 확인

---

## 7. 파일 체크리스트

```
vibe-four-cut/
├── google-services.json          # Android용 (Firebase Console에서 다운로드)
├── GoogleService-Info.plist      # iOS용 (Firebase Console에서 다운로드)
├── app.json                      # 패키지명, 번들ID 설정
├── eas.json                      # EAS Build 설정
└── features/auth/utils/
    └── authService.ts            # Google Client ID 설정
```

---

## 참고 링크
- [Expo AuthSession 문서](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Firebase Authentication 문서](https://firebase.google.com/docs/auth)
- [EAS Build 문서](https://docs.expo.dev/build/introduction/)




