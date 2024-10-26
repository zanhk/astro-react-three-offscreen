// Connectors.tsx
// https://codesandbox.io/p/sandbox/lusion-connectors-xy8c8z
import { Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { BallCollider, Physics, RigidBody } from "@react-three/rapier";
import { easing } from "maath";
import React, { useMemo, useReducer, useRef } from "react";
import * as THREE from "three";

const accents: string[] = ["#4060ff", "#20ffa0", "#ff4060", "#ffcc00"];

interface MaterialProps {
	color: string;
	roughness: number;
	accent?: boolean;
}

const shuffle = (accent = 0): MaterialProps[] => [
	{ color: "white", roughness: 0.1 },
	{ color: "white", roughness: 0.75 },
	{ color: "white", roughness: 0.75 },
	{ color: "white", roughness: 0.1 },
	{ color: "white", roughness: 0.75 },
	{ color: "white", roughness: 0.1 },
	{ color: accents[accent], roughness: 0.1, accent: true },
	{ color: accents[accent], roughness: 0.75, accent: true },
	{ color: accents[accent], roughness: 0.1, accent: true },
];

const Scene: React.FC = () => {
	const [accent, setAccent] = useReducer((state: number) => (state + 1) % accents.length, 0);
	const connectors = useMemo(() => shuffle(accent), [accent]);

	const { gl } = useThree();

	React.useEffect(() => {
		gl.setClearColor(0x000000, 0);

		const handleClick = () => {
			setAccent();
		};

		gl.domElement.addEventListener("click", handleClick);

		return () => {
			gl.domElement.removeEventListener("click", handleClick);
		};
	}, [gl]);

	return (
		<>
			<ambientLight intensity={0.4} />
			<spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
			<Physics gravity={[0, 0, 0]}>
				<Pointer />
				{connectors.map((props, i) => (
					<Connector key={i} {...props} />
				))}
			</Physics>
			<EffectComposer multisampling={8}>
				<N8AO distanceFalloff={1} aoRadius={1} intensity={4} />
			</EffectComposer>
			<Environment resolution={256}>
				<group rotation={[-Math.PI / 3, 0, 1]}>
					<Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
					<Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
					<Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
					<Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
				</group>
			</Environment>
		</>
	);
};

interface ConnectorProps extends MaterialProps {
	position?: [number, number, number];
	children?: React.ReactNode;
	vec?: THREE.Vector3;
	scale?: number;
}

const Connector: React.FC<ConnectorProps> = ({
	position,
	children,
	vec = new THREE.Vector3(),
	scale,
	r = THREE.MathUtils.randFloatSpread,
	accent,
	...props
}) => {
	const api = useRef(null);
	const pos = useMemo<[number, number, number]>(() => position || [r(10), r(10), r(10)], [position, r]);

	useFrame((state, delta) => {
		delta = Math.min(0.1, delta);
		api.current?.applyImpulse(vec.copy(api.current.translation()).negate().multiplyScalar(0.08));
	});

	return (
		<RigidBody linearDamping={4} angularDamping={1} friction={0.1} position={pos} ref={api} colliders={false}>
			<BallCollider args={[0.66]} />
			{children ? children : <Model {...props} />}
			{accent && <pointLight intensity={4} distance={2.5} color={props.color} />}
		</RigidBody>
	);
};

interface PointerProps {
	vec?: THREE.Vector3;
}

const Pointer: React.FC<PointerProps> = ({ vec = new THREE.Vector3() }) => {
	const ref = useRef(null);

	useFrame(({ mouse, viewport }) => {
		ref.current?.setNextKinematicTranslation(
			vec.set((mouse.x * viewport.width) / 2, (mouse.y * viewport.height) / 2, 0),
		);
	});

	return (
		<RigidBody position={[0, 0, 0]} type="kinematicPosition" colliders={false} ref={ref}>
			<BallCollider args={[1]} />
		</RigidBody>
	);
};

interface ModelProps extends Partial<MaterialProps> {
	children?: React.ReactNode;
}

const Model: React.FC<ModelProps> = ({ children, color = "white", roughness = 0, ...props }) => {
	const ref = useRef<THREE.Mesh>(null);

	useFrame((state, delta) => {
		if (ref.current && ref.current.material instanceof THREE.MeshStandardMaterial) {
			easing.dampC(ref.current.material.color, color, 0.2, delta);
		}
	});

	return (
		<mesh ref={ref} castShadow receiveShadow scale={0.5} {...props}>
			<sphereGeometry args={[0.9, 30, 30]} />
			<meshStandardMaterial metalness={0.2} roughness={roughness} color={ref?.current?.material.color} />
			{children}
		</mesh>
	);
};

export default Scene;
