export const Stepper = ({ steps, currentStep }) => {
    return (
        <div className="flex items-center gap-4">
            {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${index === currentStep ? 'bg-[#EC7B1D] text-white' : 'bg-slate-700 text-slate-400'}`}>
                        {index + 1}
                    </div>
                    <span className="mt-2 text-sm font-medium text-slate-400">{step}</span>
                </div>
            ))}
        </div>
    )
}