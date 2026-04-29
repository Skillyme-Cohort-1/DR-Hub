// Imports 
import React, { useEffect, useState } from "react";
import { roomService } from "@/services/roomApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// Room component section
export default function RoomsSection() {

    const [ error, setError ] = useState('');
    const [ rooms, setRooms ] = useState([]);

    // Function to fetch rooms
    const fetchRooms = async () => {
        try {
            const res = await roomService.getAllRooms();
            setRooms(res.data);
        } catch (error) {
            const errorMessage = "Error fetching rooms.";
            toast.error(errorMessage);
            setError(errorMessage);
        }
    }

    // Re-render only once
    useEffect(() => {

        fetchRooms();
    }, [])
    
    return(
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

            {/* Error display if failed fetching */}
            {error && <p className="text-red-500">{error}</p> }

            {/* Map rooms */}
            {rooms.map((room) => {
                const isActive = room.isActive ?? room.is_active;

                return (
                    <div key={room.id}>
                        <Card
                            className="group overflow-hidden border border-white/10 bg-zinc-900/40 p-0 transition-all duration-300 hover:-translate-y-1 hover:border-[#E87722]/50 hover:shadow-lg hover:shadow-black/40"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={room.imageUrl || "https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg"}
                                    alt=""
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                            <CardHeader className="px-6 pt-6">
                                <CardTitle className="flex items-center gap-3 text-xl text-white">
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E87722]/15 text-[#E87722] ring-1 ring-[#E87722]/25">
                                        <Users className="h-5 w-5" aria-hidden />
                                    </span>
                                    {room.name}
                                </CardTitle>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/85">
                                        Capacity: <span className="ml-1 font-semibold text-white">{room.capacity ?? "N/A"}</span>
                                    </span>
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                            isActive
                                                ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
                                                : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30"
                                        }`}
                                    >
                                        {isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <CardDescription className="text-base text-white/55">{room.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 pb-6">
                                <Button
                                    asChild
                                    className="w-full rounded-md bg-[#E87722] py-6 text-base text-white hover:bg-[#d96d1f]"
                                >
                                    <Link to="/booking">Book this room</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                );
            })}
        </div>
    )
}


