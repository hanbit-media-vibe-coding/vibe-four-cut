import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';

interface MyPageScreenProps {
  user?: {
    nickname: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  };
  onLogout?: () => void;
  onBack?: () => void;
  onEditNickname?: () => void;
}

export const MyPageScreen: React.FC<MyPageScreenProps> = ({
  user,
  onLogout,
  onBack,
  onEditNickname,
}) => {
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠어요?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            onLogout?.();
          },
        },
      ]
    );
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      '알림 설정',
      '알림 설정 기능은 준비 중입니다.',
      [{ text: '확인' }]
    );
  };

  const handleEditProfile = () => {
    onEditNickname?.();
  };

  const handleTerms = () => {
    Alert.alert(
      '이용약관',
      '바이브네컷 이용약관\n\n제1조 (목적)\n본 약관은 바이브네컷(이하 "서비스")의 이용과 관련하여 필요한 사항을 규정함을 목적으로 합니다.\n\n제2조 (정의)\n1. "서비스"란 일기를 네컷 만화로 변환하는 서비스를 의미합니다.\n2. "사용자"란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.\n\n제3조 (서비스의 제공)\n1. 서비스는 사용자가 작성한 일기를 AI를 통해 네컷 만화로 변환하여 제공합니다.\n2. 서비스는 24시간 제공되나, 시스템 점검 등으로 인해 일시 중단될 수 있습니다.\n\n(이하 생략...)',
      [{ text: '확인' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      '개인정보 처리방침',
      '바이브네컷 개인정보 처리방침\n\n1. 수집하는 개인정보의 항목\n- 이메일 주소\n- 닉네임\n- 프로필 사진\n- 작성한 일기 내용\n- 생성된 만화 이미지\n\n2. 개인정보의 수집 및 이용 목적\n- 서비스 제공 및 개선\n- 사용자 인증 및 관리\n- 만화 생성 및 저장\n\n3. 개인정보의 보유 및 이용 기간\n- 회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 삭제합니다.\n\n4. 개인정보의 제3자 제공\n- 원칙적으로 제3자에게 제공하지 않습니다.\n\n(이하 생략...)',
      [{ text: '확인' }]
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
        <Text style={styles.headerTitle}>마이페이지</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 영역 */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>
                  {user?.nickname?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.nickname}>{user?.nickname || '사용자'}</Text>
          {user?.email && (
            <Text style={styles.email}>{user.email}</Text>
          )}
        </View>

        {/* 메뉴 영역 */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={handleNotificationSettings}
          >
            <Text style={styles.menuItemText}>알림 설정</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={handleEditProfile}
          >
            <Text style={styles.menuItemText}>개인정보 수정</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={handleTerms}
          >
            <Text style={styles.menuItemText}>이용약관</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={handlePrivacy}
          >
            <Text style={styles.menuItemText}>개인정보 처리방침</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>

        {/* 앱 버전 정보 */}
        <Text style={styles.versionText}>버전 1.0.0</Text>
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
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5E6D3',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF8C69',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nickname: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  email: {
    fontSize: 16,
    color: '#6B5B4F',
    fontWeight: '400',
  },
  menuSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemText: {
    fontSize: 16,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  menuItemArrow: {
    fontSize: 24,
    color: '#C4B5A0',
    fontWeight: '300',
  },
  logoutButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFB6A3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8C69',
    letterSpacing: 0.3,
  },
  versionText: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 8,
  },
});

