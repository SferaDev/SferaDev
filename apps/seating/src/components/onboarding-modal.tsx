"use client";

import {
	ArrowLeft,
	ArrowRight,
	Circle,
	GripVertical,
	MousePointerClick,
	PartyPopper,
	RectangleHorizontal,
	Sparkles,
	UserPlus,
	Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "seating-onboarding-complete";

interface OnboardingStep {
	title: string;
	description: string;
	icon: React.ReactNode;
	illustration: React.ReactNode;
}

const steps: OnboardingStep[] = [
	{
		title: "Welcome to Seating Planner",
		description:
			"Plan your perfect seating arrangement for weddings, events, or any gathering. Let's take a quick tour of the main features.",
		icon: <PartyPopper className="w-6 h-6" />,
		illustration: (
			<div className="flex items-center justify-center gap-4 py-6">
				<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
					<Sparkles className="w-8 h-8 text-primary" />
				</div>
			</div>
		),
	},
	{
		title: "Add Your Guests",
		description:
			"Start by adding your guests in the left panel. You can include their names and optionally upload photos to make them easy to identify.",
		icon: <UserPlus className="w-6 h-6" />,
		illustration: (
			<div className="flex items-center justify-center py-6">
				<div className="flex flex-col items-center gap-3 p-4 rounded-lg border bg-card shadow-sm">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
							<Users className="w-5 h-5 text-muted-foreground" />
						</div>
						<div className="text-left">
							<div className="text-sm font-medium">John Smith</div>
							<div className="text-xs text-muted-foreground">Guest</div>
						</div>
					</div>
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<UserPlus className="w-4 h-4" />
						<span>Click to add guests</span>
					</div>
				</div>
			</div>
		),
	},
	{
		title: "Create Tables",
		description:
			"Create round or rectangular tables with custom seating capacities. Rectangular tables offer multiple seating arrangements: around all sides, one side only, or a single row.",
		icon: <Circle className="w-6 h-6" />,
		illustration: (
			<div className="flex items-center justify-center gap-6 py-6">
				<div className="flex flex-col items-center gap-2">
					<div className="w-16 h-16 rounded-full border-2 border-primary bg-primary/5 flex items-center justify-center">
						<Circle className="w-8 h-8 text-primary" />
					</div>
					<span className="text-xs text-muted-foreground">Round</span>
				</div>
				<div className="flex flex-col items-center gap-2">
					<div className="w-20 h-12 rounded-md border-2 border-primary bg-primary/5 flex items-center justify-center">
						<RectangleHorizontal className="w-8 h-8 text-primary" />
					</div>
					<span className="text-xs text-muted-foreground">Rectangle</span>
				</div>
			</div>
		),
	},
	{
		title: "Assign Seats",
		description:
			"Assign guests to seats using the dropdown menu on each seat, or drag tables around the canvas to create your perfect layout. Tables snap to alignment guides for easy organization.",
		icon: <MousePointerClick className="w-6 h-6" />,
		illustration: (
			<div className="flex items-center justify-center py-6">
				<div className="flex flex-col items-center gap-4">
					<div className="flex items-center gap-3 p-3 rounded-lg border bg-card shadow-sm">
						<GripVertical className="w-4 h-4 text-muted-foreground" />
						<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
							<Users className="w-4 h-4 text-primary" />
						</div>
						<ArrowRight className="w-4 h-4 text-muted-foreground" />
						<div className="w-8 h-8 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center">
							<span className="text-xs text-primary">1</span>
						</div>
					</div>
					<span className="text-xs text-muted-foreground">Use dropdowns or drag to assign</span>
				</div>
			</div>
		),
	},
];

export function OnboardingModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);

	useEffect(() => {
		const hasSeenOnboarding = localStorage.getItem(STORAGE_KEY);
		if (!hasSeenOnboarding) {
			setIsOpen(true);
		}
	}, []);

	const handleClose = useCallback(() => {
		localStorage.setItem(STORAGE_KEY, "true");
		setIsOpen(false);
	}, []);

	const handleNext = useCallback(() => {
		if (currentStep < steps.length - 1) {
			setCurrentStep((prev) => prev + 1);
		} else {
			handleClose();
		}
	}, [currentStep, handleClose]);

	const handleBack = useCallback(() => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	}, [currentStep]);

	const step = steps[currentStep];
	const isLastStep = currentStep === steps.length - 1;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
							{step.icon}
						</div>
						<DialogTitle className="text-xl">{step.title}</DialogTitle>
					</div>
				</DialogHeader>

				<div className="py-4">
					{step.illustration}
					<p className="text-sm text-muted-foreground text-center leading-relaxed">
						{step.description}
					</p>
				</div>

				<div className="flex justify-center gap-1.5 py-2">
					{steps.map((_, index) => (
						<button
							key={index}
							type="button"
							onClick={() => setCurrentStep(index)}
							className={`w-2 h-2 rounded-full transition-colors ${
								index === currentStep
									? "bg-primary"
									: "bg-muted-foreground/30 hover:bg-muted-foreground/50"
							}`}
							aria-label={`Go to step ${index + 1}`}
						/>
					))}
				</div>

				<DialogFooter className="flex-row justify-between sm:justify-between gap-2">
					<Button variant="ghost" onClick={handleClose} className="text-muted-foreground">
						Skip
					</Button>
					<div className="flex gap-2">
						{currentStep > 0 && (
							<Button variant="outline" onClick={handleBack}>
								<ArrowLeft className="w-4 h-4 mr-1" />
								Back
							</Button>
						)}
						<Button onClick={handleNext}>
							{isLastStep ? (
								"Get Started"
							) : (
								<>
									Next
									<ArrowRight className="w-4 h-4 ml-1" />
								</>
							)}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
