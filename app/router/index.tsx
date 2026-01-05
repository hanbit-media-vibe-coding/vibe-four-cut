import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { HomeScreen } from '../../features/home';
import { DiaryWriteScreen, LoadingScreen } from '../../features/diary';
import { ComicResultScreen, GalleryScreen, ComicDetailScreen } from '../../features/gallery';
import { LoginScreen, RegisterScreen, MyPageScreen } from '../../features/auth';
import { useAuth } from '../../shared/contexts/AuthContext';
import { signOut } from '../../features/auth/utils/authService';
import { ComicStyle } from '../../features/diary/types';

type Screen = 'login' | 'register' | 'home' | 'diary-write' | 'loading' | 'comic-result' | 'gallery' | 'comic-detail' | 'mypage' | 'edit-nickname';

export const AppRouter: React.FC = () => {
  const { user, userData, isLoading: authLoading, isNewUser, setIsNewUser, refreshUserData } = useAuth();
  
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [comicData, setComicData] = useState<{
    id: string;
    title?: string;
    imageUrl?: string;
    imageUrls?: string[];
    emotionSentence?: string;
  } | null>(null);
  const [selectedComic, setSelectedComic] = useState<{
    id: string;
    title?: string;
    imageUrl?: string;
    imageUrls?: string[];
    createdAt: Date;
  } | null>(null);
  const [diaryContent, setDiaryContent] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<ComicStyle>('anime');

  // 인증 상태에 따른 화면 전환
  useEffect(() => {
    // 로딩 중이면 화면 전환하지 않음
    if (authLoading) return;

    // 로그인 상태가 확인되면 화면 전환
    if (!user) {
      // 로그인되지 않은 경우
      setCurrentScreen('login');
    } else if (isNewUser || !userData?.nickname) {
      // 새 사용자이거나 닉네임이 없는 경우
      setCurrentScreen('register');
    } else {
      // 기존 사용자 - 로그인 상태 유지
      // 로그인/등록 화면에서만 홈으로 이동 (다른 화면은 유지)
      if (currentScreen === 'login' || currentScreen === 'register') {
        setCurrentScreen('home');
      }
    }
  }, [user, userData, isNewUser, authLoading, currentScreen]);

  // 로딩 중 화면
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C69" />
      </View>
    );
  }

  const handleLoginSuccess = (isNew: boolean) => {
    setIsNewUser(isNew);
    if (isNew) {
      setCurrentScreen('register');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleNicknameSubmit = async (nickname: string) => {
    console.log('닉네임 저장 완료:', nickname);
    setIsNewUser(false);
    await refreshUserData();
    setCurrentScreen('home');
  };

  const handleBackFromRegister = async () => {
    // 닉네임 입력 화면에서 뒤로가기 시 로그아웃
    try {
      await signOut();
      setCurrentScreen('login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleWriteDiary = () => {
    setCurrentScreen('diary-write');
  };

  const handleViewGallery = () => {
    setCurrentScreen('gallery');
  };

  const handleComicPress = (comic: {
    id: string;
    title?: string;
    imageUrl?: string;
    imageUrls?: string[];
    createdAt: Date;
  }) => {
    setSelectedComic(comic);
    setCurrentScreen('comic-detail');
  };

  const handleBackFromGallery = () => {
    setCurrentScreen('home');
  };

  const handleBackFromDetail = () => {
    setCurrentScreen('gallery');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setComicData(null);
  };

  const handleMyPage = () => {
    setCurrentScreen('mypage');
  };

  const handleBackFromMyPage = () => {
    setCurrentScreen('home');
  };

  const handleEditNickname = () => {
    setCurrentScreen('edit-nickname');
  };

  const handleBackFromEditNickname = () => {
    setCurrentScreen('mypage');
  };

  const handleNicknameUpdate = async (nickname: string) => {
    await refreshUserData();
    setCurrentScreen('mypage');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentScreen('login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleDiarySubmit = async (content: string, style: ComicStyle) => {
    setDiaryContent(content);
    setSelectedStyle(style);
    setCurrentScreen('loading');
  };

  const handleLoadingComplete = async () => {
    try {
      const userId = user?.uid || `user-${Date.now()}`;
      
      // 1. 시나리오 생성 및 저장
      const { createScenarioFromDiary } = await import('../../features/diary/utils/scenarioService');
      const scenarioResult = await createScenarioFromDiary(userId, diaryContent);
      
      console.log('시나리오 생성 완료:', scenarioResult);
      
      // 2. 시나리오를 기반으로 만화 이미지 생성 및 저장
      const { createComicFromScenario } = await import('../../features/diary/utils/comicService');
      const comicResult = await createComicFromScenario(
        scenarioResult.scenarioId,
        scenarioResult.diaryId,
        userId,
        scenarioResult.scenario.scenes,
        '오늘의 만화',
        selectedStyle
      );
      
      console.log('만화 생성 완료:', comicResult);
      
      // 3. 감정 문장 생성
      let emotionSentence = '오늘 하루도 수고했어요.';
      try {
        const { generateEmotionSentence } = await import('../../features/diary/utils/emotionGenerator');
        emotionSentence = await generateEmotionSentence(diaryContent, scenarioResult.scenario.scenes);
        console.log('감정 문장 생성 완료:', emotionSentence);
      } catch (error) {
        console.error('감정 문장 생성 실패:', error);
        // 기본 문장 사용
      }
      
      // 4. 갤러리 캐시 무효화 (새 만화가 추가되었으므로)
      const { invalidateComicsCache } = await import('../../features/gallery/utils/galleryService');
      await invalidateComicsCache(userId);
      
      // 5. 결과 화면에 표시할 데이터 설정
      const comicData = {
        id: comicResult.comicId,
        title: '오늘의 만화',
        imageUrl: comicResult.imageUrl,
        emotionSentence,
      };
      setComicData(comicData);
      setCurrentScreen('comic-result');
    } catch (error: any) {
      console.error('만화 생성 실패:', error);
      
      if (error?.name === 'QuotaExceededError' || error?.error?.code === 429) {
        console.warn('할당량 초과로 인해 더미 데이터를 표시합니다.');
      }
      
      // 에러 발생 시에도 더미 데이터로 결과 화면 표시
      const dummyComicData = {
        id: `comic-${Date.now()}`,
        title: '오늘의 만화',
        imageUrl: 'https://via.placeholder.com/600x600/FFB6A3/FFFFFF?text=4-Panel+Comic',
        emotionSentence: '오늘 하루도 수고했어요.',
      };
      setComicData(dummyComicData);
      setCurrentScreen('comic-result');
    }
  };

  // 사용자 정보 객체 생성
  const userInfo = userData ? {
    nickname: userData.nickname || '',
    email: userData.email || user?.email || '',
    displayName: userData.displayName || user?.displayName || '',
    photoURL: userData.photoURL || user?.photoURL || '',
  } : undefined;

  switch (currentScreen) {
    case 'login':
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    
    case 'register':
      return (
        <RegisterScreen
          userId={user?.uid}
          onSubmit={handleNicknameSubmit}
          onBack={handleBackFromRegister}
          userDisplayName={user?.displayName || ''}
        />
      );
    
    case 'diary-write':
      return (
        <DiaryWriteScreen
          userId={user?.uid}
          onSubmit={handleDiarySubmit}
          onBack={handleBackToHome}
        />
      );
    
    case 'loading':
      return <LoadingScreen onComplete={handleLoadingComplete} />;
    
    case 'comic-result':
      return (
        <ComicResultScreen
          comicData={comicData || undefined}
          onBackToHome={handleBackToHome}
        />
      );
    
    case 'gallery':
      return (
        <GalleryScreen
          onComicPress={handleComicPress}
          onBack={handleBackFromGallery}
        />
      );
    
    case 'comic-detail':
      return (
        <ComicDetailScreen
          comic={selectedComic || undefined}
          onBack={handleBackFromDetail}
        />
      );
    
    case 'mypage':
      return (
        <MyPageScreen
          user={userInfo}
          onLogout={handleLogout}
          onBack={handleBackFromMyPage}
          onEditNickname={handleEditNickname}
        />
      );
    
    case 'edit-nickname':
      return (
        <RegisterScreen
          userId={user?.uid}
          onSubmit={handleNicknameUpdate}
          onBack={handleBackFromEditNickname}
          userDisplayName={user?.displayName || ''}
          isEditMode={true}
          currentNickname={userData?.nickname || ''}
        />
      );
    
    case 'home':
    default:
      return (
        <HomeScreen
          onWriteDiary={handleWriteDiary}
          onViewGallery={handleViewGallery}
          onMyPage={handleMyPage}
        />
      );
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F5',
  },
});
