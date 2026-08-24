"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const QUESTION_TYPES = [
  { value: "CHOIX_UNIQUE", label: "Choix unique" },
  { value: "CHOIX_MULTIPLE", label: "Choix multiple" },
  { value: "PREUVE_PRATIQUE", label: "Preuve pratique" },
];

interface OptionDraft {
  label: string;
  labelEn: string;
  isCorrect: boolean;
}

// Formulaire Seuil : crée une question de quiz. Pour CHOIX_UNIQUE, cocher
// une option décoche automatiquement les autres (toggleCorrect) ; les
// options sont omises de la requête pour le type PREUVE_PRATIQUE, qui
// n'en a pas besoin (correction manuelle, cf. ReviewEvidenceForm).
export function AddQuestionForm({
  quizId,
  nextPosition,
}: {
  quizId: string;
  nextPosition: number;
}) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [questionEn, setQuestionEn] = useState("");
  const [type, setType] = useState("CHOIX_UNIQUE");
  const [points, setPoints] = useState("1");
  const [options, setOptions] = useState<OptionDraft[]>([
    { label: "", labelEn: "", isCorrect: false },
    { label: "", labelEn: "", isCorrect: false },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function updateOption(index: number, patch: Partial<OptionDraft>) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  }

  function toggleCorrect(index: number) {
    setOptions((prev) =>
      prev.map((o, i) => {
        if (type === "CHOIX_UNIQUE") {
          return { ...o, isCorrect: i === index };
        }
        return i === index ? { ...o, isCorrect: !o.isCorrect } : o;
      }),
    );
  }

  function addOption() {
    setOptions((prev) => [...prev, { label: "", labelEn: "", isCorrect: false }]);
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch(`/api/v1/quizzes/${quizId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        questionEn: questionEn || undefined,
        type,
        position: nextPosition,
        points: Number(points),
        options:
          type === "PREUVE_PRATIQUE"
            ? []
            : options.map((o) => ({
                label: o.label,
                labelEn: o.labelEn || undefined,
                isCorrect: o.isCorrect,
              })),
      }),
    });
    const result = await res.json();
    setPending(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setQuestion("");
    setQuestionEn("");
    setOptions([
      { label: "", labelEn: "", isCorrect: false },
      { label: "", labelEn: "", isCorrect: false },
    ]);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <p className="text-sm font-medium text-text">
        Ajouter une question (position {nextPosition})
      </p>
      <Input
        label="Question"
        required
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <Input
        label="Question (anglais)"
        value={questionEn}
        onChange={(e) => setQuestionEn(e.target.value)}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm text-text-muted">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-accent"
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Points"
        type="number"
        min={1}
        max={100}
        value={points}
        onChange={(e) => setPoints(e.target.value)}
      />

      {type !== "PREUVE_PRATIQUE" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-text-muted">
            Options (
            {type === "CHOIX_UNIQUE"
              ? "cochez la seule bonne réponse"
              : "cochez toutes les bonnes réponses"}
            )
          </p>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type={type === "CHOIX_UNIQUE" ? "radio" : "checkbox"}
                name="correct-option"
                checked={option.isCorrect}
                onChange={() => toggleCorrect(index)}
              />
              <input
                value={option.label}
                onChange={(e) => updateOption(index, { label: e.target.value })}
                placeholder={`Option ${index + 1}`}
                required
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-accent"
              />
              <input
                value={option.labelEn}
                onChange={(e) => updateOption(index, { labelEn: e.target.value })}
                placeholder={`Option ${index + 1} (anglais)`}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-accent"
              />
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={() => removeOption(index)}
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="tertiary" onClick={addOption}>
            Ajouter une option
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Ajout…" : "Ajouter la question"}
      </Button>
    </form>
  );
}
