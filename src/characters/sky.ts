import { vec3, mat4 } from "gl-matrix";
import myGameScene from "../scenes/myGameScene";
import ShaderProgram from "../common/shader-program";
import { spaceShip } from "./spaceship";
import mesh from "../common/mesh";
//gameScene is the abstract base of all scenes
import * as MeshUtils from "../common/mesh-utils";
import * as gameUtils from "../common/gameUtils/gameUtils";


export class sky {

    static readonly cubemapDirections = [
        "negx",
        "negy",
        "negz",
        "posx",
        "posy",
        "posz"
    ];
    skyTexture:WebGLTexture;
    skyProgram:ShaderProgram;

    public constructor(gameScene: myGameScene) {
        
        const target_directions = [
            gameScene.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gameScene.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gameScene.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            gameScene.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            gameScene.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            gameScene.gl.TEXTURE_CUBE_MAP_POSITIVE_Z
        ];

        
       this.skyTexture = gameScene.gl.createTexture();
        gameScene.gl.bindTexture(gameScene.gl.TEXTURE_CUBE_MAP, this.skyTexture);
        gameScene.gl.pixelStorei(gameScene.gl.UNPACK_ALIGNMENT, 4);
        for (let i = 0; i < 6; i++) {
            gameScene.gl.texImage2D(
                target_directions[i],
                0,
                gameScene.gl.RGBA,
                gameScene.gl.RGBA,
                gameScene.gl.UNSIGNED_BYTE,
                gameScene.game.loader.resources[sky.cubemapDirections[i]]
            );
        }
        gameScene.gl.generateMipmap(gameScene.gl.TEXTURE_CUBE_MAP);
        gameScene.sampler = gameScene.gl.createSampler();

        gameScene.gl.samplerParameteri(
            gameScene.sampler,
            gameScene.gl.TEXTURE_MAG_FILTER,
            gameScene.gl.LINEAR
        );
        gameScene.gl.samplerParameteri(
            gameScene.sampler,
            gameScene.gl.TEXTURE_MIN_FILTER,
            gameScene.gl.LINEAR_MIPMAP_LINEAR
        );
    }
    
    public  draw(VP: mat4, gameScene: myGameScene): void {
        let M = mat4.clone(VP);
        mat4.translate(M, M, vec3.fromValues(0, 0, -2));
        mat4.rotateY(M, M, performance.now() / 1000);

        gameScene.gl.bindTexture(gameScene.gl.TEXTURE_CUBE_MAP, this.skyTexture);

        gameScene.gl.cullFace(gameScene.gl.FRONT);
        gameScene.gl.depthMask(false);

        gameScene.programs["sky"].use();

        gameScene.programs["sky"].setUniformMatrix4fv(
            "VP",
            false,
            gameScene.camera.ViewProjectionMatrix
        );
        gameScene.programs["sky"].setUniform3f("cam_position", gameScene.camera.position);

        let skyMat = mat4.create();
        mat4.translate(skyMat, skyMat, gameScene.camera.position);

        gameScene.programs["sky"].setUniformMatrix4fv("M", false, skyMat);
        gameScene.programs["sky"].setUniform4f("tint", [1, 1, 1, 1]);
        gameScene.programs["sky"].setUniformMatrix4fv(
            "M_it",
            true,
            mat4.invert(mat4.create(), M)
        );

        gameScene.gl.activeTexture(gameScene.gl.TEXTURE0);
        gameScene.gl.bindTexture(gameScene.gl.TEXTURE_CUBE_MAP, this.skyTexture);
        gameScene.programs["sky"].setUniform1i("cube_texture_sampler", 0);
        gameScene.gl.bindSampler(0, gameScene.sampler);

        gameScene.meshes["sky"].draw(gameScene.gl.TRIANGLES);

        gameScene.gl.cullFace(gameScene.gl.BACK);
        gameScene.gl.depthMask(true);
    }
}
