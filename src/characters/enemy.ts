import { vec3, mat4 } from "gl-matrix";
import myGameScene from "../scenes/myGameScene";
import ShaderProgram from "../common/shader-program";
import { spaceShip } from "./spaceship";
import mesh from "../common/mesh";
//This is the abstract base of all scenes
import * as MeshUtils from "../common/mesh-utils";
import * as gameUtils from "../common/gameUtils/gameUtils";

export class enemy extends spaceShip {
    public constructor(pos: vec3, speed: number, width: number, height: number, length: number, shootPower: number, direction: vec3, health: number, mygameScene: myGameScene) {
        super(pos, speed, width, height, length, shootPower, direction, health);
        // prepare the object mesh
        this.shapeMesh = MeshUtils.LoadOBJMesh(mygameScene.gl, mygameScene.game.loader.resources["spaceship"]);
        this.shapeTextures[0] = mygameScene.gl.createTexture();
        mygameScene.gl.activeTexture(mygameScene.gl.TEXTURE0);
        mygameScene.gl.bindTexture(mygameScene.gl.TEXTURE_2D, this.shapeTextures[0]);
        mygameScene.gl.pixelStorei(mygameScene.gl.UNPACK_ALIGNMENT, 4);
        mygameScene.gl.texImage2D(mygameScene.gl.TEXTURE_2D, 0, mygameScene.gl.RGBA, mygameScene.gl.RGBA, mygameScene.gl.UNSIGNED_BYTE, mygameScene.game.loader.resources["spaceship-texture"]);
        mygameScene.gl.generateMipmap(mygameScene.gl.TEXTURE_2D);
        this.shapeGameScene = mygameScene;
    }
    
    public draw(VP: mat4, program: ShaderProgram): void {
        program.use();
        let spaceshipMat = mat4.create();
        mat4.translate(spaceshipMat, spaceshipMat, this.pos);
        program.setUniformMatrix4fv("VP", false, VP);
        program.setUniformMatrix4fv("M", false, spaceshipMat);
        program.setUniform4f("tint", [1, 1, 1, 1]);
        this.shapeGameScene.gl.activeTexture(this.shapeGameScene.gl.TEXTURE0);
        this.shapeGameScene.gl.bindTexture(this.shapeGameScene.gl.TEXTURE_2D, this.shapeTextures[0]);
        program.setUniform1i("texture_sampler", 0);
        this.shapeMesh.draw(this.shapeGameScene.gl.TRIANGLES);
    }
}
