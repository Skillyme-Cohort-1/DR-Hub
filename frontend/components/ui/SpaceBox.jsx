import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { SpaceCard } from './SpaceCard';

const spaces = [
    {
        id: 'boardroom',
        title: 'Boardroom',
        description:
            'Spacious boardroom with seating for up to 8 people. Includes full AV setup, whiteboard, and video conferencing.',
        price: 'From Ksh 3,500',
        subtotal: 3500,
        rateType: 'Non-member / Weekday',
        imageSrc: '/boardroom.jpeg',
        imageAlt: 'Boardroom',
    },
    {
        id: 'private-office',
        title: 'Private Office',
        description: 'Quiet, soundproofed office perfect for focused work or one-on-one meetings. Includes desk and seating for 2.',
        price: 'From Ksh 2,000',
        subtotal: 2000,
        rateType: 'Non-member / Weekday',
        imageSrc: '/private-space.jpeg',
        imageAlt: 'Private Office',
    },
    {
        id: 'combined-space',
        title: 'Combined Space',
        description: 'Flexible space that can be configured for various needs, from small meetings to larger events. Equipped with modern amenities.',
        price: 'From Ksh 4,000',
        subtotal: 4000,
        rateType: 'Non-member / Weekday',
        imageSrc: '/combined-space.jpeg',
        imageAlt: 'Combined Space',
    }
];

export const SpaceBox = ({
    onSpaceChange,
    onNext,
    onBack,
    canProceed = false,
    canGoBack = false,
    isLastStep = false,
}) => {
    const [selectedSpaceId, setSelectedSpaceId] = useState(null);

    const handleSelectSpace = (space) => {
        setSelectedSpaceId(space.id);
        onSpaceChange?.(space);
    };

    return (
        <div className="flex flex-col border-r border-gray-800 gap-6 p-6 md:p-10">
            <div className="w-full text-start">
                <h1 className="text-2xl font-semibold text-amber-50">Select your space</h1>
            </div>
            <div className="w-full grid grid-cols-1 gap-4">
                {spaces.map((item) => (
                    <SpaceCard
                        key={item.id}
                        title={item.title}
                        description={item.description}
                        price={item.price}
                        imageSrc={item.imageSrc}
                        imageAlt={item.imageAlt}
                        selected={selectedSpaceId === item.id}
                        onSelect={() => handleSelectSpace(item)}
                    />
                ))}
            </div>

            <div className="mt-2 w-full border-t border-slate-800 pt-8">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr]">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={!canGoBack}
                        className="flex items-center justify-center border border-white bg-transparent px-6 py-3 text-xl font-semibold text-slate-200 transition-colors duration-200 hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                        Back
                    </button>

                    <button
                        type="button"
                        onClick={onNext}
                        disabled={!canProceed || isLastStep}
                        className="flex w-full items-center justify-center gap-3 bg-[#EC7B1D] px-6 py-3 text-xl font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                        <span>{isLastStep ? 'Completed' : 'Next'}</span>
                        {!isLastStep && <ChevronRight aria-hidden="true" className="h-5 w-5" strokeWidth={2} />}
                    </button>
                </div>
            </div>
        </div>
    )
}