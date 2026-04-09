import { Lock } from 'lucide-react';

const formatKsh = (amount) => `Ksh ${Number(amount).toLocaleString()}`;

export const BookingSummary = ({
    room = 'Boardroom',
    rateType = 'Non-member / Weekday',
    subtotal = 3500,
    bookingFee = 1000,
}) => {
    const total = Number(subtotal) + Number(bookingFee);

    return (
        <section className="h-full border border-gray-900 p-5 md:p-6 flex flex-col">
            <h2 className="text-lg font-semibold tracking-[0.12em] text-slate-100 uppercase">Booking Summary</h2>

            <div className="mt-5 flex flex-1 flex-col justify-between">
                <div className="space-y-5">
                    <div>
                        <p className="text-base text-slate-400">Room</p>
                        <p className="mt-1 text-3xl font-semibold text-white">{room}</p>
                    </div>

                    <div>
                        <p className="text-base text-slate-400">Rate type</p>
                        <p className="mt-1 text-lg font-semibold text-white">{rateType}</p>
                    </div>

                    <hr className="border-slate-800" />

                    <div className="space-y-3 text-lg">
                        <div className="flex items-center justify-between text-slate-300">
                            <span>Subtotal</span>
                            <span className="font-semibold text-white">{formatKsh(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                            <span>Booking fee</span>
                            <span className="font-semibold text-white">{formatKsh(bookingFee)}</span>
                        </div>
                    </div>

                    <hr className="border-slate-800" />

                    <div className="flex items-center justify-between">
                        <span className="text-xl font-semibold text-slate-100">Total</span>
                        <span className="text-xl font-bold text-white">{formatKsh(total)}</span>
                    </div>
                </div>

                <div className="mt-4 border-t border-slate-800 pt-4 flex items-start gap-3 w-full text-base leading-snug text-slate-400">
                    <Lock aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-gray-500" strokeWidth={1.8} />
                    <p>Secure booking. Confirmation sent by email & SMS.</p>
                </div>
            </div>
        </section>
    );
};
