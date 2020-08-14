import React, { useCallback, useRef, useMemo, useEffect } from "react";
import { useFrame, ReactThreeFiber } from "react-three-fiber";
import {
  Mesh,
  Font,
  Group,
  IcosahedronGeometry,
  Vector3,
  Matrix4,
  Face3,
  TextGeometry,
  MeshStandardMaterial,
  Color,
  PointLight,
  AnimationMixer,
  AnimationClip,
  ColorKeyframeTrack,
  LoopRepeat,
  InterpolateDiscrete,
  AnimationAction,
  BoxGeometry,
} from "three";
import FontJson from "../resources/Fredoka One_Regular.json";

const font = new Font(FontJson);

// const dieColor = new Color("rgb(30, 30, 30)");
const dieColor = new Color("rgb(20, 20, 20)");
const dieHighlighted = new Color("rgb(255, 0, 0)");

type NumberTextProps = {
  face: Face3;
  text: string;
  vertices: ReactThreeFiber.Vector3[];
  rotation: number;
};

const NumberText = (props: NumberTextProps) => {
  const textRef = useMemo(() => {
    const geo = new TextGeometry(props.text, {
      font,
      size: 0.9,
      height: 0.001,
    });

    const size = new Vector3();
    geo.computeBoundingBox();
    geo.boundingBox?.getSize(size);
    geo.applyMatrix4(
      new Matrix4().makeTranslation(-size.x / 2, -size.y / 2, -size.z / 2)
    );

    geo.rotateZ(props.rotation);

    const v3 = new Vector3(
      props.face.normal.x,
      props.face.normal.y,
      props.face.normal.z
    );

    geo.lookAt?.(v3.multiplyScalar(10));

    return geo;
  }, [props.text, props.face, props.rotation]);

  let x = 0,
    y = 0,
    z = 0;

  const vertA = props.vertices[props.face.a];
  const vertB = props.vertices[props.face.b];
  const vertC = props.vertices[props.face.c];

  if ("x" in vertA && "x" in vertB && "x" in vertC) {
    x = (vertA.x + vertB.x + vertC.x) / 3;
    y = (vertA.y + vertB.y + vertC.y) / 3;
    z = (vertA.z + vertB.z + vertC.z) / 3;
  }

  return (
    <mesh position={[x, y, z]} geometry={textRef}>
      <meshStandardMaterial attach="material" color="#d2d2d2" />
    </mesh>
  );
};

const faceIndexes: number[] = [1, 2, 3, 4, 5, 6];
const rotations: number[] = [0, 0, 0, 0, 0, 0];

type LEDAnimation = {
  times: number[];
  colors: any[];
};

type Props = {
  animations: LEDAnimation[];
  animationDuration: number;
};

export default ({ animations, animationDuration }: Props) => {
  const groupRef = useRef<ReactThreeFiber.Object3DNode<Group, typeof Group>>();

  const currentFace = useRef<number>(-1);
  const previousFace = useRef<number>(-1);

  const dieGeo = useMemo(() => new BoxGeometry(3, 3, 3), []);

  const dieGeo2 = useMemo(() => new BoxGeometry(4, 4, 4), []);

  const onClick = useCallback((event) => {
    if (currentFace.current >= 0) {
      previousFace.current = currentFace.current;
    }

    console.log(event);

    currentFace.current = event.faceIndex;
  }, []);

  const dieMesh = useMemo(() => {
    const m = new Mesh(
      dieGeo,
      new MeshStandardMaterial({
        color: dieColor,
        opacity: 1,
        transparent: true,
        metalness: 0.5,
        vertexColors: true,
      })
    );

    console.log(m);

    return m;
  }, [dieGeo]);

  const leds = useMemo(() => {
    const l = new Array(6).fill(0).map((_, i) => {
      let x = 0;
      let y = 0;
      let z = 0;

      const vertA = dieGeo2.vertices[dieGeo2.faces[i].a];
      const vertB = dieGeo2.vertices[dieGeo2.faces[i].b];
      const vertC = dieGeo2.vertices[dieGeo2.faces[i].c];

      if ("x" in vertA && "x" in vertB && "x" in vertC) {
        x = (vertA.x + vertB.x + vertC.x) / 3;
        y = (vertA.y + vertB.y + vertC.y) / 3;
        z = (vertA.z + vertB.z + vertC.z) / 3;
      }

      const pl = new PointLight("#ffffff", 0.009, 5);

      pl.position.set(x, y, z);

      return pl;
    });
    return l;
  }, [dieGeo2]);

  const ledAnimationMixers = useMemo(
    () => leds.map((led) => new AnimationMixer(led)),
    [leds]
  );

  useEffect(() => {
    const actions: AnimationAction[] = [];

    for (var i = 0; i < 6; i++) {
      if (animations.length > i && animations[i]) {
        const track = new ColorKeyframeTrack(
          ".color",
          animations[faceIndexes[i] - 1].times,
          animations[faceIndexes[i] - 1].colors,
          InterpolateDiscrete
        );

        const clip = new AnimationClip(
          `D6LEDAnimation${i + 1}`,
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
    const a = new Array(6).fill(0).map((_, i) => {
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
          `D6LEDAnimation${i + 1}`,
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
    if (dieMesh.geometry && dieMesh.geometry.faces) {
      let updated = false;

      if (previousFace.current >= 0) {
        dieMesh.geometry.faces[previousFace.current].color = dieColor;
        updated = true;
        previousFace.current = -1;
      }

      if (
        currentFace.current >= 0 &&
        dieMesh.geometry.faces[currentFace.current].color !== dieHighlighted
      ) {
        dieMesh.geometry.faces[currentFace.current].color = dieHighlighted;
        updated = true;
      }

      if (updated) {
        dieMesh.geometry.elementsNeedUpdate = true;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={dieMesh} onDoubleClick={onClick} />
      {faceIndexes.map((v, i) => (
        <NumberText
          key={`Text${i}`}
          text={`${v}`}
          face={dieGeo.faces[i]}
          vertices={dieGeo.vertices}
          rotation={rotations[i]}
        />
      ))}
      {leds.map((v, i) => (
        <primitive key={`LED${i}`} object={v} />
      ))}
    </group>
  );
};
