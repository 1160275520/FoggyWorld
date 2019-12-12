"use strict";
class ClippedQuadric extends UniformProvider 
{
    constructor(id, ...programs) 
    {
      super(`clippedQuadrics[${id}]`);
      this.addComponentsAndGatherUniforms(...programs);
      this.color = new Vec3(0.0,0.4,0.1);
      this.specularColor =  new Vec3();
      this.shininess =  0.0;
    }
    makeUnitCylinder(){
      this.surface.set(1,  0,  0,  0,
                        0,  0,  0,  0,
                        0,  0,  1,  0,
                        0,  0,  0, -5);
      this.clipper.set(0,  0,  0,  0,
                      0,  1,  0,  0,
                      0,  0,  0,  0,
                      0,  0,  0, -100);
    }

    makeUnitCone(){
      this.surface.set(1,  0,  0,  0,
                        0,  -1,  0,  0,
                        0,  0,  1,  0,
                        0,  0,  0, 0);
      this.clipper.set(0,  0,  0,  0,
                      0,  1,  0,  5,
                      0,  0,  0,  0,
                      0,  0,  0, 0);
    }

    makeUnitSurface(){
      this.surface.set(
        0,  0,  0,  0,
        0,  4,  0,  0,
        0,  0,  0,  0,
        0,  0,  0, -5);
      this.clipper.set(0,  0,  0,  0,
                      0,  0,  0,  0,
                      0,  0,  0,  0,
                      0,  0,  0, -100);
    }

    makeUnitSphere(){
      this.surface.set(1,  0,  0,  0,
                        0,  1,  0,  0,
                        0,  0,  1,  0,
                        0,  0,  0, -20);
      this.clipper.set(0,  0,  0,  0,
                      0,  0,  0,  0,
                      0,  0,  0,  0,
                      0,  0,  0, -100);
    }

    makeUnitEllipsoid(){
      this.surface.set(1,  0,  0,  0,
                        0,  2,  0,  0,
                        0,  0,  1,  0,
                        0,  0,  0, -30);
      this.clipper.set(0,  0,  0,  0,
                      0,  0,  0,  0,
                      0,  0,  0,  0,
                      0,  0,  0, -100);
    }

    transform(matrix){
      matrix.invert();    // T is now T-1
      this.surface.premul(matrix);   // A is now T-1 * A
      this.clipper.premul(matrix);   // A is now T-1 * A

      matrix.transpose(); // T is now T-1T
      this.surface.mul(matrix); 
      this.clipper.mul(matrix); 
    }
}