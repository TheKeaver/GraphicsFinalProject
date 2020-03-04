/*
Robot is a custom complex object built from scratch that allows
for customization of specific values, such as diffuse textures
and shapes. Some transfomations are hard coded meaning that
universal scalings do not exist. Each body part has its own
shape and color that is selected by users when running the .html
file.
*/
/*
The constructor initializes most of the material() objects
relating to each part of the robot. Important values are stored
here, such as the player's health total, their world position,
the location of 1st/3rd person camera, their punching status
and the positions of each fist. 
*/
var Robot = function (x,z,color) {
    this.health = 3;
    this.position = vec3.fromValues(x,0.1,z);
    this.thirdCamPos;
    this.firstCamPos;
    this.defaultColor = color;
    this.strike = new Boolean(false);

    this.bodyRotation = mat4.create();
    this.upArmRotL = Math.PI/4;
    this.lowArmRotL = Math.PI/2;
    this.upArmRotR = Math.PI/4;
    this.lowArmRotR = Math.PI/2;

    this.head = Shapes.cube;
    this.headMat = new Material();
    this.headMat.diffuse = this.defaultColor;

    this.body = Shapes.cube;
    this.bodyMat = new Material();
    this.bodyMat.diffuse = this.defaultColor;
    
    this.leg = Shapes.cube;
    this.legMat = new Material();
    this.legMat.diffuse = this.defaultColor;

    this.foot = Shapes.cube;
    this.footMat = new Material();
    this.footMat.diffuse = this.defaultColor;

    this.arm = Shapes.cube;
    this.armMat = new Material();
    this.armMat.diffuse = this.defaultColor;

    this.fist = Shapes.cube;
    this.fistMat = new Material();
    this.fistMat.diffuse = this.defaultColor;
    this.leftFistPos = vec3.create();
    this.rightFistPos = vec3.create();

    this.platform = Shapes.disk;
    this.platMat = new Material();
    this.platMat.diffuse = this.defaultColor;
};

Robot.prototype.render = function (gl, uni) {
    // The Robot's Platform
    var rMatrix = new MatrixStack();
    rMatrix.push(); // Identity matrix as rMatrix[-1]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), this.position));
    rMatrix.push(); // Copy to prep for general translation at rMatrix[0]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), Math.PI/2, vec3.fromValues(0,1,0)));
    rMatrix.push(); // Position matrix as rMatrix[1]
    rMatrix.multiply(this.bodyRotation);
    rMatrix.push(); // Copy to prep for general translation at rMatrix[2]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), 3*Math.PI/2, vec3.fromValues(1,0,0)));
    rMatrix.push(); // Disk rotation matrix as rMatrix[3]
    rMatrix.multiply(mat4.fromScaling(mat4.create(), vec3.fromValues(2,2,1)));
    model = rMatrix.peek(); // Position*Rotation*Rotation matrix as rMatrix[4]
    gl.uniformMatrix4fv(uni.uModel, false, model);
    this.platform.render(gl,uni,this.platMat);

    // The Robot's Body -> Arms & Body -> Head
    rMatrix.pop(); // Return to rMatrix[3]
    rMatrix.pop(); // Return to rMatrix[2]
    // Pretend as though rMatrix[1] is here, 
    // I can't be bothered to change it now
    rMatrix.push(); // Copy to prep for body position at rMatrix[3]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), vec3.fromValues(0,2.5,0))); // body position
    rMatrix.push(); // Copy to prep for body scaling at rMatrix[4]
    rMatrix.multiply(mat4.fromScaling(mat4.create(), vec3.fromValues(2,2,2)));
    rMatrix.push(); // Copy to prep for body rotation at rMatrix[5]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), 3*Math.PI/2, vec3.fromValues(1,0,0)));
    model = rMatrix.peek(); 
    gl.uniformMatrix4fv(uni.uModel, false, model);
    this.body.render(gl,uni,this.bodyMat);

    // Robot's Head
    rMatrix.pop(); // Return to rMatrix[4]
    rMatrix.pop(); // Return to rMatrix[3]
    rMatrix.push(); // Copy to prepare for head position at rMatrix[4]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), vec3.fromValues(0,2,0)));
    rMatrix.push(); // Copy to prepare for head x-rotation at rMatrix[5]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), 3*Math.PI/2, vec3.fromValues(1,0,0)));
    model = rMatrix.peek();
    gl.uniformMatrix4fv(uni.uModel, false, model);
    this.head.render(gl,uni,this.headMat);

    // 3rd Person camera
    rMatrix.pop(); // Return to rMatrix[4]
    rMatrix.push(); // Copy to prepare for 3rd cam position at rMatrix[5]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), vec3.fromValues(-5,3,0)));
    model = rMatrix.peek();
    //gl.uniformMatrix4fv(uni.uModel, false, model);
    //this.head.render(gl,uni,this.headMat);
    this.thirdCamPos = vec3.fromValues(model[12],model[13],model[14]);

    // 1st person camera
    rMatrix.pop(); // Return to rMatrix[4]
    rMatrix.push(); // Copy to prepare for 1st cam position at rMatrix[5]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), vec3.fromValues(0.6,1,0)));
    model = rMatrix.peek();
    //gl.uniformMatrix4fv(uni.uModel, false, model);
    //this.head.render(gl,uni,this.headMat);
    this.firstCamPos = vec3.fromValues(model[12],model[13],model[14]);

    // Left Upper Arm, dependent on the matrices of the body
    rMatrix.pop(); // Return to rMatrix[4]
    rMatrix.pop(); // Return to rMartix[3]
    rMatrix.push(); // Copy to prep for arm position at rMatrix[4]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), vec3.fromValues(0,1.5,1.0)));
    rMatrix.push(); // Copy to prep for arm rotation at rMatrix[5]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), Math.PI/2.5, vec3.fromValues(1,0,0)));
    rMatrix.push(); // Copy to prep for arm rotation at rMatrix[6]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), this.upArmRotL, vec3.fromValues(0,1,0)));
    rMatrix.push(); // Copy to prep for arm scaling at rMatrix[7]
    rMatrix.multiply(mat4.scale(mat4.create(), mat4.create(),vec3.fromValues(0.5,0.5,2.0)));
    model = rMatrix.peek(); 
    gl.uniformMatrix4fv(uni.uModel, false, model);
    this.arm.render(gl,uni,this.armMat);
    
    // Left Lower Arm, dependent on the matrices of the body and left upper arm
    rMatrix.pop(); // Return to rMatrix[6]
    rMatrix.push(); // Copy to prep for lowever arm position at rMatrix[7]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), vec3.fromValues(0,0,2.0)));
    rMatrix.push(); // Copy to prep for lower arm rotation about y at rMatrix[8]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), this.lowArmRotL, vec3.fromValues(0,1,0)));
    rMatrix.push(); // Copy to prep for lower arm scaling at rMatrix[9]
    rMatrix.multiply(mat4.fromScaling(mat4.create(), vec3.fromValues(0.5,0.5,2.0)));
    model = rMatrix.peek(); 
    gl.uniformMatrix4fv(uni.uModel, false, model);
    this.arm.render(gl,uni,this.armMat);

    // Left Fist, dependent on the matrices of body and left upper/lower arm (cube only)
    rMatrix.pop(); // return to rMatrix[8]
    rMatrix.push(); // Copy to prep for left fist translation at rMatrix[9]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), vec3.fromValues(0,0,1.7)));
    rMatrix.push(); // Copy to prep for left fist rotation at rMatrix[10]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), Math.PI/2, vec3.fromValues(0,0,1)));
    rMatrix.push(); // Copy to prep for left fist scaling at rMatrix[11]
    rMatrix.multiply(mat4.fromScaling(mat4.create(), vec3.fromValues(0.75,0.75,0.75)));
    model = rMatrix.peek();
    this.leftFistPos = vec3.fromValues(model[12],model[13],model[14]);
    gl.uniformMatrix4fv(uni.uModel, false, model);
    this.fist.render(gl,uni,this.fistMat);

    // Right upper arm, root traces back to the body transformations
    rMatrix.pop(); // return to rMatrix[10]
    rMatrix.pop(); // return to rMatrix[9]
    rMatrix.pop(); // return to rMatrix[8]
    rMatrix.pop(); // return to rMatrix[7]
    rMatrix.pop(); // return to rMatrix[6]
    rMatrix.pop(); // retern to rMatrix[5]
    rMatrix.pop(); // Return to rMatrix[4]
    rMatrix.pop(); // Return to rMartix[3]
    rMatrix.push(); // Copy to prep for arm position at rMatrix[4]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), vec3.fromValues(0,1.5,-1.0)));
    rMatrix.push(); // Copy to prep for arm rotation about x at rMatrix[5]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), Math.PI/1.7, vec3.fromValues(1,0,0)));
    rMatrix.push(); // Copy to prep for arm rotation about y at rMatrix[6]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), this.upArmRotR, vec3.fromValues(0,1,0)));
    rMatrix.push(); // Copy to prep for arm scaling at rMatrix[7]
    rMatrix.multiply(mat4.fromScaling(mat4.create(),vec3.fromValues(0.5,0.5,2.0)));
    model = rMatrix.peek(); 
    gl.uniformMatrix4fv(uni.uModel, false, model);
    this.arm.render(gl,uni,this.armMat);

    // Right Lower Arm, dependent on the matrices of the body and right upper arm
    rMatrix.pop(); // Return to rMatrix[6]
    rMatrix.push(); // Copy to prep for lowever arm position at rMatrix[7]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), vec3.fromValues(0,0,2.0)));
    rMatrix.push(); // Copy to prep for lower arm rotation about y at rMatrix[8]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), this.lowArmRotR, vec3.fromValues(0,1,0)));
    rMatrix.push(); // Copy to prep for lower arm scaling at rMatrix[9]
    rMatrix.multiply(mat4.fromScaling(mat4.create(), vec3.fromValues(0.5,0.5,2.0)));
    model = rMatrix.peek(); 
    gl.uniformMatrix4fv(uni.uModel, false, model);
    this.arm.render(gl,uni,this.armMat);

    // Right Fist, dependent on the matrices of body and left upper/lower arm (cube only)
    rMatrix.pop(); // return to rMatrix[8]
    rMatrix.push(); // Copy to prep for left fist translation at rMatrix[9]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), vec3.fromValues(0,0,1.7)));
    rMatrix.push(); // Copy to prep for left fist rotation at rMatrix[10]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), Math.PI/2, vec3.fromValues(0,0,1)));
    rMatrix.push(); // Copy to prep for left fist scaling at rMatrix[11]
    rMatrix.multiply(mat4.fromScaling(mat4.create(), vec3.fromValues(0.75,0.75,0.75)));
    model = rMatrix.peek();
    this.rightFistPos = vec3.fromValues(model[12],model[13],model[14]);
    gl.uniformMatrix4fv(uni.uModel, false, model);
    this.fist.render(gl,uni,this.fistMat);

    // Robot Left Foot
    // Return to the disk matrix for the left foot
    rMatrix.pop(); // return to rMatrix[10]
    rMatrix.pop(); // return to rMatrix[9]
    rMatrix.pop(); // return to rMatrix[8]
    rMatrix.pop(); // return to rMatrix[7]
    rMatrix.pop(); // return to rMatrix[6]
    rMatrix.pop(); // return to rMatrix[5]
    rMatrix.pop(); // retern to rMatrix[4]
    rMatrix.pop(); // Return to rMatrix[3]
    rMatrix.pop(); // Return to rMartix[2]
    rMatrix.push(); // Copy to prep for translation of left foot at rMatrix[3]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), vec3.fromValues(0,0.25,0.2)));
    rMatrix.push(); // Copy to prep for scaling of left foot at rMatrix[4]
    model = rMatrix.multiply(mat4.fromScaling(mat4.create(), vec3.fromValues(1,0.5,1)));
    model = rMatrix.peek();
    gl.uniformMatrix4fv(uni.uModel,false,model);
    this.foot.render(gl,uni,this.footMat);

    // Robot left lower leg
    rMatrix.pop(); // Return to rMatrix[3]
    rMatrix.push(); // Copy to prep for lower left leg translation at rMatrix[4]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), vec3.fromValues(1,1.25,0.5)));
    rMatrix.push(); // Copy to prep for left lower leg y-rotation at rMatrix[5]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), 3*Math.PI/2, vec3.fromValues(0,1,0)));
    rMatrix.push(); // Copy to prep for left lower leg x-rotation at rMatrix[6]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), Math.PI/4, vec3.fromValues(1,0,0)));
    rMatrix.push(); // Copy to prep for left lower leg scaling at rMatrix[7]
    rMatrix.multiply(mat4.fromScaling(mat4.create(),vec3.fromValues(0.5,0.5,1.5)));
    model = rMatrix.peek();
    gl.uniformMatrix4fv(uni.uModel,false,model);
    this.leg.render(gl,uni,this.legMat);

    // Robot left upper leg
    rMatrix.pop(); // Return to rMatrix[6]
    rMatrix.push(); // Copy to prep for left lower leg x-rotation at rMatrix[7]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), -Math.PI/2, vec3.fromValues(1,0,0)));
    rMatrix.push(); // Copy to prep for left lower leg scaling at rMatrix[8]
    rMatrix.multiply(mat4.fromScaling(mat4.create(),vec3.fromValues(0.5,0.5,1.5)));
    model = rMatrix.peek();
    gl.uniformMatrix4fv(uni.uModel,false,model);
    this.leg.render(gl,uni,this.legMat);

    // Robot Left Foot
    // Return to the disk matrix for the left foot
    rMatrix.pop(); // return to rMatrix[7]
    rMatrix.pop(); // return to rMatrix[6]
    rMatrix.pop(); // return to rMatrix[5]
    rMatrix.pop(); // retern to rMatrix[4]
    rMatrix.pop(); // Return to rMatrix[3]
    rMatrix.pop(); // Return to rMartix[2]
    rMatrix.push(); // Copy to prep for translation of left foot at rMatrix[3]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), vec3.fromValues(0,0.25,-1.2)));
    rMatrix.push(); // Copy to prep for scaling of left foot at rMatrix[4]
    model = rMatrix.multiply(mat4.fromScaling(mat4.create(), vec3.fromValues(1,0.5,1)));
    model = rMatrix.peek();
    gl.uniformMatrix4fv(uni.uModel,false,model);
    this.foot.render(gl,uni,this.footMat);

    // Robot left lower leg
    rMatrix.pop(); // Return to rMatrix[3]
    rMatrix.push(); // Copy to prep for lower left leg translation at rMatrix[4]
    rMatrix.multiply(mat4.fromTranslation(mat4.create(), vec3.fromValues(1,1.25,0.5)));
    rMatrix.push(); // Copy to prep for left lower leg y-rotation at rMatrix[5]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), 3*Math.PI/2, vec3.fromValues(0,1,0)));
    rMatrix.push(); // Copy to prep for left lower leg x-rotation at rMatrix[6]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), Math.PI/4, vec3.fromValues(1,0,0)));
    rMatrix.push(); // Copy to prep for left lower leg scaling at rMatrix[7]
    rMatrix.multiply(mat4.fromScaling(mat4.create(),vec3.fromValues(0.5,0.5,1.5)));
    model = rMatrix.peek();
    gl.uniformMatrix4fv(uni.uModel,false,model);
    this.leg.render(gl,uni,this.legMat);

    // Robot left upper leg
    rMatrix.pop(); // Return to rMatrix[6]
    rMatrix.push(); // Copy to prep for left lower leg x-rotation at rMatrix[7]
    rMatrix.multiply(mat4.fromRotation(mat4.create(), -Math.PI/2, vec3.fromValues(1,0,0)));
    rMatrix.push(); // Copy to prep for left lower leg scaling at rMatrix[8]
    rMatrix.multiply(mat4.fromScaling(mat4.create(),vec3.fromValues(0.5,0.5,1.5)));
    model = rMatrix.peek();
    gl.uniformMatrix4fv(uni.uModel,false,model);
    this.leg.render(gl,uni,this.legMat);
};
// pos = player's position , at = opponent's position
// Functions very similarly to that of the camera.lookAt()
// the difference being that we do not store the inverse
// rotation
Robot.prototype.lookAt = function( pos, at) {
    vec3.copy(this.position, pos);
    let up = vec3.fromValues(0,1,0);

    let n = vec3.subtract(vec3.create(), pos, at);
    let u = vec3.cross(vec3.create(), up, n);
    let v = vec3.cross(vec3.create(), n, u);
    vec3.normalize(n,n);
    vec3.normalize(u,u);
    vec3.normalize(v,v);

    this.setRotation(u,v,n);
};
// Set rotation sets the rotation values normally rather
// than the inverse storage that we used in the camera class
Robot.prototype.setRotation = function(u, v, n) {
    this.bodyRotation[0] = u[0]; this.bodyRotation[4] = v[0]; this.bodyRotation[8] = n[0];
    this.bodyRotation[1] = u[1]; this.bodyRotation[5] = v[1]; this.bodyRotation[9] = n[1];
    this.bodyRotation[2] = u[2]; this.bodyRotation[6] = v[2]; this.bodyRotation[10] = n[2];
};
// Dolly function also functions similarly to the camera class,
// accepts a 'delta' value and the opponent player. Player
// collision is detected by taking the distance between the
// two players and restricting all movement if the delta value
// would put the two of them too close
Robot.prototype.dolly = function(delta,opponent) {
    let d = delta;
    let n = vec3.fromValues(this.bodyRotation[8], this.bodyRotation[9], this.bodyRotation[10]);
    let copy = vec3.copy(vec3.create(),this.position);
    vec3.scaleAndAdd(copy, copy, n, d);
    if(delta>0)
        vec3.copy(this.position,copy);
    else {
        let newDistance = vec3.subtract(vec3.create(),copy,opponent.position);
        if(vec3.length(newDistance) > 4 )
            this.position = copy;
    }
};
// The orbit function works much like the dolly function,
// yet the function doesn't need to check for collisions
// given that rotational movement will never lead to collision
// is checked regardless of orbit direction as it is possible
// for a player pressed up against a wall to collide if
// the opponent is too close to that same wall.
Robot.prototype.orbit = function(delta,opponent) {
    let d = delta;
    let n = vec3.fromValues(this.bodyRotation[0], this.bodyRotation[1], this.bodyRotation[2]);
    let copy = vec3.copy(vec3.create(),this.position);
    vec3.scaleAndAdd(copy, copy, n, d);
    let newDistance = vec3.subtract(vec3.create(),copy,opponent.position);
    if(vec3.length(newDistance) > 4 )
        this.position = copy;
    
};
// Call for fist collision only if distance is ~4
// requestAnimationFrame calling code inspired heavily by:
// http://www.javascriptkit.com/javatutors/requestanimationframe.shtml
Robot.prototype.punch = function(start,arm,duration,opp) {
    var self = this; // assignment allows to pass this into request animation frame
    let distance;
    var opp = opp;
    let time = new Date().getTime();
    let runtime = time - start;
    let progress = runtime / duration;
    progress = Math.min(progress,1);
    if(arm == 0) {
        this.upArmRotL += (0.07);
        this.lowArmRotL -= (0.1);
        }
        else {
        this.upArmRotR += (0.07);
        this.lowArmRotR -= (0.1);
        }
    // loop through if duration has not been met
    if(runtime < duration) {
        window.requestAnimationFrame(function() {
            self.punch(start,arm,duration,opp);
        });
    }
    else {
        // check for punch landing after duration is fulfilled
        if(arm == 0) {
            // checks the distance from appropriate fist location to that of the
            // opponents already calculated '1st' person camera location
            distance = vec3.subtract(vec3.create(),this.leftFistPos,opp.firstCamPos);}
        else {            
            distance = vec3.subtract(vec3.create(),this.rightFistPos,opp.firstCamPos);}
        if(vec3.len(distance) <= 1.2) {
            opp.damage(); // call opponent's take damage method
        }
        // Afterwords begin the retract animation, pass in variables initially
        // passed into the punch() method to the retract() method
        window.requestAnimationFrame(function() {
            self.retract(time,arm,duration+16);
        });
    }
};
// Retract function seeks to hard code the animation
// of punch() in reverse. 
Robot.prototype.retract = function(strt,rm,duratio) {
    var self = this;
    let time = new Date().getTime();
    let runtime = time - strt;
    let progress = runtime / duratio;
    progress = Math.min(progress,1);
    if(rm == 0) {
        this.upArmRotL -= (0.07);
        this.lowArmRotL += (0.1);
        }
        else {
        this.upArmRotR -= (0.07);
        this.lowArmRotR += (0.1);
        }
    // Loop through animation if duration not completed
    if(runtime < duratio) {
        window.requestAnimationFrame(function() {
            self.retract(strt,rm,duratio);
        });
    }
    else {
        // after retracting this player's punching boolean
        // value is set to false to allow for movement and
        // more punching
        this.strike = false;
    }
};
// Play a sound when damage is taken and lose one life
Robot.prototype.damage = function() {
    oof.play();
    this.health -= 1;
};
// Respective shape and color changes are made in the same
// function. Whenever calling color change only we pass
// -1 for the other value
Robot.prototype.headChange = function(s,c) {
    if(s == 0)
        this.head = Shapes.cube;
    else if(s == 1)
        this.head = Shapes.cylinder;
    if(c == 0)
        this.headMat.diffuse = this.defaultColor;
    else if(c == 1)
        this.headMat.diffuse = vec3.fromValues(0,1,1);
    else if(c == 2)
        this.headMat.diffuse = vec3.fromValues(0,1,0);
    else if(c == 3)
        this.headMat.diffuse = vec3.fromValues(1,0,1);
};
Robot.prototype.bodyChange = function(s,c) {
    if(s == 0)
        this.body = Shapes.cube;
    else if(s == 1)
        this.body = Shapes.cylinder;
    if(c == 0)
        this.bodyMat.diffuse = this.defaultColor;
    else if(c == 1)
        this.bodyMat.diffuse = vec3.fromValues(0,1,1);
    else if(c == 2)
        this.bodyMat.diffuse = vec3.fromValues(0,1,0);
    else if(c == 3)
        this.bodyMat.diffuse = vec3.fromValues(1,0,1);
};
Robot.prototype.armChange = function(s,c) {
    if(s == 0)
        this.arm = Shapes.cube;
    else if(s == 1)
        this.arm = Shapes.cylinder;
    if(c == 0)
        this.armMat.diffuse = this.defaultColor;
    else if(c == 1)
        this.armMat.diffuse = vec3.fromValues(0,1,1);
    else if(c == 2)
        this.armMat.diffuse = vec3.fromValues(0,1,0);
    else if(c == 3)
        this.armMat.diffuse = vec3.fromValues(1,0,1);
};
Robot.prototype.legChange = function(s,c) {
    if(s == 0)
        this.leg = Shapes.cube;
    else if(s == 1)
        this.leg = Shapes.cylinder;
    if(c == 0)
        this.legMat.diffuse = this.defaultColor;
    else if(c == 1)
        this.legMat.diffuse = vec3.fromValues(0,1,1);
    else if(c == 2)
        this.legMat.diffuse = vec3.fromValues(0,1,0);
    else if(c == 3)
        this.legMat.diffuse = vec3.fromValues(1,0,1);
};
Robot.prototype.footChange = function(s,c) {
    if(s == 0)
        this.foot = Shapes.cube;
    else if(s == 1)
        this.foot = Shapes.cylinder;
    if(c == 0)
        this.footMat.diffuse = this.defaultColor;
    else if(c == 1)
        this.footMat.diffuse = vec3.fromValues(0,1,1);
    else if(c == 2)
        this.footMat.diffuse = vec3.fromValues(0,1,0);
    else if(c == 3)
        this.footMat.diffuse = vec3.fromValues(1,0,1);
};
// Ring collision limits the x and z values to 8 using a conditional. If values
// were to exceed we instead reset the respective value to its max/min value.
// This is called after inputs and positions are updated from button presses.
// Source: http://www.hnldesign.nl/work/code/javascript-limit-integer-min-max/
Robot.prototype.ringCollision = function() {
    this.position[0] = (this.position[0] > -8) ? ((this.position[0] < 8) ? this.position[0] : 8) : -8;
    this.position[2] = (this.position[2] > -8) ? ((this.position[2] < 8) ? this.position[2] : 8) : -8;
};
// Player collision is calculated whenever an input is registered and attempting
// to change a player's position. We simply calculate the distance between the
// player and the opponent. If this distance were to become too short as a result
// of the input the the player's position is not changed. Otherwise move accordingly.
Robot.prototype.playerCollision = function(value,direction,oppPos) {
    let newDistance;
    let newPosition;
    if(direction == 0) { // x translation
        newPosition = vec3.fromValues(this.position[0]+value,this.position[1],this.position[2]);
        newDistance = vec3.subtract(vec3.create(),newPosition,oppPos);
        if(vec3.length(newDistance) > 4 )
            this.position = newPosition;
    }
    if(direction == 1) { // z translation
        newPosition = vec3.fromValues(this.position[0],this.position[1],this.position[2]+value);
        newDistance = vec3.subtract(vec3.create(),newPosition,oppPos);
        if(vec3.length(newDistance) > 4 )
            this.position = newPosition;
    }
};