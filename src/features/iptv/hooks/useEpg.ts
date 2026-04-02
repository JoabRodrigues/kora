import { useEffect, useMemo, useState } from "react";
import { fetchShortEpg } from "../api";
import type { Credentials, EpgEntry, NormalizedChannel } from "../types";

export function useEpg(
  credentials: Credentials,
  activeChannel: NormalizedChannel | null,
  setErrorMessage: (value: string) => void
) {
  const [epgEntries, setEpgEntries] = useState<EpgEntry[]>([]);
  const [isEpgLoading, setIsEpgLoading] = useState(false);

  useEffect(() => {
    if (!activeChannel || activeChannel.mode !== "live") {
      setEpgEntries([]);
      setIsEpgLoading(false);
      return;
    }

    let cancelled = false;
    setIsEpgLoading(true);

    fetchShortEpg(credentials, activeChannel.id)
      .then((entries) => {
        if (cancelled) return;
        setEpgEntries(entries);
      })
      .catch((error) => {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Falha ao carregar programacao.";
        setErrorMessage(message);
        setEpgEntries([]);
      })
      .finally(() => {
        if (cancelled) return;
        setIsEpgLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeChannel, credentials, setErrorMessage]);

  const currentProgram = useMemo(
    () => epgEntries.find((entry) => entry.isCurrent) ?? epgEntries[0] ?? null,
    [epgEntries]
  );

  const upcomingPrograms = useMemo(() => {
    if (!currentProgram) return epgEntries.slice(0, 5);
    return epgEntries.filter((entry) => entry.id !== currentProgram.id).slice(0, 5);
  }, [currentProgram, epgEntries]);

  return {
    currentProgram,
    epgEntries,
    isEpgLoading,
    upcomingPrograms,
  };
}
