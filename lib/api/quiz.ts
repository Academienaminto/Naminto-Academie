import type { ApiResult } from "@/lib/api/auth";

interface StartAttemptData {
  attemptId: string;
  attemptNumber: number;
  quiz: {
    id: string;
    title: string;
    questions: {
      id: string;
      question: string;
      type: string;
      position: number;
      points: number;
      options: { id: string; label: string; position: number }[];
    }[];
  };
}

export async function startAttemptRequest(
  quizId: string,
): Promise<ApiResult<StartAttemptData>> {
  const res = await fetch(`/api/v1/quizzes/${quizId}/attempts`, { method: "POST" });
  return res.json();
}

export async function submitAttemptRequest(
  attemptId: string,
  answers: { questionId: string; selectedOptionIds?: string[]; fileId?: string }[],
): Promise<ApiResult<{ scorePercent: number | null; passed: boolean | null; pendingEvidence: boolean }>> {
  const res = await fetch(`/api/v1/attempts/${attemptId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  return res.json();
}
