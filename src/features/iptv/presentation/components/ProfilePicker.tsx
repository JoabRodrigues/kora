import type { SavedProfile } from "../../domain/types";

type ProfilePickerProps = {
  savedProfiles: SavedProfile[];
  onCreateProfile: () => void;
  onDeleteProfile: (profileId: string) => void;
  onEditProfile: (profile: SavedProfile) => void;
};

export function ProfilePicker({
  savedProfiles,
  onCreateProfile,
  onDeleteProfile,
  onEditProfile,
}: ProfilePickerProps) {
  return (
    <div className="profiles-panel">
      <div className="profiles-list profile-picker-list">
        {savedProfiles.map((profile) => (
          <div key={profile.id} className="profile-item">
            <button
              type="button"
              className="profile-main"
              onClick={() => onEditProfile(profile)}
            >
              <strong>{profile.name}</strong>
            </button>
            <button
              type="button"
              className="profile-delete"
              onClick={() => onDeleteProfile(profile.id)}
              aria-label={`Excluir perfil ${profile.name}`}
              title={`Excluir perfil ${profile.name}`}
            >
              Excluir
            </button>
          </div>
        ))}

        <button type="button" className="profile-create-button" onClick={onCreateProfile}>
          Novo perfil
        </button>

        {savedProfiles.length === 0 ? (
          <div className="empty-list">Nenhum perfil salvo neste navegador.</div>
        ) : null}
      </div>
    </div>
  );
}
