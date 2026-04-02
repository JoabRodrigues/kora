import type { FormEvent } from "react";
import type { Credentials } from "../../domain/types";

type ProfileEditorProps = {
  credentials: Credentials;
  forceCreate: boolean;
  isLoading: boolean;
  profileName: string;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onProfileNameChange: (value: string) => void;
  onSaveAndConnect?: () => void;
  onSaveProfile: () => void;
  onSetCredentials: (updater: (current: Credentials) => Credentials) => void;
  onTestConnection?: () => void | Promise<void>;
};

export function ProfileEditor({
  credentials,
  forceCreate,
  isLoading,
  profileName,
  onLogin,
  onProfileNameChange,
  onSaveAndConnect,
  onSaveProfile,
  onSetCredentials,
  onTestConnection,
}: ProfileEditorProps) {
  return (
    <form className="login-form" onSubmit={onLogin}>
      <label>
        Nome do perfil
        <input
          value={profileName}
          onChange={(event) => onProfileNameChange(event.target.value)}
          placeholder="Casa, Quarto, Cliente 1"
          required
        />
      </label>

      <label>
        URL do servidor
        <input
          type="url"
          value={credentials.serverUrl}
          onChange={(event) =>
            onSetCredentials((current) => ({
              ...current,
              serverUrl: event.target.value,
            }))
          }
          placeholder="http://painel.exemplo.com:8080"
          required
        />
      </label>

      <label>
        Usuario
        <input
          value={credentials.username}
          onChange={(event) =>
            onSetCredentials((current) => ({
              ...current,
              username: event.target.value,
            }))
          }
          placeholder="usuario"
          required
        />
      </label>

      <label>
        Senha
        <input
          type="password"
          value={credentials.password}
          onChange={(event) =>
            onSetCredentials((current) => ({
              ...current,
              password: event.target.value,
            }))
          }
          placeholder="senha"
          required
        />
      </label>

      <div className="action-group">
        {forceCreate ? (
          <>
            <button
              type="button"
              className="primary-button"
              disabled={isLoading}
              onClick={onSaveAndConnect}
            >
              {isLoading ? "Conectando..." : "Salvar perfil"}
            </button>
            <button
              type="button"
              className="ghost-button"
              disabled={isLoading}
              onClick={() => onTestConnection?.()}
            >
              Testar conexao
            </button>
          </>
        ) : (
          <>
            <button type="submit" className="primary-button" disabled={isLoading}>
              {isLoading ? "Conectando..." : "Entrar no IPTV"}
            </button>
            <button type="button" className="ghost-button" onClick={onSaveProfile}>
              Salvar perfil
            </button>
          </>
        )}
      </div>
    </form>
  );
}
