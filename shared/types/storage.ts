/**
 * Firebase Storage 경로 구조
 * 
 * Storage 경로 패턴:
 * 
 * users/{userId}/profile/avatar.jpg
 *   - 사용자 프로필 이미지
 * 
 * comics/{userId}/{comicId}/scene-1.jpg
 * comics/{userId}/{comicId}/scene-2.jpg
 * comics/{userId}/{comicId}/scene-3.jpg
 * comics/{userId}/{comicId}/scene-4.jpg
 *   - 네컷 만화 이미지 (각 씬별로 1개씩, 총 4개)
 */

export const STORAGE_PATHS = {
  /**
   * 사용자 프로필 이미지 경로 생성
   * @param userId 사용자 ID
   * @param filename 파일명 (기본값: avatar.jpg)
   * @returns Storage 경로
   */
  userProfile: (userId: string, filename: string = 'avatar.jpg'): string => 
    `users/${userId}/profile/${filename}`,

  /**
   * 만화 씬 이미지 경로 생성
   * @param userId 사용자 ID
   * @param comicId 만화 ID
   * @param sceneNumber 씬 번호 (1-4)
   * @returns Storage 경로
   */
  comicScene: (userId: string, comicId: string, sceneNumber: 1 | 2 | 3 | 4): string =>
    `comics/${userId}/${comicId}/scene-${sceneNumber}.jpg`,

  /**
   * 만화 디렉토리 경로 (모든 씬 이미지 포함)
   * @param userId 사용자 ID
   * @param comicId 만화 ID
   * @returns Storage 디렉토리 경로
   */
  comicDirectory: (userId: string, comicId: string): string =>
    `comics/${userId}/${comicId}/`,

  /**
   * 만화의 모든 씬 이미지 경로 배열 생성
   * @param userId 사용자 ID
   * @param comicId 만화 ID
   * @returns 4개 씬 이미지 경로 배열
   */
  allComicScenes: (userId: string, comicId: string): string[] => {
    return [1, 2, 3, 4].map((num) => 
      STORAGE_PATHS.comicScene(userId, comicId, num as 1 | 2 | 3 | 4)
    );
  },
} as const;

