import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '../../../shared/config/gemini';

export interface Scene {
  order: number;
  description: string;
}

export interface Scenario {
  scenes: Scene[];
  fullText: string;
}

/**
 * 일기 텍스트를 네컷 만화 시나리오로 변환
 */
export async function generateScenario(diaryText: string): Promise<Scenario> {
  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
  });

  const prompt = `다음 일기 내용을 네컷 만화 시나리오로 변환해주세요. 
각 장면은 간단하고 명확한 설명으로 작성해주세요.
응답은 JSON 형식으로 다음과 같이 작성해주세요:

{
  "scenes": [
    {
      "order": 1,
      "description": "첫 번째 장면 설명"
    },
    {
      "order": 2,
      "description": "두 번째 장면 설명"
    },
    {
      "order": 3,
      "description": "세 번째 장면 설명"
    },
    {
      "order": 4,
      "description": "네 번째 장면 설명"
    }
  ]
}

일기 내용:
${diaryText}

JSON 형식으로만 응답해주세요.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const responseText = response.text.trim();
    
    // JSON 파싱 시도
    let scenarioData;
    try {
      // JSON 코드 블록이 있는 경우 제거
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : responseText;
      scenarioData = JSON.parse(jsonText);
    } catch (parseError) {
      // JSON 파싱 실패 시 기본 시나리오 생성
      console.error('JSON 파싱 실패:', parseError);
      return createDefaultScenario(diaryText);
    }

    // 시나리오 검증 및 정규화
    if (!scenarioData.scenes || !Array.isArray(scenarioData.scenes)) {
      return createDefaultScenario(diaryText);
    }

    // 4개의 장면이 있는지 확인
    const scenes = scenarioData.scenes
      .slice(0, 4)
      .map((scene: any, index: number) => ({
        order: index + 1,
        description: scene.description || `장면 ${index + 1}`,
      }));

    // 4개 미만이면 부족한 장면 추가
    while (scenes.length < 4) {
      scenes.push({
        order: scenes.length + 1,
        description: `장면 ${scenes.length + 1}`,
      });
    }

    return {
      scenes,
      fullText: responseText,
    };
  } catch (error) {
    console.error('시나리오 생성 실패:', error);
    // 에러 발생 시 기본 시나리오 반환
    return createDefaultScenario(diaryText);
  }
}

/**
 * 기본 시나리오 생성 (에러 발생 시 사용)
 */
function createDefaultScenario(diaryText: string): Scenario {
  const textLength = diaryText.length;
  const partLength = Math.ceil(textLength / 4);

  return {
    scenes: [
      {
        order: 1,
        description: diaryText.substring(0, partLength) || '첫 번째 장면',
      },
      {
        order: 2,
        description: diaryText.substring(partLength, partLength * 2) || '두 번째 장면',
      },
      {
        order: 3,
        description: diaryText.substring(partLength * 2, partLength * 3) || '세 번째 장면',
      },
      {
        order: 4,
        description: diaryText.substring(partLength * 3) || '네 번째 장면',
      },
    ],
    fullText: diaryText,
  };
}

