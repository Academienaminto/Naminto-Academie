"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { startAttemptRequest, submitAttemptRequest } from "@/lib/api/quiz";
import { uploadFileRequest } from "@/lib/api/files";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { localize } from "@/lib/i18n/content";

interface Question {
  id: string;
  question: string;
  questionEn: string | null;
  type: string;
  position: number;
  points: number;
  options: { id: string; label: string; labelEn: string | null; position: number }[];
}

interface QuizRunnerProps {
  quizId: string;
  questions: Question[];
  attemptId: string | null;
  passed: boolean;
  attemptsUsed: number;
  maxAttempts: number;
  awaitingReview: boolean;
  t: Dictionary["quiz"];
  locale: Locale;
}

// RÈGLES MÉTIER §31 SCORE : jamais de score/verdict envoyé par le client —
// seules les réponses choisies (ou un fileId déjà uploadé) sont transmises,
// la correction reste entièrement côté serveur.
export function QuizRunner({
  quizId,
  questions,
  attemptId: initialAttemptId,
  passed,
  attemptsUsed,
  maxAttempts,
  awaitingReview,
  t,
  locale,
}: QuizRunnerProps) {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState(initialAttemptId);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [files, setFiles] = useState<Record<string, { id: string; name: string } | undefined>>({});
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    scorePercent: number | null;
    passed: boolean | null;
    pendingEvidence: boolean;
  } | null>(null);

  if (passed) {
    return <p className="text-sm text-success">{t.validated}</p>;
  }

  if (awaitingReview) {
    return <p className="text-sm text-warning">{t.awaitingReview}</p>;
  }

  if (result) {
    if (result.pendingEvidence) {
      return <p className="text-sm text-warning">{t.pendingEvidence}</p>;
    }
    return (
      <div className="flex flex-col gap-1">
        <p className={result.passed ? "text-sm text-success" : "text-sm text-error"}>
          {result.passed
            ? `${t.passedPrefix} (${result.scorePercent}%).`
            : `${t.failedPrefix} (${result.scorePercent}%).`}
        </p>
        {!result.passed && (
          <p className="text-xs text-text-muted">
            {t.attemptCounter} {attemptsUsed + 1}/{maxAttempts}.
          </p>
        )}
      </div>
    );
  }

  if (!attemptId) {
    if (attemptsUsed >= maxAttempts) {
      return <p className="text-sm text-error">{t.maxAttemptsReached}</p>;
    }

    async function onStart() {
      setPending(true);
      setError(null);
      const res = await startAttemptRequest(quizId);
      setPending(false);
      if (!res.success) {
        setError(res.error.message);
        return;
      }
      setAttemptId(res.data.attemptId);
    }

    return (
      <div className="flex flex-col items-start gap-2">
        <Button onClick={onStart} disabled={pending}>
          {pending ? t.starting : t.start}
        </Button>
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }

  function toggleOption(questionId: string, optionId: string, type: string) {
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      if (type === "CHOIX_UNIQUE") {
        return { ...prev, [questionId]: [optionId] };
      }
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [questionId]: next };
    });
  }

  async function onFileChange(questionId: string, file: File | null) {
    if (!file) return;
    setUploadingFor(questionId);
    setError(null);
    const res = await uploadFileRequest(file);
    setUploadingFor(null);
    if (!res.success) {
      setError(res.error.message);
      return;
    }
    setFiles((prev) => ({ ...prev, [questionId]: res.data }));
  }

  async function onSubmit() {
    setPending(true);
    setError(null);
    const payload = questions.map((q) =>
      q.type === "PREUVE_PRATIQUE"
        ? { questionId: q.id, fileId: files[q.id]?.id }
        : { questionId: q.id, selectedOptionIds: answers[q.id] ?? [] },
    );
    const res = await submitAttemptRequest(attemptId!, payload);
    setPending(false);
    if (!res.success) {
      setError(res.error.message);
      return;
    }
    setResult(res.data);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {questions.map((q) => (
        <div key={q.id} className="flex flex-col gap-2">
          <p className="text-sm font-medium text-text">
            {localize(locale, q.question, q.questionEn)}
          </p>
          {q.type === "PREUVE_PRATIQUE" ? (
            <div className="flex flex-col gap-1">
              <input
                type="file"
                onChange={(e) => onFileChange(q.id, e.target.files?.[0] ?? null)}
                className="text-sm text-text-muted"
              />
              {uploadingFor === q.id && (
                <p className="text-xs text-text-muted">{t.uploading}</p>
              )}
              {files[q.id] && (
                <p className="text-xs text-success">
                  {files[q.id]!.name} {t.uploaded}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {q.options.map((o) => (
                <label key={o.id} className="flex items-center gap-2 text-sm text-text">
                  <input
                    type={q.type === "CHOIX_UNIQUE" ? "radio" : "checkbox"}
                    name={q.id}
                    checked={(answers[q.id] ?? []).includes(o.id)}
                    onChange={() => toggleOption(q.id, o.id, q.type)}
                  />
                  {localize(locale, o.label, o.labelEn)}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      {error && <p className="text-sm text-error">{error}</p>}
      <Button onClick={onSubmit} disabled={pending}>
        {pending ? t.submitting : t.submit}
      </Button>
    </div>
  );
}
