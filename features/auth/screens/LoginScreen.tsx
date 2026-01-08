import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { signInWithGoogleIdToken, GOOGLE_CONFIG } from '../utils/authService';
import { AuthEvents } from '../../../shared/utils/analytics';

// WebBrowser 세션 완료 처리 (Android에서 필요)
WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
  onLoginSuccess?: (isNewUser: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Google OAuth 요청 설정
  // EAS Build에서는 각 플랫폼별 Client ID가 필요
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CONFIG.webClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
  });

  // OAuth 응답 처리
  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === 'success') {
        const { authentication } = response;
        
        // ID Token이 있는 경우 Firebase 로그인
        if (authentication?.idToken) {
          try {
            setIsLoading(true);
            const result = await signInWithGoogleIdToken(authentication.idToken);
            console.log('로그인 성공:', result.user.email);
            AuthEvents.loginSuccess('google');
            onLoginSuccess?.(result.isNewUser);
          } catch (error: any) {
            console.error('로그인 처리 실패:', error);
            AuthEvents.loginFailure(error.message || 'unknown');
            Alert.alert(
              '로그인 실패',
              error.message || '로그인 중 문제가 발생했습니다. 다시 시도해주세요.',
              [{ text: '확인' }]
            );
          } finally {
            setIsLoading(false);
          }
        } else {
          // ID Token이 없는 경우 (Access Token만 있는 경우)
          console.warn('ID Token이 없습니다. webClientId를 확인해주세요.');
          Alert.alert(
            '인증 오류',
            'Google 인증에 문제가 발생했습니다. 설정을 확인해주세요.',
            [{ text: '확인' }]
          );
        }
      } else if (response?.type === 'error') {
        console.error('Google 인증 에러:', response.error);
        AuthEvents.loginFailure(response.error?.message || 'google_auth_error');
        Alert.alert(
          '인증 실패',
          'Google 인증에 실패했습니다. 다시 시도해주세요.',
          [{ text: '확인' }]
        );
      } else if (response?.type === 'dismiss') {
        // 사용자가 인증 창을 닫음
        console.log('사용자가 로그인을 취소했습니다.');
      }
    };

    if (response) {
      handleGoogleResponse();
    }
  }, [response, onLoginSuccess]);

  const handleGoogleLogin = async () => {
    if (!request) {
      Alert.alert(
        '준비 중',
        'Google 로그인을 준비하고 있습니다. 잠시 후 다시 시도해주세요.',
        [{ text: '확인' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      AuthEvents.loginStart();
      await promptAsync();
    } catch (error) {
      console.error('Google 로그인 시작 실패:', error);
      AuthEvents.loginFailure('login_start_failed');
      Alert.alert(
        '오류',
        '로그인을 시작할 수 없습니다. 다시 시도해주세요.',
        [{ text: '확인' }]
      );
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 앱 로고 및 설명 영역 */}
        <View style={styles.header}>
          <Text style={styles.appName}>바이브네컷</Text>
          <Text style={styles.appDescription}>
            오늘의 일기를{'\n'}네컷 만화로 남겨보세요
          </Text>
        </View>

        {/* 구글 로그인 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <View style={styles.googleButtonContent}>
                <View style={styles.googleIcon}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Google로 시작하기</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 하단 안내 텍스트 */}
        <Text style={styles.footerText}>
          로그인하면 서비스를 이용할 수 있어요
        </Text>

        {/* 개발 모드 안내 (EAS Build 필요) */}
        {__DEV__ && (
          <View style={styles.devNote}>
            <Text style={styles.devNoteText}>
              ⚠️ Google 로그인은 EAS Build로 빌드된 앱에서만 동작합니다.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 80,
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  appDescription: {
    fontSize: 18,
    color: '#6B5B4F',
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  googleButton: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 60,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3C4043',
    letterSpacing: 0.3,
  },
  footerText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 16,
  },
  devNote: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    width: '100%',
  },
  devNoteText: {
    fontSize: 12,
    color: '#E65100',
    textAlign: 'center',
    lineHeight: 18,
  },
});
