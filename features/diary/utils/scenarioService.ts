import { generateScenario } from './scenarioGenerator';
import {
  saveDiaryToFirestore,
  updateScenarioInFirestore,
  updateScenarioStatus,
} from './firestoreService';

export interface ScenarioGenerationResult {
  diaryId: string;
  scenarioId: string;
  scenario: {
    scenes: Array<{
      order: number;
      description: string;
    }>;
  };
}

/**
 * 일기 텍스트로부터 시나리오 생성 및 저장
 */
export async function createScenarioFromDiary(
  userId: string,
  diaryContent: string
): Promise<ScenarioGenerationResult> {
  let diaryId: string;
  let scenarioId: string;

  try {
    // 1. 일기를 Firestore에 저장
    diaryId = await saveDiaryToFirestore(userId, diaryContent);

    // 2. 시나리오 생성 시작 (pending 상태로 저장)
    const pendingScenarioData = {
      diaryId,
      userId,
      scenarioText: '',
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 임시로 시나리오 문서 생성
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { firestore } = await import('../../../shared/config/firebase');
    
    const scenarioRef = await addDoc(
      collection(firestore, 'scenarios'),
      {
        diaryId,
        userId,
        scenarioText: '',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );
    scenarioId = scenarioRef.id;

    // 3. 상태를 processing으로 업데이트
    await updateScenarioStatus(scenarioId, 'processing');

    // 4. Gemini API로 시나리오 생성
    const scenario = await generateScenario(diaryContent);

    // 5. 생성된 시나리오를 기존 문서에 업데이트
    await updateScenarioInFirestore(scenarioId, scenario);

    return {
      diaryId,
      scenarioId,
      scenario: {
        scenes: scenario.scenes,
      },
    };
  } catch (error) {
    console.error('시나리오 생성 프로세스 실패:', error);
    
    // 에러 발생 시 상태 업데이트
    if (scenarioId) {
      await updateScenarioStatus(
        scenarioId,
        'failed',
        error instanceof Error ? error.message : '알 수 없는 오류'
      );
    }

    throw error;
  }
}

