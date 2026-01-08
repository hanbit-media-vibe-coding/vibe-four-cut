import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { checkTodayDiaryExists } from '../utils/firestoreService';
import { COMIC_STYLES, ComicStyle } from '../types';
import { DiaryEvents } from '../../../shared/utils/analytics';

interface DiaryWriteScreenProps {
  userId?: string;
  onSubmit?: (content: string, style: ComicStyle) => void;
  onBack?: () => void;
}

export const DiaryWriteScreen: React.FC<DiaryWriteScreenProps> = ({
  userId,
  onSubmit,
  onBack,
}) => {
  const [diaryContent, setDiaryContent] = useState('');
  const [isCheckingDiary, setIsCheckingDiary] = useState(false); // 하루 한 번 제한 기능 임시 비활성화
  const [hasTodayDiary, setHasTodayDiary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ComicStyle>('anime'); // 기본값: 애니메이션 스타일

  // 화면 진입 시 오늘 일기 존재 여부 확인 (임시 비활성화)
  useEffect(() => {
    // 화면 조회 이벤트
    DiaryEvents.diaryWriteView();
    
    // 하루 한 번 제한 기능 임시 비활성화
    setIsCheckingDiary(false);
    
    // const checkDiary = async () => {
    //   if (!userId) {
    //     setIsCheckingDiary(false);
    //     return;
    //   }

    //   try {
    //     setIsCheckingDiary(true);
    //     const result = await checkTodayDiaryExists(userId);
        
    //     if (result.exists) {
    //       setHasTodayDiary(true);
    //       Alert.alert(
    //         '오늘은 이미 일기를 썼어요',
    //         '하루에 한 번만 일기를 쓸 수 있어요.\n내일 다시 만나요! 💛',
    //         [
    //           {
    //             text: '홈으로 돌아가기',
    //             onPress: () => onBack?.(),
    //           },
    //         ]
    //       );
    //     }
    //   } catch (error) {
    //     console.error('오늘 일기 확인 실패:', error);
    //     Alert.alert(
    //       '오류',
    //       '일기 확인 중 문제가 발생했어요. 다시 시도해주세요.',
    //       [
    //         { text: '다시 시도', onPress: () => checkDiary() },
    //         { text: '돌아가기', onPress: () => onBack?.() },
    //       ]
    //     );
    //   } finally {
    //     setIsCheckingDiary(false);
    //   }
    // };

    // checkDiary();
  }, [userId, onBack]);

  const handleSubmit = async () => {
    if (!diaryContent.trim() || isSubmitting) return;

    // 하루 한 번 제한 기능 임시 비활성화
    // 제출 전 한 번 더 확인
    // if (userId) {
    //   try {
    //     setIsSubmitting(true);
    //     const result = await checkTodayDiaryExists(userId);
        
    //     if (result.exists) {
    //       setHasTodayDiary(true);
    //       Alert.alert(
    //         '오늘은 이미 일기를 썼어요',
    //         '하루에 한 번만 일기를 쓸 수 있어요.',
    //         [{ text: '확인', onPress: () => onBack?.() }]
    //       );
    //       return;
    //     }
    //   } catch (error) {
    //     console.error('일기 확인 실패:', error);
    //     Alert.alert('오류', '잠시 후 다시 시도해주세요.');
    //     setIsSubmitting(false);
    //     return;
    //   }
    // }

    // 일기 제출 이벤트
    DiaryEvents.diarySubmit(diaryContent.trim().length, selectedStyle);
    
    onSubmit?.(diaryContent.trim(), selectedStyle);
  };

  // 로딩 중일 때 로딩 화면 표시
  if (isCheckingDiary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8C69" />
          <Text style={styles.loadingText}>확인 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 이미 오늘 일기를 쓴 경우 (Alert 표시 후 화면)
  if (hasTodayDiary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.alreadyWrittenContainer}>
          <Text style={styles.alreadyWrittenEmoji}>📝</Text>
          <Text style={styles.alreadyWrittenTitle}>오늘은 이미 일기를 썼어요</Text>
          <Text style={styles.alreadyWrittenSubtitle}>
            하루에 한 번만 일기를 쓸 수 있어요.{'\n'}내일 다시 만나요! 💛
          </Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backToHomeButtonText}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* 헤더 영역 */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>오늘의 일기</Text>
        </View>

        {/* 텍스트 입력 영역 */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="오늘 하루는 어땠나요?{'\n'}자유롭게 적어보세요..."
              placeholderTextColor="#C4B5A0"
              multiline
              textAlignVertical="top"
              value={diaryContent}
              onChangeText={setDiaryContent}
              autoFocus
              editable={!isSubmitting}
            />
          </View>

          {/* 화풍 선택 영역 */}
          <View style={styles.styleSection}>
            <Text style={styles.styleSectionTitle}>만화 스타일 선택</Text>
            <View style={styles.styleOptions}>
              {COMIC_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.value}
                  style={[
                    styles.styleOption,
                    selectedStyle === style.value && styles.styleOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedStyle(style.value);
                    DiaryEvents.comicStyleSelect(style.value);
                  }}
                  activeOpacity={0.7}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.styleOptionText,
                      selectedStyle === style.value && styles.styleOptionTextSelected,
                    ]}
                  >
                    {style.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* 하단 버튼 영역 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!diaryContent.trim() || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!diaryContent.trim() || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>만화로 만들기</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '500',
  },
  alreadyWrittenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  alreadyWrittenEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  alreadyWrittenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 12,
    textAlign: 'center',
  },
  alreadyWrittenSubtitle: {
    fontSize: 16,
    color: '#6B5B4F',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backToHomeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#FF8C69',
    borderRadius: 16,
  },
  backToHomeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5E6D3',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 28,
    color: '#8B4513',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#8B4513',
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    lineHeight: 28,
    color: '#4A4A4A',
    padding: 0,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  styleSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F5E6D3',
  },
  styleSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  styleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  styleOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F5E6D3',
    marginBottom: 8,
  },
  styleOptionSelected: {
    backgroundColor: '#FF8C69',
    borderColor: '#FF8C69',
  },
  styleOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B5B4F',
  },
  styleOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: '#FFF8F5',
    borderTopWidth: 1,
    borderTopColor: '#F5E6D3',
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
