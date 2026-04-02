import { useState, useEffect } from 'react';
import { ImageUploadModal } from './ImageUploadModal';
import { supabase } from '../../config/supabase';
import placeholder from '../../assets/img/team/placeholder.png';

interface TeamMember {
  id: string;
  name: string;
  image: string;
  role: string;
  extra?: string; // e.g. regNo or level for class reps
}

interface TeamUploadManagerProps {
  members: TeamMember[];
  teamType: 'executive' | 'classRep' | 'press';
  teamName: string;
  onImageUpdate: (memberId: string, newImageUrl: string) => void;
  onMemberUpdate: (memberId: string, fields: { name?: string; role?: string; extra?: string }) => void;
}

function EditableField({
  value,
  onSave,
  label,
  mono,
}: {
  value: string;
  onSave: (v: string) => void;
  label: string;
  mono?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  // Keep draft in sync when parent updates value (e.g. after Supabase fetch)
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const commit = async () => {
    if (draft.trim() === value) { setEditing(false); return; }
    setSaving(true);
    await onSave(draft.trim());
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 w-full">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
          className={`flex-1 border border-[#00875a] rounded-lg px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 ${mono ? 'font-mono' : ''}`}
          placeholder={label}
        />
        <button
          onClick={commit}
          disabled={saving}
          className="w-7 h-7 rounded-lg bg-[#00875a] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#00875a]/90 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <button
          onClick={() => { setDraft(value); setEditing(false); }}
          className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 flex items-center justify-center flex-shrink-0 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className="group flex items-center gap-1.5 w-full text-left hover:bg-gray-50 rounded-lg px-1.5 py-1 -mx-1.5 transition-colors"
      title={`Edit ${label}`}
    >
      <span className={`text-sm text-gray-800 truncate ${mono ? 'font-mono' : 'font-medium'}`}>{value || <span className="text-gray-400 italic">Click to edit {label.toLowerCase()}</span>}</span>
      <svg className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
      </svg>
    </button>
  );
}

export function TeamUploadManager({
  members,
  teamType,
  teamName,
  onImageUpdate,
  onMemberUpdate,
}: TeamUploadManagerProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const openUploadModal = (memberId: string) => {
    setSelectedMemberId(memberId);
    setIsModalOpen(true);
  };

  const handleUploadSuccess = (imageUrl: string) => {
    if (selectedMemberId) onImageUpdate(selectedMemberId, imageUrl);
  };

  const persistField = async (memberId: string, field: string, value: string) => {
    await supabase
      .from('team_images')
      .upsert(
        {
          id: `${teamType}_${memberId}`,
          team_type: teamType,
          member_id: memberId,
          [field]: value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-6 text-gray-900">{teamName}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            {/* Image area */}
            <div className="relative h-44 bg-gray-100">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = placeholder;
                }}
              />
              <button
                onClick={() => openUploadModal(member.id)}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                Change Photo
              </button>
            </div>

            {/* Editable fields */}
            <div className="p-4 space-y-2">
              {/* Name */}
              <div>
                <p className="text-xss font-bold text-gray-400 uppercase tracking-wide mb-0.5">Name</p>
                <EditableField
                  value={member.name}
                  label="Name"
                  onSave={async (v) => {
                    await persistField(member.id, 'name', v);
                    onMemberUpdate(member.id, { name: v });
                  }}
                />
              </div>

              {/* Role / Title */}
              <div>
                <p className="text-xss font-bold text-gray-400 uppercase tracking-wide mb-0.5">Title / Role</p>
                <EditableField
                  value={member.role}
                  label="Role"
                  onSave={async (v) => {
                    await persistField(member.id, 'role', v);
                    onMemberUpdate(member.id, { role: v });
                  }}
                />
              </div>

              {/* Extra field (phone / reg no / work) */}
              {member.extra !== undefined && (
                <div>
                  <p className="text-xss font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                    {teamType === 'press' ? 'Level / Info' : 'Phone Number'}
                  </p>
                  <EditableField
                    value={member.extra}
                    label={teamType === 'executive' ? 'Phone Number' : 'Extra info'}
                    onSave={async (v) => {
                      await persistField(member.id, 'extra', v);
                      onMemberUpdate(member.id, { extra: v });
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedMember && (
        <ImageUploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          memberId={selectedMemberId!}
          teamType={teamType}
          memberName={selectedMember.name}
        />
      )}
    </div>
  );
}
