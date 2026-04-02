import type { Credentials, SavedProfile } from "../types";
import { inferProfileName } from "../utils";

export function validateProfileCredentials(credentials: Credentials) {
  const serverUrl = credentials.serverUrl.trim().replace(/\/+$/, "");
  const username = credentials.username.trim();
  const password = credentials.password.trim();

  if (!serverUrl || !username || !password) {
    throw new Error("Preencha URL, usuario e senha antes de salvar o perfil.");
  }

  return { serverUrl, username, password };
}

export function buildSavedProfile(params: {
  credentials: Credentials;
  currentProfiles: SavedProfile[];
  editingProfileId: string | null;
  profileName: string;
}) {
  const normalized = validateProfileCredentials(params.credentials);
  const normalizedName = params.profileName.trim();
  const generatedId = `${normalized.serverUrl}|${normalized.username}`;
  const profileId = params.editingProfileId ?? generatedId;
  const existingProfile = params.currentProfiles.find((item) => item.id === profileId);

  const profile: SavedProfile = {
    id: profileId,
    name:
      normalizedName ||
      existingProfile?.name ||
      inferProfileName({
        serverUrl: normalized.serverUrl,
        username: normalized.username,
        password: normalized.password,
      }),
    serverUrl: normalized.serverUrl,
    username: normalized.username,
    password: normalized.password,
    createdAt: existingProfile?.createdAt ?? new Date().toISOString(),
  };

  const profiles = [
    profile,
    ...params.currentProfiles.filter(
      (item) => item.id !== profileId && item.id !== generatedId
    ),
  ];

  return { profile, profiles };
}
