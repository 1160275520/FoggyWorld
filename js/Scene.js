"use strict";
/* exported Scene */
class Scene extends UniformProvider {
  constructor(gl) {
    super("scene");
    this.programs = [];
    this.gameObjects = [];

    this.new_color = new Vec3(0.01,0.01,0.01);

    this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured-fs.glsl");
    this.vsTextured = new Shader(gl, gl.VERTEX_SHADER, "textured-vs.glsl");    
    this.programs.push( 
    	this.texturedProgram = new TexturedProgram(gl, this.vsTextured, this.fsTextured));

    this.vsQuad = new Shader(gl, gl.VERTEX_SHADER, "quad-vs.glsl");    
    this.fsTrace = new Shader(gl, gl.FRAGMENT_SHADER, "trace-fs.glsl");
    this.fsShow = new Shader(gl, gl.FRAGMENT_SHADER, "show-fs.glsl");
    this.programs.push( 
    	this.traceProgram = new TexturedProgram(gl, this.vsQuad, this.fsTrace));
    this.programs.push( 
      this.showProgram = new TexturedProgram(gl, this.vsQuad, this.fsShow));

    this.texturedQuadGeometry = new TexturedQuadGeometry(gl);    

    this.timeAtFirstFrame = new Date().getTime();
    this.timeAtLastFrame = this.timeAtFirstFrame;

    this.traceMaterial = new Material(this.traceProgram);
    this.envTexture = new TextureCube(gl, [
      "media/fnx.png",
      "media/fx.png",
      "media/fy.png",
      "media/fny.png",
      "media/fz.png",
      "media/fnz.png",]
      );
    this.traceMaterial.envTexture.set(this.envTexture);
    this.traceMaterial.freq = 0.9;
    this.traceMaterial.noiseFreq = 0.9;
    this.traceMaterial.noiseExp = 0.5;
    this.traceMaterial.noiseAmp = 0.2;
    this.traceMaterial.lightWoodColor = new Vec3(0.7,0.5,0.0);
    this.traceMaterial.darkWoodColor = new Vec3(0.7,0,0);
    this.traceMesh = new Mesh(this.traceMaterial, this.texturedQuadGeometry);

    this.traceQuad = new GameObject(this.traceMesh);
    this.gameObjects.push(this.traceQuad);

    this.slowpokeMaterial = new Material(this.texturedProgram);
    this.slowpokeMaterial.colorTexture.set(new Texture2D(gl, "media/slowpoke/YadonDh.png"));
    this.eyeMaterial = new Material(this.texturedProgram);
    this.eyeMaterial.colorTexture.set(new Texture2D(gl, "media/slowpoke/YadonEyeDh.png"));
    this.mesh = new MultiMesh(gl, "media/slowpoke/Slowpoke.json", 
        [this.slowpokeMaterial, this.eyeMaterial]);
    this.avatar =  new GameObject(this.mesh);
    // this.gameObjects.push(this.avatar);

    this.camera = new PerspectiveCamera(...this.programs); 
    this.camera.position.set(0, 5, 25);
    this.camera.update();
    this.addComponentsAndGatherUniforms(...this.programs);

    this.clippedQuadrics = [];
    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[0].makeUnitCone();

    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[1].makeUnitSurface();

    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[2].makeUnitCone();

    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[3].makeUnitCone();

    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[4].makeUnitSphere();

    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[5].makeUnitSphere();

    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[6].makeUnitEllipsoid();

    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[7].makeUnitSphere();

    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[8].makeUnitSphere();

    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[9].makeUnitCone();
  

    const transformMatrix = new Mat4().translate(0,3,0);
    this.clippedQuadrics[0].transform(transformMatrix);

    const transformMatrix3 = new Mat4().translate(0,6,0);
    this.clippedQuadrics[3].transform(transformMatrix3);

    const transformMatrix2 = new Mat4().translate(0,-10,0);
    this.clippedQuadrics[1].transform(transformMatrix2);

    const transformMatrix4 = new Mat4().translate(15,0,0);
    this.clippedQuadrics[4].transform(transformMatrix4);
    this.clippedQuadrics[4].color = new Vec3(1,1,1);

    const transformMatrix5 = new Mat4().scale(0.6).translate(15,7,0);
    this.clippedQuadrics[5].transform(transformMatrix5);
    this.clippedQuadrics[5].color = new Vec3(1,1,1);

    const transformMatrix6 = new Mat4().translate(-15,10,0);
    this.clippedQuadrics[6].transform(transformMatrix6);

    const transformMatrix7 = new Mat4().scale(0.1).translate(15,7,3);
    this.clippedQuadrics[7].transform(transformMatrix7);
    this.clippedQuadrics[7].color = new Vec3(0,0,0);

    const transformMatrix8 = new Mat4().scale(0.1).translate(12,7,3);
    this.clippedQuadrics[8].transform(transformMatrix8);
    this.clippedQuadrics[8].color = new Vec3(0,0,0);

    const rotationMatrix = new Mat4(
      1,0,0,0,
      0,Math.cos(-Math.PI/2),-Math.sin(-Math.PI/2),0,
      0,Math.sin(-Math.PI/2),Math.cos(-Math.PI/2),0,
      0,0,0,1
    );
    const transformMatrix9 = new Mat4().mul(rotationMatrix).scale(0.1).translate(14,6,3);
    this.clippedQuadrics[9].transform(transformMatrix9);
    this.clippedQuadrics[9].color = new Vec3(0.9,0.3,0);

    for (let i =0; i<10;i++)
    {
      this.clippedQuadrics[i].specularColor = new Vec3(0,0,0);
      this.clippedQuadrics[i].shininess = 50.0;
    }


    
    this.lights = [];
    for (let i=0;i<8;i++)
    {
      this.lights.push(new Light(this.lights.length, ...this.programs));
    }
    this.lights[0].position.set(0.0, 0.8, 1, 0).normalize();
    this.lights[0].powerDensity.set(1,1,1);
    this.lights[1].position.set(10, 6, 1, 1).normalize();
    this.lights[1].powerDensity.set(1, 1, 1);
    gl.enable(gl.DEPTH_TEST);
  }

  resize(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    this.camera.setAspectRatio(canvas.width / canvas.height);
  }

  update(gl, keysPressed) {
    //jshint bitwise:false
    //jshint unused:false
    const timeAtThisFrame = new Date().getTime();
    const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
    const t = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0; 
    this.timeAtLastFrame = timeAtThisFrame;
    //this.time.set(t);
    this.time = t;
    this.color.set(this.new_color);

    if (keysPressed.P)
    {
      this.new_color.x+=0.0001;
    }
    if (keysPressed.O)
    {
      this.new_color.x-=0.0001;
    }
    
    if (keysPressed.I)
    {
      this.new_color.y+=0.0001;
    }
    if (keysPressed.U)
    {
      this.new_color.y-=0.0001;
    }

    if (keysPressed.L)
    {
      this.new_color.z+=0.0001;
    }
    if (keysPressed.K)
    {
      this.new_color.z-=0.0001;
    }
    

    // clear the screen
    gl.clearColor(0.3, 0.0, 0.3, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.camera.move(dt, keysPressed);

    for(const gameObject of this.gameObjects) {
        gameObject.update();
    }
    for(const gameObject of this.gameObjects) {
      gameObject.draw(this, this.camera, ...this.lights, ...this.clippedQuadrics);
    }
    // this.lights[1].position.set(2*Math.cos(this.time), 1, 1, 1).normalize();

  }
}
