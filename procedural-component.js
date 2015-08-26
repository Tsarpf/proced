var width, height, depth;
pc.script.create('procedural', function (app) {
    var ProceduralObject = function (entity) {
        this.entity = entity;
    }

    ProceduralObject.prototype = {
        initialize: function () {
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
