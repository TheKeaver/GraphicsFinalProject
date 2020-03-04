var generateConeData = function( slices=6, radius=1, height=2 ) {
    // Allocate temporary space for the vertex data
    let verts = [], el = [], normals = [];

    // Generate the points
    let p = vec3.create();
    let sliceFac = 2.0 * Math.PI / slices;
    let angle = 0.0;    
    for( var j = 0; j < slices; j++ ) {
        angle = sliceFac * j;
        p[0] = radius * Math.cos(angle);
        p[1] = radius * Math.sin(angle);
        p[2] = 0.0;
        verts.push(p[0], p[1], p[2]);
        let push = vec3.fromValues(p[0],p[1],(1/2)); // Rcos'u', Rsin'u', R^2/H
        vec3.normalize(push, push);
        normals.push(push[0],push[1],push[2]);
    }
    verts.push(0, 0, height);
    normals.push(0,0,1);

    // Generate the element indexes for triangles
    for( var j = 0; j < slices; j++ ) {
        el.push(j, (j+1) % slices, slices);
    }

    return {
        index: el,
        normal: normals,
        position: verts
    };
};