//globals for eslint
/*global noise:false, PROCED:false*/

var width, height, depth, isolevel, dataStep, chunkPos, scaleFactor;
pc.script.create('procedural', function (app) {
	var ProceduralObject = function (entity) {
		this.entity = entity;
	};

	ProceduralObject.prototype = {
		initialize: function () {
			if(!this.chunkSize) {
				return;
			}
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
			this.draw();
		},
		getMesh: function() {
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
			var buffers = getBuffers();

			var vertexBuffer = new pc.VertexBuffer(
				app.graphicsDevice,
				vertexFormat,
				//vertexArray.length / 2, //wat why was this like dat?
				buffers.vertexList.length / 6,
				pc.BUFFER_STATIC
			);
			var indexBuffer = new pc.IndexBuffer(app.graphicsDevice, pc.INDEXFORMAT_UINT16, buffers.indexList.length);
			var indices = new Uint16Array(indexBuffer.lock());
			indices.set(buffers.indexList);
			indexBuffer.unlock();

			var vertices = new Float32Array(vertexBuffer.lock());

			vertices.set(buffers.vertexList);

			vertexBuffer.unlock();

			var mesh = new pc.Mesh();
			mesh.vertexBuffer = vertexBuffer;
			mesh.indexBuffer[0] = indexBuffer;
			mesh.primitive[0].type = pc.PRIMITIVE_TRIANGLES;

			//what's this I don't even?
			mesh.primitive[0].base = 0;

			mesh.primitive[0].count = buffers.indexList.length / 6;

			mesh.primitive[0].indexed = true;
			return mesh;
		},
		addComponents: function() {
			app.systems.model.addComponent(this.entity, {
				type: 'asset'
			});
			this.entity.model.model = this.model;

			app.systems.rigidbody.addComponent(this.entity, {
				type: 'static'
			});
			app.systems.collision.addComponent(this.entity, {
				type: 'mesh'
			});
			/*
			this.entity.collision.model = this.model;
			app.systems.collision.implementations.mesh.doRecreatePhysicalShape(this.entity.collision);
			*/
		},
		draw: function() {
			var mesh = this.getMesh(),
				node = new pc.GraphNode(),
				material = new pc.PhongMaterial();
			//var material = new pc.BasicMaterial();
			//material.cull = 0;
			//material.vertexColors = true;
			var meshInstance = new pc.MeshInstance(node, mesh, material);
			var model = new pc.Model();
			model.graph = node;
			model.meshInstances = [meshInstance];
			this.model = model;

			if(this.visible) {
				this.addComponents();
			}
		}
	};
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

	/*
	function getNormalForVertex(x, y, z, sampler, outObj) {
		outObj.x = -(sampler(x + dataStep.x, y, z) - sampler(x - dataStep.x, y , z));
		outObj.y = -(sampler(x, y + dataStep.y, z) - sampler(x, y - dataStep.y , z));
		outObj.z = -(sampler(x, y, z + dataStep.z) - sampler(x, y , z - dataStep.z));
	}
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
	*/

	//var zeroVec = {x: 0, y: 0, z: 0};


	function getBuffers() {
		//var sampler = getFlatVal;
		var sampler = getNoiseVal;
		//var sampler = getSphereVal;
		//var sampler = getSlopeVal;

		//var xPos, yPos, zPos;
		//subtract 1 from each end since the last one doesn't need its own cube yaknaw :S
		/*
		var getCube = 0,
			polygonize = 0,
			addToLists = 0,
			t0 = 0,
			t1 = 0;
			*/
		var triangles = [];
		var vertexLookup = [];
		for(var z = 0; z < depth - 1; z++) {
			for(var y = 0; y < height - 1; y++) {
				for(var x = 0; x < width - 1; x++) {
					//t0 = performance.now();
					var cube = getCubeAtPos(x,y,z, sampler);
					//t1 = performance.now();
					//getCube += t1 - t0;
					var cubeTris = [];
					//var ntriangles = PROCED.polygonize(cube, isolevel, cubeTris);
					//t0 = performance.now();
					PROCED.polygonize(cube, isolevel, cubeTris);

					for(var i = 0; i < cubeTris.length; i+=9) {
						var v1 = new pc.Vec3(
							cubeTris[i + 3] - cubeTris[i + 0],
							cubeTris[i + 4] - cubeTris[i + 1],
							cubeTris[i + 5] - cubeTris[i + 2]
						);
						var v2 = new pc.Vec3(
							cubeTris[i + 6] - cubeTris[i + 0],
							cubeTris[i + 7] - cubeTris[i + 1],
							cubeTris[i + 8] - cubeTris[i + 2]
						);

						var normal = new pc.Vec3().cross(v1, v2);
						normal.normalize();
						var area = v1.length * v2.length / 2;

						var triangle = {
							fst: [cubeTris[0], cubeTris[1], cubeTris[2]],
							snd: [cubeTris[3], cubeTris[4], cubeTris[5]],
							trd: [cubeTris[6], cubeTris[7], cubeTris[8]]
							/*
							normal: normal,
							area: area
							*/
						};
						triangles.push(triangle);


						
						//Add triangle normals for each vertex here
						//so they can be used in the next pass when generating the actual vertex and index buffers
						debugger;
						var idx = getIdx(vert[0], vert[1], vert[2]);
						if(!vertexLookup[idx]) {
							vertexLookup[idx] = [{
								normal: normal,
								area: area
							}];
						}
						else {
							vertexLookup[idx].push({
								normal: normal,
								area: area
							});
						}
					}
				}
			}
		}

		var vertexList = [];
		var indexList = [];
		var vertexIndexLookup = [];
		for(i = 0; i < triangles.length; i++) {
			for(var vertKey in triangles[i]) {
				var vert = triangles[i][vertKey];
				idx = getIdx(vert[0], vert[1], vert[2]);
				//var normal = vertexLookup[idx] //calc normal here
				normal = getAverageNormal(vertexLookup[idx]);
				if(!vertexIndexLookup[idx]) {
					vertexList.push(vert[0] * scaleFactor, vert[1] * scaleFactor, vert[2] * scaleFactor);
					vertexList.push(normal.x, normal.y, normal.z);
					var len = vertexList.length;
					vertexIndexLookup[idx] = {
						vertexIndices: [len - 6, len - 5, len - 4],
						normalIndices: [len - 3, len - 2, len - 1]
					};
				}
				var idxObj = vertexIndexLookup[idx];
				indexList.push(
					idxObj.vertexIndices[0],
					idxObj.vertexIndices[1],
					idxObj.vertexIndices[2],
					idxObj.normalIndices[0],
					idxObj.normalIndices[1],
					idxObj.normalIndices[2]
				);
			}
		}

		//console.log('getting cube: %d, polygonize: %d, addToLists: %d', getCube, polygonize, addToLists);
		return {vertexList: vertexList, indexList: indexList};
	}

	function getAverageNormal(trianglesData) {
		var sumVec = pc.Vec3(0,0,0);
		for(var i = 0; i < trianglesData.length; i++) {
			sumVec += trianglesData.normal * trianglesData.area;
		}
		sumVec *= sumVec * 1 / trianglesData.length;
		return sumVec;
	}
	function getIdx(x, y, z) {
		return x + width * (y + height * z);
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

	/*
	function getDistance(p1, p2) {
		return Math.sqrt(
			Math.pow(p1.x - p2.x, 2) + 
			Math.pow(p1.y - p2.y, 2) +
			Math.pow(p1.z - p2.z, 2)
		);
	}
	*/
	return ProceduralObject;
});

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
   */

	/*
            var numIndices = (resolution - 1) * (resolution - 1) * 6;
            var indexBuffer = new pc.IndexBuffer(app.graphicsDevice, pc.INDEXFORMAT_UINT16, numIndices);
            var indices = new Uint16Array(indexBuffer.lock());
    
            var indexArray = [];
            for (x = 0; x < resolution - 1; x++) {
                for (y = 0; y < resolution - 1; y++) {
                    indexArray.push(x * resolution + y + 1, 
                                    (x + 1) * resolution + y,
                                    x * resolution + y,
                                    (x + 1) * resolution + y,
                                    x * resolution + y + 1,
                                    (x + 1) * resolution + y + 1);
                }
            }
            indices.set(indexArray);
            indexBuffer.unlock();

            var mesh = new pc.Mesh();
            mesh.vertexBuffer = vertexBuffer;
            mesh.indexBuffer[0] = indexBuffer;
	 */
