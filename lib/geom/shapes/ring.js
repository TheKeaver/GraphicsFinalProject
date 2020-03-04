var Ring = function(){
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.ringMat = new Material();
    this.ringMat.diffuse = vec3.fromValues(1,1,1);
    this.postMat = new Material();
    this.postMat.diffuse = vec3.fromValues(0.25,0.25,0.25);
    this.ropeMat = new Material();
    this.ropeMat.diffuse = vec3.fromValues(1.0,0.0,0.0);
    this.ringSize = 10;
};

Ring.prototype.render = function(gl, uni) {
mat4.fromTranslation(model, vec3.fromValues(this.x+this.ringSize,this.y-0.5,this.z));
mat4.rotateY(model,model,-Math.PI/2);
mat4.scale(model,model,vec3.fromValues(this.ringSize*2.0,1,this.ringSize*2.0));
gl.uniformMatrix4fv(uni.uModel, false, model);
Shapes.cube.render(gl,uni,this.ringMat);
model = mat4.create();

// 4 Posts
mat4.fromTranslation(model, vec3.fromValues(this.x-this.ringSize,this.y-0.5,this.z-this.ringSize));
mat4.rotateX(model,model,3*Math.PI/2);
mat4.scale(model,model,vec3.fromValues(0.5,0.5,4.0));
gl.uniformMatrix4fv(uni.uModel, false, model);
Shapes.cylinder.render(gl,uni,this.postMat);
model = mat4.create();

mat4.fromTranslation(model, vec3.fromValues(this.x+this.ringSize,this.y-0.5,this.z-this.ringSize));
mat4.rotateX(model,model,3*Math.PI/2);
mat4.scale(model,model,vec3.fromValues(0.5,0.5,4.0));
gl.uniformMatrix4fv(uni.uModel, false, model);
Shapes.cylinder.render(gl,uni,this.postMat);
model = mat4.create();

mat4.fromTranslation(model, vec3.fromValues(this.x-this.ringSize,this.y-0.5,this.z+this.ringSize));
mat4.rotateX(model,model,3*Math.PI/2);
mat4.scale(model,model,vec3.fromValues(0.5,0.5,4.0));
gl.uniformMatrix4fv(uni.uModel, false, model);
Shapes.cylinder.render(gl,uni,this.postMat);
model = mat4.create();

mat4.fromTranslation(model, vec3.fromValues(this.x+this.ringSize,this.y-0.5,this.z+this.ringSize));
mat4.rotateX(model,model,3*Math.PI/2);
mat4.scale(model,model,vec3.fromValues(0.5,0.5,4.0));
gl.uniformMatrix4fv(uni.uModel, false, model);
Shapes.cylinder.render(gl,uni,this.postMat);
model = mat4.create();

// Front Ropes
mat4.fromTranslation(model, vec3.fromValues(this.x+this.ringSize,this.y+1.0,this.z+this.ringSize));
mat4.rotateY(model,model,3*Math.PI/2);
mat4.scale(model,model,vec3.fromValues(0.10,0.10,this.ringSize*2.0));
gl.uniformMatrix4fv(uni.uModel, false, model);
Shapes.cylinder.render(gl,uni,this.ropeMat);
model = mat4.create();

mat4.fromTranslation(model, vec3.fromValues(this.x+this.ringSize,this.y+2.0,this.z+this.ringSize));
mat4.rotateY(model,model,3*Math.PI/2);
mat4.scale(model,model,vec3.fromValues(0.10,0.10,this.ringSize*2.0));
gl.uniformMatrix4fv(uni.uModel, false, model);
Shapes.cylinder.render(gl,uni,this.ropeMat);
model = mat4.create();

// Left Ropes 
mat4.fromTranslation(model, vec3.fromValues(this.x-this.ringSize,this.y+1.0,this.z+this.ringSize));
mat4.rotateY(model,model,Math.PI);
mat4.scale(model,model,vec3.fromValues(0.10,0.10,this.ringSize*2.0));
gl.uniformMatrix4fv(uni.uModel, false, model);
Shapes.cylinder.render(gl,uni,this.ropeMat);
model = mat4.create();

mat4.fromTranslation(model, vec3.fromValues(this.x-this.ringSize,this.y+2.0,this.z+this.ringSize));
mat4.rotateY(model,model,Math.PI);
mat4.scale(model,model,vec3.fromValues(0.10,0.10,this.ringSize*2.0));
gl.uniformMatrix4fv(uni.uModel, false, model);
Shapes.cylinder.render(gl,uni,this.ropeMat);
model = mat4.create();

// Back Ropes
mat4.fromTranslation(model, vec3.fromValues(this.x+this.ringSize,this.y+1.0,this.z-this.ringSize));
mat4.rotateY(model,model,3*Math.PI/2);
mat4.scale(model,model,vec3.fromValues(0.10,0.10,this.ringSize*2.0));
gl.uniformMatrix4fv(uni.uModel, false, model);
Shapes.cylinder.render(gl,uni,this.ropeMat);
model = mat4.create();

mat4.fromTranslation(model, vec3.fromValues(this.x+this.ringSize,this.y+2.0,this.z-this.ringSize));
mat4.rotateY(model,model,3*Math.PI/2);
mat4.scale(model,model,vec3.fromValues(0.10,0.10,this.ringSize*2.0));
gl.uniformMatrix4fv(uni.uModel, false, model);
Shapes.cylinder.render(gl,uni,this.ropeMat);
model = mat4.create();

// Right Ropes
mat4.fromTranslation(model, vec3.fromValues(this.x+this.ringSize,this.y+1.0,this.z+this.ringSize));
mat4.rotateY(model,model,Math.PI);
mat4.scale(model,model,vec3.fromValues(0.10,0.10,this.ringSize*2.0));
gl.uniformMatrix4fv(uni.uModel, false, model);
Shapes.cylinder.render(gl,uni,this.ropeMat);
model = mat4.create();

mat4.fromTranslation(model, vec3.fromValues(this.x+this.ringSize,this.y+2.0,this.z+this.ringSize));
mat4.rotateY(model,model,Math.PI);
mat4.scale(model,model,vec3.fromValues(0.10,0.10,this.ringSize*2.0));
gl.uniformMatrix4fv(uni.uModel, false, model);
Shapes.cylinder.render(gl,uni,this.ropeMat);
model = mat4.create();
};

Ring.prototype.setPostTex = function(gl,uni) {
    this.postMat.diffuseTexture = "post.jpg";
};
Ring.prototype.setFloorTex = function(gl,uni) {
    this.ringMat.diffuseTexture = "kof.jpg";
};