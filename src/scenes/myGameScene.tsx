import { Scene } from "../common/game";
import ShaderProgram from "../common/shader-program";
import Mesh from "../common/mesh";
import Camera from "../common/camera";
import FlyCameraController from "../common/camera-controllers/fly-camera-controller";
import { vec3, mat4 } from "gl-matrix";
import { Vector, Selector } from "../common/dom-utils";
import {
    createElement,
    StatelessProps,
    StatelessComponent
} from "tsx-create-element";
import { Plane, Cube } from "../common/mesh-utils";
import * as MeshUtils from "../common/mesh-utils";
import { player } from "../characters/player";
import {enemy} from "../characters/enemy"
import { asteroid } from "../characters/asteroid";
import * as gameUtils from "../common/game-utils";
import { Key } from "ts-key-enum";
import {sky} from "../characters/sky"

// It follows a tree like structure where every node defines a celestial object and its children if any
interface gameSystemDescription {
    width:number,
    height:number,
    length:number    
  };

// In this scene we will draw one rectangle with a texture
export default class myGameScene extends Scene {
    camera: Camera;
    controller: FlyCameraController;
    textures: WebGLTexture[] = [];
    current_texture: number = 0;
    sampler: WebGLSampler;
    programs: { [name: string]: ShaderProgram } = {};
    meshes: { [name: string]: Mesh } = {};

    systems: {[name:string]:gameSystemDescription};
    
    // enemyLevels: {[levNum: number]: enemy[]} = {};
    // game attributes & characters area
    myPlayer: player;
    enemyLevel: enemy[][];
    asteroidLevel: asteroid[][];
    numOfBatches: number = 3; // each batch has 3 enemies
    batchDistance: number = 10; // this is the distance between each batch of enemies
    objectDistance: number = 2.5;
    testEnemy: enemy;
    mySky:sky;


    texcoordinates: Float32Array = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]);
    wrap_s: number;
    wrap_t: number;
    mag_filter: number;
    min_filter: number;

    playerPosition: vec3 = vec3.fromValues(1, 1, 1);

    static readonly cubemapDirections = [
        "negx",
        "negy",
        "negz",
        "posx",
        "posy",
        "posz"
    ];

    public load(): void {
        // These shaders take 2 uniform: MVP for 3D transformation and Tint for modifying colors
        this.game.loader.load({
            ["texture.vert"]: { url: "shaders/texture.vert", type: "text" },
            ["texture.frag"]: { url: "shaders/texture.frag", type: "text" },
            ["sky.frag"]: { url: "shaders/sky.frag", type: "text" },
            ["sky.vert"]: { url: "shaders/sky.frag", type: "text" },
            ["texture"]: { url: "images/color-grid.png", type: "image" },
            ["sky-cube.vert"]: { url: "shaders/sky-cube.vert", type: "text" },
            ["sky-cube.frag"]: { url: "shaders/sky-cube.frag", type: "text" },
            ["spaceship1"]: {
                url: "models/spaceships/spaceship.obj",
                type: "text"
            },
            ["spaceship-texture1"]: {
                url: "models/spaceships/sh3.jpg",
                type: "image"
            }, 
            ["spaceship"]: { url: "models/spaceships/spaceship2.obj", type: "text" },
            ["spaceship-texture"]: {
                url: "models/spaceships/sh3.png",
                type: "image"
            },
            ["asteroid"]: { url: "models/astroid/ad.obj", type: "text" },
            ["asteroid-texture"]: {
                url: "models/astroid/astext.jpg",
                type: "image"
            },
            ["asteroid-texture1"]: {
                url: "models/astroid/astext1.jpg",
                type: "image"
            },
            ["enemy-texture"]: {
                url: "models/spaceships/sh3_s.jpg",
                type: "image"
            },
            
            ["systems"]:{url:'data/solar-systems.json', type:'json'},
            ...Object.fromEntries(
                myGameScene.cubemapDirections.map(dir => [
                    dir,
                    { url: `images/space/${dir}.png`, type: "image" }
                ])
            )
        });
    }

    public PrepareShaderProgram(progName:string, vertResource:string, fragResource:string ){
        this.programs[progName] = new ShaderProgram(this.gl);
        this.programs[progName].attach(
            this.game.loader.resources[vertResource],
            this.gl.VERTEX_SHADER
        );
        this.programs[progName].attach(
            this.game.loader.resources[fragResource],
            this.gl.FRAGMENT_SHADER
        );
        this.programs[progName].link();
    }

    public start(): void {
        this.systems = this.game.loader.resources["systems"];
        this.PrepareShaderProgram("cube", "texture.vert", "texture.frag");
        this.PrepareShaderProgram("sky","sky-cube.vert","sky-cube.frag");
        this.meshes["spaceship"] = MeshUtils.LoadOBJMesh(
            this.gl,
            this.game.loader.resources["spaceship"]
        );
      // sky
      this.mySky = new sky(this);



        this.wrap_s = this.wrap_t = this.gl.REPEAT;
        this.mag_filter = this.min_filter = this.gl.NEAREST;

        this.textures["spaceship"] = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures["spaceship"]);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 4);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            this.game.loader.resources["spaceship-texture"]
        );
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_WRAP_S,
            this.gl.REPEAT
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_WRAP_T,
            this.gl.REPEAT
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_MAG_FILTER,
            this.gl.LINEAR
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_MIN_FILTER,
            this.gl.LINEAR_MIPMAP_LINEAR
        );

        this.camera = new Camera();
        this.camera.type = "perspective";
        this.camera.position = vec3.fromValues(3, 5, -10);
        this.camera.direction = vec3.fromValues(0, 0, 1);
        this.camera.aspectRatio =
            this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;

        this.controller = new FlyCameraController(this.camera, this.game.input);
        this.controller.movementSensitivity = 0.001;

        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.frontFace(this.gl.CCW);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearColor(0, 0, 0, 1);
        this.setupControls();

        // Create a colored rectangle using our new Mesh class
        this.meshes["cube"] = Cube(this.gl);

        this.meshes["sky"] = Cube(this.gl);
        this.programs["cube"].use();
        this.programs["cube"].setUniform1i("texture_sampler", 0);
        /// A draw the characters at the start of the game
        // A.1. draw the enemies

           // A.2 draw the player
        this.myPlayer = new player(
            vec3.fromValues(0, 0, 0),
            0,
            this.systems[Object.keys(this.systems)[0]].width,
            this.systems[Object.keys(this.systems)[0]].height,
            this.systems[Object.keys(this.systems)[0]].length,
            5,
            vec3.fromValues(0, 0, 1),
            100,
            this
        );

        this.testEnemy = new enemy(
            vec3.fromValues(0, 0, 4),
            0,
            this.systems[Object.keys(this.systems)[0]].width,
            this.systems[Object.keys(this.systems)[0]].height,
            this.systems[Object.keys(this.systems)[0]].length,
            5,
            vec3.fromValues(0, 0, 1),
            100,
            this
        );
            
        this.generateLevel();
    }

    public draw(deltaTime: number): void {

        // -----------------------GAME LOOP ----------------------------
        this.controller.update(deltaTime);
        if (this.game.input.isKeyJustDown(Key.ArrowUp)) {
            this.myPlayer.moveUp();
        }
        else if (this.game.input.isKeyJustDown(Key.ArrowDown)) {
            this.myPlayer.moveDown();
        }
        else if (this.game.input.isKeyJustDown(Key.ArrowLeft)) {
            this.myPlayer.moveLeft();
        }
        else if (this.game.input.isKeyJustDown(Key.ArrowRight)) {
            this.myPlayer.moveRight();
        }


        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        // _------------- Gui Updating Area ----------------
        
        this.programs["cube"].use();
        let VP = this.camera.ViewProjectionMatrix;
        let playerMat = mat4.clone(VP);
        mat4.translate(playerMat, playerMat, this.playerPosition);
        
        this.myPlayer.draw(VP, this.programs["cube"]);
        this.myPlayer.incrementScore(); 
        
        //this.testEnemy.draw(VP, this.programs["cube"])
        
        for (var i: number = 0; i < this.numOfBatches; i++) {
            for (var j: number = -1; j <= 1; j++) {
                this.asteroidLevel[i][j + 1].updatePosition(this.myPlayer);
                this.asteroidLevel[i][j + 1].draw(VP, this.programs["cube"]);
            }
        }
        this.mySky.draw(VP,this);        
    }

    public generateLevel(){
            
    this.asteroidLevel = [];
    for (var i: number = 0; i < this.numOfBatches; i++) {
        this.asteroidLevel[i] = [];
        for (var j: number = -1; j <= 1; j++) {
            let randNum = gameUtils.getRndInteger(-1, 1);
            this.asteroidLevel[i][j + 1] = new asteroid(
                vec3.fromValues(
                    j * this.objectDistance,
                    randNum * this.objectDistance,
                    (i + 1) * this.batchDistance
                ),
                10,
                2,
                2,
                2,
                3,
                vec3.fromValues(0, 0, -1),
                100,
                this
            );
        }
    }
    }
  
    public end(): void {
        for (let key in this.programs) {
            this.programs[key].dispose;
        }
        this.programs = {};
        for (let key in this.meshes) {
            this.meshes[key].dispose;
        }
        this.meshes = {};
        for (let texture of this.textures) this.gl.deleteTexture(texture);
        this.textures = [];
        this.gl.deleteSampler(this.sampler);
        this.clearControls();
    }

    /////////////////////////////////////////////////////////
    ////// ADD CONTROL TO THE WEBPAGE (NOT IMPORTNANT) //////
    /////////////////////////////////////////////////////////
    private setupControls() {
        const healthBar = document.querySelector("#bar");
        healthBar.innerHTML = "100"

    }

    private clearControls() {
        const controls = document.querySelector("#controls");
        controls.innerHTML = "";
    }
}
