import * as THREE from "three";

/**
 * Closed roof prisms built from raw triangles. All are centered at the
 * origin: x ∈ [-w/2, w/2], z ∈ [-d/2, d/2], y ∈ [0, rise], with the ridge
 * running along the x axis. Rotate the mesh to reorient the ridge.
 */

function fromTriangles(tris: number[][][]): THREE.BufferGeometry {
  const positions: number[] = [];
  for (const tri of tris) {
    for (const v of tri) positions.push(v[0], v[1], v[2]);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.computeVertexNormals();
  return geom;
}

/** Symmetric gable: ridge along x at full width. */
export function gablePrism(w: number, d: number, rise: number): THREE.BufferGeometry {
  const A = [-w / 2, rise, 0];
  const B = [w / 2, rise, 0];
  const C = [-w / 2, 0, d / 2];
  const D = [w / 2, 0, d / 2];
  const E = [-w / 2, 0, -d / 2];
  const F = [w / 2, 0, -d / 2];
  return fromTriangles([
    [C, D, B], [C, B, A], // front slope (+z)
    [F, E, A], [F, A, B], // back slope (-z)
    [C, A, E], // left end (-x)
    [D, F, B], // right end (+x)
    [C, E, F], [C, F, D], // bottom
  ]);
}

/** Hip: equal pitch all around; ridge shortened along x. */
export function hipPrism(w: number, d: number, rise: number): THREE.BufferGeometry {
  const hx = Math.max(w / 2 - d / 2, w * 0.08);
  const A = [-hx, rise, 0];
  const B = [hx, rise, 0];
  const C = [-w / 2, 0, d / 2];
  const D = [w / 2, 0, d / 2];
  const E = [-w / 2, 0, -d / 2];
  const F = [w / 2, 0, -d / 2];
  return fromTriangles([
    [C, D, B], [C, B, A], // front slope
    [F, E, A], [F, A, B], // back slope
    [C, A, E], // left hip
    [D, F, B], // right hip
    [C, E, F], [C, F, D], // bottom
  ]);
}

/** Shed: high edge at z = -d/2 sloping down to z = +d/2. */
export function shedPrism(w: number, d: number, rise: number): THREE.BufferGeometry {
  const A = [-w / 2, rise, -d / 2];
  const B = [w / 2, rise, -d / 2];
  const C = [-w / 2, 0, d / 2];
  const D = [w / 2, 0, d / 2];
  const E = [-w / 2, 0, -d / 2];
  const F = [w / 2, 0, -d / 2];
  return fromTriangles([
    [C, D, B], [C, B, A], // slope
    [F, E, A], [F, A, B], // back vertical face
    [C, A, E], // left end
    [D, F, B], // right end
    [C, E, F], [C, F, D], // bottom
  ]);
}

/** Triangular gable-end wall face, in the XY plane facing +z. */
export function gableEndShape(d: number, rise: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-d / 2, 0);
  shape.lineTo(d / 2, 0);
  shape.lineTo(0, rise);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}
