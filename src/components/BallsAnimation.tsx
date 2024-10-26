// BallsAnimation.tsx
import { Canvas } from "@react-three/offscreen";
import { type SetStateAction, useEffect, useState } from "react";
import { Suspense, lazy } from "react";

const Scene = lazy(() => import("./Scene"));

const BallsAnimation: React.FC = () => {
	const [isMounted, setIsMounted] = useState(false);
	const [worker, setWorker] = useState<Worker | null>(null);
	const [gpuTier, setGpuTier] = useState<number | null>(null);

	useEffect(() => {
		setIsMounted(true);
		const newWorker = new Worker(new URL("./worker.tsx", import.meta.url), { type: "module" });
		setWorker(newWorker);

		import("detect-gpu").then((module) => {
			module.getGPUTier().then((tierRes: { tier: SetStateAction<number | null>; fps?: number }) => {
				setGpuTier(tierRes.tier);
			});
		});

		return () => {
			newWorker.terminate();
		};
	}, []);

	if (!isMounted || gpuTier === null) {
		return null;
	}

	if (gpuTier <= 1) {
		return (
			<div>
				<span className="sr-only">Your GPU is not powerful enough to run this animation.</span>
				<img src="/images/hero.webp" width={924} height={768} alt="Hero" />
			</div>
		);
	}

	return (
		<div className="canvasContainer" style={{ height: "100vh" }}>
			<Suspense fallback={null}>
				{worker && (
					<Canvas
						worker={worker}
						fallback={<Scene />}
						shadows
						dpr={[1, 1.5]}
						gl={{
							antialias: false,
							alpha: true,
							premultipliedAlpha: false,
							preserveDrawingBuffer: true,
						}}
						camera={{ position: [0, 0, 15], fov: 17.5, near: 1, far: 20 }}
					/>
				)}
			</Suspense>
		</div>
	);
};

export default BallsAnimation;
