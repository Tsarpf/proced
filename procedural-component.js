var width, height, depth, isolevel;
pc.script.create('procedural', function (app) {
    var ProceduralObject = function (entity) {
        this.entity = entity;
    }

    ProceduralObject.prototype = {
        initialize: function () {
            width = height = depth = 64;
            isolevel = 0.5;
        },
        update: function() {
        }
    }
    return ProceduralObject;
});

function createSphere() {
    var maxDistance = width / 2;
    var result, idx, pos;
    var data = [];

    var center = {
        x: width / 2,
        y: height / 2,
        z: depth / 2
    }
    //We can reuse the variable since it's not passed outside this function 
    pos = {
        x: 0, y: 0, z: 0
    } 
    for(var z = 0; z < depth; z++) {
        for(var y = 0; y < height; y++) {
            for(var x = 0; x < width; x++) {
                pos.x = x; pos.y = y; pos.z = z;
                result = 1 - (getDistance(pos, center) / maxDistance); 
                idx = getIdx(x, y, z);
                data[idx] = result; 
            } 
        } 
    } 
    return data;
}

function getCubeAtPos(x, y, z, vals) {
    var cube = [];
    cube[0] = {
        pos: {
            x: x,
            y: y,
            z: z
        },
        val: vals[getIdx(x,y,z)]
    }
    cube[1] = {
        pos: {
            x: x + 1,
            y: y,
            z: z
        },
        val: vals[getIdx(x + 1,y,z)]
    }
    cube[2] = {
        pos: {
            x: x + 1,
            y: y,
            z: z + 1
        },
        val: vals[getIdx(x + 1,y,z + 1)]
    }
    cube[3] = {
        pos: {
            x: x,
            y: y,
            z: z + 1
        },
        val: vals[getIdx(x,y,z + 1)]
    }
    cube[4] = {
        pos: {
            x: x,
            y: y + 1,
            z: z
        },
        val: vals[getIdx(x,y + 1, z)]
    }
    cube[5] = {
        pos: {
            x: x + 1,
            y: y + 1,
            z: z
        },
        val: vals[getIdx(x + 1,y + 1,z)]
    }
    cube[6] = {
        pos: {
            x: x + 1,
            y: y + 1,
            z: z + 1
        },
        val: vals[getIdx(x + 1, y + 1, z + 1)]
    }
    cube[7] = {
        pos: {
            x: x,
            y: y + 1,
            z: z + 1
        },
        val: vals[getIdx(x,y + 1, z + 1)]
    }

    return cube;
}

function getThang() {
    var vals = createSphere();
    var triangles = [];

    //subtract 1 from each end since the last one doesn't need its own cube yaknaw :S
    for(var z = 0; z < depth - 1; z++) {
        for(var y = 0; y < height - 1; y++) {
            for(var x = 0; x < width - 1; x++) {
                var cube = getCubeAtPos(x,y,z, vals);
                var cubeTris = [];
                var ntriangles = PROCED.polygonize(cube, isolevel, cubeTris);
                for(var i = 0; i < ntriangles; i++) {
                    triangles.push(cubeTris[i]);
                }
                console.log(ntriangles);
            }
        }
    }
    //draw triangles
}

function getDistance(p1, p2) {
    return Math.sqrt(
        Math.pow(p1.x - p2.x, 2) + 
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
    );
}

function getIdx(x, y, z) {
    return x + width * (y + height * z);
}
