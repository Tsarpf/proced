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
				buffers.vertexList.length / 3,
				pc.BUFFER_STATIC
			);

			var vertices = new Float32Array(vertexBuffer.lock());

			vertices.set(buffers.vertexList);

			vertexBuffer.unlock();

			var mesh = new pc.Mesh();
			mesh.vertexBuffer = vertexBuffer;
			mesh.indexBuffer[0] = this.getIndexBuffer(buffers);
			mesh.primitive[0].type = pc.PRIMITIVE_TRIANGLES;

			//what's this I don't even?
			mesh.primitive[0].base = 0;

			mesh.primitive[0].count = buffers.indexList.length;

			mesh.primitive[0].indexed = true;
			return mesh;
		},
		getIndexBuffer: function(buffers) {
			var indexBuffer = new pc.IndexBuffer(app.graphicsDevice, pc.INDEXFORMAT_UINT32, buffers.indexList.length);
			var indices = new Uint32Array(indexBuffer.lock());
			indices.set(buffers.indexList);
			indexBuffer.unlock();
			return indexBuffer;
/*
        // var indexBuffer = new pc.gfx.IndexBuffer(context.graphicsDevice, pc.gfx.INDEXFORMAT_UINT16, numIndices, pc.gfx.BUFFER_STATIC);
        var indexBuffer = new pc.gfx.IndexBuffer(context.graphicsDevice, pc.gfx.INDEXFORMAT_UINT16, numIndices);
        var indices = new Uint8Array(indexBuffer.lock());

        var indexArray = [];
        // Should be like this order: http://dan.lecocq.us/wordpress/2009/12/25/triangle-strip-for-grids-a-construction/
        for(x=0;x<dimminus1;x++) {
            for(y=0;y<dimminus1;y++) {
                indexArray.push(x*dimension+y,(x+1)*dimension+y, x*dimension+y+1,(x+1)*dimension+y, x*dimension+y+1, (x+1)*dimension+y+1);
            }
        }
        indices.set(indexArray);
        indexBuffer.unlock();
*/
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
				//material = new pc.BasicMaterial();
				material = new pc.PhongMaterial();
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
	function getSlopeVal(x, y, z) {
			return y / height + x / width;
	}
	function getFlatVal(x, y, z) {
			return y / height;
	}
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

	function getBuffers() {
		var sampler = getNoiseVal;
		//var sampler = getSlopeVal;
		//var sampler = getFlatVal;
		var triangles = [];
		var vertexLookup = [];
		for(var z = 0; z < depth - 1; z++) {
			for(var y = 0; y < height - 1; y++) {
				for(var x = 0; x < width - 1; x++) {
					var cube = getCubeAtPos(x,y,z, sampler);
					var cubeTris = [];
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

						//debugger;
						var normal = new pc.Vec3().cross(v1, v2);
						normal.normalize();
						var area = v1.length() * v2.length() / 2;

						var triangle = {
							fst: [cubeTris[i + 0], cubeTris[i + 1], cubeTris[i + 2]],
							snd: [cubeTris[i + 3], cubeTris[i + 4], cubeTris[i + 5]],
							trd: [cubeTris[i + 6], cubeTris[i + 7], cubeTris[i + 8]]
							/*
							normal: normal,
							area: area
							*/
						};
						triangles.push(triangle);
						
						//Add triangle normals for each vertex here
						//so they can be used in the next pass when generating the actual vertex and index buffers
						for(var j = i; j < i + 9; j+=3) {
							var idx = getIdx(cubeTris[j], cubeTris[j + 1], cubeTris[j+2]);
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
		}

		var vertexList = [];
		var indexList = [];
		var vertexIndexLookup = [];
		for(i = 0; i < triangles.length; i++) {
			for(var vertKey in triangles[i]) {
				var vert = triangles[i][vertKey];
				idx = getIdx(vert[0], vert[1], vert[2]);
				//var normal = vertexLookup[idx] //calc normal here
				//debugger;
				normal = getAverageNormal(vertexLookup[idx]);
				//normal.scale(-1);
				if(!vertexIndexLookup[idx]) {
					vertexList.push(vert[0] * scaleFactor, vert[1] * scaleFactor, vert[2] * scaleFactor);
					vertexList.push(normal.x, normal.y, normal.z);
					var len = vertexList.length;
					vertexIndexLookup[idx] = {
						vertexIndices: [len - 3, len - 2, len - 1],
						//vertexIndices: [len - 6, len - 5, len - 4],
						normalIndices: [len - 3, len - 2, len - 1]
					};
				}
				var idxObj = vertexIndexLookup[idx];
				indexList.push(idxObj.vertexIndices[0] / 6);
			}
		}

		
		/*
		return {vertexList: [
			1, 2, 0, //0-2
			1, 2, 1, //3-5
			0, 2, 0, //6-8
			0, 2, 1 //9 - 11
		], indexList: [
			0, 1, 2, //first triangle
			1, 3, 2
		]};
		*/
		return {vertexList: vertexList, indexList: indexList};
	}

	function getAverageNormal(trianglesData) {
		var sumVec = new pc.Vec3(0,0,0);
		for(var i = 0; i < trianglesData.length; i++) {
			sumVec.add(trianglesData[i].normal.scale(trianglesData[i].area));
		}
		sumVec.scale(1 / trianglesData.length);
		sumVec.normalize();
		return sumVec;
	}
	var decimalCount = 5;
	function getIdx(x, y, z) {
		return '' + x.toFixed(decimalCount) + ' ' + y.toFixed(decimalCount) + ' ' + z.toFixed(decimalCount);
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

	return ProceduralObject;
});
