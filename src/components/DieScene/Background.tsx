import { useThree, useFrame, useLoader } from "react-three-fiber";
import { TextureLoader } from "three";

const image = require("../../resources/backdrop.jpg");

export default () => {
  const { scene } = useThree();

  const background = useLoader(TextureLoader, image);

  useFrame(() => {
    scene.background = background;
  });

  return null;
};
