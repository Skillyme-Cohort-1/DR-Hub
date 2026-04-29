import { useState } from 'react';
import { Check } from 'lucide-react';

export const SpaceCard = ({
    title = 'Boardroom',
    description = 'Spacious boardroom with seating for up to 8 people. Includes full AV setup, whiteboard, and video conferencing.',
    price = 'From Ksh 3,500',
    imageSrc = '/boardroom.jpeg',
    imageAlt = 'Boardroom',
    selected,
    onSelect,
}) => {
    const [isSelectedInternal, setIsSelectedInternal] = useState(false);
    const isControlled = typeof selected === 'boolean';
    const isSelected = isControlled ? selected : isSelectedInternal;

    const handleSelect = () => {
        const nextValue = !isSelected;

        if (!isControlled) {
            setIsSelectedInternal(nextValue);
        }

        onSelect?.(nextValue);
    };

    return (
        <button
            type="button"
            onClick={handleSelect}
            className={`relative flex w-full cursor-pointer gap-4 border p-3 text-left transition-colors duration-200 ${
                isSelected
                    ? 'border-[#EC7B1D] bg-[#1C2A3F]'
                    : 'border-slate-600 bg-[#0B1526] hover:border-[#EC7B1D]'
            }`}
            aria-pressed={isSelected}
        >
            {isSelected && (
                <span
                    className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center bg-[#EC7B1D] text-xl font-semibold text-white"
                    aria-hidden="true"
                >
                    <Check className="h-5 w-5" />
                </span>
            )}
            <div className="p-4">
                <img className="w-48 h-32 md:w-56 md:h-36 object-cover " src={imageSrc} alt={imageAlt} />
            </div>
            <div className="pr-10">
                <h1 className="text-lg font-semibold text-white">{title}</h1>
                <p className="mt-2 text-lg text-slate-400">{description}</p>
                <h2 className="mt-3 text-xl text-[#EC7B1D]">{price}</h2>
            </div>
        </button>
    );
};