import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Credentials, SavedProfile } from "../../domain/types";
import { ProfileEditor } from "./ProfileEditor";
import { ProfilePicker } from "./ProfilePicker";

type UserMenuProps = {
  credentials: Credentials;
  errorMessage: string;
  isLoading: boolean;
  savedProfiles: SavedProfile[];
  sessionActive: boolean;
  statusMessage?: string;
  forceCreate?: boolean;
  onClose: () => void;
  onDeleteProfile: (profileId: string) => void;
  onLoadProfile: (profile: SavedProfile) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onLogout: () => void;
  onSaveProfile: (profileName: string, profileId: string | null) => void;
  onSaveAndConnect?: (profileName: string, profileId: string | null) => void;
  onSetCredentials: (updater: (current: Credentials) => Credentials) => void;
  onTestConnection?: () => void | Promise<void>;
};

export function UserMenu({
  credentials,
  errorMessage,
  forceCreate = false,
  isLoading,
  savedProfiles,
  sessionActive,
  statusMessage,
  onClose,
  onDeleteProfile,
  onLoadProfile,
  onLogin,
  onLogout,
  onSaveProfile,
  onSaveAndConnect,
  onSetCredentials,
  onTestConnection,
}: UserMenuProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string | "new" | null>(
    forceCreate ? "new" : null
  );
  const [profileName, setProfileName] = useState("");

  const selectedProfile = useMemo(
    () => savedProfiles.find((profile) => profile.id === selectedProfileId) ?? null,
    [savedProfiles, selectedProfileId]
  );

  useEffect(() => {
    if (!selectedProfileId || selectedProfileId === "new") {
      return;
    }

    if (!selectedProfile) {
      setSelectedProfileId(null);
      setProfileName("");
    }
  }, [selectedProfile, selectedProfileId]);

  useEffect(() => {
    if (!forceCreate) {
      return;
    }

    setSelectedProfileId("new");
  }, [forceCreate]);

  function handleCreateProfile() {
    setSelectedProfileId("new");
    setProfileName("");
    onSetCredentials(() => ({
      serverUrl: "",
      username: "",
      password: "",
    }));
  }

  function handleEditProfile(profile: SavedProfile) {
    setSelectedProfileId(profile.id);
    setProfileName(profile.name);
    onLoadProfile(profile);
  }

  function handleSubmitProfile() {
    onSaveProfile(profileName, selectedProfile?.id ?? null);
  }

  const isEditing = selectedProfileId !== null;
  const title = selectedProfileId === "new" ? "Novo perfil" : selectedProfile?.name ?? "Perfis";

  return (
    <>
      {!forceCreate ? (
        <button
          type="button"
          className="user-menu-backdrop"
          aria-label="Fechar menu de usuario"
          onClick={onClose}
        />
      ) : null}
      <div className={forceCreate ? "user-menu panel user-menu standalone" : "user-menu panel"}>
        <div className="panel-header">
          <div>
            <span className="eyebrow">{forceCreate ? "Bem-vindo" : "Perfis"}</span>
            <strong className="panel-title">
              {forceCreate ? "Crie seu primeiro perfil" : title}
            </strong>
          </div>
          {isEditing && !forceCreate ? (
            <button
              type="button"
              className="ghost-button compact-button"
              onClick={() => setSelectedProfileId(null)}
            >
              Voltar
            </button>
          ) : null}
        </div>

        {!isEditing && !forceCreate ? (
          <ProfilePicker
            savedProfiles={savedProfiles}
            onCreateProfile={handleCreateProfile}
            onDeleteProfile={onDeleteProfile}
            onEditProfile={handleEditProfile}
          />
        ) : (
          <ProfileEditor
            credentials={credentials}
            forceCreate={forceCreate}
            isLoading={isLoading}
            profileName={profileName}
            onLogin={onLogin}
            onProfileNameChange={setProfileName}
            onSaveAndConnect={() =>
              (onSaveAndConnect ?? onSaveProfile)(profileName, selectedProfile?.id ?? null)
            }
            onSaveProfile={handleSubmitProfile}
            onSetCredentials={onSetCredentials}
            onTestConnection={onTestConnection}
          />
        )}

        {!errorMessage && statusMessage && forceCreate ? (
          <div className="meta-card">{statusMessage}</div>
        ) : null}

        {sessionActive && !forceCreate ? (
          <button type="button" className="ghost-button" onClick={onLogout}>
            Sair
          </button>
        ) : null}

        {errorMessage ? <div className="error-box">{errorMessage}</div> : null}
      </div>
    </>
  );
}
