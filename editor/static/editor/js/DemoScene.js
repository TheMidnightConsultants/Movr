DesktopScene.prototype = Scene.prototype;

function DesktopScene(){
  Scene.apply(this, Array.prototype.slice.call(arguments));
  this.cursorLocked;

  this.controlsEnabled = false;
  this.moveForward = false;
  this.moveBackward = false;
  this.moveLeft = false;
  this.moveRight = false;
  this.canJump = false;

  this.prevTime = performance.now();
  this.velocity = new THREE.Vector3();

  this.controls = new THREE.PointerLockControls( this.camera );
  this.scene.add( this.controls.getObject() );

  document.addEventListener( 'keydown', this.onKeyDown.bind(this), false );
  document.addEventListener( 'keyup', this.onKeyUp.bind(this), false );
  document.addEventListener( 'click', this.onClick.bind(this), false );

  this.temp = null;
  this.hoverFurniture = null;
  
  this.animate();
};

DesktopScene.prototype.onKeyDown = function ( event ) {

  switch ( event.keyCode ) {

    case 38: // up
    case 87: // w
      this.moveForward = true;
      break;

    case 37: // left
    case 65: // a
      this.moveLeft = true; 
      break;

    case 40: // down
    case 83: // s
      this.moveBackward = true;
      break;

    case 39: // right
    case 68: // d
      this.moveRight = true;
      break;
      
    case 81: // q
      this.rotateClockwise = true;
      break;
      
    case 69: // e
      this.rotateCounterClockwise = true;
      break;
      
    case 46: // delete
      this.removeHoverFurniture();
      break;
  }

};

DesktopScene.prototype.onKeyUp = function ( event ) {

  switch( event.keyCode ) {

    case 38: // up
    case 87: // w
      this.moveForward = false;
      break;

    case 37: // left
    case 65: // a
      this.moveLeft = false;
      break;

    case 40: // down
    case 83: // s
      this.moveBackward = false;
      break;

    case 39: // right
    case 68: // d
      this.moveRight = false;
      break;
      
    case 81: // q
      this.rotateClockwise = false;
      break;
      
    case 69: // e
      this.rotateCounterClockwise = false;
      break;
  }

};

// click to pickup/place furniture
DesktopScene.prototype.onClick = function ( event ) {
  if (this.controlsEnabled){
    if (this.hoverFurniture != null){
      this.placeFurniture();
    } else {
      this.hoverFurniture = this.pickFurniture();
    }
  }
};

DesktopScene.prototype.animate = function() {
  requestAnimationFrame( this.animate.bind(this) );

  if ( this.controlsEnabled ) {

    var time = performance.now();
    var delta = ( time - this.prevTime ) / 1000;
    var velocity = this.velocity;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    if ( this.moveForward ) velocity.z -= 12 * 300.0 * delta;
    if ( this.moveBackward ) velocity.z += 12 * 300.0 * delta;

    if ( this.moveLeft ) velocity.x -= 12 * 300.0 * delta;
    if ( this.moveRight ) velocity.x += 12 * 300.0 * delta;
    
    if ( this.hoverFurniture != null){
      if ( this.rotateClockwise ) this.hoverFurniture.rotateYaw(0.05);
      if ( this.rotateCounterClockwise ) this.hoverFurniture.rotateYaw(-0.05);
    }

    var controlObj = this.controls.getObject();

    if (this.room){
      var limX = this.room.dimensions[0] / 2;
      var limZ = this.room.dimensions[1] / 2;
      var changed = false;
      // get world position
      var worldPos = controlObj.getWorldPosition();
      var worldVel = new THREE.Vector3().copy(velocity);
      // translate local vel to world
      controlObj.localToWorld(worldVel);
      if (worldPos.x > limX - 6 || worldPos.x < 6 - limX){
        worldVel.x = 0;
        changed = true;
      }
      if (worldPos.z > limZ - 6 || worldPos.z < 6 - limZ){
        worldVel.z = 0;
        changed = true;
      }
      if (changed){
        controlObj.worldToLocal(worldVel);
        velocity.copy(worldVel);
      }
    }

    controlObj.translateX( velocity.x * delta );
    controlObj.translateZ( velocity.z * delta );

    this.prevTime = time;

  } else {
    this.prevTime = performance.now();
  }
  
  this.updateHoverPosition();

  this.renderer.render( this.scene, this.camera );
};

DesktopScene.prototype.DisableControls = function(){
  this.controls.enabled = false;
  this.controlsEnabled = false;
};

DesktopScene.prototype.EnableControls = function(){
  this.controls.enabled = true;
  this.controlsEnabled = true;
};

// get a raycaster that points where the camera is looking
DesktopScene.prototype.getCameraRaycaster = function(){
  var lookDirection = this.camera.getWorldDirection();
  var cameraPos = this.controls.getObject().position.clone();
  var rc = new THREE.Raycaster(cameraPos, lookDirection);
  return rc;
};

// add a hovering furniture model where the player is looking
DesktopScene.prototype.addHoverFurniture = function(model_id){
  this.hoverFurniture = new Furniture(model_id, 0xf442f1);
  this.scene.add(this.hoverFurniture.mesh);
}

DesktopScene.prototype.removeHoverFurniture = function(){
  if (this.hoverFurniture != null){
    console.log("removing hoverFurniture");
    this.scene.remove(this.hoverFurniture.mesh);
    this.room.removeFurniture(this.hoverFurniture);
    this.hoverFurniture = null;
  }
}

// find the point if/where a raycaster intersects the floor plane
DesktopScene.prototype.getFloorRaycast = function(rc){
  var floor = this.scene.getObjectByName("floorplane");
  var intersect = rc.intersectObject(floor, false);
  return intersect;
};

DesktopScene.prototype.placeFurniture = function(){
  this.scene.remove(this.hoverFurniture.mesh);
  this.room.addFurniture(this.hoverFurniture);
  this.hoverFurniture.resetColor();
  this.hoverFurniture = null;
};

// determine and pick the furniture the camera is looking at
DesktopScene.prototype.pickFurniture = function(){
  var rc = this.getCameraRaycaster();
  var intersect = rc.intersectObject(this.room.furniture, true);
  if (intersect.length > 0){
    var nearest = intersect[0].object.parent.parent;
    var f = nearest.asFurniture;
    console.log(f);
    f.setColor(0xff3333);
    return f;
  }
  return null;
};

// update the position that picked up furniture is hovering at
DesktopScene.prototype.updateHoverPosition = function(){
  if (this.hoverFurniture == null){
    return;
  }
  var rc = this.getCameraRaycaster();
  var intersect = this.getFloorRaycast(rc);
  if (intersect.length > 0){
    var p = intersect[0].point;
    this.hoverFurniture.setPosition(p.x, p.y, p.z);
  }
};

// get the dimensions of the furniture that's currently picked up
DesktopScene.prototype.getHoverDimensions = function(){
  if (this.hoverFurniture == null){
    return null;
  } else {
    return this.hoverFurniture.getDimensions();
  }
}

// multiply the scale of the picked up furniture by a scalar
DesktopScene.prototype.hoverScaleMultiply = function(scalar){
  if (this.hoverFurniture == null){
    return;
  } else {
    this.hoverFurniture.scaleMultiply(scalar);
  }
}

// set the scale of the picked up furniture to a given vector
DesktopScene.prototype.setHoverScale = function(x,y,z){
  if (this.hoverFurniture == null){
    return;
  } else {
    this.hoverFurniture.setScale(x,y,z);
  }
}

// set the dimensions of the picked up furniture
DesktopScene.prototype.setHoverDimensions = function(x,y,z){
  if (this.hoverFurniture == null){
    return;
  } else {
    this.hoverFurniture.setDimensions(x,y,z);
  }
}
