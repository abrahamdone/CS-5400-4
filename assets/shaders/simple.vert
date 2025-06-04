#version 300 es

in vec4 aPosition;
uniform int uInteresting;
uniform mat4 uScale;
uniform mat4 uProjection;
uniform mat4 uTransform;
in vec4 aColor;
out vec4 vColor;

void main() {
    mat4 transform = uProjection * uTransform;

    if (uInteresting == 1 && (aPosition == vec4(0.5, -0.5, 0.5, 1) || aPosition == vec4(0.5, 0.5, -0.5, 1) || aPosition == vec4(-0.5, 0.5, 0.5, 1) || aPosition == vec4(-0.5, -0.5, -0.5, 1))) {
        gl_Position = transform * uScale * aPosition;
    } else {
        gl_Position = transform * aPosition;
    }

    vColor = aColor;
}