var generateDiskData = function( radius=1, slices=8 ) {
    var v = [], n = [], el = [], tc = [];

    var factor = 2.0 * Math.PI / slices;
    for( var i = 0; i < slices; i++ ) {
        var angle = factor * i;
        v.push(radius * Math.cos(angle));
        v.push(radius * Math.sin(angle));
        v.push(0);
        tc.push(0.5+(0.5 * Math.cos(angle)));
        tc.push(0.5+(0.5 * Math.sin(angle)));
        n.push(0,0,1);
        el.push(i, (i + 1) % slices, slices);
    }

    // Add center point
    v.push(0,0,0);
    n.push(0,0,1);
    tc.push(0.5,0.5);

    return {
        index: el,
        position: v,
        normal: n,
        texCoord: tc
    };
};