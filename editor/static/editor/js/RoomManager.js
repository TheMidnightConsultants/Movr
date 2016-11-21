function RoomManager(roomList, addBtn, dupBtn, delBtn, userId, authToken, scene, menuManager){
	console.log('initializing simple RoomManager');
	this.roomList = document.getElementById(roomList);
	this.roomNames = [];
	this.scene = scene;
	this.menuManager = menuManager;
	this.loadedRoom = -1;
	
	this.deleting = false;
	this.duplicating = false;
	
	if (typeof addBtn !== 'undefined' && typeof dupBtn !== 'undefined' && typeof delBtn !== 'undefined' && typeof userId !== 'undefined' && typeof authToken !== 'undefined'){
		console.log('initializing complicated RoomManager');
		this.addBtn = document.getElementById(addBtn);
		this.dupBtn = document.getElementById(dupBtn);
		this.delBtn = document.getElementById(delBtn);
		this.userId = userId;
		this.authToken = authToken;
		
		this.roomList.addEventListener('click', RoomManager.prototype.onRoomClick.bind(this), true);
		
		this.addBtn.addEventListener('click', function(event){
			var fields = new Array({'tag':'name', 'type':'text'}, {'tag':'width', 'type':'number'}, 
				{'tag':'length', 'type':'number'}, {'tag':'height', 'type':'number'});
			this.menuManager.getInput(fields, function(data){
				console.log(data);
				var name = data[0];
				var width = data[1];
				var length = data[2];
				var height = data[3];
				this.addRoom(name, [width, length, height]); //TODO:update args to include width/length/height
				this.menuManager.switchMenu('mainMenu');
			}.bind(this));
		}.bind(this), false);
		
		this.dupBtn.addEventListener('click', function(event){
			this.duplicating = !this.duplicating;
		}.bind(this), false);
		
		this.delBtn.addEventListener('click', function(event){
			this.deleting = !this.deleting;
		}.bind(this), false);
	}
};

RoomManager.prototype.update = function(){
	Util.POST('/api/rooms/', {'auth_token':this.authToken}, function(err, data){
		if (err != null){
			console.log('Error ' + err + ' while getting rooms list.');
		} else if (data.status === 'ok'){
			while (this.roomList.lastChild){
				this.roomList.removeChild(this.roomList.lastChild);
			}
			this.roomNames = data.data;
			for (var key in this.roomNames){
				var li = document.createElement('li');
				li.appendChild(document.createTextNode(this.roomNames[key]));
				li.id = '_room_' + key;
				this.roomList.appendChild(li);
			}
		} else {
			console.log(data.status + ':' + data.msg);
		}
	}.bind(this));
};

//TODO:update args to accept length/width/height of room
RoomManager.prototype.addRoom = function(roomName, dims){
	Util.POST('/api/addroom/', {'auth_token':this.authToken, 'room_name':roomName, dims}, function(err, data){
		if (err != null){
			console.log('Error ' + err + ' while POST-ing new room.');
		} else if (data.status === 'ok'){
			this.update();
		} else {
			console.log(data.status + ':' + data.msg);
		}
	}.bind(this));
}

RoomManager.prototype.deleteRoom = function(roomId){
	Util.POST('/api/deleteroom/', {'auth_token':this.authToken, 'room_id':roomId}, function(err, data){
		if (err != null){
			console.log('Error ' + err + ' while POST-ing room deletion.');
		} else {
			this.update();
		}
	}.bind(this));
}

RoomManager.prototype.loadRoom = function(roomId){
	// this function should actually fetch the saved room from the server, but that
	// functionality doesn't exist yet
	// Should use GET or POST
	Util.POST('/api/loadroom/', {'auth_token':this.authToken, 'room_id':roomId}, function(err, data) {
		console.log("ROOM DATA:")
		console.log(data)
		console.log(this.scene);
		this.scene.clearRooms();
		var room = new Room(data.dimensions.x, data.dimensions.y, data.dimensions.z, 0xFF0000);
		this.scene.addRoom(room);
	}.bind(this));
}

RoomManager.prototype.onRoomClick = function(event){
	var roomId = event.target.id;
	if (!roomId.startsWith('_room_')){
		return;
	} else {
		roomId = roomId.substring(6);
	}
	if (this.deleting){
		this.deleting = false;
		this.deleteRoom(roomId);
	} else if (this.duplicating){
		//duplicate the room
	} else {
		//load the room they clicked on and start the app
		if (this.loadedRoom != roomId){
			this.loadRoom(roomId);
		}
		this.menuManager.switchMenu('furnitureMenu');
		this.menuManager.startApp();
	}
	console.log("clicked " + roomId);
}
