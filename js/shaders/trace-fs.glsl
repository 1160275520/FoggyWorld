Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es 
  precision highp float;

  out vec4 fragmentColor;
  in vec4 rayDir;
  in vec4 worldPosition;
  in vec4 worldNormal;
  in vec3 cameraPosition;


  uniform struct{
    vec3 lightWoodColor;
    vec3 darkWoodColor;
    float freq;
    float noiseFreq;
    float noiseExp;
    float noiseAmp;
    samplerCube envTexture;
  } material;

  uniform struct {
    mat4 viewProjMatrix;  
    mat4 rayDirMatrix;
    vec3 position;
  } camera;

  uniform struct {
    mat4 surface;
    mat4 clipper;
    vec3 color;
    vec3 specularColor;
    float shininess;
  } clippedQuadrics[16];

  uniform struct {
    vec4 position;
    vec3 powerDensity;
  } lights[8];

    uniform struct {
    vec3 color;
  } scene;


  float snoise(vec3 r) {
    vec3 s = vec3(7502, 22777, 4767);
    float f = 0.0;
    for(int i=0; i<16; i++) {
      f += sin( dot(s - vec3(32768, 32768, 32768), r)
                                  / 65536.0);
      s = mod(s, 32768.0) * 2.0 + floor(s / 32768.0);
    }
    return f / 32.0 + 0.5;
  }

  float intersectClippedQuadric(mat4 A, mat4 B, vec4 e, vec4 d)
  {
    float a = dot(d*A, d);
    float b = dot(d*A, e)+dot(e*A, d);
    float c = dot(e*A, e);
    float discriminant = b*b-4.0*a*c;
    if (discriminant<0.0)
    {
      return -1.0;
    }
    float t1 = (-b + sqrt(discriminant)) / (2.0*a);
    float t2 = (-b - sqrt(discriminant)) / (2.0*a);
    vec4 r1 =  e + d * t1;
    vec4 r2 =  e + d * t2;
    if (dot(r1*B,r1)>0.0)
    {
      t1 = -1.0;
    }
    if (dot(r2*B,r2)>0.0)
    {
      t2 = -1.0;
    }
    return (t1<0.0)?t2:((t2<0.0)?t1:min(t1, t2));
  }

  bool findBestHit(vec4 e, vec4 d, out float bestT, out int bestIndex)
  {
    bestT = 10000.0;
    bestIndex = 0;
    for (int i=0;i<10;i++)
    {
      float t = intersectClippedQuadric(clippedQuadrics[i].surface,clippedQuadrics[i].clipper,e,d);
      if (t<bestT && t>0.0)
      {
        bestT = t;
        bestIndex = i;
      }
    }
    return bestT!=10000.0;
  }


  vec3 shade(vec3 normal, vec3 lightDir, vec3 viewDir, vec3 powerDensity, 
  vec3 materialColor, vec3 specularColor, float shininess) 
  {
    float cosa = clamp(dot(lightDir, normal), 0.0, 1.0);
    float cosb = clamp(dot(viewDir, normal), 0.0, 1.0);

    vec3 halfway = normalize(viewDir + lightDir);
    float cosDelta = clamp(dot(halfway, normal), 0.0, 1.0);

    // return powerDensity * materialColor * cosa ;
    return powerDensity * materialColor * cosa + powerDensity * specularColor * pow(cosDelta, shininess)* cosa / max(cosb, cosa);
  }


  void main(void) {

	  vec4 e = vec4(camera.position, 1);		 //< ray origin
  	vec4 d = vec4(normalize(rayDir).xyz, 0); //< ray direction
    mat4 A = mat4(	1, 0, 0, 0,
                    0, -1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 0);
    mat4 B = mat4(	0, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, -30);

    float bestT = 10000.0;
    int bestIndex = 0;


    vec3 w = vec3(1, 1, 1); // product of reflectances so far
    //recursive ray tracing 
    float sigma = 0.04;
    vec3 q = scene.color;
    // vec3 q = vec3(0.012,0.01,0.01);
    //     float sigma = 0.0;
    // vec3 q = vec3(0.0,0.0,0.0);
    fragmentColor = vec4(0.0,0.0,0.0,1.0);
    for (int j=0;j<10;j++)
    {
      if(findBestHit(e, d, bestT, bestIndex))
      {
        vec4 hit = e + d * bestT;
        vec3 normal = normalize((hit*clippedQuadrics[bestIndex].surface + clippedQuadrics[bestIndex].surface*hit).xyz);
        if (dot(normal,d.xyz)>0.0)
        {
          normal*=-1.0;
        }
        // computing depth from world space hit coordinates 
        vec4 ndcHit = hit * camera.viewProjMatrix;
        vec3 viewDir = -d.xyz;
        if (j==0)
        {
          gl_FragDepth = ndcHit.z / ndcHit.w * 0.5 + 0.5;
        }
        // add lights
        vec3 directlight = vec3(0.0,0.0,0.0);
        for (int i=0;i<2;i++)
        {
          vec3 lightDiff = lights[i].position.xyz - hit.xyz * lights[i].position.w;
          vec3 lightDir = normalize(lightDiff);

          float bestShadowT = 10000.0;
          int bestShadowIndex = 0;
          bool shadowRayHitSomething =  findBestHit(hit+vec4(normal,0)*0.01, vec4(lightDir,0), bestShadowT, bestShadowIndex);
          if(!shadowRayHitSomething || bestShadowT * lights[i].position.w > sqrt(dot(lightDiff, lightDiff)) ) 
          {
            float distanceSquared = dot(lightDiff, lightDiff);
            vec3 powerDensity = lights[i].powerDensity / distanceSquared;
            // procedure color
            float w_p = fract( hit.x * material.freq + pow(snoise(hit.xyz * material.noiseFreq),material.noiseExp)* material.noiseAmp);
            vec3 color = mix( material.lightWoodColor, material.darkWoodColor, w_p);
            if (bestIndex==1)
            {
              directlight.rgb += exp(-bestT*sigma)*shade(normal, lightDir, viewDir, powerDensity, color, clippedQuadrics[bestIndex].specularColor, clippedQuadrics[bestIndex].shininess)*w;
            }
            else
            {
              directlight.rgb += exp(-bestT*sigma)*shade(normal, lightDir, viewDir, powerDensity, clippedQuadrics[bestIndex].color, clippedQuadrics[bestIndex].specularColor, clippedQuadrics[bestIndex].shininess)*w;        
            }    
          }
        }
        fragmentColor.rgb += directlight*exp(-bestT*sigma);
        fragmentColor.rgb += w*q*(1.0-exp(-bestT*sigma))/sigma;            

        if (bestIndex==1||bestIndex==6)
        {
          e = hit+vec4(normal,0)*0.01;
          d.xyz = reflect(d.xyz,normal);
          w *= 0.5*exp(-bestT*sigma);
        }
        else
        {
          w *= 0.0;
          break;
        }
      }
      // nothing hit by ray, return enviroment color
      else
      {
        fragmentColor.rgb += exp(-bestT*sigma)*texture(material.envTexture, d.xyz).rgb*w;
        fragmentColor.rgb += w*q/sigma;
        gl_FragDepth = 0.9999999;
        w = vec3(0,0,0);
        break;
      }

    }

  }

`;