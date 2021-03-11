import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, useLoader, useUpdate } from "react-three-fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  Mesh,
  IcosahedronGeometry,
  MeshStandardMaterial,
  Color,
  AnimationMixer,
  AnimationClip,
  ColorKeyframeTrack,
  LoopRepeat,
  InterpolateDiscrete,
  AnimationAction,
  Group,
  DoubleSide,
  MeshPhysicalMaterial,
  BufferGeometry,
} from "three";

import { createLight } from "../utils/DiceRenderUtils";

const d20GLB = require("../resources/d20.glb");

const faceIndexes: number[] = [
  14,
  20,
  8,
  16,
  6,
  2,
  4,
  9,
  3,
  10,
  5,
  13,
  1,
  7,
  15,
  18,
  11,
  19,
  17,
  12,
];

type LEDAnimation = {
  times: number[];
  colors: any[];
};

type Props = {
  animations: LEDAnimation[];
  animationDuration: number;
  dieColor: { r: number; g: number; b: number };
};

export default ({ animations, animationDuration, dieColor }: Props) => {
  const groupRef = useRef<Group>(null);

  const dieLightGeo = useMemo(() => {
    const g = new IcosahedronGeometry(2.75);

    g.rotateX((20.905 * Math.PI) / 180);

    return g;
  }, []);

  const { scene } = useLoader(GLTFLoader, d20GLB);

  const die = useMemo(() => {
    const dieMesh = scene.children[0] as Mesh;

    dieMesh.material = new MeshPhysicalMaterial({
      color: "black",
      sheen: new Color("#cccccc"),
      clearcoat: 1,
      clearcoatRoughness: 0.5,
    });

    const innerDieMesh = dieMesh.children[0] as Mesh;

    innerDieMesh.material = new MeshStandardMaterial({
      color: "#888888",
      side: DoubleSide,
    });

    dieMesh.add(innerDieMesh);

    dieMesh.scale.set(3, 3, 3);

    return dieMesh;
  }, [scene.children]);

  const dieRef = useUpdate(
    (mesh: Mesh<BufferGeometry, MeshStandardMaterial>) => {
      mesh.material.color.setRGB(
        dieColor.r / 255,
        dieColor.g / 255,
        dieColor.b / 255
      );
      mesh.material.needsUpdate = true;
    },
    [dieColor]
  );

  const leds = useMemo(
    () =>
      new Array(20)
        .fill(0)
        .map((_, i) =>
          createLight(0.2, 6, "#ffffff", [
            dieLightGeo.vertices[dieLightGeo.faces[i].a],
            dieLightGeo.vertices[dieLightGeo.faces[i].b],
            dieLightGeo.vertices[dieLightGeo.faces[i].c],
          ])
        ),
    [dieLightGeo]
  );

  const ledAnimationMixers = useMemo(
    () => leds.map((led) => new AnimationMixer(led)),
    [leds]
  );

  useEffect(() => {
    const actions: AnimationAction[] = [];

    for (var i = 0; i < 20; i++) {
      if (animations.length > i && animations[i]) {
        const track = new ColorKeyframeTrack(
          ".color",
          animations[faceIndexes[i] - 1].times,
          i === 5 ? [0, 255, 0] : animations[faceIndexes[i] - 1].colors,
          InterpolateDiscrete
        );

        const clip = new AnimationClip(
          `D20LEDAnimation${i + 1}`,
          animationDuration,
          [track]
        );

        const action = ledAnimationMixers[i].clipAction(clip);

        action.loop = LoopRepeat;

        action.play();

        actions.push(action);
      }
    }
    return () => {
      actions.forEach((action) => action.stop());
    };
  }, [animations, ledAnimationMixers, animationDuration]);

  useFrame((state, delta) => {
    ledAnimationMixers.forEach((am) => {
      am.update(delta);
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={die} ref={dieRef} />
      {leds.map((v, i) => (
        <primitive key={`LED${i}`} object={v} />
      ))}
    </group>
  );
};
