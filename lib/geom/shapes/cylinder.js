var generateCylinderData = function(radius=0.5, height=1, slices=8) {
    var nFaces = slices;  // Quadrilateral faces
    var nVerts = slices * 2;

    var verts = [], normals = [], el = [], tc = [];

    // Generate the points
    var x, y, z;
    var sliceFac = 2.0 * Math.PI / slices;
    var angle = 0.0;
    for( var i = 0; i <= 1 ; i++ ) {
        z = i * height;
        for( var j = 0; j < slices; j++ ) {
            angle = sliceFac * j;
            x = Math.cos(angle);
            y = Math.sin(angle);
            x *= radius;
            y *= radius;
            verts.push(x, y, z);
            let norm = vec3.fromValues(x,y,z);
            vec3.subtract(norm, norm, vec3.fromValues(0,0,z));
            vec3.normalize(norm, norm);
            normals.push(norm[0],norm[1],norm[2]);
            let u = j / slices;
            tc.push(u*4);
            tc.push(i);
        }
    }
    // Duplicate the first 2 points, assign the final texture coordinate values
    verts.push(1,0,0); // Equivalent to R*cos(angle)/R*sin(angle) when angle = 0, z = 0
    let norm = vec3.fromValues(1,0,0);
    vec3.subtract(norm,norm,vec3.fromValues(0,0,0));
    vec3.normalize(norm,norm);
    normals.push(norm[0],norm[1],norm[2]);
    tc.push(1,0);

    verts.push(1,0,1); // z = 1
    let norme = vec3.fromValues(1,0,1);
    vec3.subtract(norme,norme,vec3.fromValues(0,0,1));
    vec3.normalize(norme,norme);
    normals.push(norme[0],norme[1],norme[2]);
    tc.push(1,1);

    // Generate the element indexes for triangles
    var topStart = slices;
    for( var j = 0; j < slices; j++ ) {
        // Triangle 1
        el.push(j);
        el.push(topStart + ((j+1) % slices));
        el.push(topStart + j);
        // Triangle 2
        el.push(j);
        el.push((j+1) % slices);
        el.push(topStart + ((j+1) % slices));
    }

    return {
        index: el,
        position: verts,
        normal: normals,
        texCoord: tc
    };
};