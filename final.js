/*
Name: Keith Petitt
Assignment: Final Project
Course/Semester: CS 412 - Spring 2018
Instructor: Wolff
Sources consulted: Past Assignments, Slides, Sources listed below
Paragraph: This program is largely an expansion of prior lab
assignments into a game-like environment between two fist-fighting
robots. Individuals can control both robots simultaneously, allowing
for punching and detection to play noises as a response to successful
hits. Camera modes 'Mouse' and 'Fly' allow for the standard camera
controls in previous labs. You can also move players in 'Mouse' mode.
Camera modes '1st' and '3rd' person take you into perspectives relative
to Player 1. Only '1st' and '3rd' mode allow punching. 
Controls: 
Player 1: Q/E for Left/Right Punch, WASD to move (varies by camera mode)
Player 2: U/O for Left/Right Punch, IJKL to move (varies by camera mode)
Players have 3 total life before the gameplay freezes and requires a
browser reload to reset the game state.
*/
// The WebGL object
var gl;

// The HTML canvas
var canvas;

var grid;    // The reference grid
var axes;    // The coordinate axes
var camera;  // The camera
var model;
var defaulCamPos = vec3.fromValues(0,5,15);
var defaultCamAt = vec3.fromValues(0,0,0);
var defaultCamUp = vec3.fromValues(0,1,0);
var pointLightPos = vec3.fromValues(0,10,0);
var oof = new Audio("media/roblox_oof.mp3");
var logged = new Boolean(false);

// Uniform variable locations
var uni = {
    uModel: null,
    uView: null,
    uProj: null,
    uColor: null,
    uEmissive: null,
    uAmbient: null,
    uDiffuse: null,
    uSpecular: null,
    uShine: null,
    uLightPos: null,
    uLightIntensity: null,
    uAmbientLight: null,
    uHasDiffuseTex: null,
    uDiffuseTex: null
};

//var groundMaterial = new Material();

/**
 * Initialize the WebGL context, load/compile shaders, and initialize our shapes.
 */
var init = function() {
    
    // Set up WebGL
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Set the viewport transformation
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set the background color
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    
    // Enable the z-buffer
    gl.enable(gl.DEPTH_TEST);

    // Load and compile shaders
    program = Utils.loadShaderProgram(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Find the uniform variable locations
    uni.uModel = gl.getUniformLocation(program, "uModel");
    uni.uView = gl.getUniformLocation(program, "uView");
    uni.uProj = gl.getUniformLocation(program, "uProj");
    uni.uColor = gl.getUniformLocation(program, "uColor");
    uni.uEmissive = gl.getUniformLocation(program, "uEmissive");
    uni.uAmbient = gl.getUniformLocation(program, "uAmbient");
    uni.uDiffuse = gl.getUniformLocation(program, "uDiffuse");
    uni.uSpecular = gl.getUniformLocation(program, "uSpecular");
    uni.uShine = gl.getUniformLocation(program, "uShine");
    uni.uLightPos = gl.getUniformLocation(program, "uLightPos");
    uni.uLightIntensity = gl.getUniformLocation(program, "uLightIntensity");
    uni.uAmbientLight = gl.getUniformLocation(program, "uAmbientLight");
    uni.uHasDiffuseTex = gl.getUniformLocation(program, "uHasDiffuseTex");
    uni.uDiffuseTex = gl.getUniformLocation(program, "uDiffuseTex");
    gl.uniform3fv(uni.uAmbientLight, vec3.fromValues(0,0,0));
    gl.uniform3fv(uni.uLightIntensity, vec3.fromValues(1,1,1));
    gl.uniform1i(uni.uDiffuseTex, 0);


    // Initialize our shapes
    Shapes.init(gl);
    // Initialize player rotations
    Shapes.player1.lookAt(Shapes.player1.position,Shapes.player2.position);
    Shapes.player2.lookAt(Shapes.player2.position,Shapes.player1.position);

    model = mat4.create();

    // Initialize the camera
    camera = new Camera( canvas.width / canvas.height );
    setupEventHandlers();

    Promise.all( [
        Utils.loadTexture(gl, "media/Geese.jpg"),
        Utils.loadTexture(gl, "media/kof.jpg"),
        Utils.loadTexture(gl, "media/post.jpg")
    ]).then( function(values) {
       Textures["Geese.jpg"] = values[0],
       Textures["kof.jpg"] = values[1],
       Textures["post.jpg"] = values[2];
       render();
   });
};

/**
 * Render the scene!
 */
var render = function() {
    // Request another draw
    window.requestAnimFrame(render, canvas);

    // Update camera when in fly mode
    updateCamera();

    // Clear the color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set projection and view matrices 
    gl.uniformMatrix4fv(uni.uView, false, camera.viewMatrix());
    gl.uniformMatrix4fv(uni.uProj, false, camera.projectionMatrix());

    drawScene();
};

/**
 * Draw the objects in the scene.  
 */
var drawScene = function() {
    model = mat4.create();
    Shapes.ring.setPostTex(gl,uni);
    Shapes.ring.setFloorTex(gl,uni);
    Shapes.ring.render(gl,uni);
    Shapes.player1.render(gl,uni);
    Shapes.player2.render(gl,uni);
};

//////////////////////////////////////////////////
// Event handlers
//////////////////////////////////////////////////

/**
 * An object used to represent the current state of the mouse.
 */
mouseState = {
    prevX: 0,     // position at the most recent previous mouse motion event
    prevY: 0, 
    x: 0,          // Current position
    y: 0,      
    button: 0,     // Left = 0, middle = 1, right = 2
    down: false,   // Whether or not a button is down
    wheelDelta: 0  // How much the mouse wheel was moved
};
var cameraMode = 0;          // Mouse = 0, Fly = 1
var lightMode = 0;           // Local = 0, Camera = 1
var downKeys = new Set();    // Keys currently pressed

var setupEventHandlers = function() {
    let modeSelect = document.getElementById("camera-mode-select");
    let lightSelect = document.getElementById("lighting-mode-select");
    // Player 1 element retrieval
    let p1Head = document.getElementById("p1-head-select");
    let p1HeadColor = document.getElementById("p1-head-color");
    let p1Body = document.getElementById("p1-body-select");
    let p1BodyColor = document.getElementById("p1-body-color");
    let p1Arm = document.getElementById("p1-arm-select");
    let p1ArmColor = document.getElementById("p1-arm-color");
    let p1Leg = document.getElementById("p1-leg-select");
    let p1LegColor = document.getElementById("p1-leg-color");
    let p1Foot = document.getElementById("p1-foot-select");
    let p1FootColor = document.getElementById("p1-foot-color");
    // Player 2 element retrieval
    let p2Head = document.getElementById("p2-head-select");
    let p2HeadColor = document.getElementById("p2-head-color");
    let p2Body = document.getElementById("p2-body-select");
    let p2BodyColor = document.getElementById("p2-body-color");
    let p2Arm = document.getElementById("p2-arm-select");
    let p2ArmColor = document.getElementById("p2-arm-color");
    let p2Leg = document.getElementById("p2-leg-select");
    let p2LegColor = document.getElementById("p2-leg-color");
    let p2Foot = document.getElementById("p2-foot-select");
    let p2FootColor = document.getElementById("p2-foot-color");

    // Disable the context menu in the canvas in order to make use of
    // the right mouse button.
    canvas.addEventListener("contextmenu", function(e) {
        e.preventDefault();
    });
    // This large block of event handlers corresponds to the various
    // customizable features of each robot. Each individual part
    // is customizable by color and shape. The robots were designed
    // to be flexible with various basic shapes utilized previously.
    // More colors/shapes could be added, yet the options are limited
    // so as to show the functionality.
    p1Head.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player1.headChange(0,-1);
            else if( val === "1" ) 
                Shapes.player1.headChange(1,-1);
        }
    );
    p1HeadColor.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player1.headChange(-1,0);
            else if( val === "1" ) 
                Shapes.player1.headChange(-1,1);
            else if( val === "2" ) 
                Shapes.player1.headChange(-1,2);
            else if( val === "3" ) 
                Shapes.player1.headChange(-1,3);
        }
    );
    p1Body.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player1.bodyChange(0,-1);
            else if( val === "1" ) 
                Shapes.player1.bodyChange(1,-1);
        }
    );
    p1BodyColor.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player1.bodyChange(-1,0);
            else if( val === "1" ) 
                Shapes.player1.bodyChange(-1,1);
            else if( val === "2" ) 
                Shapes.player1.bodyChange(-1,2);
            else if( val === "3" ) 
                Shapes.player1.bodyChange(-1,3);
        }
    );
    p1Arm.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player1.armChange(0,-1);
            else if( val === "1" ) 
                Shapes.player1.armChange(1,-1);
        }
    );
    p1ArmColor.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player1.armChange(-1,0);
            else if( val === "1" ) 
                Shapes.player1.armChange(-1,1);
            else if( val === "2" ) 
                Shapes.player1.armChange(-1,2);
            else if( val === "3" ) 
                Shapes.player1.armChange(-1,3);
        }
    );
    p1Leg.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player1.legChange(0,-1);
            else if( val === "1" ) 
                Shapes.player1.legChange(1,-1);
        }
    );
    p1LegColor.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player1.legChange(-1,0);
            else if( val === "1" ) 
                Shapes.player1.legChange(-1,1);
            else if( val === "2" ) 
                Shapes.player1.legChange(-1,2);
            else if( val === "3" ) 
                Shapes.player1.legChange(-1,3);
        }
    );
    p1Foot.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player1.footChange(0,-1);
            else if( val === "1" ) 
                Shapes.player1.footChange(1,-1);
        }
    );
    p1FootColor.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player1.footChange(-1,0);
            else if( val === "1" ) 
                Shapes.player1.footChange(-1,1);
            else if( val === "2" ) 
                Shapes.player1.footChange(-1,2);
            else if( val === "3" ) 
                Shapes.player1.footChange(-1,3);
        }
    );
    p2Head.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player2.headChange(0,-1);
            else if( val === "1" ) 
                Shapes.player2.headChange(1,-1);
        }
    );
    p2HeadColor.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player2.headChange(-1,0);
            else if( val === "1" ) 
                Shapes.player2.headChange(-1,1);
            else if( val === "2" ) 
                Shapes.player2.headChange(-1,2);
            else if( val === "3" ) 
                Shapes.player2.headChange(-1,3);
        }
    );
    p2Body.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player2.bodyChange(0,-1);
            else if( val === "1" ) 
                Shapes.player2.bodyChange(1,-1);
        }
    );
    p2BodyColor.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player2.bodyChange(-1,0);
            else if( val === "1" ) 
                Shapes.player2.bodyChange(-1,1);
            else if( val === "2" ) 
                Shapes.player2.bodyChange(-1,2);
            else if( val === "3" ) 
                Shapes.player2.bodyChange(-1,3);
        }
    );
    p2Arm.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player2.armChange(0,-1);
            else if( val === "1" ) 
                Shapes.player2.armChange(1,-1);
        }
    );
    p2ArmColor.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player2.armChange(-1,0);
            else if( val === "1" ) 
                Shapes.player2.armChange(-1,1);
            else if( val === "2" ) 
                Shapes.player2.armChange(-1,2);
            else if( val === "3" ) 
                Shapes.player2.armChange(-1,3);
        }
    );
    p2Leg.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player2.legChange(0,-1);
            else if( val === "1" ) 
                Shapes.player2.legChange(1,-1);
        }
    );
    p2LegColor.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player2.legChange(-1,0);
            else if( val === "1" ) 
                Shapes.player2.legChange(-1,1);
            else if( val === "2" ) 
                Shapes.player2.legChange(-1,2);
            else if( val === "3" ) 
                Shapes.player2.legChange(-1,3);
        }
    );
    p2Foot.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player2.footChange(0,-1);
            else if( val === "1" ) 
                Shapes.player2.footChange(1,-1);
        }
    );
    p2FootColor.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                Shapes.player2.footChange(-1,0);
            else if( val === "1" ) 
                Shapes.player2.footChange(-1,1);
            else if( val === "2" ) 
                Shapes.player2.footChange(-1,2);
            else if( val === "3" ) 
                Shapes.player2.footChange(-1,3);
        }
    );
    // Changes the camera coordinates to standard locations
    // whenever a user selects an option
    modeSelect.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" ) {
                cameraMode = 0; 
                camera.reset(); }
            else if( val === "1" ) {
                cameraMode = 1;
                camera.reset(); }
            else if( val === "2") {
                // Move to just in front of player 1's head. 
                cameraMode = 2;
                camera.lookAt(Shapes.player1.position,Shapes.player2.position,defaultCamUp); }
            else if(val === "3") {
                cameraMode = 3; 
                let camPos = vec3.fromValues(Shapes.player1.position[0]-5,Shapes.player1.position[1]+7,Shapes.player1.position[2]);
                let camAt = vec3.fromValues(Shapes.player2.position[0],Shapes.player2.position[1]+5,Shapes.player2.position[2]); 
                camera.lookAt(camPos,camAt,defaultCamUp); }
        }
    );
    lightSelect.addEventListener("change",
        function(e) {
            let val = e.target.value;
            if( val === "0")
                lightMode = 0;
            else if( val === "1")
                lightMode = 1;
        })
    canvas.addEventListener("mousemove", 
        function(e) {
            if( mouseState.down && (cameraMode == 0 || cameraMode == 1)) {
                mouseState.x = e.pageX - this.offsetLeft;
                mouseState.y = e.pageY - this.offsetTop;
                mouseDrag();
                mouseState.prevX = mouseState.x;
                mouseState.prevY = mouseState.y;
            }
        });
    canvas.addEventListener("mousedown", function(e) {
        mouseState.x = e.pageX - this.offsetLeft;
        mouseState.y = e.pageY - this.offsetTop;    
        mouseState.down = true;
        mouseState.prevX = mouseState.x;
        mouseState.prevY = mouseState.y;
        mouseState.button = e.button;
    } );
    canvas.addEventListener("mouseup", function(e) {
        mouseState.x = e.pageX - this.offsetLeft;
        mouseState.y = e.pageY - this.offsetTop;
        mouseState.down = false;
        mouseState.prevX = 0;
        mouseState.prevY = 0;
    } );
    canvas.addEventListener("wheel", function(e) {
        e.preventDefault();
        mouseState.wheelDelta = e.deltaY;
        // TODO: Update camera if necessary.
        if(cameraMode == 0) {
            camera.dolly(mouseState.wheelDelta / Math.abs(mouseState.wheelDelta / 5));
        }
    } );
    document.addEventListener("keydown", function(e) {
        downKeys.add(e.code);
    });
    document.addEventListener("keyup", function(e) {
        downKeys.delete(e.code);
    });
};

/**
 * Check the list of keys that are currently pressed (downKeys) and
 * update the camera appropriately.  This function is called 
 * from render() every frame.
 * updateCamera will serve as the differentiator for game modes
 * alongside camera and light modes. Certain buttons will only work
 * under certain game modes such as customization mode and play mode.
 */
var updateCamera = function() {
    // TODO: Implement this method
    // Update camera loop only works if both players have health remaining
    // Manually reload page once either player has lost all of their health
if(Shapes.player1.health > 0 && Shapes.player2.health > 0) {
    if(cameraMode == 0) {
        // In 'Mouse' mode, check call prototype method checking for player
        // collisions during freeform movement
        if(downKeys.has("KeyW") == true) {
            Shapes.player1.playerCollision(-0.05,1,Shapes.player2.position); }
        if(downKeys.has("KeyS") == true) {
            Shapes.player1.playerCollision(0.05,1,Shapes.player2.position); }
        if(downKeys.has("KeyD") == true) {
            Shapes.player1.playerCollision(0.05,0,Shapes.player2.position); }
        if(downKeys.has("KeyA") == true) {
            Shapes.player1.playerCollision(-0.05,0,Shapes.player2.position); }
        if(downKeys.has("KeyI") == true) {
            Shapes.player2.playerCollision(-0.05,1,Shapes.player1.position); }
        if(downKeys.has("KeyK") == true) {
            Shapes.player2.playerCollision(0.05,1,Shapes.player1.position); }
        if(downKeys.has("KeyL") == true) {
            Shapes.player2.playerCollision(0.05,0,Shapes.player1.position); }
        if(downKeys.has("KeyJ") == true) {
            Shapes.player2.playerCollision(-0.05,0,Shapes.player1.position); }
        // Always update the rotations of each robot so that they constantly
        // face eachother
        Shapes.player1.lookAt(Shapes.player1.position,Shapes.player2.position);
        Shapes.player2.lookAt(Shapes.player2.position,Shapes.player1.position);
    }
    else if(cameraMode == 1) {
        // In fly mode controls are limited to the camera. There is no need to
        // update the player rotations in this camera mode.
        if(downKeys.has("KeyW") == true) {
            camera.dolly(-1); }
        if(downKeys.has("KeyS") == true) {
            camera.dolly(1); }
        if(downKeys.has("KeyD") == true) {
            camera.track(-1,0); }
        if(downKeys.has("KeyA") == true) {
            camera.track(1,0); }
        if(downKeys.has("KeyE") == true) {
            camera.track(0,-1); }
        if(downKeys.has("KeyQ") == true) {
            camera.track(0,1); }
    }
    else {
        // This code executed when in '1st'/'3rd' person mode
        if(Shapes.player1.strike == false) {
            // ^ Only calls this portion of the code when the player is NOT punching
            // this is a means for players to dodge punches given that the punching
            // player will no longer rotate and track the other's position.
            if(downKeys.has("KeyS") == true) {
                // +/- z-direction motion left to dolly function that works
                // almost identically to the camera class' version
                Shapes.player1.dolly(0.05,Shapes.player2); }
            if(downKeys.has("KeyW") == true) {
                Shapes.player1.dolly(-0.05,Shapes.player2); }
            if(downKeys.has("KeyD") == true) {
                // Orbit function does not share the same code as the camera class,
                // yet the implementation is very similar to that of robot.dolly()
                Shapes.player1.orbit(0.05,Shapes.player2); }
            if(downKeys.has("KeyA") == true) {
                Shapes.player1.orbit(-0.05,Shapes.player2); }
            if((downKeys.has("KeyQ") == true)) {
                // Request animation frame when the Q/E button is pressed. Call
                // prototype punch function, pass in time,arm,duration,and opponent
                window.requestAnimationFrame(function() {
                let start = new Date().getTime();
                Shapes.player1.punch(start,1,250,Shapes.player2);
                });
                Shapes.player1.strike = true;
                // set punching to true to prevent multiple function calls
            }
            if(downKeys.has("KeyE") == true) {
                window.requestAnimationFrame(function() {
                let start = new Date().getTime();
                Shapes.player1.punch(start,0,250,Shapes.player2);
                });
                Shapes.player1.strike = true;
            }
            // Only update Player 1's rotation when NOT punching
            Shapes.player1.lookAt(Shapes.player1.position,Shapes.player2.position);
        } 
        if(Shapes.player2.strike == false) {
            // All code in this block mirrors that of Player 1's above
            if(downKeys.has("KeyK") == true) {
                Shapes.player2.dolly(-0.05,Shapes.player1); }
            if(downKeys.has("KeyI") == true) {
                Shapes.player2.dolly(0.05,Shapes.player1); }
            if(downKeys.has("KeyL") == true) {
                Shapes.player2.orbit(-0.05,Shapes.player1); }
            if(downKeys.has("KeyJ") == true) {
                Shapes.player2.orbit(0.05,Shapes.player1); }
            if(downKeys.has("KeyU") == true) {
                window.requestAnimationFrame(function() {
                let start = new Date().getTime();
                Shapes.player2.punch(start,1,250,Shapes.player1);
                });
                Shapes.player2.strike = true;
            }
            if(downKeys.has("KeyO") == true) {
                window.requestAnimationFrame(function() {
                let start = new Date().getTime();
                Shapes.player2.punch(start,0,250,Shapes.player1);
                });
                Shapes.player2.strike = true;
            }
            Shapes.player2.lookAt(Shapes.player2.position,Shapes.player1.position);
        }
    }
    if((downKeys.has("Space") == true) && (cameraMode == 0 || cameraMode == 1)) {
        camera.reset(); }
    if(lightMode == 1) {
        gl.uniform3fv(uni.uLightPos, vec3.fromValues(0,0,0));
    }
    if(cameraMode == 3) {
        // Update the '3rd' person camera location when in camera mode 3
        // thirdCamPos calculated every Shapes.player1.render()
        let eyeTemp = vec3.copy(vec3.create(),Shapes.player1.thirdCamPos);
        let eyeLook = vec3.fromValues(
            Shapes.player2.position[0],
            Shapes.player2.position[1]+5,
            Shapes.player2.position[2]
        );
        camera.lookAt(eyeTemp,eyeLook,defaultCamUp);
    }
    else if(cameraMode == 2){
        // Update the '1st' person camera location when in camera mode 2
        // thirdCamPos calculated every Shapes.player1.render()
        let eyeTemp = vec3.copy(vec3.create(),Shapes.player1.firstCamPos);
        let eyeLook = vec3.fromValues(
            Shapes.player2.position[0],
            Shapes.player2.position[1]+5,
            Shapes.player2.position[2]
        );
        camera.lookAt(eyeTemp,eyeLook,defaultCamUp);
    }
    // check for ring collision whenever not punching
    Shapes.player1.ringCollision();
    Shapes.player2.ringCollision();
  } // end of health check
  else if(logged == false) {
    // when a player loses console displays victory message and thus freezes
    // all gameplay. Must reset page
    logged = true;
    let winner = Shapes.player1.health - Shapes.player2.health;
    if(winner > 0)
        console.log("Player 1 Wins!");
    else
        console.log("Player 2 Wins!");
  }
};

/**
 * Called when a mouse motion event occurs and a mouse button is 
 * currently down.
 */
var mouseDrag = function () {
    // TODO: Implement this method
    if(cameraMode == 0) {
        if(mouseState.button == 2) {
            camera.track((mouseState.prevX-mouseState.x)/2, (mouseState.y-mouseState.prevY)/2); }
        if(mouseState.button == 0) {
            camera.orbit(-(mouseState.prevX-mouseState.x), -(mouseState.y-mouseState.prevY)); }
    }
    else {
        camera.turn(-(mouseState.prevX-mouseState.x), -(mouseState.y-mouseState.prevY)); }
};

// When the HTML document is loaded, call the init function.
window.addEventListener("load", init);