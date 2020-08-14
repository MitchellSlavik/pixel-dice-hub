import React, { useCallback, useRef, useMemo, useEffect } from "react";
import { useFrame } from "react-three-fiber";
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
  RingGeometry,
  Group,
  Vector3,
  MeshBasicMaterial,
} from "three";

import {
  createText,
  createLight,
  getAvgPosition,
} from "../utils/DiceRenderUtils";

const dieColor = new Color("rgb(20, 20, 20)");

const faceIndexes: number[] = [
  1,
  19,
  3,
  17,
  7,
  9,
  13,
  15,
  8,
  16,
  4,
  18,
  2,
  20,
  14,
  11,
  5,
  12,
  10,
  6,
];
const rotations: number[] = [
  Math.PI / 4, // 1
  -Math.PI / 3, // 19
  -Math.PI / 4, // 3
  -Math.PI / 8, // 17
  0, // 7
  -Math.PI / 5, // 9
  -Math.PI / 6, // 13
  Math.PI, // 15
  Math.PI / 6, // 8
  Math.PI / 4, // 16
  -Math.PI / 6, // 4
  0, // 18
  0, // 2
  Math.PI / 8, // 20
  -Math.PI / 3, // 14
  Math.PI / 6, // 11
  Math.PI / 6, // 5
  -Math.PI / 8, // 12
  Math.PI / 2, // 10
  0, // 6
];

type LEDAnimation = {
  times: number[];
  colors: any[];
};

type Props = {
  animations: LEDAnimation[];
  animationDuration: number;
};

export default ({ animations, animationDuration }: Props) => {
  const groupRef = useRef<Group>(null);

  const currentFace = useRef<number>(-1);
  const previousFace = useRef<number>(-1);

  const triangleRef = useRef<Mesh | null>(null);

  const dieGeo = useMemo(() => new IcosahedronGeometry(3), []);

  const dieGeo2 = useMemo(() => new IcosahedronGeometry(4), []);

  const onClick = useCallback(
    (event) => {
      if (currentFace.current >= 0) {
        previousFace.current = currentFace.current;
      }

      console.log(event);

      currentFace.current = event.faceIndex;

      if (triangleRef.current) {
        groupRef.current?.remove(triangleRef.current);
      }

      const g = new RingGeometry(0.8, 0.9, 48, 1);

      const ringMesh = new Mesh(g, new MeshBasicMaterial({ color: "#dddddd" }));

      const face = dieGeo.faces[event.faceIndex];

      ringMesh.position.set(
        ...getAvgPosition([
          dieGeo.vertices[face.a],
          dieGeo.vertices[face.b],
          dieGeo.vertices[face.c],
        ])
      );
      ringMesh.position.add(
        new Vector3().copy(face.normal).multiplyScalar(0.01)
      );

      ringMesh.lookAt(new Vector3().copy(face.normal).multiplyScalar(10));

      groupRef.current?.add(ringMesh);
      triangleRef.current = ringMesh;
    },
    [dieGeo]
  );

  const dieMesh = useMemo(
    () =>
      new Mesh(
        dieGeo,
        new MeshStandardMaterial({
          color: dieColor,
          opacity: 1,
          transparent: true,
          metalness: 0.5,
          vertexColors: true,
        })
      ),
    [dieGeo]
  );

  const textMeshes = useMemo(
    () =>
      faceIndexes.map((v, i) =>
        createText(
          `${v}${v === 6 || v === 9 ? "." : ""}`,
          [
            dieGeo.vertices[dieGeo.faces[i].a],
            dieGeo.vertices[dieGeo.faces[i].b],
            dieGeo.vertices[dieGeo.faces[i].c],
          ],
          dieGeo.faces[i].normal,
          rotations[i],
          0.9
        )
      ),
    [dieGeo]
  );

  const leds = useMemo(
    () =>
      new Array(20)
        .fill(0)
        .map((_, i) =>
          createLight(0.009, 5, "#ffffff", [
            dieGeo2.vertices[dieGeo2.faces[i].a],
            dieGeo2.vertices[dieGeo2.faces[i].b],
            dieGeo2.vertices[dieGeo2.faces[i].c],
          ])
        ),
    [dieGeo2]
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
          animations[faceIndexes[i] - 1].colors,
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

  const ledAnimations = useMemo(() => {
    const a = new Array(20).fill(0).map((_, i) => {
      const animationMixer = new AnimationMixer(leds[i]);

      animationMixer.timeScale = 1;

      if (animations[faceIndexes[i] - 1]) {
        const track = new ColorKeyframeTrack(
          ".color",
          animations[faceIndexes[i] - 1].times,
          animations[faceIndexes[i] - 1].colors,
          InterpolateDiscrete
        );

        const clip = new AnimationClip(
          `D20LEDAnimation${i + 1}`,
          animationDuration,
          [track]
        );

        const action = animationMixer.clipAction(clip);

        action.loop = LoopRepeat;

        action.play();
      }

      return animationMixer;
    });
    return a;
  }, [leds, animations, animationDuration]);

  useFrame((state, delta) => {
    ledAnimations.forEach((am) => {
      am.update(delta);
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={dieMesh} onDoubleClick={onClick} />
      {textMeshes.map((v, i) => (
        <primitive key={`Text${i}`} object={v} />
      ))}
      {leds.map((v, i) => (
        <primitive key={`LED${i}`} object={v} />
      ))}
    </group>
  );
};
