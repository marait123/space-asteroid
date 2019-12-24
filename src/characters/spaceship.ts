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
    shapeTexture: WebGLTexture;
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

export class player extends spaceShip {
    score: number = 0;
    static distBetObjects:number = 2.5;
    static posLimit:number = 1;
    public constructor(
        pos: vec3,
        speed: number,
        width: number,
        height: number,
        length: number,
        shootPower: number,
        direction: vec3,
        health: number,
        mygameScene: myGameScene
    ) {
        super(pos, speed, width, height, length, shootPower, direction, health);
        // prepare the object mesh
        this.shapeMesh = MeshUtils.LoadOBJMesh(
            mygameScene.gl,
            mygameScene.game.loader.resources["spaceship"]
        );
        this.shapeTexture = mygameScene.gl.createTexture();
        mygameScene.gl.activeTexture(mygameScene.gl.TEXTURE0);

        mygameScene.gl.bindTexture(
            mygameScene.gl.TEXTURE_2D,
            this.shapeTexture
        );
        mygameScene.gl.pixelStorei(mygameScene.gl.UNPACK_ALIGNMENT, 4);
        mygameScene.gl.texImage2D(
            mygameScene.gl.TEXTURE_2D,
            0,
            mygameScene.gl.RGBA,
            mygameScene.gl.RGBA,
            mygameScene.gl.UNSIGNED_BYTE,
            mygameScene.game.loader.resources["spaceship-texture"]
        );
        mygameScene.gl.generateMipmap(mygameScene.gl.TEXTURE_2D);
        this.shapeGameScene = mygameScene;
    }
    public decreaseHealth() {
        this.health -= 10;
    }
    public draw(VP: mat4, program: ShaderProgram): void {
        program.use();
        let spaceshipMat = mat4.clone(VP);
        mat4.translate(spaceshipMat, spaceshipMat, this.pos);

        program.setUniformMatrix4fv("MVP", false, spaceshipMat);
        program.setUniform4f("tint", [1, 1, 1, 1]);

        this.shapeGameScene.gl.activeTexture(this.shapeGameScene.gl.TEXTURE0);
        this.shapeGameScene.gl.bindTexture(
            this.shapeGameScene.gl.TEXTURE_2D,
            this.shapeTexture
        );
        program.setUniform1i("texture_sampler", 0);

        this.shapeMesh.draw(this.shapeGameScene.gl.TRIANGLES);
    }
    public moveRight():void{
        // decrement x
        if(this.pos[0] > (-1 * player.posLimit) ){
            this.pos[0] -=   player.distBetObjects;
        }

    }
    public moveLeft():void{
        // decrement x
        if(this.pos[0] < (  player.posLimit) ){
            this.pos[0] +=  player.distBetObjects;
        }

    }
   
    public moveDown():void{
        // decrement x
        if(this.pos[1] > (-1 * player.posLimit) ){
            this.pos[1] -=   player.distBetObjects;
        }

    }
    public moveUp():void{
        // decrement x
        if(this.pos[1] < (  player.posLimit) ){
            this.pos[1] +=  player.distBetObjects;
        }

    }
   
    
    public incrementScore(): void {
        this.score += 0.1;
        document.querySelector(
            "div#text span#score"
        ).innerHTML = this.score.toFixed(0);
    }
}

export class enemy extends spaceShip {
    public constructor(
        pos: vec3,
        speed: number,
        width: number,
        height: number,
        length: number,
        shootPower: number,
        direction: vec3,
        health: number,
        mygameScene: myGameScene
    ) {
        super(pos, speed, width, height, length, shootPower, direction, health);
        // prepare the object mesh
        this.shapeMesh = MeshUtils.LoadOBJMesh(
            mygameScene.gl,
            mygameScene.game.loader.resources["spaceship"]
        );
        this.shapeTexture = mygameScene.gl.createTexture();
        mygameScene.gl.activeTexture(mygameScene.gl.TEXTURE0);
        mygameScene.gl.bindTexture(
            mygameScene.gl.TEXTURE_2D,
            this.shapeTexture
        );
        mygameScene.gl.pixelStorei(mygameScene.gl.UNPACK_ALIGNMENT, 4);
        mygameScene.gl.texImage2D(
            mygameScene.gl.TEXTURE_2D,
            0,
            mygameScene.gl.RGBA,
            mygameScene.gl.RGBA,
            mygameScene.gl.UNSIGNED_BYTE,
            mygameScene.game.loader.resources["enemy-texture"]
        );
        mygameScene.gl.generateMipmap(mygameScene.gl.TEXTURE_2D);
        this.shapeGameScene = mygameScene;
    }

    public draw(VP: mat4, program: ShaderProgram): void {
        program.use();
        let spaceshipMat = mat4.clone(VP);
        mat4.translate(spaceshipMat, spaceshipMat, this.pos);

        // mat4.rotateX(spaceshipMat, spaceshipMat, Math.PI/2);
        /* mat4.rotateY(spaceshipMat, spaceshipMat, Math.PI/2);         
       mat4.translate(spaceshipMat, spaceshipMat, this.pos);
       mat4.scale(spaceshipMat, spaceshipMat,vec3.fromValues(this.length,this.width,this.height));
     */
        //mat4.rotateZ(spaceshipMat, spaceshipMat, Math.PI/8);
        mat4.rotateY(spaceshipMat, spaceshipMat, Math.PI);
        program.setUniformMatrix4fv("MVP", false, spaceshipMat);
        program.setUniform4f("tint", [1, 1, 1, 1]);

        this.shapeGameScene.gl.activeTexture(this.shapeGameScene.gl.TEXTURE0);
        this.shapeGameScene.gl.bindTexture(
            this.shapeGameScene.gl.TEXTURE_2D,
            this.shapeTexture
        );
        program.setUniform1i("texture_sampler", 0);

        this.shapeMesh.draw(this.shapeGameScene.gl.TRIANGLES);
    }
}

export class asteroid {
    pos: vec3; // this is the center position

    height: number;
    length: number;
    width: number;
    speed: number;
    shootPower: number; // we have to rethink of this
    diretion: vec3;
    health: number;

    shapeMesh: mesh;
    shapeTexture: WebGLTexture;
    shapeGameScene: myGameScene;

    public constructor(
        pos: vec3,
        speed: number,
        width: number,
        height: number,
        length: number,
        shootPower: number,
        direction: vec3,
        health: number,
        mygameScene: myGameScene
    ) {
        this.pos = pos;
        this.speed = speed;
        this.shootPower = shootPower;
        this.diretion = direction;
        this.health = health;
        this.width = width;
        this.height = height;
        this.length = length;
        // prepare the object mesh
        this.shapeMesh = MeshUtils.LoadOBJMesh(
            mygameScene.gl,
            mygameScene.game.loader.resources["asteroid"]
        );
        this.shapeTexture = mygameScene.gl.createTexture();
        mygameScene.gl.activeTexture(mygameScene.gl.TEXTURE0);
        mygameScene.gl.bindTexture(
            mygameScene.gl.TEXTURE_2D,
            this.shapeTexture
        );
        mygameScene.gl.pixelStorei(mygameScene.gl.UNPACK_ALIGNMENT, 4);
        mygameScene.gl.texImage2D(
            mygameScene.gl.TEXTURE_2D,
            0,
            mygameScene.gl.RGBA,
            mygameScene.gl.RGBA,
            mygameScene.gl.UNSIGNED_BYTE,
            mygameScene.game.loader.resources["asteroid-texture"]
        );
        mygameScene.gl.generateMipmap(mygameScene.gl.TEXTURE_2D);
        this.shapeGameScene = mygameScene;
    }

    public draw(VP: mat4, program: ShaderProgram): void {
        program.use();
        let spaceshipMat = mat4.clone(VP);
        mat4.translate(spaceshipMat, spaceshipMat, this.pos);

        // mat4.rotateX(spaceshipMat, spaceshipMat, Math.PI/2);
        /* mat4.rotateY(spaceshipMat, spaceshipMat, Math.PI/2);         
       mat4.translate(spaceshipMat, spaceshipMat, this.pos);
       mat4.scale(spaceshipMat, spaceshipMat,vec3.fromValues(this.length,this.width,this.height));
     */
        //mat4.rotateZ(spaceshipMat, spaceshipMat, Math.PI/8);
        mat4.rotateY(spaceshipMat, spaceshipMat, Math.PI);
        program.setUniformMatrix4fv("MVP", false, spaceshipMat);
        program.setUniform4f("tint", [1, 1, 1, 1]);

        this.shapeGameScene.gl.activeTexture(this.shapeGameScene.gl.TEXTURE0);
        this.shapeGameScene.gl.bindTexture(
            this.shapeGameScene.gl.TEXTURE_2D,
            this.shapeTexture
        );
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
        } else if (vec3.dist(playerPos, this.pos) <= 1.5) {
            console.log("colloided");
            let randNum = gameUtils.getRndInteger(-1, 1);
            this.pos[2] = 30;
            this.pos[1] = 2.5 * randNum;
            gamePlayer.health -= 10;
        }
    }
}
