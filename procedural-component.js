var width, height, depth, isolevel, dataStep;
pc.script.create('procedural', function (app) {
    var ProceduralObject = function (entity) {
        this.entity = entity;
    }

    ProceduralObject.prototype = {
        initialize: function () {
            width = height = depth = 16;
            isolevel = 0.5;
			dataStep = {
				x: 1 / width,
				y: 1 / height,
				z: 1 / depth
			};
            var vertexFormat = new pc.VertexFormat(app.graphicsDevice, [{
                    semantic: pc.SEMANTIC_POSITION,
                    components: 3,
                    type: pc.ELEMENTTYPE_FLOAT32
                },
				{
                    semantic: pc.SEMANTIC_NORMAL,
                    components: 3,
                    type: pc.ELEMENTTYPE_FLOAT32
                }
            ]);

            //Marching etc done at this point
            var vertexArray = getVertices();

            var vertexBuffer = new pc.VertexBuffer(
                app.graphicsDevice,
                vertexFormat,
                vertexArray.length / 2,
                pc.BUFFER_STATIC
            );

            var vertices = new Float32Array(vertexBuffer.lock());

            vertices.set(vertexArray);

            console.log(vertexArray.length);
            vertexBuffer.unlock();

            var mesh = new pc.Mesh();
            mesh.vertexBuffer = vertexBuffer;
            mesh.primitive[0].type = pc.PRIMITIVE_TRIANGLES;

            //what's this I don't even?
            mesh.primitive[0].base = 0;

            mesh.primitive[0].count = vertexArray.length / 6;

            //Probably leaving this undefined would suffice. But since I couldn't find any docs about this right now let's just be safe
            mesh.primitive[0].indexed = false;

            var node = new pc.GraphNode();
            var material = new pc.PhongMaterial();
            //var material = new pc.BasicMaterial();
            //material.cull = 0;
            //material.vertexColors = true;
            var meshInstance = new pc.MeshInstance(node, mesh, material);

            var model = new pc.Model();
            model.graph = node;
            model.meshInstances = [meshInstance];

            /*
             * These don't work without an index buffer :(
            model.generateWireframe();
            model.meshInstances[0].renderStyle = pc.RENDERSTYLE_WIREFRAME;
            */

            app.systems.model.addComponent(this.entity, {
                type: 'asset'
            });
            this.entity.model.model = model;

            app.systems.rigidbody.addComponent(this.entity, {
                type: 'static'
            });
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
	return getVals(getSphereVal);
}

function createSlopeTest() {

	return getVals(getSlopeVal);
}

function createFlatTest() {

	return getVals(getFlatVal);
}

function getSlopeVal(x, y, z) {
	return y / height + x / width;
}
function getFlatVal(x, y, z) {
	return y / height;
}
function getSphereVal(x, y, z) {
    var maxDistance = width / 2;
    var result, idx, pos;
    var data = [];

    var center = {
        x: width / 2,
        y: height / 2,
        z: depth / 2
    }
    pos = {
        x: x, y: y, z: z
    } 
	return 1 - (getDistance(pos, center) / maxDistance); 
}

function getNormalForVertex(x, y, z, sampler, outObj) {
/*
	outObj.x = sampler(x + dataStep.x, y, z) - sampler(x - dataStep.x, y , z);
	outObj.y = sampler(x, y + dataStep.y, z) - sampler(x, y - dataStep.y , z);
	outObj.z = sampler(x, y, z + dataStep.z) - sampler(x, y , z - dataStep.z);

*/
	outObj.x = -(sampler(x + dataStep.x, y, z) - sampler(x - dataStep.x, y , z));
	outObj.y = -(sampler(x, y + dataStep.y, z) - sampler(x, y - dataStep.y , z));
	outObj.z = -(sampler(x, y, z + dataStep.z) - sampler(x, y , z - dataStep.z));
}

function getVertices() {
	//var sampler = getFlatVal;
	var sampler = getSphereVal;
	//var sampler = getSlopeVal;
    var vertices = [];
	var normal = {
		x: 0,
		y: 0,
		z: 0
	};

	var xPos, yPos, zPos;
    //subtract 1 from each end since the last one doesn't need its own cube yaknaw :S
    for(var z = 0; z < depth - 1; z++) {
        for(var y = 0; y < height - 1; y++) {
            for(var x = 0; x < width - 1; x++) {
                var cube = getCubeAtPos(x,y,z, sampler);
                var cubeTris = [];
                var ntriangles = PROCED.polygonize(cube, isolevel, cubeTris);
                var count = 0;
				for(var i = 0; i < cubeTris.length; i+=3) {
					xPos = cubeTris[i];
					yPos = cubeTris[i+1];
					zPos = cubeTris[i+2];

					vertices.push(xPos);
					vertices.push(yPos);
					vertices.push(zPos);

					getNormalForVertex(xPos, yPos, zPos, sampler, normal);

					vertices.push(normal.x);
					vertices.push(normal.y);
					vertices.push(normal.z);

				}
            }
        }
    }
    return vertices;
}

function getCubeAtPos(x, y, z, sampler) {
    var cube = [];
    cube[0] = {
        pos: {
            x: x,
            y: y,
            z: z
        },
        val: sampler(x,y,z)
    }
    cube[1] = {
        pos: {
            x: x + 1,
            y: y,
            z: z
        },
        val: sampler(x + 1,y,z)
    }
    cube[2] = {
        pos: {
            x: x + 1,
            y: y,
            z: z + 1
        },
        val: sampler(x + 1,y,z + 1)
    }
    cube[3] = {
        pos: {
            x: x,
            y: y,
            z: z + 1
        },
        val: sampler(x,y,z + 1)
    }
    cube[4] = {
        pos: {
            x: x,
            y: y + 1,
            z: z
        },
        val: sampler(x,y + 1, z)
    }
    cube[5] = {
        pos: {
            x: x + 1,
            y: y + 1,
            z: z
        },
        val: sampler(x + 1,y + 1,z)
    }
    cube[6] = {
        pos: {
            x: x + 1,
            y: y + 1,
            z: z + 1
        },
        val: sampler(x + 1, y + 1, z + 1)
    }
    cube[7] = {
        pos: {
            x: x,
            y: y + 1,
            z: z + 1
        },
        val: sampler(x,y + 1, z + 1)
    }

    return cube;
}

function getDistance(p1, p2) {
    return Math.sqrt(
        Math.pow(p1.x - p2.x, 2) + 
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
    );
}

function debugPrint(array) {
	/*	
	var pos = [];
    for(var z = 0; z < depth - 1; z++) {
        for(var y = 0; y < height - 1; y++) {
            for(var x = 0; x < width - 1; x++) {
			 	pos.push(getIdx(x,y,z));
				if(pos.length === 3) {
					console.log(pos);
					pos = [];
				}
			}
		}
	}
	*/

	var pos = [];
	for(var i = 0; i < array.length; i++) {
		pos.push(array[i]);
		if(pos.length === 3) {
			console.log(pos);
			pos = [];
		}

	}
}

function getIdx(x, y, z) {
    return x + width * (y + height * z);
}
