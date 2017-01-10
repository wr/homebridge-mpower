var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerPlatform("homebridge-mpower", "mPower", mPowerPlatform);
}

function mPowerPlatform(log, config){
  function stringGen(length) {
    var text = "";
    var charset = "0123456789";
    for( var i=0; i < length; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
  }

  this.log = log;
  this.airos_sessionid = config["airos_sessionid"] || stringGen(32);
  this.outlets = config["outlets"];
}

mPowerPlatform.prototype = {
  accessories: function(callback){
    var foundAccessories = [];

    var count = this.outlets.length;

    for(index=0; index< count; ++index){
      var accessory  = new mPowerAccessory(
        this.log,
        this.airos_sessionid,
        this.outlets[index]);

      foundAccessories.push(accessory);
    }

    callback(foundAccessories);
  }
};

function mPowerAccessory(log, airos_sessionid, outlet) {
  this.log = log;
  this.airos_sessionid = airos_sessionid;
  this.name = outlet["name"];
  this.username = outlet["username"];
  this.password = outlet["password"];
  this.url = outlet["url"];
  this.id = outlet["id"];

  this.services = [];

  this.outletService = new Service.Outlet(this.name);

  this.outletService
    .getCharacteristic(Characteristic.On)
    .on('get', this.getState.bind(this))
    .on('set', this.setState.bind(this));

  /*Power consumption in Watt*/
  this.outletService
    .getCharacteristic(Characteristic.OutletInUse)
    .on('get', this.getOutletInUse.bind(this));

  this.services.push(this.outletService);
}

mPowerAccessory.prototype.setState = function(state, callback) {
  var exec = require('child_process').exec;
  state = (state == true || state == 1) ? 1 : 0;
  
  var cmdAuth = 'curl -X POST -d "username=' + this.username + '&password=' + this.password + '" -b "AIROS_SESSIONID=' + this.airos_sessionid + '" ' + this.url + '/login.cgi';
  var cmdUpdate = 'curl -X POST -d "output=' + state+ '" -b "AIROS_SESSIONID=' + this.airos_sessionid + '" ' + this.url + '/sensors/' + this.id;

  var stateName = (state == 1) ? 'on' : 'off';

  this.log("Turning " + this.name + " outlet " + stateName + ".");

  exec(cmdAuth, function(error, stdout, stderr) {
    if (!error) {
      exec(cmdUpdate, function(error, stdout, stderr) {
        if (!error) {
          if (stdout != "") {
            var response = JSON.parse(stdout);

            if(response.status == "success") {
              callback(null);
            } else {
              callback(error);
            }
          } else {
            console.log("Failed with error: " + error);
          }
        }
      });
    } else {
      console.log("Failed with error: " + error);
    }
  });
}

mPowerAccessory.prototype.getState = function(callback) {
  var exec = require('child_process').exec;

  var cmdAuth = 'curl -X POST -d "username=' + this.username + '&password=' + this.password + '" -b "AIROS_SESSIONID=' + this.airos_sessionid + '" ' + this.url + '/login.cgi';
  var cmdStatus = 'curl -b "AIROS_SESSIONID=' + this.airos_sessionid + '" ' + this.url + '/sensors/' + this.id + '/output';

  exec(cmdAuth, function(error, stdout, stderr) {
    if (!error) {
      exec(cmdStatus, function(error, stdout, stderr) {
        if (!error) {
          if (stdout != "") {
            var state = JSON.parse(stdout);
            if(state.sensors[0].output == 1) {
              callback(null, true);
            } else if(state.sensors[0].output == 0) {
              callback(null, false);
            }
            else {
              callback(error);
            }
          } else {
            console.log("Failed to communicate with mPower accessory");
          }
        } else {
          console.log("Failed with error: " + error);
        }
      });
    } else {
      console.log("Failed with error: " + error);
    }
  });
}

mPowerAccessory.prototype.getOutletInUse = function(callback) {
  var exec = require('child_process').exec;

  var cmdAuth = 'curl -X POST -d "username=' + this.username + '&password=' + this.password + '" -b "AIROS_SESSIONID=' + this.airos_sessionid + '" ' + this.url + '/login.cgi';
  var cmdOutletInUseStatus = 'curl -b "AIROS_SESSIONID=' + this.airos_sessionid + '" ' + this.url + '/sensors/' + this.id + '/power';

  exec(cmdAuth, function(error, stdout, stderr) {
    if (!error) {
      exec(cmdOutletInUseStatus, function(error, stdout, stderr) {
        if (!error) {
          if (stdout != "") {
            var state = JSON.parse(stdout);
            if(state.sensors[0].power > 0) {
              callback(null, true);
            } else if(state.sensors[0].power == 0) {
              callback(null, false);
            }
	    else {
              callback(error);
            }
          } else {
            console.log("Failed to communicate with mPower accessory");
          }
        } else {
          console.log("Failed with error: " + error);
        }
      });
    } else {
      console.log("Failed with error: " + error);
    }
  });
}

mPowerAccessory.prototype.getDefaultValue = function(callback) {
  callback(null, this.value);
}

mPowerAccessory.prototype.setCurrentValue = function(value, callback) {
  this.log("Value: " + value);

  callback(null, value);
}

mPowerAccessory.prototype.getServices = function() {
  return this.services;
}
