import type { FormEvent } from "react";
import type { Credentials, SavedProfile } from "../types";

type UserMenuProps = {
  credentials: Credentials;
  errorMessage: string;
  isLoading: boolean;
  savedProfiles: SavedProfile[];
  sessionActive: boolean;
  showProfiles: boolean;
  onClose: () => void;
  onDeleteProfile: (profileId: string) => void;
  onLoadProfile: (profile: SavedProfile) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onLogout: () => void;
  onSaveProfile: () => void;
  onSetCredentials: (updater: (current: Credentials) => Credentials) => void;
  onToggleProfiles: () => void;
};

export function UserMenu({
  credentials,
  errorMessage,
  isLoading,
  savedProfiles,
  sessionActive,
  showProfiles,
  onClose,
  onDeleteProfile,
  onLoadProfile,
  onLogin,
  onLogout,
  onSaveProfile,
  onSetCredentials,
  onToggleProfiles,
}: UserMenuProps) {
  return (
    <>
      <button
        type="button"
        className="user-menu-backdrop"
        aria-label="Fechar menu de usuario"
        onClick={onClose}
      />
      <div className="user-menu panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Perfis</span>
            <strong className="panel-title">
              {savedProfiles.length > 0
                ? `${savedProfiles.length} perfil${savedProfiles.length > 1 ? "s" : ""}`
                : "Criar perfil"}
            </strong>
          </div>
          <button
            type="button"
            className="ghost-button compact-button"
            onClick={onToggleProfiles}
          >
            {showProfiles ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {showProfiles ? (
          <div className="profiles-panel">
            <div className="panel-subhead">
              <strong>Perfis salvos</strong>
              <span>{savedProfiles.length}</span>
            </div>
            <div className="profiles-list">
              {savedProfiles.length === 0 ? (
                <div className="empty-list">Nenhum perfil salvo neste navegador.</div>
              ) : null}
              {savedProfiles.map((profile) => (
                <div key={profile.id} className="profile-item">
                  <button
                    type="button"
                    className="profile-main"
                    onClick={() => onLoadProfile(profile)}
                  >
                    <strong>{profile.name}</strong>
                    <small>{profile.serverUrl}</small>
                  </button>
                  <button
                    type="button"
                    className="profile-delete"
                    onClick={() => onDeleteProfile(profile.id)}
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {savedProfiles.length === 0 || !showProfiles ? (
          <form className="login-form" onSubmit={onLogin}>
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
              <button type="submit" className="primary-button" disabled={isLoading}>
                {isLoading ? "Conectando..." : "Entrar no IPTV"}
              </button>
              <button type="button" className="ghost-button" onClick={onSaveProfile}>
                Salvar perfil
              </button>
            </div>
          </form>
        ) : (
          <div className="meta-card">
            <strong>Novo perfil</strong>
            <p>Use "Ocultar" para abrir o formulario e cadastrar outra conexao.</p>
          </div>
        )}

        {sessionActive ? (
          <button type="button" className="ghost-button" onClick={onLogout}>
            Sair
          </button>
        ) : null}

        {errorMessage ? <div className="error-box">{errorMessage}</div> : null}
      </div>
    </>
  );
}
