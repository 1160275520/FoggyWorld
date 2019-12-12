"use strict";
/* exported Texture2D */
const Texture2D = function(gl, mediaFileUrl) { 
  gl.pendingResources[mediaFileUrl] =
                 ++gl.pendingResources[mediaFileUrl] || 1; 
  this.mediaFileUrl = mediaFileUrl; 
  
  this.glTexture = gl.createTexture(); 

  this.image = new Image(); 
 
  this.image.onload = () => { this.loaded(gl); }; 
  this.image.src = mediaFileUrl; 
};

Texture2D.prototype.loaded = function(gl){ 
  gl.bindTexture(gl.TEXTURE_2D, this.glTexture); 
  gl.texImage2D(gl.TEXTURE_2D, 0,
             gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image); 
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
                                             gl.LINEAR); 
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                               gl.LINEAR_MIPMAP_LINEAR); 
  gl.generateMipmap(gl.TEXTURE_2D); 
  gl.bindTexture(gl.TEXTURE_2D, null); 
  if( --gl.pendingResources[this.mediaFileUrl] === 0 ) { 
    delete gl.pendingResources[this.mediaFileUrl]; 
  } 
};
