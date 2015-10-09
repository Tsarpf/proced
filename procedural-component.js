//globals for eslint
/*global noise:false, PROCED:false*/

//these should be refactored into the component.
var height, depth, isolevel, dataStep, scaleFactor;
pc.script.create('procedural', function (app) {
	var ProceduralObject = function (entity) {
		this.entity = entity;
	};
	ProceduralObject.prototype = {
		initialize: function () {
			if(!this.chunkSize) {
				return;
			}
			this.width = this.chunkSize.x;
			height = this.chunkSize.y;
			depth = this.chunkSize.z;
			//chunkPos = this.chunkPos;
			this.chunkOffset = {
				x: this.chunkPos.x * (this.width - 1),
				y: this.chunkPos.y * (height - 1),
				z: this.chunkPos.z * (depth - 1)
			};

			scaleFactor = this.scaleFactor;
			isolevel = 0.5;
			dataStep = {
				x: 1 / this.width,
				y: 1 / height,
				z: 1 / depth
			};

			switch(this.sampler) {
			case 'alien':
				this.samplerFunction = this.getNoiseVal;
				break;
			case 'perlin':
				this.samplerFunction = this.getNoiseVal;
				break;
			case 'sin':
				this.samplerFunction = this.getSinVal;
				break;
			case 'sin-noise-displace':
				this.samplerFunction = this.getNoiseDisplacedSinVal;
				break;
			}

			this.draw();
		},
		state: 'loading',
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
			//console.log('getting buffers');
			var buffers = this.getBuffers();

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
		},
		addComponents: function() {
			this.state = 'drawing';
			app.systems.model.addComponent(this.entity, {
				type: 'asset'
			});
			this.entity.model.model = this.model;
			this.state = 'drawn';
		},
		draw: function() {
			var mesh = this.getMesh(),
				node = new pc.GraphNode(),
				//material = new pc.BasicMaterial();
				material = new pc.PhongMaterial();
			material.cull = 0;
			//material.opacity = 0.5;
			//material.vertexColors = true;
			var meshInstance = new pc.MeshInstance(node, mesh, material);
			var model = new pc.Model();
			model.graph = node;
			model.meshInstances = [meshInstance];
			this.model = model;

			this.state = 'loaded';

			if(this.visible) {
				this.addComponents();
			}
		},
		getBuffers: function() {
			//var sampler = this.getNoiseVal;
			var sampler = this.samplerFunction;
			sampler = sampler.bind(this);
			this.noiseLookup = [];
			//var sampler = getSlopeVal;
			//var sampler = getFlatVal;
			var triangles = [];
			var vertexLookup = [];
			for(var z = 0; z < depth - 1; z++) {
				for(var y = 0; y < height - 1; y++) {
					for(var x = 0; x < this.width - 1; x++) {
						var cube = this.getCubeAtPos(x,y,z, sampler);
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
					normal = getAverageNormal(vertexLookup[idx]);
					//normal.scale(-1);
					if(!vertexIndexLookup[idx]) {
						vertexList.push(vert[0] * scaleFactor, vert[1] * scaleFactor, vert[2] * scaleFactor);
						vertexList.push(normal.x, normal.y, normal.z);
						var len = vertexList.length;
						vertexIndexLookup[idx] = len - 3;
					}
					indexList.push(vertexIndexLookup[idx] / 6);
				}
			}
			return {vertexList: vertexList, indexList: indexList};
		},
		getNoiseIdx: function(x,y,z) {
			return x + this.width * (y + height * z);
		},
		noiseLookup: [],
		getPerlinVal: function(x, y, z) {
			var idx = this.getNoiseIdx(x,y,z);
			x += this.chunkOffset.x;
			y += this.chunkOffset.y;
			z += this.chunkOffset.z;

			var value;
			var lookupVal = this.noiseLookup[idx];
			if(lookupVal === undefined) {
				value = noise.perlin3(
					x / 20 + dataStep.x,
					y / 20 + dataStep.y,
					z / 20 + dataStep.z
				);
				if(y < 0) {
					value += 1;
				}
				this.noiseLookup[idx] = value;
			}
			else {
				value = lookupVal;
			}
			return value;
		},
		getNoiseVal: function(x, y, z) {
			var idx = this.getNoiseIdx(x,y,z);
			x += this.chunkOffset.x;
			y += this.chunkOffset.y;
			z += this.chunkOffset.z;

			var value;
			var lookupVal = this.noiseLookup[idx];
			if(lookupVal === undefined) {
				value = noise.simplex3(
					x / 20 + dataStep.x,
					y / 20 + dataStep.y,
					z / 20 + dataStep.z
				);
				if(y < 0) {
					value += 1;
				}
				this.noiseLookup[idx] = value;
			}
			else {
				value = lookupVal;
			}
			return value;
		},
		getSinVal: function(x, y, z) {
			x += this.chunkOffset.x;
			y += this.chunkOffset.y - 10;
			z += this.chunkOffset.z;
			var edge = Math.sin(x / 10) * 5
			if(y < edge) {
				return 1;
			}
			else
				return 0;
		},
		getNoiseDisplacedSinVal: function(x, y, z) {
			x += this.chunkOffset.x;
			y += this.chunkOffset.y - 5;
			z += this.chunkOffset.z;
			var edge = Math.sin(x / 10) * 5;
			edge += noise.simplex3(
				x / 10 + dataStep.x,
				y / 10 + dataStep.y,
				z / 10 + dataStep.z
			) * 3;

			if(y < edge) {
				return 1;
			}
			else
				return 0;
		},
		getCubeAtPos: function(x, y, z, sampler) {
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
	};

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


	return ProceduralObject;
});
