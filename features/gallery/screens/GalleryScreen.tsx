import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { getUserComics, deleteComic, ComicListItem } from '../utils/galleryService';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { GalleryEvents, logScreenView } from '../../../shared/utils/analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_PADDING = 16;
const ITEM_GAP = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - ITEM_PADDING * 2 - ITEM_GAP) / 2;

interface GalleryScreenProps {
  onComicPress?: (comic: ComicListItem) => void;
  onBack?: () => void;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({
  onComicPress,
  onBack,
}) => {
  const { user } = useAuth();
  const [comics, setComics] = useState<ComicListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 만화 목록 로드
  const loadComics = async (showRefreshIndicator = false) => {
    if (!user?.uid) {
      setError('로그인이 필요합니다.');
      setIsLoading(false);
      return;
    }

    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);
      const userComics = await getUserComics(user.uid);
      setComics(userComics);
    } catch (err: any) {
      console.error('만화 목록 로드 실패:', err);
      setError('만화 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    logScreenView('gallery');
    GalleryEvents.galleryView();
    loadComics();
  }, [user?.uid]);

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const handleDeleteComic = (comic: ComicListItem) => {
    Alert.alert(
      '만화 삭제',
      '정말 이 만화를 삭제하시겠어요?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            if (!user?.uid) return;
            
            try {
              await deleteComic(comic.id, user.uid);
              GalleryEvents.comicDelete(comic.id);
              // 목록 새로고침
              await loadComics();
            } catch (error) {
              console.error('만화 삭제 실패:', error);
              Alert.alert('삭제 실패', '만화 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const renderComicItem = ({ item }: { item: ComicListItem }) => {
    return (
      <View style={styles.comicItemWrapper}>
        <TouchableOpacity
          style={styles.comicItem}
          onPress={() => {
            GalleryEvents.comicDetailView(item.id);
            onComicPress?.(item);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.thumbnailContainer}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>이미지 없음</Text>
              </View>
            )}
          </View>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          {item.title && (
            <Text style={styles.titleText} numberOfLines={1}>
              {item.title}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteComic(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FF8C69" />
          <Text style={styles.emptyText}>만화를 불러오는 중...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadComics()}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📝</Text>
        <Text style={styles.emptyTitle}>아직 만화가 없어요</Text>
        <Text style={styles.emptySubtitle}>
          첫 번째 만화를 만들어보세요!
        </Text>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>내 만화 갤러리</Text>
      </View>

      {/* 갤러리 리스트 */}
      {comics.length > 0 ? (
        <FlatList
          data={comics}
          renderItem={renderComicItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadComics(true)}
              tintColor="#FF8C69"
            />
          }
        />
      ) : (
        renderEmptyState()
      )}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#8B4513',
    letterSpacing: 0.3,
  },
  listContent: {
    padding: ITEM_PADDING,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: ITEM_GAP,
  },
  comicItemWrapper: {
    width: ITEM_WIDTH,
    position: 'relative',
  },
  comicItem: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 20,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5E6D3',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5E6D3',
  },
  placeholderText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  dateText: {
    padding: 12,
    paddingBottom: 4,
    fontSize: 14,
    color: '#6B5B4F',
    fontWeight: '500',
    textAlign: 'center',
  },
  titleText: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B5B4F',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B5B4F',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FF8C69',
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
