import { useEffect, useRef, useState } from "react";
import type { Credentials } from "../../domain/types";
import { authenticate } from "../../infrastructure/api";

type UseSessionParams = {
  credentials: Credentials;
  hasProfiles: boolean;
  onConnectSuccess: () => Promise<void> | void;
  onLogout: () => void;
  setErrorMessage: (value: string) => void;
  setStatusMessage: (value: string) => void;
};

type ConnectOptions = {
  closeUserMenu?: boolean;
  silent?: boolean;
  validateOnly?: boolean;
};

export function useSession({
  credentials,
  hasProfiles,
  onConnectSuccess,
  onLogout,
  setErrorMessage,
  setStatusMessage,
}: UseSessionParams) {
  const [sessionActive, setSessionActive] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const hasAttemptedAutoLogin = useRef(false);

  async function connect(options?: ConnectOptions) {
    setErrorMessage("");
    setIsAuthenticating(true);
    setStatusMessage(
      options?.silent ? "Conectando ao perfil salvo..." : "Validando credenciais..."
    );

    try {
      await authenticate(credentials);

      if (options?.validateOnly) {
        setSessionActive(false);
        setStatusMessage("Conexao validada com sucesso.");
        return { connected: false, shouldCloseMenu: false };
      }

      setSessionActive(true);
      setStatusMessage("Conectado com sucesso.");
      await onConnectSuccess();

      return { connected: true, shouldCloseMenu: options?.closeUserMenu ?? true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha desconhecida ao conectar no IPTV.";
      setSessionActive(false);
      setErrorMessage(message);
      setStatusMessage("Conexao falhou.");
      return { connected: false, shouldCloseMenu: false };
    } finally {
      setIsAuthenticating(false);
    }
  }

  useEffect(() => {
    if (hasAttemptedAutoLogin.current || !hasProfiles || sessionActive) {
      return;
    }

    const { serverUrl, username, password } = credentials;
    if (!serverUrl || !username || !password) {
      return;
    }

    hasAttemptedAutoLogin.current = true;
    connect({ closeUserMenu: false, silent: true }).catch(() => undefined);
  }, [credentials, hasProfiles, sessionActive]);

  function logout() {
    setSessionActive(false);
    onLogout();
  }

  return {
    connect,
    isAuthenticating,
    logout,
    sessionActive,
  };
}
