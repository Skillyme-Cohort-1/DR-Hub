import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";

const inputClassName =
  "w-full rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20";

const selectClassName =
  "w-full cursor-pointer rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none transition-colors focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20";

function validatePhone(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 9) return "Enter a valid phone number";
  if (digits.length > 15) return "Phone number is too long";
  return true;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "",
      occupation: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (values) => {
    setSubmitError("");

    const payload = {
      name: `${values.firstName} ${values.lastName}`.trim(),
      phoneNumber: values.phone,
      gender: values.gender,
      email: values.email,
      password: values.password,
      occupation: values.occupation,
    };

    let response;
    try {
      response = await fetch("http://localhost:3000/api/users/self-registration", {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
    <AuthLayout
      wide
      title="Create your account"
      subtitle="Join DR Hub to book premium workspace in Westlands."
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2"
        noValidate
      >
        <div>
          <label htmlFor="register-first-name" className="mb-2 block text-sm font-medium text-white/80">
            First name
          </label>
          <input
            id="register-first-name"
            type="text"
            autoComplete="given-name"
            className={inputClassName}
            placeholder="Jane"
            {...register("firstName", {
              required: "Enter your first name",
              minLength: { value: 2, message: "Too short" },
            })}
            aria-invalid={errors.firstName ? "true" : "false"}
          />
          {errors.firstName ? (
            <p className="mt-1.5 text-sm text-red-400" role="alert">
              {errors.firstName.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="register-last-name" className="mb-2 block text-sm font-medium text-white/80">
            Last name
          </label>
          <input
            id="register-last-name"
            type="text"
            autoComplete="family-name"
            className={inputClassName}
            placeholder="Wanjiku"
            {...register("lastName", {
              required: "Enter your last name",
              minLength: { value: 2, message: "Too short" },
            })}
            aria-invalid={errors.lastName ? "true" : "false"}
          />
          {errors.lastName ? (
            <p className="mt-1.5 text-sm text-red-400" role="alert">
              {errors.lastName.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-white/80">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            className={inputClassName}
            placeholder="you@chambers.co.ke"
            {...register("email", {
              required: "Enter your email",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            })}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email ? (
            <p className="mt-1.5 text-sm text-red-400" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="register-phone" className="mb-2 block text-sm font-medium text-white/80">
            Phone number
          </label>
          <input
            id="register-phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={inputClassName}
            placeholder="+254 712 345 678"
            {...register("phone", {
              required: "Enter your phone number",
              validate: validatePhone,
            })}
            aria-invalid={errors.phone ? "true" : "false"}
          />
          {errors.phone ? (
            <p className="mt-1.5 text-sm text-red-400" role="alert">
              {errors.phone.message}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-white/40">Include country code if outside Kenya.</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="register-gender" className="mb-2 block text-sm font-medium text-white/80">
            Gender
          </label>
          <select
            id="register-gender"
            className={selectClassName}
            {...register("gender", { required: "Select your gender" })}
            aria-invalid={errors.gender ? "true" : "false"}
          >
            <option value="" disabled>
              Select gender
            </option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
          </select>
          {errors.gender ? (
            <p className="mt-1.5 text-sm text-red-400" role="alert">
              {errors.gender.message}
            </p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="register-occupation" className="mb-2 block text-sm font-medium text-white/80">
            Occupation
          </label>
          <input
            id="register-occupation"
            type="text"
            autoComplete="organization-title"
            className={inputClassName}
            placeholder="e.g. Divorce Lawyer"
            {...register("occupation", {
              required: "Enter your occupation",
              minLength: { value: 2, message: "Too short" },
            })}
            aria-invalid={errors.occupation ? "true" : "false"}
          />
          {errors.occupation ? (
            <p className="mt-1.5 text-sm text-red-400" role="alert">
              {errors.occupation.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-white/80">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            className={inputClassName}
            placeholder="At least 8 characters"
            {...register("password", {
              required: "Choose a password",
              minLength: { value: 8, message: "At least 8 characters" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: "Include upper, lower, and a number",
              },
            })}
            aria-invalid={errors.password ? "true" : "false"}
          />
          {errors.password ? (
            <p className="mt-1.5 text-sm text-red-400" role="alert">
              {errors.password.message}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-white/40">Use 8+ characters with upper, lower, and a number.</p>
          )}
        </div>

        <div>
          <label htmlFor="register-confirm" className="mb-2 block text-sm font-medium text-white/80">
            Confirm password
          </label>
          <input
            id="register-confirm"
            type="password"
            autoComplete="new-password"
            className={inputClassName}
            placeholder="Repeat password"
            {...register("confirmPassword", {
              required: "Confirm your password",
              validate: (value) =>
                value === getValues("password") || "Passwords do not match",
            })}
            aria-invalid={errors.confirmPassword ? "true" : "false"}
          />
          {errors.confirmPassword ? (
            <p className="mt-1.5 text-sm text-red-400" role="alert">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-white/70 md:col-span-2">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-[#141414] text-[#E67E22] focus:ring-2 focus:ring-[#E67E22]/30"
            {...register("acceptTerms", {
              required: "You must accept the terms to continue",
            })}
            aria-invalid={errors.acceptTerms ? "true" : "false"}
          />
          <span>
            I agree to the{" "}
            <a href="#" className="text-[#E67E22] hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#E67E22] hover:underline">
              Privacy Policy
            </a>
            .
          </span>
        </label>
        {errors.acceptTerms ? (
          <p className="text-sm text-red-400 md:col-span-2" role="alert">
            {errors.acceptTerms.message}
          </p>
        ) : null}
        {submitError ? (
          <p className="text-sm text-red-400 md:col-span-2" role="alert">
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#E67E22] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#E67E22]/15 transition-colors hover:bg-[#d35400] disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-white/55">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#E67E22] hover:text-[#f39c4d]">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
