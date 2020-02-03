#version 300 es
layout(location=0) in vec3 position;
layout(location=1) in vec4 color;
layout(location=2) in vec2 texcoord;

out vec4 v_color;
out vec2 v_texcoord;

uniform mat4 VP;
uniform mat4 M;

void main(){
    gl_Position = VP * M * vec4(position, 1.0f); 
    v_color = color;
    v_texcoord = texcoord;
}