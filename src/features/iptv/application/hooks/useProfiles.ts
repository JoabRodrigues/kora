import { CREDENTIALS_STORAGE_KEY, PROFILES_STORAGE_KEY } from "../../domain/constants";
import type { Credentials, SavedProfile } from "../../domain/types";
import { buildSavedProfile } from "../../domain/services/profile-service";
import { usePersistentState } from "../../infrastructure/storage";

export function useProfiles() {
  const [credentials, setCredentials] = usePersistentState<Credentials>(
    CREDENTIALS_STORAGE_KEY,
    { serverUrl: "", username: "", password: "" }
  );
  const [savedProfiles, setSavedProfiles] = usePersistentState<SavedProfile[]>(
    PROFILES_STORAGE_KEY,
    []
  );

  function saveProfile(
    profileName: string,
    editingProfileId: string | null,
    setErrorMessage: (value: string) => void,
    setStatusMessage: (value: string) => void
  ) {
    try {
      const savedProfile = buildSavedProfile({
        credentials,
        currentProfiles: savedProfiles,
        editingProfileId,
        profileName,
      });

      setSavedProfiles(savedProfile.profiles);
      setErrorMessage("");
      setStatusMessage(`Perfil ${savedProfile.profile.name} salvo neste navegador.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel salvar o perfil.";
      setErrorMessage(message);
      return;
    }
  }

  function loadProfile(
    profile: SavedProfile,
    setStatusMessage: (value: string) => void,
    setErrorMessage: (value: string) => void
  ) {
    setCredentials({
      serverUrl: profile.serverUrl,
      username: profile.username,
      password: profile.password,
    });
    setStatusMessage(`Perfil ${profile.name} carregado.`);
    setErrorMessage("");
  }

  function deleteProfile(profileId: string) {
    setSavedProfiles((current) => current.filter((profile) => profile.id !== profileId));
  }

  return {
    credentials,
    savedProfiles,
    setCredentials,
    saveProfile,
    loadProfile,
    deleteProfile,
  };
}
