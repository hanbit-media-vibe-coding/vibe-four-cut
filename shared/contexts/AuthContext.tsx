import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserFromFirestore, UserData } from '../../features/auth/utils/authService';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
  setUserData: (data: UserData | null) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Firestore에서 사용자 데이터 가져오기
  const refreshUserData = async () => {
    if (user) {
      try {
        const data = await getUserFromFirestore(user.uid);
        setUserData(data);
      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
      }
    }
  };

  // Firebase Auth 상태 변화 감지
  // onAuthStateChanged는 앱 시작 시 자동으로 이전 로그인 상태를 복원합니다
  useEffect(() => {
    // 초기 로딩 상태 유지
    setIsLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('인증 상태 변경:', firebaseUser ? '로그인됨' : '로그아웃됨');
      
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // 로그인된 경우 Firestore에서 사용자 데이터 가져오기
        try {
          const data = await getUserFromFirestore(firebaseUser.uid);
          setUserData(data);
          
          // 닉네임이 없으면 새 사용자로 간주
          if (!data || !data.nickname) {
            setIsNewUser(true);
          } else {
            setIsNewUser(false);
          }
        } catch (error) {
          console.error('사용자 데이터 로드 실패:', error);
          setIsNewUser(true);
        }
      } else {
        // 로그아웃된 경우
        setUserData(null);
        setIsNewUser(false);
      }
      
      // 인증 상태 확인 완료
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    userData,
    isLoading,
    isNewUser,
    setIsNewUser,
    setUserData,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

