function Scene(){
	var geometry, material, mesh;

	this.objects = [];

	this.raycaster;

	this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

	this.scene = new THREE.Scene();
	// this.scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

	var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
	light.position.set( 0.5, 1, 0.75 );
	this.scene.add( light );

	this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

	// floor

	geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
	geometry.rotateX( - Math.PI / 2 );

	for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

		var vertex = geometry.vertices[ i ];
		vertex.x += Math.random() * 20 - 10;
		// vertex.y += Math.random() * 2;
		vertex.z += Math.random() * 20 - 10;

	}

	for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

		var face = geometry.faces[ i ];
		face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

	}

	material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

	mesh = new THREE.Mesh( geometry, material );
	this.scene.add( mesh );

	
	this.room = new Room(120, 120, 50, 0xAA2288);
	this.scene.add(this.room.mesh);

// 	var testCouch = new Furniture("couch.obj", 0x736283);
// 	this.room.addFurniture(testCouch, 0, 0, 0);


	// object loader
/*	
	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};

	var onError = function ( xhr ) {
	};
	
	var loader = new THREE.OBJLoader();
	loader.load('/static/editor/models/couch.obj',
		function(object){
			object.traverse( function(child) {
			 	if (child instanceof THREE.Mesh){
			 		// child.material = new THREE.MeshBasicMaterial( {color: 0x445599, wireframe: false, vertexColors: THREE.NoColors } );
			 		child.material = new THREE.MeshPhongMaterial( {color: 0x445599, wireframe: false, vertexColors: THREE.NoColors } );
			  	}
			});
			object.position.y = 4;
			object.scale.set(5,5,5);
			this.scene.add(object);
		}.bind(this), onProgress, onError );
*/


	//

	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setClearColor( 0xffffff );
	this.renderer.setPixelRatio( window.devicePixelRatio );
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( this.renderer.domElement );

	//

	window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
};

Scene.prototype.onWindowResize = function() {
	//update 3D scene
	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();

	this.renderer.setSize( window.innerWidth, window.innerHeight );
};

Scene.prototype.animate = function() {
	requestAnimationFrame( this.animate.bind(this) );
	this.renderer.render( this.scene, this.camera );
};

Scene.prototype.EnableControls = function(){};

Scene.prototype.DisableControls = function(){};