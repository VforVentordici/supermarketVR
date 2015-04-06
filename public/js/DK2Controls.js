/*
Based on Lars Ivar Hatledal

   @modified by Marco Marchesi (quaternions)
*/


THREE.DK2Controls = function(object) {

  this.object = object;
  this.ws;
  this.sensorData;
  this.lastId = -1;
  
  this.controller = new THREE.Object3D();
  
  this.headPos = new THREE.Vector3();
  this.headQuat = new THREE.Quaternion();
  
  this.translationSpeed  = 5;
  this.lookSpeed = 0;
  
  this.wasdqe = {
    left: false,
    up: false,
    right: false,
    down: false,
    turnLeft: false,
    turnRight: false
  };
  
  var that = this;
  var ws = new WebSocket("ws://localhost:8888/ws");
  ws.onopen = function () {
    console.log("### Connected ####");
  };

  ws.onmessage = function (evt) {
    var message = evt.data;
    try {
      that.sensorData = JSON.parse(message);
    } catch (err) {
      console.log(message);
    }
  };

  ws.onclose = function () {
    console.log("### Closed ####");
  };
  
  
  this.onKeyDown = function (event) {

    if(!pause) {
      
      switch (event.keyCode) {
        case 81: /*Q*/
          this.wasdqe.turnLeft = true;
          break;
        case 69: /*E*/
          this.wasdqe.turnRight = true;
          break;
        case 87: /*W*/
          this.wasdqe.up = true;
          break;
        case 83: /*S*/
          this.wasdqe.down = true;
          break;
        case 68: /*D*/
          this.wasdqe.right = true;
          break;
        case 65: /*A*/
          this.wasdqe.left = true;
          break;
      }
    }
  };
  
  this.onKeyUp = function (event) {
    switch (event.keyCode) {

      case 81: /*Q*/
        this.wasdqe.turnLeft = false;
        break;
      case 69: /*E*/
        this.wasdqe.turnRight = false;
        break;
      case 87: /*W*/
        this.wasdqe.up = false;
        break;

      case 83: /*S*/
        this.wasdqe.down = false;
        break;

      case 68: /*D*/
        this.wasdqe.right = false;
        break;

      case 65: /*A*/
          this.wasdqe.left = false;
          break;
    }
  };


  this.update = function(delta) {

   /* OCULUS ON */
    if (this.sensorData) { 
      var id = this.sensorData[0];
      if (id > this.lastId) {
        this.headPos.set(this.sensorData[1]*10, this.sensorData[2]*10, this.sensorData[3]*10);
        this.headQuat.set(this.sensorData[4], this.sensorData[5], this.sensorData[6], this.sensorData[7]);
        
        var gloveQuaternion = new THREE.Quaternion();
        // commented the line below
        // this.camera.setRotationFromQuaternion(this.headQuat);
        /* combine head rotations and glove rotations */
        gloveQuaternion.setFromEuler(new THREE.Euler( 0, this.lookSpeed, 0, 'XYZ' ));
        var finalQuaternion = new THREE.Quaternion();
        finalQuaternion.multiplyQuaternions(gloveQuaternion,this.headQuat);

        /* transform camera and controller rotations */
        this.object.setRotationFromQuaternion(finalQuaternion);

        //TODO calculate position with angle from 'this.lookSpeed'
        this.controller.setRotationFromMatrix(this.object.matrix);

      }
      this.lastId = id;
    } 
    /* OCULUS OFF */
    else {

        var gloveQuaternion = new THREE.Quaternion();
        gloveQuaternion.setFromEuler(new THREE.Euler( 0, this.lookSpeed, 0, 'XYZ' ));
        this.object.setRotationFromQuaternion(gloveQuaternion);
        this.controller.setRotationFromMatrix(this.object.matrix); 
        cart_mesh.setRotationFromMatrix(this.object.matrix); 
    }


    /* CHECK KEY CONTROLS */

    if(this.wasdqe.turnLeft){
      this.lookSpeed += 0.02;
      var turnQuaternion = new THREE.Quaternion();
      turnQuaternion.setFromEuler(new THREE.Euler( 0, this.lookSpeed, 0, 'XYZ' ));

      var isColliding = collision.detect(this.controller.position.x, this.controller.position.z);
      console.log(isColliding);
      if(isColliding == 0){
        /* transform camera and controller rotations */
        this.object.setRotationFromQuaternion(turnQuaternion);
        this.controller.setRotationFromMatrix(this.object.matrix); 
        cart_mesh.setRotationFromMatrix(this.object.matrix); 
      }
    }

    if(this.wasdqe.turnRight){
      this.lookSpeed += -0.02;
      var turnQuaternion = new THREE.Quaternion();
      turnQuaternion.setFromEuler(new THREE.Euler( 0, this.lookSpeed, 0, 'XYZ' ));
      var isColliding = collision.detect(this.controller.position.x, this.controller.position.z);
      console.log(isColliding);
      if(isColliding == 0){
        /* transform camera and controller rotations */
        this.object.setRotationFromQuaternion(turnQuaternion);
        this.controller.setRotationFromMatrix(this.object.matrix); 
        cart_mesh.setRotationFromMatrix(this.object.matrix); 
      }
    }

    // update position TODO here for rotate the cart ???
    if (this.wasdqe.up){
       var isColliding = collision.detect(this.controller.position.x,this.controller.position.z - this.translationSpeed * delta * walkingFactor);
       console.log(isColliding);
       if(isColliding == 0){
        this.controller.translateZ(-this.translationSpeed * delta * walkingFactor);
       }   
    }
     
    if (this.wasdqe.down){
      var isColliding = collision.detect(this.controller.position.x,this.controller.position.z + this.translationSpeed * delta * walkingFactor);
       console.log(isColliding);
       if(isColliding == 0){
         this.controller.translateZ(this.translationSpeed * delta * walkingFactor);
       }   
    }
     
    // if (this.wasdqe.right){
    //   var isColliding = collision.detect(this.controller.position.x + this.translationSpeed * delta,this.controller.position.z);
    //    console.log(isColliding);
    //    if(isColliding == 0){
    //      this.controller.translateX(this.translationSpeed * delta);
    //    } 
    // }
      
    // if (this.wasdqe.left){
    //   var isColliding = collision.detect(this.controller.position.x - this.translationSpeed * delta,this.controller.position.z);
    //    console.log(isColliding);
    //    if(isColliding == 0){
    //      this.controller.translateX(-this.translationSpeed * delta);
    //    } 
    // }


    /* UPDATE POSITIONS */
    // both camera and object (camera's bounding box) need to be updated
    this.object.position.addVectors(this.controller.position, this.headPos);
    camera.position.addVectors(this.controller.position, this.headPos);
    cart_mesh.position.addVectors(this.controller.position, this.headPos);

      if (ws) {
        if (ws.readyState === 1) {
          ws.send("get\n");
        }
      }
  };
  
  window.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
  window.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );
  
  function bind( scope, fn ) {
    return function () {
      fn.apply( scope, arguments );
    };

  };

};