import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert, Platform } from 'react-native';

/**
 * 이미지를 기기의 사진 갤러리에 저장
 */
export async function saveImageToGallery(imageUrl: string): Promise<boolean> {
  try {
    // 권한 요청
    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        '권한 필요',
        '사진을 저장하려면 갤러리 접근 권한이 필요합니다.',
        [{ text: '확인' }]
      );
      return false;
    }

    // 이미지 다운로드 (legacy API 사용)
    const fileUri = `${FileSystem.cacheDirectory}comic_${Date.now()}.png`;
    const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
    
    if (!downloadResult.uri) {
      throw new Error('이미지 다운로드 실패');
    }

    // MediaLibrary에 저장
    const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
    
    // iOS에서는 앨범에 추가
    if (Platform.OS === 'ios') {
      let album = await MediaLibrary.getAlbumAsync('바이브네컷');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('바이브네컷', asset, false);
      }
    }

    // 임시 파일 삭제
    await FileSystem.deleteAsync(fileUri, { idempotent: true });

    return true;
  } catch (error) {
    console.error('이미지 저장 실패:', error);
    return false;
  }
}

