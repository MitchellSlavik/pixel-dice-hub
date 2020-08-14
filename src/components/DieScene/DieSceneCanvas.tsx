import React, { useRef } from "react";
import { Canvas } from "react-three-fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import DieScene from "./DieScene";

const DieSceneCanvas: React.FC = ({ children }) => {
  const controls = useRef<OrbitControls | null>(null);
  return (
    <Canvas
      camera={{ position: [0, 0, 10], up: [0, 1, 0] }}
      onCreated={({ camera, gl, scene }) => {
        // Add camera to scene so that its children get rendered
        scene.add(camera);

        // Add orbit controls
        controls.current = new OrbitControls(camera, gl.domElement);
        controls.current.enablePan = false;
        controls.current.enableKeys = false;
        controls.current.enableZoom = false;
      }}
    >
      <DieScene />
      {children}
    </Canvas>
  );
};

export default DieSceneCanvas;
