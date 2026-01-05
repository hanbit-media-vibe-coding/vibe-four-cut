import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '../../../shared/config/gemini';
import { Scene } from './scenarioGenerator';

/**
 * 일기 내용과 시나리오를 바탕으로 감정 한 줄 문장 생성
 */
export async function generateEmotionSentence(
  diaryContent: string,
  scenes: Scene[]
): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
  });

  // 시나리오 텍스트 생성
  const scenarioText = scenes
    .map((scene) => `${scene.order}. ${scene.description}`)
    .join('\n');

  const prompt = `다음 일기 내용과 네컷 만화 시나리오를 바탕으로, 사용자의 하루를 조용히 감싸주는 감정 한 줄 문장을 만들어주세요.

요구사항:
- 1문장으로 작성
- 부드럽고 공감되는 말투 사용
- 평가하거나 조언하지 말 것
- 사용자의 하루를 조용히 감싸주는 느낌
- 너무 시적이거나 과장되지 않게
- 일상적인 톤으로 작성
- 따뜻하고 위로가 되는 느낌

일기 내용:
${diaryContent}

시나리오:
${scenarioText}

위의 내용을 바탕으로 감정 한 줄 문장을 작성해주세요. 문장만 출력하고 다른 설명은 하지 마세요.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const emotionSentence = response.text.trim();
    
    // 불필요한 따옴표나 특수문자 제거
    const cleanedSentence = emotionSentence
      .replace(/^["']|["']$/g, '') // 앞뒤 따옴표 제거
      .replace(/^[^\w가-힣]+\s*/, '') // 앞의 특수문자 제거
      .trim();

    // 문장이 너무 길면 자르기 (최대 50자)
    if (cleanedSentence.length > 50) {
      return cleanedSentence.substring(0, 47) + '...';
    }

    return cleanedSentence || '오늘 하루도 수고했어요.';
  } catch (error) {
    console.error('감정 문장 생성 실패:', error);
    // 기본 감정 문장 반환
    return '오늘 하루도 수고했어요.';
  }
}

