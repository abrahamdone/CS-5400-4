
// noinspection JSVoidFunctionReturnValueUsed
MySample.main = (function() {
    'use strict';

    const canvas = document.getElementById('canvas-main');
    const gl = canvas.getContext('webgl2');

    let vertices = {};
    let indices = {};
    let vertexColors = {};

    let shaderProgram = {};
    let indexBuffer = {};

    let projection = {};

    let rotateAngle = 0;

    let step = 0;
    let interesting = false;
    let size = 0.288675;
    let growing = true;
    let parallel = true;

    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update() {
        if (parallel) {
            projection = parallelProjection(1, -1, 1, -1, 1, 10);
        } else {
            projection = perspectiveProjection(1, 1, 1, 10);
        }

        if (step < 1000) {
            initializeVertices(0);
        } else if (step  < 2000) {
            initializeVertices(1)
        } else if (step < 3000) {
            initializeVertices(2)
        } else if (step < 10000) {
            interesting = true;
            initializeVertices(3)
        } else {
            growing = false;
            size = 0.288675;
            interesting = false;
            step = 0;
            parallel = !parallel;
        }

        step += 1;
        if (rotateAngle > 2 * Math.PI) {
            rotateAngle = 0;
        }
        rotateAngle += 0.01;

        if (interesting) {
            if (growing) {
                if (size >= 1.0) {
                    growing = false;
                } else {
                    size += 0.0005;
                }
            } else {
                if (size <= 0.288675) {
                    growing = true;
                } else {
                    size -= 0.0005;
                }
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Rendering code goes here
    //
    //------------------------------------------------------------------
    function render() {
        gl.clearColor(
            0.3921568627450980392156862745098,
            0.58431372549019607843137254901961,
            0.92941176470588235294117647058824,
            1.0);
        gl.clearDepth(1.0);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let uInteresting = gl.getUniformLocation(shaderProgram, 'uInteresting');
        gl.uniform1i(uInteresting, interesting ? 1 : 0);

        let uProjection = gl.getUniformLocation(shaderProgram, 'uProjection');
        gl.uniformMatrix4fv(uProjection, false, transposeMatrix4x4(projection));

        let cos = Math.cos(rotateAngle);
        let sin = Math.sin(rotateAngle);
        let zRotation = [
            cos, -sin,    0,    0,
            sin,  cos,    0,    0,
              0,    0,    1,    0,
              0,    0,    0,    1,
        ];
        let xRotation = [
               1,    0,    0,    0,
               0,  cos, -sin,    0,
               0,  sin,  cos,    0,
               0,    0,    0,    1
        ];
        let yRotation = [
             cos,    0,  sin,    0,
               0,    1,    0,    0,
            -sin,    0,  cos,    0,
               0,    0,    0,    1
        ];
        let move = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, -2,
            0, 0, 0, 1
        ];
        let uTransform = gl.getUniformLocation(shaderProgram, 'uTransform');
        gl.uniformMatrix4fv(uTransform, false, transposeMatrix4x4(multiplyMatrix4x4(move, multiplyMatrix4x4(zRotation, multiplyMatrix4x4(xRotation, yRotation)))));

        let scale = [
            size,    0,    0,    0,
               0, size,    0,    0,
               0,    0, size,    0,
               0,    0,    0,    1,
        ];
        let uScale = gl.getUniformLocation(shaderProgram, 'uScale');
        gl.uniformMatrix4fv(uScale, false, transposeMatrix4x4(scale));

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }

    //------------------------------------------------------------------
    //
    // This is the animation loop.
    //
    //------------------------------------------------------------------
    function animationLoop(time) {

        update();
        render();

        requestAnimationFrame(animationLoop);
    }

    async function initialize() {
        console.log('initializing...');

        const vertexShaderSource = await loadFileFromServer('assets/shaders/simple.vert');
        const fragmentShaderSource = await loadFileFromServer('assets/shaders/simple.frag');
        initializeShaders(vertexShaderSource, fragmentShaderSource);

        requestAnimationFrame(animationLoop);
    }

    function initializeVertices(set) {
        switch (set) {
            case 0:
                // octahedron
                vertices = new Float32Array([
                     0.5,  0.0,  0.0,
                     0.0,  0.5,  0.0,
                     0.0,  0.0,  0.5,
                    -0.5,  0.0,  0.0,
                     0.0, -0.5,  0.0,
                     0.0,  0.0, -0.5
                ]);
                indices = new Uint16Array([
                    0, 1, 2,
                    0, 5, 1,
                    0, 4, 5,
                    0, 2, 4,
                    3, 2, 1,
                    3, 1, 5,
                    3, 4, 2,
                    3, 5, 4
                ]);
                vertexColors = new Float32Array([
                    1.0, 0.0, 0.0,
                    0.0, 1.0, 0.0,
                    0.0, 0.0, 1.0,
                    1.0, 1.0, 0.0,
                    0.0, 1.0, 1.0,
                    1.0, 0.0, 1.0
                ]);
                break;
            case 1:
                // cube
                vertices = new Float32Array([
                     0.5,  0.5,  0.5,
                     0.5, -0.5, -0.5,
                    -0.5,  0.5, -0.5,
                    -0.5, -0.5,  0.5,
                     0.5, -0.5,  0.5,
                     0.5,  0.5, -0.5,
                    -0.5,  0.5,  0.5,
                    -0.5, -0.5, -0.5
                ]);
                indices = new Uint16Array([
                    0, 3, 4,
                    0, 4, 1,
                    1, 4, 3,
                    0, 6, 3,
                    0, 2, 6,
                    6, 2, 3,
                    0, 5, 2,
                    0, 1, 5,
                    5, 1, 2,
                    7, 1, 3,
                    7, 2, 1,
                    7, 3, 2
                ]);
                vertexColors = new Float32Array([
                      1.0, 0.0, 0.0,
                      0.0, 1.0, 0.0,
                      0.0, 0.0, 1.0,
                      0.0, 0.0, 0.0,
                      1.0, 1.0, 0.0,
                      1.0, 0.0, 1.0,
                      0.0, 1.0, 1.0,
                      1.0, 1.0, 1.0
                ]);
                break;
            case 2:
                // tetrahedron
                vertices = new Float32Array([
                     0.5,  0.5,  0.5,
                     0.5, -0.5, -0.5,
                    -0.5,  0.5, -0.5,
                    -0.5, -0.5,  0.5
                ]);
                indices = new Uint16Array([
                    0, 1, 2,
                    0, 2, 3,
                    1, 3, 2,
                    0, 3, 1
                ]);
                vertexColors = new Float32Array([
                    1.0, 0.0, 0.0,
                    0.0, 1.0, 0.0,
                    0.0, 0.0, 1.0,
                    0.0, 0.0, 0.0,
                ]);
                break;
            case 3:
                // special cube
                vertices = new Float32Array([
                     0.5,  0.5,  0.5,
                     0.5, -0.5, -0.5,
                    -0.5,  0.5, -0.5,
                    -0.5, -0.5,  0.5,
                     0.5, -0.5,  0.5,
                     0.5,  0.5, -0.5,
                    -0.5,  0.5,  0.5,
                    -0.5, -0.5, -0.5
                ]);
                indices = new Uint16Array([
                    0, 3, 4,
                    0, 4, 1,
                    1, 4, 3,
                    0, 6, 3,
                    0, 2, 6,
                    6, 2, 3,
                    0, 5, 2,
                    0, 1, 5,
                    5, 1, 2,
                    7, 1, 3,
                    7, 2, 1,
                    7, 3, 2
                ]);
                vertexColors = new Float32Array([
                      1.0,   0.0,   0.0,
                      0.0,   1.0,   0.0,
                      0.0,   0.0,   1.0,
                      0.0,   0.0,   0.0,
                    0.333, 0.333,   0.0,
                    0.333, 0.333, 0.333,
                    0.333,   0.0, 0.333,
                      0.0, 0.333, 0.333
                ]);
                break;
        }
        initializeBufferObjects();
    }

    function initializeBufferObjects() {
        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        let vertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        let position = gl.getAttribLocation(shaderProgram, 'aPosition');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, vertices.BYTES_PER_ELEMENT * 3, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);

        let color = gl.getAttribLocation(shaderProgram, 'aColor');
        gl.enableVertexAttribArray(color);
        gl.vertexAttribPointer(color, 3, gl.FLOAT, false, vertexColors.BYTES_PER_ELEMENT * 3, 0);
    }

    function initializeShaders(vertexShaderSource, fragmentShaderSource) {
        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        console.log(gl.getShaderInfoLog(vertexShader)); // for debugging

        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        console.log(gl.getShaderInfoLog(fragmentShader));

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);
    }

    function parallelProjection(right, left, top, bottom, near, far) {
        return [
            2 / (right - left),                    0,                  0,  -(right + left) / (right - left),
            0,                    2 / (top - bottom),                  0,  -(top + bottom) / (top - bottom),
            0,                                     0,  -2 / (far - near),      -(far + near) / (far - near),
            0,                                     0,                  0,                                 1
        ]
    }

    function perspectiveProjection(right, top, near, far) {
        return [
            near / right,                  0,                            0,                               0,
                       0,         near / top,                            0,                               0,
                       0,                  0, -(far + near) / (far - near),  -2 * far * near / (far - near),
                       0,                  0,                           -1,                               0
        ]
    }

    initialize();

}());
