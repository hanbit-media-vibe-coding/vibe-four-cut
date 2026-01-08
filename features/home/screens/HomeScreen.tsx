import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { HomeEvents } from '../../../shared/utils/analytics';

interface HomeScreenProps {
  onWriteDiary?: () => void;
  onViewGallery?: () => void;
  onMyPage?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onWriteDiary,
  onViewGallery,
  onMyPage,
}) => {
  useEffect(() => {
    HomeEvents.homeView();
  }, []);

  const handleWriteDiary = () => {
    HomeEvents.writeDiaryButtonClick();
    onWriteDiary?.();
  };

  const handleViewGallery = () => {
    HomeEvents.viewGalleryButtonClick();
    onViewGallery?.();
  };

  const handleMyPage = () => {
    HomeEvents.myPageButtonClick();
    onMyPage?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 마이페이지 버튼 */}
      {onMyPage && (
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.myPageButton}
            onPress={handleMyPage}
            activeOpacity={0.7}
          >
            <Text style={styles.myPageButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.content}>
        {/* 앱 이름 및 설명 영역 */}
        <View style={styles.header}>
          <Text style={styles.appName}>바이브네컷</Text>
          <Text style={styles.appDescription}>
            오늘의 일기를{'\n'}네컷 만화로 남겨보세요
          </Text>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleWriteDiary}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>오늘의 일기 쓰기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleViewGallery}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>내 만화 갤러리 보기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5', // 따뜻한 크림색 배경
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  myPageButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myPageButtonText: {
    fontSize: 24,
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
    color: '#8B4513', // 따뜻한 갈색
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  appDescription: {
    fontSize: 18,
    color: '#6B5B4F', // 부드러운 갈색
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
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
    backgroundColor: '#FF8C69', // 따뜻한 코랄 오렌지
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
    borderColor: '#FFB6A3', // 부드러운 피치색
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF8C69', // 코랄 오렌지
    letterSpacing: 0.3,
  },
});

