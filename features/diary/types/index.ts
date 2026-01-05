/**
 * 만화 이미지 스타일 타입
 */
export type ComicStyle = 
  | 'anime'           // 일본 애니메이션 스타일
  | 'watercolor'      // 수채화 느낌
  | 'sketch'          // 연필 스케치처럼
  | 'pastel'          // 따뜻한 파스텔 톤
  | 'vangogh';        // 고흐 화풍

/**
 * 스타일 정보
 */
export interface ComicStyleInfo {
  value: ComicStyle;
  label: string;
  description?: string;
}

/**
 * 사용 가능한 스타일 목록
 */
export const COMIC_STYLES: ComicStyleInfo[] = [
  {
    value: 'anime',
    label: '일본 애니메이션 스타일',
    description: '밝고 생동감 있는 애니메이션 느낌',
  },
  {
    value: 'watercolor',
    label: '수채화 느낌',
    description: '부드럽고 흐르는 듯한 수채화 톤',
  },
  {
    value: 'sketch',
    label: '연필 스케치처럼',
    description: '자연스럽고 따뜻한 손그림 느낌',
  },
  {
    value: 'pastel',
    label: '따뜻한 파스텔 톤',
    description: '부드럽고 따뜻한 파스텔 색감',
  },
  {
    value: 'vangogh',
    label: '고흐 화풍',
    description: '생동감 있고 표현력 있는 화풍',
  },
];

/**
 * 스타일별 프롬프트 설명
 */
export const STYLE_PROMPTS: Record<ComicStyle, string> = {
  anime: 'in Japanese anime style with vibrant colors, expressive characters, and dynamic compositions',
  watercolor: 'in watercolor painting style with soft, flowing colors and gentle brushstrokes',
  sketch: 'in pencil sketch style with natural, warm hand-drawn lines and soft shading',
  pastel: 'in warm pastel tones with soft, gentle colors and a cozy atmosphere',
  vangogh: 'in Van Gogh painting style with expressive brushstrokes, vibrant colors, and dynamic movement',
};
