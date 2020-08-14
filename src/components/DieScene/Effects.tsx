import * as THREE from "three";
import React, { useMemo, useEffect } from "react";
import { extend, useThree, useFrame } from "react-three-fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";

extend({ EffectComposer, ShaderPass, RenderPass, UnrealBloomPass });

export default () => {
  const { scene, gl, size, camera } = useThree();
  const aspect = useMemo(() => new THREE.Vector2(512, 512), []);
  const composer = useMemo(() => {
    const ec = new EffectComposer(gl);

    ec.addPass(new RenderPass(scene, camera));
    const shaderPass = new ShaderPass(FXAAShader);

    shaderPass.material.uniforms.resolution = {
      value: [1 / size.width, 1 / size.height],
    };
    shaderPass.renderToScreen = true;

    ec.addPass(shaderPass);
    ec.addPass(new UnrealBloomPass(aspect, 0.9, 1, 0.9));

    return ec;
  }, [scene, camera, aspect, size, gl]);
  useEffect(() => void composer.setSize(size.width, size.height), [
    size,
    composer,
  ]);
  useFrame(() => composer.render(), 1);
  return <primitive object={composer} />;
};
