import { Button } from "../ui/button";
import { formatProfileDate } from "../../lib/formatters";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.split(" ");
  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0].toUpperCase();
}

export function ProfileSection({ profileForm, profileLoading, onUpdateField }) {
  if (profileLoading) {
    return (
      <section className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#E87722]/20 border-t-[#E87722]" />
          <p className="mt-4 text-slate-400">Loading profile...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Profile Settings</h2>
        <p className="mt-1 text-sm text-slate-400">Manage your personal information and account details</p>
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-800/80 p-6 shadow-sm md:p-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#E87722] to-[#d46a1a] text-2xl font-bold text-white shadow-lg shadow-[#E87722]/30">
            {getInitials(profileForm.name)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{profileForm.name || "User"}</h3>
            <p className="text-sm text-slate-400">{profileForm.occupation || "No occupation specified"}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                {profileForm.role}
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                {profileForm.status}
              </span>
            </div>
          </div>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              { id: "name", label: "Full Name", type: "text" },
              { id: "email", label: "Email Address", type: "email" },
              { id: "phoneNumber", label: "Phone Number", type: "tel" },
            ].map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="mb-2 block text-sm font-medium text-slate-300">
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type={field.type}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition-all focus:border-[#E87722]/50 focus:bg-slate-700 focus:ring-2 focus:ring-[#E87722]/20"
                  value={profileForm[field.id]}
                  onChange={(e) => onUpdateField(field.id, e.target.value)}
                />
              </div>
            ))}
            <div>
              <label htmlFor="gender" className="mb-2 block text-sm font-medium text-slate-300">
                Gender
              </label>
              <select
                id="gender"
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white outline-none transition-all focus:border-[#E87722]/50 focus:bg-slate-700 focus:ring-2 focus:ring-[#E87722]/20"
                value={profileForm.gender}
                onChange={(e) => onUpdateField("gender", e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            {[
              { id: "occupation", label: "Occupation", placeholder: undefined },
              { id: "address", label: "Address", placeholder: "Street address" },
              { id: "city", label: "City", placeholder: "e.g. Nairobi" },
              { id: "country", label: "Country", placeholder: "e.g. Kenya" },
            ].map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="mb-2 block text-sm font-medium text-slate-300">
                  {field.label}
                </label>
                <input
                  id={field.id}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition-all focus:border-[#E87722]/50 focus:bg-slate-700 focus:ring-2 focus:ring-[#E87722]/20"
                  value={profileForm[field.id]}
                  onChange={(e) => onUpdateField(field.id, e.target.value)}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>

          <div className="border-t border-slate-700/50 pt-6">
            <h4 className="mb-4 text-sm font-semibold text-slate-300">Account Information</h4>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">
                  Account Created
                </label>
                <div className="rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-slate-400">
                  {formatProfileDate(profileForm.createdAt)}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">
                  Last Updated
                </label>
                <div className="rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-slate-400">
                  {formatProfileDate(profileForm.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Button type="button" className="rounded-lg bg-[#E87722] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E87722]/20 transition-all hover:bg-[#d46a1a] hover:shadow-[#E87722]/30">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}