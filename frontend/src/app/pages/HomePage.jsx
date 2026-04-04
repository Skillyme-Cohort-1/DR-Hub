import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import { rooms } from "../components/serviceRooms";
import { Wifi, Volume2, Car, Coffee, MapPin, Check, ArrowRight, Users, Building2, LayoutGrid, Star, ChevronRight } from 'lucide-react';

export default function HomePage() {

      const steps = [
        { number: 1, title: 'Choose your room', description: 'Select from boardroom, private office, or combined space' },
        { number: 2, title: 'Pick a date & time', description: 'Book available slots that fit your schedule' },
        { number: 3, title: 'Upload credentials', description: 'Submit your professional qualifications' },
        { number: 4, title: 'Pay & get confirmed', description: 'Secure payment with instant confirmation' },
    ];

    return (
       <div className="min-h-screen bg-black text-white">

            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[72px]">
                <div
                    className="absolute inset-0 bg-cover bg-center brightness-50"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1771147372634-976f022c0033?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBib2FyZHJvb20lMjBtZWV0aW5nJTIwc3BhY2V8ZW58MXx8fHwxNzc0OTgyODA4fDA&ixlib=rb-4.1.0&q=80&w=1080)'}}
                >
                    <div className="absolute inset-0 bg-black/35" />
                </div>
                <div className="relative z-10 w-full max-w-[1100px] px-6 py-32">
                    <div className="mx-auto flex max-w-[900px] flex-col items-start">
                        <h1 className="text-5xl text-white sm:text-6xl lg:text-7xl mb-8 tracking-tight">Premium Office Space for Legal Professionals</h1>
                    
                        <p className="text-xl text-white/70 max-w-[600px] mb-12">Soundproofed rooms. High-speed connectivity. In the heart of Westlands, Nairobi.</p>
                        <div className="flex flex-wrap gap-4 mb-12 ">
                            <Button className="p-7 bg-orange-400 text-white hover:bg-orange-500 cursor-pointer rounded-xs text-lg cursor-pointer transition-all duration-900">Book a Space {">"}</Button>
                            <Button variant="ghost" className="p-7 text-white border-1 border-gray-500 hover:bg-white hover:text-orange-500 rounded-xs text-lg font-bold cursor-pointer transition-all duration-500 easeinout">Take a Tour</Button>
                        </div>
                        <ul className="list-disc flex flex-wrap gap-10 marker:text-orange-500 pl-4 text-white/80 text-lg">
                            <li>Advocates</li>
                            <li>ADR Practitioners</li>
                            <li>DR Hub Members</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[1100px] px-6 py-20 bg-black">
                <div className="mb-10 max-w-2xl text-white">
                    <h2 className="text-3xl font-semibold sm:text-4xl">Available Rooms</h2>
                    <p className="mt-3 text-base text-slate-400">Choose the room that fits your meeting, hearing, or private work session.</p>
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                    {rooms.map((room) => {
                        const RoomIcon = room.icon;

                        return (
                            <Card key={room.name} className="overflow-hidden p-0 bg-gray-900 border-1 rounded-b-xs border-gray-600 hover:border-orange-500 transition-all duration-500 easeinout">
                                <img src={room.image} alt={room.name} className="h-56 w-full object-cover" />
                                <CardHeader className="px-6 pt-6">
                                    <CardTitle className="flex items-center gap-3 text-xl text-white ">
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                                            <RoomIcon className="h-5 w-5" />
                                        </span>
                                        {room.name}
                                    </CardTitle>
                                    <CardDescription className="text-base">{room.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <Button className="w-full bg-orange-400 text-white hover:bg-orange-500 cursor-pointer rounded-xs">Book this room</Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>
            
            <section className="mt-17 px-20 py-2 mb-30">
                <div className="grid grid-cols lg:grid-cols-2 flex items-center gap-20">
                    <div className="">
                        <h6 className="text-orange-500 font-bold mb-3">AMENITIES</h6>
                        <h1 className="text-6xl">World-Class Facilities</h1>
                        <div className="flex flex-col mt-10 gap-5 text-2xl text-white/70">
                            <span className="flex items-center gap-5">
                                <div className="border-1 border-orange-500 bg-yellow-800/40 rounded-full p-2">
                                    <Wifi className="text-orange-500"/>
                                </div>
                                <p> High-speed WIFI & teleconferencing</p>
                            </span>
                            <span className="flex items-center gap-5">
                                <div  className="border-1 border-orange-500 bg-yellow-800/40 rounded-full p-2">
                                    <Volume2 className="text-orange-500"/>
                                </div>
                                <p>SoundProofed rooms</p>
                            </span>
                            <span className="flex items-center gap-5">
                                <div  className="border-1 border-orange-500 bg-yellow-800/40 rounded-full p-2">
                                    <Car className="text-orange-500"/>
                                </div>
                                <p>Complimentary parking</p>
                            </span>
                            <span className="flex items-center gap-5">
                                <div  className="border-1 border-orange-500 bg-yellow-800/40 rounded-full p-2">
                                    <Coffee className="text-orange-500"/>
                                </div>
                                <p>Refreshments included</p>
                            </span>
                            <span className="flex items-center gap-5">
                                <div  className="border-1 border-orange-500 bg-yellow-800/40 rounded-full p-2">
                                    <MapPin className="text-orange-500"/>
                                </div>
                                <p>Westlands Business Park, 3rd Floor</p>
                            </span>
                        </div>
                    </div>
                    <div>
                        <img src="https://imgs.search.brave.com/3xEEsnbD4eJWKm8uyeResOxaAU9eICRKjJ0-at4GRsE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/cHJvZC53ZWJzaXRl/LWZpbGVzLmNvbS82/NzNmNmNiYjM3ZjIz/MDdhNzVmNjNkMGYv/NjczZjZjYmIzN2Yy/MzA3YTc1ZjY0Mjhl/X3RoZS1tYWRpc29u/LWNvbmZlcmVuY2Ut/cm9vbS1wYXJzaXBw/YW55LmF2aWY" alt="Boardroom Office" className="h-150 w-150" />
                    </div>
                </div>
            </section>

            <hr className="border-[1px] border-white/10"/>
            <section className="pt-30 pb-30 bg-white/4">
                <div className="max-w-[1280px] mx-auto">
                    <div className="flex flex-col gap-4 text-center">
                        <h6 className="text-orange-500 font-bold mb-3">PROCESS</h6>
                        <h1 className="text-6xl">How It Works</h1>
                        <p className="text-white/50">Book your space in four simple steps</p>
                    </div>
                    <div className="grid lg:grid-cols-4 gap-12 mt-20">
                        {steps.map((step) => {
                            return (
                                <div className="relative flex px-6">
                                    <div className="relative flex flex-col items-start">
                                        <span className="text-orange-500/20 text-8xl mb-6">
                                            {step.number}
                                        </span>
                                        <span className="text-2xl mb-5">
                                            {step.title}
                                        </span>
                                        <span className="text-white/60">
                                            {step.description}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

                <section className="bg-black px-6 py-24">
                    <div className="mx-auto max-w-[1280px]">
                        <div className="mx-auto mb-14 max-w-2xl text-center">
                            <h6 className="mb-3 text-sm font-bold tracking-[0.3em] text-orange-500">TESTIMONIALS</h6>
                            <h2 className="text-4xl font-semibold sm:text-5xl">Trusted by legal professionals</h2>
                            <p className="mt-4 text-base text-white/60">Members use DR Hub for confidential meetings, mediation sessions, and focused legal work.</p>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            {[
                                {
                                    name: 'A. Mwangi',
                                    role: 'Advocate, Nairobi',
                                    quote: 'The boardroom is quiet, professional, and easy to book. It has become our default space for client meetings.',
                                },
                                {
                                    name: 'L. Njeri',
                                    role: 'ADR Practitioner',
                                    quote: 'The environment feels premium without being distracting. Everything from the soundproofing to the setup is deliberate.',
                                },
                                {
                                    name: 'K. Otieno',
                                    role: 'Legal Consultant',
                                    quote: 'It is rare to find a workspace that balances privacy, convenience, and polish this well. DR Hub does it right.',
                                },
                            ].map((testimonial) => (
                                <Card
                                    key={testimonial.name}
                                    className="bg-gray-900 border border-gray-700 p-0 transition-transform duration-300 hover:-translate-y-1 hover:border-orange-500"
                                >
                                    <CardContent className="flex h-full flex-col gap-6 px-6 py-8">
                                        <div className="flex gap-1 text-orange-500">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <Star key={index} className="h-4 w-4 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-lg leading-8 text-white/75">“{testimonial.quote}”</p>
                                        <div className="mt-auto">
                                            <p className="text-lg font-semibold text-white">{testimonial.name}</p>
                                            <p className="text-sm text-white/50">{testimonial.role}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[#e67b1f] px-6 py-28 text-black">
                    <div className="mx-auto flex max-w-[960px] flex-col items-center text-center">
                        <h2 className="max-w-4xl text-5xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
                            Ready to Book Your Space?
                        </h2>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-black/70 sm:text-xl">
                            Join hundreds of legal professionals who trust The DR Hub for their meetings and mediations.
                        </p>
                        <Button className="mt-12 bg-black px-7 py-6 text-lg text-white hover:bg-black/90 rounded-none">
                            Book Now <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </section>
       </div>

    )
}