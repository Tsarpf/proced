var width, height, depth, isolevel;
pc.script.create('procedural', function (app) {
    var ProceduralObject = function (entity) {
        this.entity = entity;
    }

    ProceduralObject.prototype = {
        initialize: function () {
            width = height = depth = 8;
            isolevel = 0.0;
            var vertexFormat = new pc.VertexFormat(app.graphicsDevice, [{
                    semantic: pc.SEMANTIC_POSITION,
                    components: 3,
                    type: pc.ELEMENTTYPE_FLOAT32
                }
            ]);

            //Marching etc done at this point
            var vertexArray = getVertices();

            var vertexBuffer = new pc.VertexBuffer(
                app.graphicsDevice,
                vertexFormat,
                vertexArray.length,
                pc.BUFFER_STATIC
            );

            var vertices = new Float32Array(vertexBuffer.lock());

            vertices.set(vertexArray);
            vertexBuffer.unlock();

            var mesh = new pc.Mesh();
            mesh.vertexBuffer = vertexBuffer;
            mesh.primitive[0].type = pc.PRIMITIVE_TRIANGLES;

            //TODO: what's this I don't even?
            mesh.primitive[0].base = 0;

            mesh.primitive[0].count = vertexArray.length / 3;

            //Probably leaving this undefined would suffice. But since I couldn't find any docs about this right now let's just be safe
            mesh.primitive[0].indexed = false;

            var node = new pc.GraphNode();
            var material = new pc.BasicMaterial();
            var meshInstance = new pc.MeshInstance(node, mesh, material);

            var model = new pc.Model();
            model.graph = node;
            model.meshInstances = [meshInstance];

            app.systems.model.addComponent(this.entity, {
                type: 'asset'
            });
            this.entity.model.model = model;

            /*
            app.systems.rigidbody.addComponent(this.entity, {
                type: 'static'
            });
            */
            app.systems.collision.addComponent(this.entity, {
                type: 'mesh'
            });
            this.entity.collision.model = model;
            app.systems.collision.implementations.mesh.doRecreatePhysicalShape(this.entity.collision);
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
                console.log(result);
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

function getVertices() {
    var vals = createSphere();
    var vertices = [];

    //subtract 1 from each end since the last one doesn't need its own cube yaknaw :S
    for(var z = 0; z < depth - 1; z++) {
        for(var y = 0; y < height - 1; y++) {
            for(var x = 0; x < width - 1; x++) {
                var cube = getCubeAtPos(x,y,z, vals);
                var cubeTris = [];
                var ntriangles = PROCED.polygonize(cube, isolevel, cubeTris);
                console.log(ntriangles);
                console.log(cubeTris);
                console.log(ntriangles * 3);
                for(var i = 0; i < ntriangles * 3; i++) {
                    vertices.push(cubeTris[i]);
                }
                //console.log(ntriangles);
            }
        }
    }
    return vertices;
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
