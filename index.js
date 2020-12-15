"use strict";

function createShaderProgram(gl, vsSource, fsSource) {
  let vert = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  let frag = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  let program = gl.createProgram();

  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert(`Unable to create shader: ${gl.getProgramIngoLog(program)}`);
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function loadShader(gl, type, source) {
  let shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createBuffers(gl, width, height) {
  let position = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, position);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0,
      0,
      width,
      0,
      0,
      height,
      0,
      height,
      width,
      0,
      width,
      height,
    ]),
    gl.STATIC_DRAW
  );

  let texCoord = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoord);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
    gl.STATIC_DRAW
  );

  return {
    position,
    texCoord,
  };
}

function loadTexture(gl, image) {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}

function render(gl, info, buffers) {
  resize(gl);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(info.program);

  gl.uniform2f(info.uniforms.resolution, gl.canvas.width, gl.canvas.height);

  gl.enableVertexAttribArray(info.attrs.position);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

  gl.vertexAttribPointer(info.attrs.position, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(info.attrs.texCoord);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);

  gl.vertexAttribPointer(info.attrs.texCoord, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function resize(gl, dpx = devicePixelRatio) {
  let dw = Math.floor(gl.canvas.clientWidth * dpx);
  let dh = Math.floor(gl.canvas.clientHeight * dpx);

  if (gl.canvas.width !== dw || gl.canvas.height !== dh) {
    gl.canvas.width = dw;
    gl.canvas.height = dh;
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function main() {
  let canvas1 = document.querySelector("#c1");
  let gl1 = canvas1.getContext("webgl");
  let canvas2 = document.querySelector("#c2");
  let gl2 = canvas2.getContext("webgl");

  if (gl1 == null) {
    alert("Unable to initialize WebGL");
    return;
  }

  let vs = document.querySelector("#vs").text;
  let fs = document.querySelector("#fs").text;

  let program1 = createShaderProgram(gl1, vs, fs);
  let program2 = createShaderProgram(gl2, vs, fs);

  let info1 = {
    program: program1,
    attrs: {
      position: gl1.getAttribLocation(program1, "aPosition"),
      texCoord: gl1.getAttribLocation(program1, "aTexCoord"),
    },
    uniforms: {
      resolution: gl1.getUniformLocation(program1, "uResolution"),
    },
  };
  let info2 = {
    program: program2,
    attrs: {
      position: gl2.getAttribLocation(program2, "aPosition"),
      texCoord: gl2.getAttribLocation(program2, "aTexCoord"),
    },
    uniforms: {
      resolution: gl2.getUniformLocation(program2, "uResolution"),
    },
  };

  // let image = new Image();
  let video = document.createElement("video");

  document.body.appendChild(video);
  // image.crossOrigin = "anonymous";
  video.src = "http://127.0.0.1:8887/rotated180.mp4";
  video.currentTime = 3;

  video.onloadeddata = async () => {
    //image = await createImageBitmap(image)

    let buffers = createBuffers(
      gl1,
      video.videoWidth / 4,
      video.videoHeight / 4
    );

    loadTexture(gl1, video);

    render(gl1, info1, buffers);
  };

  let image = document.createElement("img");
  document.body.appendChild(image);

  image.crossOrigin = "anonymous";
  image.src = "http://127.0.0.1:8887/shula.jpg";

  image.onload = async () => {
    //image = await createImageBitmap(image)

    let buffers = createBuffers(gl2, image.width / 4, image.height / 4);

    loadTexture(gl2, image);

    render(gl2, info2, buffers);
  };
}

window.onload = main;
