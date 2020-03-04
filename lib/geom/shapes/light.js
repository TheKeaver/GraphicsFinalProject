var Light = function(r,y,rot) {
    this.radius = r;
    this.y = y;
    this.rotation = r;
    this.x = 0;
    this.z = 0;
};

Light.prototype.render = function(gl, uni) {
    // White Cube
    this.x = this.radius * Math.cos(this.rotation);
    this.z = this.radius * Math.sin(this.rotation)
    var whiteCube = new Material();
    whiteCube.emissive = vec3.fromValues(1,1,1);
    mat4.fromTranslation(model, vec3.fromValues(this.x,this.y,this.z));
    mat4.rotate(model, model, this.rotation, vec3.fromValues(0,1,0));
    mat4.scale(model,model,vec3.fromValues(0.5,0.5,0.5));
    gl.uniformMatrix4fv(uni.uModel,false,model);
    Shapes.cube.render(gl,uni,whiteCube);
};

Light.prototype.worldToCamera = function(gl, uni, cam) {
    let lp = vec3.fromValues(this.x,this.y,this.z);
    vec3.transformMat4(lp, lp, mat4.create());
    mat4.multiply(lp,cam.viewMatrix(),lp);
    gl.uniform3fv(uni.uLightPos, vec3.fromValues(lp[0],lp[1],lp[2]));
}