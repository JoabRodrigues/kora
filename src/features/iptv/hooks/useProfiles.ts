import type { Dispatch, SetStateAction } from "react";
import { CREDENTIALS_STORAGE_KEY, PROFILES_STORAGE_KEY } from "../constants";
import type { Credentials, SavedProfile } from "../types";
import { inferProfileName } from "../utils";
import { usePersistentState } from "../storage";

export function useProfiles() {
  const [credentials, setCredentials] = usePersistentState<Credentials>(
    CREDENTIALS_STORAGE_KEY,
    { serverUrl: "", username: "", password: "" }
  );
  const [savedProfiles, setSavedProfiles] = usePersistentState<SavedProfile[]>(
    PROFILES_STORAGE_KEY,
    []
  );

  function saveProfile(setErrorMessage: (value: string) => void, setStatusMessage: (value: string) => void, setShowProfiles: Dispatch<SetStateAction<boolean>>) {
    const normalizedUrl = credentials.serverUrl.trim().replace(/\/+$/, "");
    const username = credentials.username.trim();
    const password = credentials.password.trim();

    if (!normalizedUrl || !username || !password) {
      setErrorMessage("Preencha URL, usuario e senha antes de salvar o perfil.");
      return;
    }

    const profile: SavedProfile = {
      id: `${normalizedUrl}|${username}`,
      name: inferProfileName({ serverUrl: normalizedUrl, username, password }),
      serverUrl: normalizedUrl,
      username,
      password,
      createdAt: new Date().toISOString(),
    };

    setSavedProfiles((current) => {
      const withoutCurrent = current.filter((item) => item.id !== profile.id);
      return [profile, ...withoutCurrent];
    });
    setErrorMessage("");
    setStatusMessage(`Perfil ${profile.name} salvo neste navegador.`);
    setShowProfiles(true);
  }

  function loadProfile(
    profile: SavedProfile,
    setStatusMessage: (value: string) => void,
    setErrorMessage: (value: string) => void,
    setShowProfiles: Dispatch<SetStateAction<boolean>>,
    setShowUserMenu: Dispatch<SetStateAction<boolean>>
  ) {
    setCredentials({
      serverUrl: profile.serverUrl,
      username: profile.username,
      password: profile.password,
    });
    setStatusMessage(`Perfil ${profile.name} carregado.`);
    setErrorMessage("");
    setShowProfiles(false);
    setShowUserMenu(false);
  }

  function deleteProfile(profileId: string) {
    setSavedProfiles((current) => current.filter((profile) => profile.id !== profileId));
  }

  return {
    credentials,
    savedProfiles,
    setCredentials: setCredentials as Dispatch<SetStateAction<Credentials>>,
    saveProfile,
    loadProfile,
    deleteProfile,
  };
}
