import Geometry, { IGeometry } from "../geometry/geometry";
export default class ObjLoader {
    load(url: string): Promise<Geometry>;
    parseIndices(faceIndices: number[][], k: number, l: number, source: number[][], output: number[], name: string): void;
    parseFaces(F: number[][][], V: number[][], VN: number[][], VT: number[][], positions: number[], normals: number[], texcoords: number[], colors: number[]): void;
    parse(text: string): IGeometry;
    unrapUvw(positions: number[]): number[];
}
