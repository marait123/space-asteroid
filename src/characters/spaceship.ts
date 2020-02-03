import { vec3, mat4, quat } from "gl-matrix";
import mesh from "../common/mesh";
import myGameScene from "../scenes/myGameScene";
//This is the abstract base of all scenes
import * as MeshUtils from "../common/mesh-utils";
import ShaderProgram from "../common/shader-program";
import { scaleAndAdd } from "gl-matrix/src/gl-matrix/vec3";
import * as gameUtils from "../common/gameUtils/gameUtils";

export abstract class spaceShip {
    pos: vec3; // this is the center position

    height: number;
    length: number;
    width: number;
    speed: number;
    shootPower: number; // we have to rethink of this
    diretion: vec3;
    health: number;

    shapeMesh: mesh;
    shapeTextures: WebGLTexture[] = [];
    shapeGameScene: myGameScene;
    public constructor(
        pos: vec3,
        speed: number,
        width: number,
        height: number,
        length: number,
        shootPower: number,
        direction: vec3,
        health: number
    ) {
        this.pos = pos;
        this.speed = speed;
        this.shootPower = shootPower;
        this.diretion = direction;
        this.health = health;
        this.width = width;
        this.height = height;
        this.length = length;
    }
    public abstract draw(VP: mat4, program: ShaderProgram): void; // Here will draw the scene (deltaTime is the difference in time between this frame and the past frame in milliseconds)
}


