import { useEffect, useState } from 'react';
import { BookingSummary } from './ui/BookingSummary';
import { SpaceBox } from './ui/SpaceBox';

export const Stepper = ({ steps, currentStep }) => {
    const normalizedStartStep = Math.min(Math.max(currentStep ?? 0, 0), steps.length - 1);
    const [activeStep, setActiveStep] = useState(normalizedStartStep);
    const [selectedSpace, setSelectedSpace] = useState(null);

    useEffect(() => {
        setActiveStep(normalizedStartStep);
    }, [normalizedStartStep]);

    const goToNextStep = () => {
        setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
    };

    const goToPreviousStep = () => {
        setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
    };

    return (
        <section className="mx-auto flex w-full  flex-col gap-8 px-4 py-8 md:px-8 lg:px-12 items-center bg-[#0F1A2E]">
            <div className="rounded-2xl  p-5 md:p-7">
                <div className="flex w-full items-center overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-center">
                            <div className="flex items-center gap-3 whitespace-nowrap">
                                <div
                                    className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                                        index <= activeStep
                                            ? 'border-[#EC7B1D] bg-[#EC7B1D] text-white'
                                            : 'border-slate-700/50  text-gray-200'
                                    }`}
                                >
                                    {index < activeStep ? '✓' : index + 1}
                                </div>
                                <span
                                    className={`text-sm font-medium ${index <= activeStep ? 'text-slate-100' : 'text-gray-200'}`}
                                >
                                    {step}
                                </span>
                            </div>

                            {index < steps.length - 1 && (
                                <span
                                    className={`mx-3 h-0.5 w-12 md:w-20 lg:w-28 ${
                                        index < activeStep ? 'bg-[#EC7B1D]' : 'bg-slate-600'
                                    }`}
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid gap-5 w-full max-h-screen grid-cols-1 lg:grid-cols-[1fr_430px] ">
                <div className="border border-slate-700/50 lg:h-[72vh] lg:overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <SpaceBox
                        onSpaceChange={setSelectedSpace}
                        onNext={goToNextStep}
                        onBack={goToPreviousStep}
                        canProceed={Boolean(selectedSpace)}
                        canGoBack={activeStep > 0}
                        isLastStep={activeStep === steps.length - 1}
                    />
                </div>
                <div className="lg:sticky lg:top-6 lg:h-[72vh]">
                    <BookingSummary
                        room={selectedSpace?.title}
                        rateType={selectedSpace?.rateType}
                        subtotal={selectedSpace?.subtotal}
                        bookingFee={1000}
                    />
                </div>
            </div>
        </section>
    )
}