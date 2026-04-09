/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Mail, Lock, Eye, ShieldCheck, ArrowRight } from "lucide-react";


export const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <section className="grid min-h-screen w-full grid-cols-1 bg-black text-left text-slate-100 lg:grid-cols-2">
            
            <div className="relative isolate hidden min-h-screen w-full overflow-hidden bg-[url('/login-banner.jpeg')] bg-cover bg-center bg-no-repeat lg:flex lg:flex-col lg:justify-center" >
                <div className="absolute inset-0 bg-black/35"></div>
                <div className="absolute inset-y-0 right-0 w-44 bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.42)_42%,rgba(0,0,0,0.82)_74%,rgba(0,0,0,1)_100%)]"></div>
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-black/35"></div>
                <div className="relative z-10 mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center gap-4 p-10 text-center">
                    <ShieldCheck className="h-14 w-14 text-[#EC7B1D]" />
                    <h1 className="text-5xl font-semibold tracking-tight text-white">DR
                        <span className="text-5xl font-bold text-[#EC7B1D]">
                            Hub

                        </span>
                        </h1>
                    <p className="text-2xl font-semibold text-[#EC7B1D]">Admin
                        
                        <span className="text-2xl font-bold text-white">
                            Portal
                        </span>
                         
                         
                         </p>
                    <p className="max-w-xl text-lg text-slate-200">
                        Manage rooms, bookings, and member access from a secure dashboard.
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md  bg-black p-8 shadow-xl">
                    <h2 className="mb-4 lg:text-4xl font-semibold tracking-tight text-white">Admin Login</h2>
                    <p className="mb-8 text-lg text-slate-400">Sign in with your administrator account</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6 mt-5">
                        {error && (
                            <div className="rounded border border-red-500/40 bg-red-900/40 p-3 text-red-100">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-100">Email</label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-13 w-full border border-slate-700 bg-linear-to-r from-[#14171d] to-[#1a1d22] pl-12 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-[#EC7B1D]"
                                    placeholder="admin@drhub.com"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-100">Password</label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-13 w-full border border-slate-700 bg-linear-to-r from-[#14171d] to-[#1a1d22] pl-12 pr-12 text-white outline-none placeholder:text-slate-500 focus:border-[#EC7B1D]"
                                    placeholder="Enter admin password"
                                    required
                                />
                                <Eye className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            </div>
                        </div>

                        <a href="/forgot-password" className="inline-block text-sm font-semibold text-[#EC7B1D] hover:text-[#ff8b30]">
                            Forgot password?
                        </a>
                        
                        <button
                            type="submit"
                            className="inline-flex h-13 w-full items-center justify-center gap-2 bg-[#EC7B1D] text-base font-semibold text-white transition hover:bg-[#ff8b30]"
                        >
                            Login <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>
        </section>
    )
}