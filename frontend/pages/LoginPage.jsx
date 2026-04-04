/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Mail, Lock, Eye, ArrowRight } from "lucide-react";

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <section className="grid min-h-screen w-full grid-cols-1 bg-black text-left text-slate-100 lg:grid-cols-2">
            
            <div className="w-full px-6 py-8 lg:px-10 lg:py-10">
                <div className="mx-auto w-full max-w-140 p-6 sm:p-10">
                <h1 className="text-5xl font-semibold tracking-tight text-white mb-4">Welcome Back</h1>
                <p className="mt-3 text-xl text-slate-400">Sign in to access your bookings and profile</p>

                <form method="POST" onSubmit={handleSubmit} className="mt-12 flex flex-col gap-7">
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-lg font-semibold text-slate-100">Email Address</label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            <input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-14 w-full border border-slate-700 bg-linear-to-r from-[#14171d] to-[#1a1d22] pl-12 pr-4 text-lg text-slate-100 outline-none placeholder:text-slate-500 focus:border-[#EC7B1D]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-lg font-semibold text-slate-100">Password</label>
                        <div className="relative">
                            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 w-full border border-slate-700 bg-linear-to-r from-[#14171d] to-[#1a1d22] pl-12 pr-12 text-lg text-slate-100 outline-none placeholder:text-slate-500 focus:border-[#EC7B1D]"
                            />
                            <Eye className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-lg">
                        <label className="inline-flex items-center gap-3 text-slate-300">
                            <input type="checkbox" className="h-5 w-5 border-slate-500 bg-transparent accent-[#EC7B1D]" />
                            Remember me
                        </label>
                        <a href="/forgot-password" className="font-semibold text-[#EC7B1D] hover:text-[#ff8b30]">Forgot password?</a>
                    </div>

                    <button className="mt-2 inline-flex h-14 items-center justify-center gap-3 bg-[#EC7B1D] text-lg font-semibold text-white transition hover:bg-[#ff8b30]" type="submit">
                        Sign In <ArrowRight className="h-5 w-5" />
                    </button>

                    {error && <div className="text-base text-red-400">{error}</div>}
                </form>
                <div className="mt-4 w-full flex justify-evenly items-center lg:h-10 py-4">
                    <h1 className="font-semibold text-xl">OR</h1>
                </div>

                <div className="mt-8 grid grid-rows-2 gap-2 text-base text-slate-400 w-full  " >
                    <div className="border-b-2 border-amber-100 pb-4 h-full w-full ">
                        <p>Don't have an account? <a className="text-[#EC7B1D] hover:text-[#ff8b30]" href="/signup">Book a space to continue</a></p>
                    </div>
                    <div className=" h-full text-center py-5">
                        <p>Admin? <a className="text-[#EC7B1D] hover:text-[#ff8b30]" href="/admin">Login here</a></p>
                    </div>
                    
                </div>
            </div>

            </div>
            <div className="relative isolate hidden h-full min-h-screen w-full overflow-hidden bg-[url('/login-banner.jpeg')] bg-cover bg-center bg-no-repeat lg:flex lg:flex-col lg:justify-center">
                <div className="absolute inset-0 bg-linear-to-r from-black/99 via-black/72 to-transparent"></div>
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-black/35"></div>
                <div className="relative z-10 flex h-full max-w-160 flex-col justify-center gap-5 p-8 text-start lg:p-10">
                    <h2 className="lg:text-lg text-sm font-bold text-[#EC7B1D]">PREMIUM LEGAL WORKSPACE</h2>
                    <h1 className="max-w-3xl text-slate-200 lg:text-4xl text-2xl">
                        Professional Meeting Spaces in the Heart of Westlands
                    </h1>
                    <p className="max-w-3xl text-slate-100 lg:text-xl text-lg">
                        Join hundreds of legal professionals who trust The DR Hub for their dispute resolution needs.
                    </p>
                    <ul className="mx-auto list-disc marker:text-orange-500 text-start text-lg flex flex-col gap-3 pl-5  w-full">
                        <li>Soundproofed boardrooms & private offices</li>
                        <li>High-speed WiFi & AV equipment</li>
                        <li>Complimentary parking & refreshments</li>
                    </ul>
                   
                </div>
            </div>
        </section>
    );
};