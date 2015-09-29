//globals for eslint
/*global noise:false, PROCED:false*/
//pc.script.attribute('chunkPosition', 'vector');

var width, height, depth, isolevel, dataStep, chunkPos, scaleFactor;
pc.script.create('procedural', function (app) {
	var ProceduralObject = function (entity) {
		this.entity = entity;
	};

	ProceduralObject.prototype = {
		initialize: function () {
			width = this.chunkSize.x;
			height = this.chunkSize.y;
			depth = this.chunkSize.z;
			chunkPos = this.chunkPos;
			scaleFactor = this.scaleFactor;
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

			//console.log(vertexArray.length);
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
	};
	return ProceduralObject;
});
function getNoiseVal(x, y, z) {
	x += chunkPos.x;
	y += chunkPos.y;
	z += chunkPos.z;
	/*
	var octave1 = noise.simplex3(
			x / 0.1 + dataStep.x,
			y / 0.1 + dataStep.y,
			z / 0.1 + dataStep.z
			) / 10;
	var octave2 = noise.simplex3(
			x / 35 + dataStep.x,
			y / 35 + dataStep.y,
			z / 35 + dataStep.z
			);
	var octave3 = noise.simplex3(
			x / 50 + dataStep.x,
			y / 50 + dataStep.y,
			z / 50 + dataStep.z
			);
	   */
	var octave3 = noise.simplex3(
		x / 10 + dataStep.x,
		y / 10 + dataStep.y,
		z / 10 + dataStep.z
	);

	//return octave1 + octave2 + octave3;
	return octave3;
}

function getNormalForVertex(x, y, z, sampler, outObj) {
	outObj.x = -(sampler(x + dataStep.x, y, z) - sampler(x - dataStep.x, y , z));
	outObj.y = -(sampler(x, y + dataStep.y, z) - sampler(x, y - dataStep.y , z));
	outObj.z = -(sampler(x, y, z + dataStep.z) - sampler(x, y , z - dataStep.z));
}

var zeroVec = {x: 0, y: 0, z: 0};

function normalizeInPlace(vec) {
	//console.log('--------');
	//console.log(vec);
	var length = getDistance(zeroVec, vec);
	//console.log(length);
	vec.x = vec.x / length;
	vec.y = vec.y / length;
	vec.z = vec.z / length;
	//console.log(vec);
	//console.log('--------');
}

function getVertices() {
	//var sampler = getFlatVal;
	var sampler = getNoiseVal;
	//var sampler = getSphereVal;
	//var sampler = getSlopeVal;
	var vertices = [];
	var normal = {
		x: 0,
		y: 0,
		z: 0
	};

	var xPos, yPos, zPos;
	//subtract 1 from each end since the last one doesn't need its own cube yaknaw :S
	var getCube = 0,
		polygonize = 0,
		addToLists = 0,
		t0 = 0,
		t1 = 0;
	for(var z = 0; z < depth - 1; z++) {
		for(var y = 0; y < height - 1; y++) {
			for(var x = 0; x < width - 1; x++) {
				t0 = performance.now();
				var cube = getCubeAtPos(x,y,z, sampler);
				t1 = performance.now();
				getCube += t1 - t0;
				var cubeTris = [];
				//var ntriangles = PROCED.polygonize(cube, isolevel, cubeTris);
				t0 = performance.now();
				PROCED.polygonize(cube, isolevel, cubeTris);
				t1 = performance.now();
				polygonize += t1 - t0;

				t0 = performance.now();
				for(var i = 0; i < cubeTris.length; i+=3) {
					xPos = cubeTris[i];
					yPos = cubeTris[i+1];
					zPos = cubeTris[i+2];

					vertices.push(xPos * scaleFactor);
					vertices.push(yPos * scaleFactor);
					vertices.push(zPos * scaleFactor);

					getNormalForVertex(xPos, yPos, zPos, sampler, normal);

					normalizeInPlace(normal);

					vertices.push(normal.x);
					vertices.push(normal.y);
					vertices.push(normal.z);
				}
				t1 = performance.now();
				addToLists += t1 - t0;
			}
		}
	}
	console.log('getting cube: %d, polygonize: %d, addToLists: %d', getCube, polygonize, addToLists);
	return vertices;
}

function getCubeAtPos(x, y, z, sampler) {
	var cube = [];
	cube[0] = {
		pos: {
			x: x,
			y: y,
			z: z
		},
		val: sampler(x,y,z)
	};
	cube[1] = {
		pos: {
			x: x + 1,
			y: y,
			z: z
		},
		val: sampler(x + 1,y,z)
	};
	cube[2] = {
		pos: {
			x: x + 1,
			y: y,
			z: z + 1
		},
		val: sampler(x + 1,y,z + 1)
	};
	cube[3] = {
		pos: {
			x: x,
			y: y,
			z: z + 1
		},
		val: sampler(x,y,z + 1)
	};
	cube[4] = {
		pos: {
			x: x,
			y: y + 1,
			z: z
		},
		val: sampler(x,y + 1, z)
	};
	cube[5] = {
		pos: {
			x: x + 1,
			y: y + 1,
			z: z
		},
		val: sampler(x + 1,y + 1,z)
	};
	cube[6] = {
		pos: {
			x: x + 1,
			y: y + 1,
			z: z + 1
		},
		val: sampler(x + 1, y + 1, z + 1)
	};
	cube[7] = {
		pos: {
			x: x,
			y: y + 1,
			z: z + 1
		},
		val: sampler(x,y + 1, z + 1)
	};

	return cube;
}

function getDistance(p1, p2) {
	return Math.sqrt(
		Math.pow(p1.x - p2.x, 2) + 
		Math.pow(p1.y - p2.y, 2) +
		Math.pow(p1.z - p2.z, 2)
	);
}

/*
function debugPrint(array) {
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
*/

