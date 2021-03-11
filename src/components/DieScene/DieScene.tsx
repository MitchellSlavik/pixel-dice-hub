import React, { useEffect, Suspense } from "react";
import {
  Color,
  CircleBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Camera,
  RingBufferGeometry,
  PointLight,
} from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector";
import { useFrame, useThree } from "react-three-fiber";
import Background from "./Background";
import Effects from "./Effects";

const makeMirror = (xSign: number, camera: Camera) => {
  const reflector = new Reflector(new CircleBufferGeometry(4, 128), {
    clipBias: 0.003,
    textureHeight: 2000,
    textureWidth: 2000,
    color: new Color(0xbbbbbb),
  });

  const frame = new Mesh(
    new RingBufferGeometry(4, 4.1, 128),
    new MeshBasicMaterial({ color: "#000000" })
  );

  reflector.position.set(Math.sign(xSign) * 10, 0, -17);
  frame.position.set(Math.sign(xSign) * 10, 0, -17);
  camera.add(reflector);
  camera.add(frame);

  return () => {
    camera.remove(reflector);
    camera.remove(frame);
  };
};

const makeLight = (position: [number, number, number], camera: Camera) => {
  const light = new PointLight("#ffffff", 0.2);

  light.position.set(...position);

  camera.add(light);

  return () => {
    camera.remove(light);
  };
};

export default () => {
  const { camera } = useThree();

  useEffect(() => makeMirror(-1, camera), [camera]);
  useEffect(() => makeMirror(1, camera), [camera]);
  useEffect(() => makeLight([-30, 0, 0], camera), [camera]);
  useEffect(() => makeLight([30, 0, 0], camera), [camera]);
  useEffect(() => makeLight([0, 0, -30], camera), [camera]);
  useEffect(() => makeLight([0, 0, 30], camera), [camera]);
  useEffect(() => makeLight([0, -30, 0], camera), [camera]);
  useEffect(() => makeLight([0, 30, 0], camera), [camera]);

  useFrame((state) => {
    if (state.camera) {
      const camPos = state.camera.position;

      state.camera.children.forEach((child) => {
        child.lookAt(camPos.x / 3, camPos.y / 3, camPos.z / 3);
      });
    }
  });
  return (
    <>
      <Suspense fallback={null}>
        <Background />
      </Suspense>
      <ambientLight intensity={0.05} />
      <Effects />
    </>
  );
};
