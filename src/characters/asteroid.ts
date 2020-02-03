


import { vec3, mat4 } from "gl-matrix";
import mesh from "../common/mesh";
import myGameScene from "../scenes/myGameScene";
import ShaderProgram from "../common/shader-program";
import { player } from "./player";
import * as MeshUtils from "../common/mesh-utils";
import * as gameUtils from "../common/gameUtils/gameUtils";

export class asteroid {
    pos: vec3; // this is the center position
    toggle: boolean = true;
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
    public constructor(pos: vec3, speed: number, width: number, height: number, length: number, shootPower: number, direction: vec3, health: number, mygameScene: myGameScene) {
        this.pos = pos;
        this.speed = speed;
        this.shootPower = shootPower;
        this.diretion = direction;
        this.health = health;
        this.width = width;
        this.height = height;
        this.length = length;
        // prepare the object mesh
        this.shapeMesh = MeshUtils.LoadOBJMesh(mygameScene.gl, mygameScene.game.loader.resources["asteroid"]);
        this.shapeTextures[0] = mygameScene.gl.createTexture();
        mygameScene.gl.activeTexture(mygameScene.gl.TEXTURE0);
        mygameScene.gl.bindTexture(mygameScene.gl.TEXTURE_2D, this.shapeTextures[0]);
        mygameScene.gl.pixelStorei(mygameScene.gl.UNPACK_ALIGNMENT, 4);
        mygameScene.gl.texImage2D(mygameScene.gl.TEXTURE_2D, 0, mygameScene.gl.RGBA, mygameScene.gl.RGBA, mygameScene.gl.UNSIGNED_BYTE, mygameScene.game.loader.resources["asteroid-texture"]);
        mygameScene.gl.generateMipmap(mygameScene.gl.TEXTURE_2D);
        this.shapeTextures[1] = mygameScene.gl.createTexture();
        mygameScene.gl.activeTexture(mygameScene.gl.TEXTURE1);
        mygameScene.gl.bindTexture(mygameScene.gl.TEXTURE_2D, this.shapeTextures[1]);
        mygameScene.gl.pixelStorei(mygameScene.gl.UNPACK_ALIGNMENT, 4);
        mygameScene.gl.texImage2D(mygameScene.gl.TEXTURE_2D, 0, mygameScene.gl.RGBA, mygameScene.gl.RGBA, mygameScene.gl.UNSIGNED_BYTE, mygameScene.game.loader.resources["asteroid-texture1"]);
        mygameScene.gl.generateMipmap(mygameScene.gl.TEXTURE_2D);
        this.shapeGameScene = mygameScene;
    }
    public draw(VP: mat4, program: ShaderProgram): void {
        program.use();
        let spaceshipMat = mat4.create();
        mat4.translate(spaceshipMat, spaceshipMat, this.pos);
        mat4.rotateY(spaceshipMat, spaceshipMat, Math.PI);
        program.setUniformMatrix4fv("VP", false, VP);
        program.setUniformMatrix4fv("M", false, spaceshipMat);
        program.setUniform4f("tint", [1, 1, 1, 1]);
        let randInt = gameUtils.getRndInteger(-1, 1);
        if (this.toggle) {
            this.shapeGameScene.gl.activeTexture(this.shapeGameScene.gl.TEXTURE0);
            this.shapeGameScene.gl.bindTexture(this.shapeGameScene.gl.TEXTURE_2D, this.shapeTextures[0]);
        }
        else {
            this.shapeGameScene.gl.activeTexture(this.shapeGameScene.gl.TEXTURE1);
            this.shapeGameScene.gl.bindTexture(this.shapeGameScene.gl.TEXTURE_2D, this.shapeTextures[1]);
        }
        program.setUniform1i("texture_sampler", 0);
        this.shapeMesh.draw(this.shapeGameScene.gl.TRIANGLES);
    }
    public updatePosition(gamePlayer: player): void {
        let playerPos = gamePlayer.pos;
        this.pos[2] -= 0.1;
        if (this.pos[2] < -10) {
            let randNum = gameUtils.getRndInteger(-1, 1);
            this.pos[2] = 30;
            this.pos[1] = 2.5 * randNum;
        }
        else if (vec3.dist(playerPos, this.pos) <= 1.5) {
            let randNum = gameUtils.getRndInteger(-1, 1);
            this.pos[2] = 30;
            this.pos[1] = 2.5 * randNum;
            gamePlayer.health -= 10;
            console.log("health is " + gamePlayer.health)
            const healthDiv = document.querySelector("#bar");
            healthDiv.innerHTML = "" + gamePlayer.health;


        }
    }
}
