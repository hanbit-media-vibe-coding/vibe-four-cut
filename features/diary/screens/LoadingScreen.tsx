import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { logScreenView } from '../../../shared/utils/analytics';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // 화면 조회 이벤트
    logScreenView('loading');
    
    // 페이드 인 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 3초 후 완료 콜백 호출
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onComplete]);

  const loadingMessages = [
    '일기를 분석하고 있어요...',
    '시나리오를 만들고 있어요...',
    '만화를 그리고 있어요...',
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF8C69" />
        </View>
        <Text style={styles.loadingText}>
          {loadingMessages[currentMessageIndex]}
        </Text>
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  opacity: currentMessageIndex === index ? 1 : 0.3,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
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
  },
  loaderContainer: {
    marginBottom: 32,
  },
  loadingText: {
    fontSize: 20,
    color: '#8B4513',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF8C69',
  },
});

