import { useMemo, useState } from "react";
import { Mail, Phone, MapPin, Clock3, Send } from "lucide-react";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTheme } from "../components/ThemeContext";

const contactCards = [
  { icon: Mail,   title: "Email",         content: "disputeresolutionhub@gmail.com", href: "mailto:disputeresolutionhub@gmail.com" },
  { icon: Phone,  title: "Phone",         content: "1234567890",                     href: "tel:1234567890" },
  { icon: MapPin, title: "Location",      content: "Westlands Business Park, 3rd Floor, Nairobi" },
  { icon: Clock3, title: "Working hours", content: "Monday - Saturday, 8:00 AM - 6:00 PM" },
];

const inputClass =
  "w-full rounded-lg border border-border bg-input-background px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 focus:border-[#E87722] focus:outline-none";

export default function ContactPage() {
  const { theme } = useTheme();
  const [form, setForm]               = useState({ fullName: "", email: "", message: "" });
  const [errors, setErrors]           = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState({ type: "idle", message: "" });

  const validationSchema = useMemo(
    () =>
      yup.object({
        fullName: yup.string().trim().min(2, "Full name must be at least 2 characters").max(120).required("Full name is required"),
        email:    yup.string().trim().email("Enter a valid email address").required("Email is required"),
        message:  yup.string().trim().min(10, "Message must be at least 10 characters").max(2000).required("Message is required"),
      }),
    []
  );

  const contactEndpoint = `${(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000").replace(/\/$/, "")}/api/contact`;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitState({ type: "idle", message: "" });
    try {
      const payload = await validationSchema.validate(form, { abortEarly: false });
      setErrors({});
      setIsSubmitting(true);

      const response = await fetch(contactEndpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = data?.message || "Unable to submit your request right now.";
        setSubmitState({ type: "error", message: msg });
        toast.error(msg);
        return;
      }

      const msg = data?.message || "Your message has been sent. We will contact you soon.";
      setSubmitState({ type: "success", message: msg });
      toast.success(msg);
      setForm({ fullName: "", email: "", message: "" });
    } catch (error) {
      if (error.name === "ValidationError") {
        const nextErrors = {};
        for (const issue of error.inner) {
          if (issue.path && !nextErrors[issue.path]) nextErrors[issue.path] = issue.message;
        }
        setErrors(nextErrors);
        return;
      }
      setSubmitState({ type: "error", message: "Network error. Please check your connection and try again." });
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main id="main-content" className="pt-16 sm:pt-17">

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-border px-4 py-16 sm:px-6 sm:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(232,119,34,0.12),transparent_55%)]" />
          <div className="relative mx-auto max-w-[1100px]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#E87722]">
              Contact us
            </p>
            <h1 className="max-w-[18ch] text-3xl font-semibold tracking-tight sm:text-5xl">
              Reach DR Hub support and bookings team
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/65 sm:mt-5 sm:text-lg">
              Have a question about room availability, professional requirements, or custom booking needs?
              Contact us and our team will get back to you quickly.
            </p>
          </div>
        </section>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="mx-auto grid max-w-[1100px] gap-6 lg:grid-cols-2">

            {/* Map + contact cards */}
            <article className="rounded-2xl border border-border bg-card p-4 sm:p-6">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Find us in Westlands, Nairobi</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/65 sm:text-base">
                Visit DR Hub at Westlands Business Park. Use the map below for quick directions.
              </p>
              <div className="mt-5 overflow-hidden rounded-xl border border-border">
                <iframe
                  title="DR Hub location in Nairobi Westlands"
                  src="https://maps.google.com/maps?q=Westlands%20Nairobi&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="h-64 w-full sm:h-80"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {contactCards.map(({ icon, title, content, href }) => {
                  const Icon = icon;
                  return (
                    <div
                      key={title}
                      className="rounded-xl border border-border bg-background p-4 transition-colors hover:border-[#E87722]/45"
                    >
                      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E87722]/15 text-[#E87722] ring-1 ring-[#E87722]/25">
                        <Icon className="h-4 w-4" aria-hidden />
                      </div>
                      <h3 className="text-sm font-semibold">{title}</h3>
                      {href ? (
                        <a href={href} className="mt-1 inline-block break-all text-sm text-foreground/70 transition-colors hover:text-[#E87722]">
                          {content}
                        </a>
                      ) : (
                        <p className="mt-1 break-words text-sm text-foreground/70">{content}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>

            {/* Contact form */}
            <article className="rounded-2xl border border-border bg-card p-5 sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Send us a message</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/65 sm:text-base">
                Share your inquiry and our team will respond as soon as possible.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-foreground/85">Full name</label>
                  <input id="fullName" name="fullName" type="text" autoComplete="name" value={form.fullName} onChange={handleChange} className={inputClass} placeholder="Enter your full name" />
                  {errors.fullName ? <p className="mt-2 text-xs text-red-400">{errors.fullName}</p> : null}
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground/85">Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="you@example.com" />
                  {errors.email ? <p className="mt-2 text-xs text-red-400">{errors.email}</p> : null}
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground/85">Message</label>
                  <textarea id="message" name="message" rows={6} value={form.message} onChange={handleChange} className={`${inputClass} resize-y`} placeholder="Tell us how we can help you..." />
                  {errors.message ? <p className="mt-2 text-xs text-red-400">{errors.message}</p> : null}
                </div>

                {submitState.type === "success" ? (
                  <p className="rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-200">
                    {submitState.message}
                  </p>
                ) : null}

                {submitState.type === "error" ? (
                  <p className="rounded-lg border border-red-400/35 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-200">
                    {submitState.message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#E87722] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#f08f43] disabled:cursor-not-allowed disabled:opacity-65"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  {isSubmitting ? "Sending..." : "Send message"}
                </button>
              </form>
            </article>
          </div>
        </section>
      </main>

      <Footer />

      {/* ToastContainer uses the current theme so toasts match the UI */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme={theme}
      />
    </div>
  );
}