"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { updateNotificationPreferenceRequest } from "@/lib/api/notifications";
import { deleteOwnAccountRequest } from "@/lib/api/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function SettingsForm({
  initialEnabled,
  initialSoundEnabled,
  t,
}: {
  initialEnabled: boolean;
  initialSoundEnabled: boolean;
  t: Dictionary["settings"];
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [soundEnabled, setSoundEnabled] = useState(initialSoundEnabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function onSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    const result = await updateNotificationPreferenceRequest({ enabled, soundEnabled });
    setSaving(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setSaved(true);
  }

  async function onConfirmDelete() {
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteOwnAccountRequest();
    setDeleting(false);
    if (!result.success) {
      setDeleteError(result.error.message);
      return;
    }
    router.push("/connexion");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
        <h2 className="font-heading text-lg font-semibold text-text">
          {t.notificationsHeading}
        </h2>
        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          {t.notificationsEnabled}
        </label>
        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
          />
          {t.soundEnabled}
        </label>
        {saved && <p className="text-sm text-success">{t.saved}</p>}
        {error && <p className="text-sm text-error">{error}</p>}
        <Button onClick={onSave} disabled={saving} className="self-start">
          {saving ? t.saving : t.save}
        </Button>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-error/40 bg-surface p-6">
        <h2 className="font-heading text-lg font-semibold text-error">{t.dangerZone}</h2>
        <p className="text-sm text-text-muted">{t.deleteAccountIntro}</p>
        {deleteError && <p className="text-sm text-error">{deleteError}</p>}
        {confirmingDelete ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-text">{t.deleteAccountConfirm}</p>
            <div className="flex items-center gap-2">
              <Button variant="danger" onClick={onConfirmDelete} disabled={deleting}>
                {deleting ? t.deleting : t.deleteAccountConfirmButton}
              </Button>
              <Button
                variant="tertiary"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
              >
                {t.deleteAccountCancel}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="secondary"
            onClick={() => setConfirmingDelete(true)}
            className="self-start"
          >
            {t.deleteAccountButton}
          </Button>
        )}
      </section>
    </div>
  );
}
