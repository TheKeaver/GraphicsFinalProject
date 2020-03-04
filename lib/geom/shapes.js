
/**
 * This single object is designed to be a "library" of primitive shapes that we can use.
 * Initially, this object has only one property (the init function).  After the init
 * function is called, it will have a property for each of the primitive shapes.  The
 * init function should be called only once.
 */
var Shapes = {
    /**
     * This function initializes all primitive shapes and makes them available.
     * 
     * @param{WebGL2RenderingContext} gl
     */
    init: function(gl) {
        if( this.initialized ) return;

        // Cube
        this.cube = new TriangleMesh(gl, generateCubeData());

        // Initialize other shapes here....
        this.disk = new TriangleMesh(gl, generateDiskData());
        this.cylinder = new TriangleMesh(gl, generateCylinderData());
        this.cone = new TriangleMesh(gl, generateConeData());
        this.light = new Light(1,1,0);
        this.ring = new Ring();
        this.player1 = new Robot(-5.0,0,vec3.fromValues(1,0,0));
        this.player2 = new Robot(5.0,0,vec3.fromValues(0,0,1));

        this.initialized = true;
    },
    initialized: false
};