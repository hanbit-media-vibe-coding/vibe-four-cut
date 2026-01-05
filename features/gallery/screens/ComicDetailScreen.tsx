import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { ComicListItem } from '../utils/galleryService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COMIC_PADDING = 20;
const COMIC_WIDTH = SCREEN_WIDTH - COMIC_PADDING * 2;

interface ComicDetailScreenProps {
  comic?: ComicListItem;
  onBack?: () => void;
}

export const ComicDetailScreen: React.FC<ComicDetailScreenProps> = ({
  comic,
  onBack,
}) => {
  // 단일 이미지 URL 또는 배열의 첫 번째 이미지 사용
  const imageUrl = comic?.imageUrl || comic?.imageUrls?.[0] || '';

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}.${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}`;
  };

  if (!comic) {
    return (
      <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerTitle}>만화 상세</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>만화를 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
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
        <View style={styles.headerContent}>
          {comic.title && (
            <Text style={styles.headerTitle}>{comic.title}</Text>
          )}
          <Text style={styles.headerDate}>{formatDate(comic.createdAt)}</Text>
        </View>
      </View>

      {/* 네컷 만화 이미지 영역 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {imageUrl ? (
          <View style={styles.comicContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.comicImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>이미지를 불러올 수 없습니다.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  headerDate: {
    fontSize: 14,
    color: '#6B5B4F',
    fontWeight: '400',
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
  },
  comicImage: {
    width: '100%',
    aspectRatio: 1, // 정사각형 비율 (2x2 그리드)
    borderRadius: 8,
    backgroundColor: '#F5E6D3',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B5B4F',
    textAlign: 'center',
  },
});
