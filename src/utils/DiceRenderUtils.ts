import { ReactThreeFiber } from "react-three-fiber";
import {
  Vector3,
  TextGeometry,
  Font,
  Mesh,
  MeshStandardMaterial,
  Matrix4,
  PointLight,
  Color,
} from "three";

import FontJson from "../resources/Fredoka One_Regular.json";

const font = new Font(FontJson);

const getAvgPosition = (
  vertices: ReactThreeFiber.Vector3[]
): [number, number, number] => {
  let x = 0,
    y = 0,
    z = 0;

  if (vertices.length > 0) {
    vertices.forEach((v) => {
      if ("x" in v) {
        x += v.x;
        y += v.y;
        z += v.z;
      }
    });

    x /= vertices.length;
    y /= vertices.length;
    z /= vertices.length;
  }

  return [x, y, z];
};

const createText = (
  text: string,
  vertices: ReactThreeFiber.Vector3[],
  normal: Vector3,
  rotation: number,
  fontSize: number
) => {
  const geo = new TextGeometry(text, {
    font,
    size: fontSize,
    height: 0.001,
  });

  const size = new Vector3();
  geo.computeBoundingBox();
  geo.boundingBox?.getSize(size);
  geo.applyMatrix4(
    new Matrix4().makeTranslation(-size.x / 2, -size.y / 2, -size.z / 2)
  );

  geo.rotateZ(rotation);

  const v3 = new Vector3(normal.x, normal.y, normal.z);

  geo.lookAt?.(v3.multiplyScalar(10));

  const mesh = new Mesh(geo, new MeshStandardMaterial({ color: "#d2d2d2" }));

  mesh.position.set(...getAvgPosition(vertices));

  return mesh;
};

const createLight = (
  intensity: number,
  distance: number,
  color: string | number | Color,
  vertices: ReactThreeFiber.Vector3[]
) => {
  const pl = new PointLight("#ffffff", 0.009, 5);

  pl.position.set(...getAvgPosition(vertices));

  return pl;
};

export { createText, createLight, getAvgPosition };
