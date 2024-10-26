// BallsAnimation.tsx
import { Canvas } from "@react-three/offscreen";
import { useEffect, useState } from "react";
import { lazy } from "react";

const Scene = lazy(() => import("./Scene"));

const BallsAnimation: React.FC = () => {
	const [worker, setWorker] = useState<Worker | null>(null);

	useEffect(() => {
		const newWorker = new Worker(new URL("./worker.tsx", import.meta.url), { type: "module" });
		setWorker(newWorker);

		return () => {
			newWorker.terminate();
		};
	}, []);

	return (
		<div className="canvasContainer" style={{ height: "100vh" }}>
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
		</div>
	);
};

export default BallsAnimation;
