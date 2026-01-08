import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { saveImageToGallery } from '../utils/imageSaveService';
import { ComicEvents, logScreenView } from '../../../shared/utils/analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COMIC_PADDING = 24;
const COMIC_WIDTH = SCREEN_WIDTH - COMIC_PADDING * 2;

interface ComicResultScreenProps {
  comicData?: {
    id: string;
    title?: string;
    imageUrl?: string;  // 단일 이미지 URL
    imageUrls?: string[];  // 하위 호환성
    emotionSentence?: string;  // 감정 한 줄 문장
  };
  onBackToHome?: () => void;
}

// 더미 이미지 URL
const DUMMY_IMAGE = 'https://via.placeholder.com/600x600/FFB6A3/FFFFFF?text=4-Panel+Comic';

export const ComicResultScreen: React.FC<ComicResultScreenProps> = ({
  comicData,
  onBackToHome,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // 단일 이미지 URL 또는 배열의 첫 번째 이미지 사용
  const imageUrl = comicData?.imageUrl || comicData?.imageUrls?.[0] || DUMMY_IMAGE;

  useEffect(() => {
    logScreenView('comic_result');
  }, []);

  const handleSavePhoto = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const success = await saveImageToGallery(imageUrl);
      
      if (success) {
        ComicEvents.comicSaveToGallery();
        Alert.alert('저장 완료', '만화가 갤러리에 저장되었습니다.', [
          { text: '확인', onPress: () => {} },
        ]);
      } else {
        Alert.alert('저장 실패', '사진 저장에 실패했습니다. 다시 시도해주세요.', [
          { text: '확인' },
        ]);
      }
    } catch (error) {
      console.error('사진 저장 에러:', error);
      Alert.alert('저장 실패', '사진 저장 중 오류가 발생했습니다.', [
        { text: '확인' },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>만화가 완성되었어요!</Text>
          {comicData?.title && (
            <Text style={styles.subtitle}>{comicData.title}</Text>
          )}
        </View>

        {/* 네컷 만화 이미지 (단일 이미지) */}
        <View style={styles.comicContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.comicImage}
            resizeMode="contain"
          />
        </View>

        {/* 감정 한 줄 문장 */}
        {comicData?.emotionSentence && (
          <View style={styles.emotionContainer}>
            <Text style={styles.emotionText}>{comicData.emotionSentence}</Text>
          </View>
        )}
      </ScrollView>

      {/* 하단 버튼 영역 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onBackToHome}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>홈으로 돌아가기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isSaving && styles.buttonDisabled]}
          onPress={handleSavePhoto}
          activeOpacity={0.8}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>사진 저장하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: COMIC_PADDING,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B5B4F',
    fontWeight: '400',
  },
  comicContainer: {
    width: COMIC_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  comicImage: {
    width: '100%',
    aspectRatio: 1, // 정사각형 비율 (2x2 그리드)
    borderRadius: 8,
    backgroundColor: '#F5E6D3',
  },
  emotionContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 8,
    alignItems: 'center',
  },
  emotionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B5B4F',
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: '#FFF8F5',
    borderTopWidth: 1,
    borderTopColor: '#F5E6D3',
    gap: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
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
  },
  primaryButton: {
    backgroundColor: '#FF8C69',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFB6A3',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF8C69',
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
