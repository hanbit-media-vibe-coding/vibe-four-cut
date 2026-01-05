import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { saveUserNickname } from '../utils/authService';

interface RegisterScreenProps {
  userId?: string;
  onSubmit?: (nickname: string) => void;
  onBack?: () => void;
  userDisplayName?: string;
  isEditMode?: boolean;
  currentNickname?: string;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  userId,
  onSubmit,
  onBack,
  userDisplayName,
  isEditMode = false,
  currentNickname = '',
}) => {
  const [nickname, setNickname] = useState(currentNickname);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nickname.trim()) return;

    if (!userId) {
      Alert.alert('오류', '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      onBack?.();
      return;
    }

    try {
      setIsLoading(true);
      
      // Firestore에 닉네임 저장
      await saveUserNickname(userId, nickname.trim());
      
      console.log('닉네임 저장 완료:', nickname.trim());
      onSubmit?.(nickname.trim());
    } catch (error) {
      console.error('닉네임 저장 실패:', error);
      Alert.alert(
        '저장 실패',
        '닉네임 저장 중 문제가 발생했습니다. 다시 시도해주세요.',
        [{ text: '확인' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 콘텐츠 영역 */}
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {isEditMode ? '닉네임 수정' : '닉네임을 입력해주세요'}
            </Text>
            {isEditMode ? (
              <Text style={styles.subtitle}>
                새로운 닉네임을 입력해주세요.
              </Text>
            ) : (
              userDisplayName && (
                <Text style={styles.subtitle}>
                  안녕하세요, {userDisplayName}님!{'\n'}
                  바이브네컷에서 사용할 닉네임을 정해주세요.
                </Text>
              )
            )}
          </View>

          {/* 닉네임 입력 필드 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor="#C4B5A0"
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <Text style={styles.inputHint}>
              {nickname.length}/20
            </Text>
          </View>

          {/* 완료 버튼 */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!nickname.trim() || isLoading) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!nickname.trim() || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>완료</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#8B4513',
    fontWeight: '300',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  textContainer: {
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B5B4F',
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  inputContainer: {
    marginBottom: 32,
  },
  textInput: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#4A4A4A',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F5E6D3',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputHint: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: '#FF8C69',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF8C69',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 56,
  },
  submitButtonDisabled: {
    backgroundColor: '#E0D5C7',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
