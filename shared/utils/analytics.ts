import { logEvent as firebaseLogEvent, Analytics } from 'firebase/analytics';
import { analytics } from '../config/firebase';
import { Platform } from 'react-native';

// React Native Firebase Analytics (iOS/Android용)
let rnFirebaseAnalytics: any = null;
if (Platform.OS !== 'web') {
  try {
    rnFirebaseAnalytics = require('@react-native-firebase/analytics').default;
  } catch (error) {
    console.warn('[Analytics] @react-native-firebase/analytics를 불러올 수 없습니다:', error);
  }
}

/**
 * 이벤트 로깅 중복 방지를 위한 Set
 * 같은 이벤트가 짧은 시간 내에 여러 번 호출되는 것을 방지
 */
const loggedEvents = new Set<string>();
const EVENT_TIMEOUT = 5000; // 5초 내 같은 이벤트는 무시

/**
 * 이벤트 로깅 가드: 같은 이벤트가 짧은 시간 내에 여러 번 호출되는 것을 방지
 */
function shouldLogEvent(eventName: string): boolean {
  const eventKey = `${eventName}_${Date.now()}`;
  
  // 5초 이내에 같은 이벤트가 로깅되었는지 확인
  const recentEvents = Array.from(loggedEvents).filter((key) => {
    const [name, timestamp] = key.split('_');
    const timeDiff = Date.now() - parseInt(timestamp, 10);
    return name === eventName && timeDiff < EVENT_TIMEOUT;
  });

  if (recentEvents.length > 0) {
    // 이미 최근에 로깅된 이벤트
    return false;
  }

  // 이벤트 로깅 허용 및 기록
  loggedEvents.add(eventKey);
  
  // 오래된 이벤트 정리 (메모리 관리)
  setTimeout(() => {
    loggedEvents.delete(eventKey);
  }, EVENT_TIMEOUT);

  return true;
}

/**
 * React Native Firebase Analytics를 통한 이벤트 전송 (iOS/Android용)
 */
async function sendEventViaRNFirebase(
  eventName: string,
  params?: Record<string, any>
): Promise<void> {
  if (!rnFirebaseAnalytics) {
    console.warn('[Analytics] React Native Firebase Analytics가 초기화되지 않았습니다.');
    return;
  }

  try {
    await rnFirebaseAnalytics().logEvent(eventName, params || {});
    if (__DEV__) {
      console.log(`[Analytics] React Native Firebase 이벤트 전송: ${eventName}`, params);
    }
  } catch (error) {
    console.error(`[Analytics] React Native Firebase 전송 실패: ${eventName}`, error);
  }
}

/**
 * Firebase Analytics 이벤트 로깅
 * @param eventName - 이벤트 이름 (snake_case)
 * @param params - 이벤트 파라미터 (선택)
 */
export function logEvent(
  eventName: string,
  params?: Record<string, any>
): void {
  // 중복 방지 체크
  if (!shouldLogEvent(eventName)) {
    if (__DEV__) {
      console.log(`[Analytics] 이벤트 중복 방지: ${eventName}`);
    }
    return;
  }

  try {
    // 웹 환경: Firebase Analytics SDK 사용
    if (Platform.OS === 'web' && analytics) {
      firebaseLogEvent(analytics as Analytics, eventName, params);
      if (__DEV__) {
        console.log(`[Analytics] 이벤트 로깅 (Web): ${eventName}`, params);
      }
    } else {
      // React Native 환경: @react-native-firebase/analytics 사용
      if (__DEV__) {
        console.log(`[Analytics] 이벤트 로깅 (Native): ${eventName}`, params);
      }
      
      // React Native Firebase Analytics로 이벤트 전송 (비동기, 에러가 나도 메인 로직에 영향 없음)
      sendEventViaRNFirebase(eventName, params).catch((error) => {
        console.error(`[Analytics] React Native Firebase 전송 실패: ${eventName}`, error);
      });
    }
  } catch (error) {
    console.error(`[Analytics] 이벤트 로깅 실패: ${eventName}`, error);
  }
}

/**
 * 화면 조회 이벤트 로깅
 */
export function logScreenView(screenName: string, params?: Record<string, any>): void {
  logEvent('screen_view', {
    screen_name: screenName,
    ...params,
  });
}

/**
 * 로그인 관련 이벤트
 */
export const AuthEvents = {
  loginStart: () => logEvent('login_start'),
  loginSuccess: (method: string = 'google') => 
    logEvent('login_success', { method }),
  loginFailure: (error?: string) => 
    logEvent('login_failure', { error: error || 'unknown' }),
  signupComplete: () => logEvent('signup_complete'),
  logout: () => logEvent('logout'),
};

/**
 * 일기 작성 관련 이벤트
 */
export const DiaryEvents = {
  diaryWriteView: () => logEvent('diary_write_view'),
  diarySubmit: (contentLength: number, style: string) => 
    logEvent('diary_submit', { 
      content_length: contentLength,
      comic_style: style,
    }),
  comicStyleSelect: (style: string) => 
    logEvent('comic_style_select', { style }),
};

/**
 * 만화 생성 관련 이벤트
 */
export const ComicEvents = {
  comicGenerationStart: (style: string) => 
    logEvent('comic_generation_start', { style }),
  comicGenerationComplete: (style: string, success: boolean) => 
    logEvent('comic_generation_complete', { 
      style,
      success,
    }),
  comicGenerationFailure: (error?: string) => 
    logEvent('comic_generation_failure', { error: error || 'unknown' }),
  comicSaveToGallery: () => logEvent('comic_save_to_gallery'),
};

/**
 * 갤러리 관련 이벤트
 */
export const GalleryEvents = {
  galleryView: () => logEvent('gallery_view'),
  comicDetailView: (comicId: string) => 
    logEvent('comic_detail_view', { comic_id: comicId }),
  comicDelete: (comicId: string) => 
    logEvent('comic_delete', { comic_id: comicId }),
};

/**
 * 홈 화면 관련 이벤트
 */
export const HomeEvents = {
  homeView: () => logEvent('home_view'),
  writeDiaryButtonClick: () => logEvent('write_diary_button_click'),
  viewGalleryButtonClick: () => logEvent('view_gallery_button_click'),
  myPageButtonClick: () => logEvent('my_page_button_click'),
};

