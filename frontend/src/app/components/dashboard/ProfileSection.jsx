import { Button } from "../ui/button";
import { formatProfileDate } from "../../lib/formatters";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.split(" ");
  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0].toUpperCase();
}

const fieldClass =
  "w-full rounded-lg border border-border bg-input-background px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none transition-all focus:border-[#E87722]/50 focus:ring-2 focus:ring-[#E87722]/20";

export function ProfileSection({ profileForm, profileLoading, onUpdateField }) {
  if (profileLoading) {
    return (
      <section className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#E87722]/20 border-t-[#E87722]" />
          <p className="mt-4 text-foreground/50">Loading profile...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Profile Settings</h2>
        <p className="mt-1 text-sm text-foreground/50">Manage your personal information and account details</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        {/* Avatar row */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#E87722] to-[#d46a1a] text-2xl font-bold text-white shadow-lg shadow-[#E87722]/30">
            {getInitials(profileForm.name)}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{profileForm.name || "User"}</h3>
            <p className="text-sm text-foreground/50">{profileForm.occupation || "No occupation specified"}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {profileForm.role}
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {profileForm.status}
              </span>
            </div>
          </div>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              { id: "name",        label: "Full Name",     type: "text" },
              { id: "email",       label: "Email Address", type: "email" },
              { id: "phoneNumber", label: "Phone Number",  type: "tel" },
            ].map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="mb-2 block text-sm font-medium text-foreground/80">
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type={field.type}
                  className={fieldClass}
                  value={profileForm[field.id]}
                  onChange={(e) => onUpdateField(field.id, e.target.value)}
                />
              </div>
            ))}

            <div>
              <label htmlFor="gender" className="mb-2 block text-sm font-medium text-foreground/80">Gender</label>
              <select
                id="gender"
                className={fieldClass}
                value={profileForm.gender}
                onChange={(e) => onUpdateField("gender", e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            {[
              { id: "occupation", label: "Occupation",  placeholder: undefined },
              { id: "address",    label: "Address",     placeholder: "Street address" },
              { id: "city",       label: "City",        placeholder: "e.g. Nairobi" },
              { id: "country",    label: "Country",     placeholder: "e.g. Kenya" },
            ].map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="mb-2 block text-sm font-medium text-foreground/80">
                  {field.label}
                </label>
                <input
                  id={field.id}
                  className={fieldClass}
                  value={profileForm[field.id]}
                  onChange={(e) => onUpdateField(field.id, e.target.value)}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>

          {/* Account info — read only */}
          <div className="border-t border-border pt-6">
            <h4 className="mb-4 text-sm font-semibold text-foreground/70">Account Information</h4>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[["Account Created", profileForm.createdAt], ["Last Updated", profileForm.updatedAt]].map(([label, val]) => (
                <div key={label}>
                  <label className="mb-2 block text-sm font-medium text-foreground/50">{label}</label>
                  <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground/60">
                    {formatProfileDate(val)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="button"
            className="rounded-lg bg-[#E87722] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E87722]/20 hover:bg-[#d46a1a]"
          >
            Save Changes
          </Button>
        </form>
      </div>
    </section>
  );
}