import { useState, useEffect } from 'react';
import { TeamUploadManager } from '../../components/ImageUpload/TeamUploadManager';
import placeholder from "../../assets/img/team/placeholder.png";
import { supabase } from '../../config/supabase';
import { classReps } from '../../data/students/classReps';
import { IoLink, IoCheckmark, IoPencil } from 'react-icons/io5';

// ─── Types ────────────────────────────────────────────────────────────────────
type TeamType = 'executive' | 'classRep' | 'press';

interface TeamMember {
  id: string;
  name: string;
  image: string;
  role: string;
  extra?: string;
}

// ─── Static default data ─────────────────────────────────────────────────────
const executiveTeamData: TeamMember[] = [
  { id: 'president',  name: 'Name Here', image: placeholder, role: 'President',               extra: '' },
  { id: 'exec-0',     name: 'Name Here', image: placeholder, role: 'Vice President',           extra: '' },
  { id: 'exec-1',     name: 'Name Here', image: placeholder, role: 'General Secretary',        extra: '' },
  { id: 'exec-2',     name: 'Name Here', image: placeholder, role: 'Financial Secretary',      extra: '' },
  { id: 'exec-3',     name: 'Name Here', image: placeholder, role: 'Treasurer',                extra: '' },
  { id: 'exec-4',     name: 'Name Here', image: placeholder, role: 'Public Relations Officer', extra: '' },
  { id: 'exec-5',     name: 'Name Here', image: placeholder, role: 'Director of Socials',      extra: '' },
  { id: 'exec-6',     name: 'Name Here', image: placeholder, role: 'Director of Academics',    extra: '' },
  { id: 'exec-7',     name: 'Name Here', image: placeholder, role: 'Director of Welfare',      extra: '' },
  { id: 'exec-8',     name: 'Name Here', image: placeholder, role: 'Director of Sports',       extra: '' },
  { id: 'exec-9',     name: 'Name Here', image: placeholder, role: 'Director of Health',       extra: '' },
  { id: 'exec-10',    name: 'Name Here', image: placeholder, role: 'Director of Research',     extra: '' },
  { id: 'exec-11',    name: 'Name Here', image: placeholder, role: 'Director of Projects',     extra: '' },
  { id: 'exec-12',    name: 'Name Here', image: placeholder, role: 'Chief Whip',               extra: '' },
  { id: 'exec-13',    name: 'Name Here', image: placeholder, role: 'Year One Representative',  extra: '' },
  { id: 'exec-14',    name: 'Name Here', image: placeholder, role: 'Director of Logistics',   extra: '' },
  { id: 'exec-15',    name: 'Name Here', image: placeholder, role: 'Director of Legal',       extra: '' },
  { id: 'exec-16',    name: 'Name Here', image: placeholder, role: 'Director of ICT',         extra: '' },
  { id: 'exec-17',    name: 'Name Here', image: placeholder, role: 'Director of Publicity',   extra: '' },
  { id: 'exec-18',    name: 'Name Here', image: placeholder, role: 'Director of Finance',     extra: '' },
  { id: 'exec-19',    name: 'Name Here', image: placeholder, role: 'Director of Complaints',  extra: '' },
  { id: 'exec-20',    name: 'Name Here', image: placeholder, role: 'Director of Protocol',    extra: '' },
  { id: 'exec-21',    name: 'Name Here', image: placeholder, role: 'Director of Community',   extra: '' },
  { id: 'exec-22',    name: 'Name Here', image: placeholder, role: 'Director of Strategy',    extra: '' },
  { id: 'exec-23',    name: 'Name Here', image: placeholder, role: 'Director of Press',       extra: '' },
];

const classRepsData: TeamMember[] = classReps.map((rep, idx) => ({
  id: `classrep-${idx}`,
  name: rep.name,
  image: rep.img,
  role: rep.title,
  extra: rep.work,
}));

const pressTeamData: TeamMember[] = [
  { id: 'editor-in-chief', name: 'Name Here', image: placeholder, role: 'Editor-in-Chief',     extra: '500 Level' },
  { id: 'press-0',         name: 'Name Here', image: placeholder, role: 'Deputy Editor',        extra: '500 Level' },
  { id: 'press-1',         name: 'Name Here', image: placeholder, role: 'News Editor',          extra: '400 Level' },
  { id: 'press-2',         name: 'Name Here', image: placeholder, role: 'Social Media Manager', extra: '400 Level' },
  { id: 'press-3',         name: 'Name Here', image: placeholder, role: 'Graphics Designer',    extra: '400 Level' },
  { id: 'press-4',         name: 'Name Here', image: placeholder, role: 'Photographer',         extra: '300 Level' },
  { id: 'press-5',         name: 'Name Here', image: placeholder, role: 'Video Editor',         extra: '400 Level' },
  { id: 'press-6',         name: 'Name Here', image: placeholder, role: 'Reporter',             extra: '300 Level' },
  { id: 'press-7',         name: 'Name Here', image: placeholder, role: 'Reporter',             extra: '300 Level' },
  { id: 'press-8',         name: 'Name Here', image: placeholder, role: 'Reporter',             extra: '200 Level' },
  { id: 'press-9',         name: 'Name Here', image: placeholder, role: 'Content Writer',       extra: '400 Level' },
];

const DEFAULT_DRIVE_URL = 'https://drive.google.com/file/d/1Vv_k_nvjAZ1Wi8QnpFa5wlsWCsns7918/view?usp=drivesdk';

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminTeamUpload() {
  const [teams, setTeams] = useState<Record<TeamType, TeamMember[]>>({
    executive: executiveTeamData,
    classRep:  classRepsData,
    press:     pressTeamData,
  });

  const [driveUrl,      setDriveUrl]      = useState(DEFAULT_DRIVE_URL);
  const [driveDraft,    setDriveDraft]    = useState(DEFAULT_DRIVE_URL);
  const [editingDrive,  setEditingDrive]  = useState(false);
  const [savingDrive,   setSavingDrive]   = useState(false);
  const [driveSaved,    setDriveSaved]    = useState(false);

  useEffect(() => {
    // Load team member overrides from Supabase
    supabase
      .from('team_images')
      .select('team_type, member_id, image_url, name, role, extra')
      .then(({ data, error }) => {
        if (error || !data) return;
        const updates: Record<string, Partial<TeamMember>> = {};
        data.forEach((row) => {
          if (row.team_type && row.member_id) {
            updates[`${row.team_type}_${row.member_id}`] = {
              ...(row.image_url && { image: row.image_url }),
              ...(row.name      && { name:  row.name }),
              ...(row.role      && { role:  row.role }),
              ...(row.extra     && { extra: row.extra }),
            };
          }
        });
        setTeams((prev) => {
          const merged = {} as Record<TeamType, TeamMember[]>;
          (Object.keys(prev) as TeamType[]).forEach((t) => {
            merged[t] = prev[t].map((m) => {
              const patch = updates[`${t}_${m.id}`];
              return patch ? { ...m, ...patch } : m;
            });
          });
          return merged;
        });
      });

    // Load Drive URL from site_settings
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'appointees_drive_url')
      .single()
      .then(({ data }) => {
        if (data?.value) {
          setDriveUrl(data.value);
          setDriveDraft(data.value);
        }
      });
  }, []);

  const saveDriveUrl = async () => {
    setSavingDrive(true);
    await supabase
      .from('site_settings')
      .upsert({ key: 'appointees_drive_url', value: driveDraft.trim() }, { onConflict: 'key' });
    setDriveUrl(driveDraft.trim());
    setSavingDrive(false);
    setEditingDrive(false);
    setDriveSaved(true);
    setTimeout(() => setDriveSaved(false), 2500);
  };

  const handleImageUpdate = (teamType: TeamType, memberId: string, newImageUrl: string) => {
    setTeams((prev) => ({
      ...prev,
      [teamType]: prev[teamType].map((m) =>
        m.id === memberId ? { ...m, image: newImageUrl } : m
      ),
    }));
  };

  const handleMemberUpdate = (
    teamType: TeamType,
    memberId: string,
    fields: { name?: string; role?: string; extra?: string }
  ) => {
    setTeams((prev) => ({
      ...prev,
      [teamType]: prev[teamType].map((m) =>
        m.id === memberId ? { ...m, ...fields } : m
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Team Management</h1>
          <p className="text-sm text-gray-500">
            Click any photo to upload a new one. Click any name or title to edit inline — changes save instantly.
          </p>
        </div>

        {/* Google Drive Link Manager */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <IoLink className="text-green-600 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">All Appointees — Google Drive Link</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                This link powers the "View All Appointees" button on the public Executive Team page.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
            {editingDrive ? (
              <>
                <input
                  autoFocus
                  value={driveDraft}
                  onChange={(e) => setDriveDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveDriveUrl();
                    if (e.key === 'Escape') { setDriveDraft(driveUrl); setEditingDrive(false); }
                  }}
                  className="flex-1 min-w-0 bg-white border border-green-500 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200 font-mono"
                  placeholder="https://drive.google.com/..."
                />
                <button
                  onClick={saveDriveUrl}
                  disabled={savingDrive}
                  className="flex-shrink-0 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {savingDrive ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : <IoCheckmark className="text-base" />}
                  Save
                </button>
                <button
                  onClick={() => { setDriveDraft(driveUrl); setEditingDrive(false); }}
                  className="flex-shrink-0 px-3 py-2 border border-gray-200 text-gray-500 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-0 text-sm text-blue-600 underline truncate font-mono"
                >
                  {driveUrl}
                </a>
                {driveSaved && (
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1 flex-shrink-0">
                    <IoCheckmark /> Saved
                  </span>
                )}
                <button
                  onClick={() => { setDriveDraft(driveUrl); setEditingDrive(true); }}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  <IoPencil className="text-sm" /> Edit Link
                </button>
              </>
            )}
          </div>
        </div>

        {/* Executive Team */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <TeamUploadManager
            members={teams.executive}
            teamType="executive"
            teamName="EBSUMSA Executive Team"
            onImageUpdate={(id, url) => handleImageUpdate('executive', id, url)}
            onMemberUpdate={(id, fields) => handleMemberUpdate('executive', id, fields)}
          />
        </div>

        {/* Class Representatives */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <TeamUploadManager
            members={teams.classRep}
            teamType="classRep"
            teamName="Class Representatives"
            onImageUpdate={(id, url) => handleImageUpdate('classRep', id, url)}
            onMemberUpdate={(id, fields) => handleMemberUpdate('classRep', id, fields)}
          />
        </div>

        {/* Press Team */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <TeamUploadManager
            members={teams.press}
            teamType="press"
            teamName="Press Team"
            onImageUpdate={(id, url) => handleImageUpdate('press', id, url)}
            onMemberUpdate={(id, fields) => handleMemberUpdate('press', id, fields)}
          />
        </div>

      </div>
    </div>
  );
}
