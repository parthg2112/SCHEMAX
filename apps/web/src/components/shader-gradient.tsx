import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type Uniforms = {
    [key: string]: {
        value: number[] | number[][] | number;
        type: string;
    };
};

interface ShaderProps {
    source: string;
    uniforms: {
        [key: string]: {
            value: number[] | number[][] | number;
            type: string;
        };
    };
    maxFps?: number;
}

export const ShaderMaterial = ({
    source,
    uniforms,
    maxFps = 60,
}: {
    source: string;
    hovered?: boolean;
    maxFps?: number;
    uniforms: Uniforms;
}) => {
    const { size } = useThree();
    const ref = useRef<THREE.Mesh>(null);
    let lastFrameTime = 0;

    useFrame(({ clock }) => {
        if (!ref.current) return;
        const timestamp = clock.getElapsedTime();
        lastFrameTime = timestamp;
        const material: any = ref.current.material;
        const timeLocation = material.uniforms.u_time;
        timeLocation.value = timestamp;
    });

    const getUniforms = () => {
        const preparedUniforms: any = {};
        for (const uniformName in uniforms) {
            const uniform: any = uniforms[uniformName];
            switch (uniform.type) {
                case "uniform1f":
                    preparedUniforms[uniformName] = { value: uniform.value, type: "1f" };
                    break;
                case "uniform1i":
                    preparedUniforms[uniformName] = { value: uniform.value, type: "1i" };
                    break;
                case "uniform3f":
                    preparedUniforms[uniformName] = {
                        value: new THREE.Vector3().fromArray(uniform.value),
                        type: "3f",
                    };
                    break;
                case "uniform1fv":
                    preparedUniforms[uniformName] = { value: uniform.value, type: "1fv" };
                    break;
                case "uniform3fv":
                    preparedUniforms[uniformName] = {
                        value: uniform.value.map((v: number[]) =>
                            new THREE.Vector3().fromArray(v)
                        ),
                        type: "3fv",
                    };
                    break;
                case "uniform2f":
                    preparedUniforms[uniformName] = {
                        value: new THREE.Vector2().fromArray(uniform.value),
                        type: "2f",
                    };
                    break;
                default:
                    console.error(`Invalid uniform type for '${uniformName}'.`);
                    break;
            }
        }
        preparedUniforms["u_time"] = { value: 0, type: "1f" };
        preparedUniforms["u_resolution"] = {
            value: new THREE.Vector2(size.width * 2, size.height * 2),
        };
        return preparedUniforms;
    };

    const material = useMemo(() => {
        const uniforms = getUniforms();
        return new THREE.ShaderMaterial({
            fragmentShader: source,
            vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            uniforms,
            glslVersion: THREE.GLSL3,
        });
    }, []);

    return (
        <mesh ref={ref}>
            <planeGeometry args={[2, 2]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
};

export const ShaderGradient = ({
    shader,
    showGradient = false,
}: {
    shader: ShaderProps;
    showGradient?: boolean;
}) => {
    return (
        <div className="absolute inset-0 z-0 h-screen w-screen">
            <div className="absolute inset-0 overflow-hidden">
                <div className="h-screen w-screen">
                    {shader && (
                        <div className="h-full w-full">
                            <ShaderMaterial source={shader.source} uniforms={shader.uniforms} maxFps={shader.maxFps} />
                        </div>
                    )}
                </div>
            </div>
            {showGradient && (
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            )}
        </div>
    );
};
