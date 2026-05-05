import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/button";
import registerImg from "../../assets/registerImage.jpg";
import { ArrowRight, User, Mail, Phone, Briefcase } from "lucide-react";
import { BACKEND_URL } from "../../services/constants";

const inputClass =
  "w-full bg-card border border-border text-foreground placeholder:text-foreground/35 h-12 rounded-none pl-12 pr-4 text-sm outline-none transition-colors focus:border-[#E87722] focus:ring-2 focus:ring-[#E87722]/20";

const inputClassNoIcon =
  "w-full bg-card border border-border text-foreground placeholder:text-foreground/35 h-12 rounded-none px-4 text-sm outline-none transition-colors focus:border-[#E87722] focus:ring-2 focus:ring-[#E87722]/20";

const selectClass =
  "w-full cursor-pointer bg-card border border-border text-foreground h-12 rounded-none px-4 text-sm outline-none transition-colors focus:border-[#E87722] focus:ring-2 focus:ring-[#E87722]/20";

function validatePhone(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 9)  return "Enter a valid phone number";
  if (digits.length > 15) return "Phone number is too long";
  return true;
}

export function RegisterPage() {
  const navigate     = useNavigate();
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: "", lastName: "", email: "", phone: "",
      gender: "", occupation: "", password: "", confirmPassword: "", acceptTerms: false,
    },
  });

  const onSubmit = async (values) => {
    setSubmitError("");

    const payload = {
      name:        `${values.firstName} ${values.lastName}`.trim(),
      phoneNumber: values.phone,
      gender:      values.gender,
      email:       values.email,
      password:    values.password,
      occupation:  values.occupation,
    };

    let response;
    try {
      response = await fetch(`${BACKEND_URL}/api/users/self-registration`, {
        method:  "POST",
        headers: { Accept: "*/*", "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
    } catch {
      setSubmitError("Could not reach the server. Please check your connection and try again.");
      return;
    }

    if (!response.ok) {
      const rawMessage = await response.text();
      setSubmitError(rawMessage || "Registration failed. Please review your details and try again.");
      return;
    }

    navigate("/login?registered=1", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left — registration form ────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12">
        <div className="max-w-[520px] mx-auto w-full">

          {/* Back to home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/50 transition-colors hover:text-foreground mb-10"
          >
            <ArrowRight className="h-4 w-4 rotate-180" aria-hidden />
            Back to home
          </Link>

          {/* Logo */}
          <Link to="/" className="inline-block mb-10">
            <Logo />
          </Link>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-foreground mb-4 tracking-tight" style={{ fontSize: '38px', lineHeight: '1.1' }}>
              Create your account
            </h1>
            <p className="text-muted-foreground text-base">
              Join DR Hub to book premium workspace in Westlands.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Name row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="register-first-name" className="block text-sm text-foreground/80">First name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="register-first-name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Jane"
                    className={inputClass}
                    {...register("firstName", { required: "Enter your first name", minLength: { value: 2, message: "Too short" } })}
                    aria-invalid={errors.firstName ? "true" : "false"}
                  />
                </div>
                {errors.firstName ? <p className="text-xs text-red-400" role="alert">{errors.firstName.message}</p> : null}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="register-last-name" className="block text-sm text-foreground/80">Last name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="register-last-name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Wanjiku"
                    className={inputClass}
                    {...register("lastName", { required: "Enter your last name", minLength: { value: 2, message: "Too short" } })}
                    aria-invalid={errors.lastName ? "true" : "false"}
                  />
                </div>
                {errors.lastName ? <p className="text-xs text-red-400" role="alert">{errors.lastName.message}</p> : null}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="register-email" className="block text-sm text-foreground/80">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@chambers.co.ke"
                  className={inputClass}
                  {...register("email", {
                    required: "Enter your email",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                  })}
                  aria-invalid={errors.email ? "true" : "false"}
                />
              </div>
              {errors.email ? <p className="text-xs text-red-400" role="alert">{errors.email.message}</p> : null}
            </div>

            {/* Phone + Gender row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="register-phone" className="block text-sm text-foreground/80">Phone number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="register-phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+254 712 345 678"
                    className={inputClass}
                    {...register("phone", { required: "Enter your phone number", validate: validatePhone })}
                    aria-invalid={errors.phone ? "true" : "false"}
                  />
                </div>
                {errors.phone
                  ? <p className="text-xs text-red-400" role="alert">{errors.phone.message}</p>
                  : <p className="text-xs text-foreground/40">Include country code if outside Kenya.</p>
                }
              </div>

              <div className="space-y-1.5">
                <label htmlFor="register-gender" className="block text-sm text-foreground/80">Gender</label>
                <select
                  id="register-gender"
                  className={selectClass}
                  {...register("gender", { required: "Select your gender" })}
                  aria-invalid={errors.gender ? "true" : "false"}
                >
                  <option value="" disabled>Select gender</option>
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                </select>
                {errors.gender ? <p className="text-xs text-red-400" role="alert">{errors.gender.message}</p> : null}
              </div>
            </div>

            {/* Occupation */}
            <div className="space-y-1.5">
              <label htmlFor="register-occupation" className="block text-sm text-foreground/80">Occupation</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="register-occupation"
                  type="text"
                  autoComplete="organization-title"
                  placeholder="e.g. Divorce Lawyer"
                  className={inputClass}
                  {...register("occupation", { required: "Enter your occupation", minLength: { value: 2, message: "Too short" } })}
                  aria-invalid={errors.occupation ? "true" : "false"}
                />
              </div>
              {errors.occupation ? <p className="text-xs text-red-400" role="alert">{errors.occupation.message}</p> : null}
            </div>

            {/* Password row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="register-password" className="block text-sm text-foreground/80">Password</label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className={inputClassNoIcon}
                  {...register("password", {
                    required: "Choose a password",
                    minLength: { value: 8, message: "At least 8 characters" },
                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: "Include upper, lower, and a number" },
                  })}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password
                  ? <p className="text-xs text-red-400" role="alert">{errors.password.message}</p>
                  : <p className="text-xs text-foreground/40">Upper, lower, and a number.</p>
                }
              </div>

              <div className="space-y-1.5">
                <label htmlFor="register-confirm" className="block text-sm text-foreground/80">Confirm password</label>
                <input
                  id="register-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  className={inputClassNoIcon}
                  {...register("confirmPassword", {
                    required: "Confirm your password",
                    validate: (value) => value === getValues("password") || "Passwords do not match",
                  })}
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                />
                {errors.confirmPassword ? <p className="text-xs text-red-400" role="alert">{errors.confirmPassword.message}</p> : null}
              </div>
            </div>

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground/70">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border bg-card text-[#E87722] focus:ring-2 focus:ring-[#E87722]/30"
                {...register("acceptTerms", { required: "You must accept the terms to continue" })}
                aria-invalid={errors.acceptTerms ? "true" : "false"}
              />
              <span>
                I agree to the{" "}
                <a href="#" className="text-[#E87722] hover:underline">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-[#E87722] hover:underline">Privacy Policy</a>.
              </span>
            </label>
            {errors.acceptTerms ? <p className="text-xs text-red-400" role="alert">{errors.acceptTerms.message}</p> : null}

            {/* Server error */}
            {submitError ? <p className="text-sm text-red-400" role="alert">{submitError}</p> : null}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#E87722] text-white hover:bg-[#d46a1a] h-14 text-base rounded-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating account…" : "Create Account"}
              {!isSubmitting && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>

            {/* Sign in link */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-[#E87722] hover:text-foreground transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* ── Right — hero image ──────────────────────────────────────────── */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${registerImg})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>

        <div className="relative h-full flex flex-col justify-end p-12">
          <div className="max-w-[500px]">
            <div className="text-[#E87722] text-xs uppercase tracking-widest mb-4">
              Join DR Hub
            </div>
            <h2 className="text-foreground mb-6 tracking-tight" style={{ fontSize: '36px', lineHeight: '1.2' }}>
              Your workspace for confidential legal work in Westlands
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Trusted by advocates, ADR practitioners, and legal consultants across Nairobi.
            </p>
            <div className="mt-8 space-y-3">
              {[
                "Book boardrooms, private offices, and combined spaces",
                "Verified professional environment",
                "Flexible slots — morning, afternoon, or evening",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-foreground/70 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E87722] shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}