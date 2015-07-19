// The code template begins here
"use strict";

(function () {

  var __amdDefs__ = {};

  // The class definition is here...
  var channelObjects_prototype = function channelObjects_prototype() {
    // Then create the traits and subclasses for this class here...

    // the subclass definition comes around here then

    // The class definition is here...
    var aceCmdConvert_prototype = function aceCmdConvert_prototype() {
      // Then create the traits and subclasses for this class here...

      (function (_myTrait_) {

        // Initialize static variables here...

        /**
         * @param float cmdList
         */
        _myTrait_.fromAce = function (cmdList) {

          var newList = [];

          cmdList.forEach(function (cmd) {

            var range = cmd.range;
            if (cmd.action == "insertText") {
              newList.push([1, range.start.row, range.start.column, range.end.row, range.end.column, cmd.text]);
            }
            if (cmd.action == "removeText") {
              newList.push([2, range.start.row, range.start.column, range.end.row, range.end.column, cmd.text]);
            }
            if (cmd.action == "insertLines") {
              newList.push([3, range.start.row, range.start.column, range.end.row, range.end.column, cmd.lines]);
            }
            if (cmd.action == "removeLines") {
              newList.push([4, range.start.row, range.start.column, range.end.row, range.end.column, cmd.lines, cmd.nl]);
            }
          });

          return newList;

          /*
          {"action":"insertText","range":{"start":{"row":0,"column":0},
          "end":{"row":0,"column":1}},"text":"d"}
          */
        };

        if (_myTrait_.__traitInit && !_myTrait_.hasOwnProperty("__traitInit")) _myTrait_.__traitInit = _myTrait_.__traitInit.slice();
        if (!_myTrait_.__traitInit) _myTrait_.__traitInit = [];
        _myTrait_.__traitInit.push(function (onFulfilled, onRejected) {});

        /**
         * @param Array cmdList
         */
        _myTrait_.reverse = function (cmdList) {

          var newList = [];

          cmdList.forEach(function (oldCmd) {

            var cmd = oldCmd.slice(); // create a copy of the old command

            var row = cmd[1],
                col = cmd[2],
                endRow = cmd[3],
                endCol = cmd[4];

            // add characters...
            if (cmd[0] == 1) {
              cmd[0] = 2;
              newList.unshift(cmd);
              return; // this simple ???
            }
            if (cmd[0] == 2) {
              cmd[0] = 1;
              newList.unshift(cmd);
              return; // this simple ???
            }
            if (cmd[0] == 3) {
              cmd[0] = 4;
              newList.unshift(cmd);
              return; // this simple ???     
              /*
              var cnt = endRow - row;
              for(var i=0; i<cnt; i++) {
              lines.splice(row+i, 0, cmd[5][i]);
              } 
              */
            }
            if (cmd[0] == 4) {
              cmd[0] = 3;
              newList.unshift(cmd);
              return; // this simple ???  
              /*
              var cnt = endRow - row;
              for(var i=0; i<cnt; i++) {
              lines.splice(row, 1);
              } 
              */
            }
          });

          return newList;
        };

        /**
         * @param float cmdList
         */
        _myTrait_.runToAce = function (cmdList) {

          var newList = [],
              _convert = ["", "insertText", "removeText", "insertLines", "removeLines"];

          cmdList.forEach(function (cmd) {

            var c = {
              action: _convert[cmd[0]],
              range: {
                start: {
                  row: cmd[1],
                  column: cmd[2]
                },
                end: {
                  row: cmd[3],
                  column: cmd[4]
                }
              }
            };
            if (cmd[0] < 3) {
              c.text = cmd[5];
            } else {
              c.lines = cmd[5];
            }
            if (cmd[0] == 4) c.nl = cmd[6] || "\n";
            newList.push(c);
          });

          return newList;

          /*
          {"action":"insertText","range":{"start":{"row":0,"column":0},
          "end":{"row":0,"column":1}},"text":"d"}
          */
        };

        /**
         * @param Object lines
         * @param float cmdList
         */
        _myTrait_.runToLineObj = function (lines, cmdList) {

          cmdList.forEach(function (cmd) {
            var row = cmd[1],
                col = cmd[2],
                endRow = cmd[3],
                endCol = cmd[4];
            if (cmd[0] == 1) {
              if (cmd[5] == "\n") {
                // add the newline can be a bit tricky
                var line = lines.item(row);
                if (!line) {
                  lines.insertAt(row, {
                    text: ""
                  });
                  lines.insertAt(row + 1, {
                    text: ""
                  });
                } else {
                  var txt = line.text();
                  line.text(txt.slice(0, col));
                  var newLine = {
                    text: txt.slice(col) || ""
                  };
                  lines.insertAt(row + 1, newLine);
                }
                //lines[row] = line.slice(0,col);
                //var newLine = line.slice(col) || "";
                //lines.splice(row+1, 0, newLine);
              } else {
                var line = lines.item(row);
                if (!line) {
                  lines.insertAt(row, {
                    text: cmd[5]
                  });
                } else {
                  var txt = line.text();
                  line.text(txt.slice(0, col) + cmd[5] + txt.slice(col));
                  // lines[row] = line.slice(0, col) + cmd[5] + line.slice(col);
                }
              }
            }
            if (cmd[0] == 2) {
              if (cmd[5] == "\n") {
                // removing the newline can be a bit tricky
                // lines[row]
                var thisLine = lines.item(row),
                    nextLine = lines.item(row + 1);

                // lines[row] = thisLine + nextLine;
                // lines.splice(row+1, 1); // remove the line...
                var txt1 = "",
                    txt2 = "";
                if (thisLine) txt1 = thisLine.text();
                if (nextLine) txt2 = nextLine.text();
                if (!thisLine) {
                  lines.insertAt(row, {
                    text: ""
                  });
                } else {
                  thisLine.text(txt1 + txt2);
                }
                if (nextLine) nextLine.remove();
              } else {
                var line = lines.item(row),
                    txt = line.text();
                line.text(txt.slice(0, col) + txt.slice(endCol));
                //  str.slice(0, 4) + str.slice(5, str.length))
                // lines[row] = line.slice(0, col) + line.slice(endCol);
              }
            }
            if (cmd[0] == 3) {
              var cnt = endRow - row;
              for (var i = 0; i < cnt; i++) {
                // var line = lines.item(row+i);
                lines.insertAt(row + i, {
                  text: cmd[5][i]
                });
                // lines.splice(row+i, 0, cmd[5][i]);
              }
            }
            if (cmd[0] == 4) {
              var cnt = endRow - row;
              for (var i = 0; i < cnt; i++) {
                var line = lines.item(row);
                line.remove();
                // lines.splice(row, 1);
              }
            }
          });
          /*
          tools.button().text("Insert to 1 ").on("click", function() {
          myT.lines.insertAt(1, { text : prompt("text")}); 
          });
          tools.button().text("Insert to 0 ").on("click", function() {
          myT.lines.insertAt(0, { text : prompt("text")}); 
          });
          tools.button().text("Split line 1").on("click", function() {
          var line1 = myT.lines.item(1);
          var txt = line1.text();
          var txt1 = txt.substring(0, 4),
          txt2 = txt.substring(4);
          line1.text(txt1);
          myT.lines.insertAt(2, { text : txt2 });
          });
          tools.button().text("Insert to N-1 ").on("click", function() {
          myT.lines.insertAt(myT.lines.length()-1, { text : prompt("text")}); 
          });
          tools.button().text("Insert to N ").on("click", function() {
          myT.lines.insertAt(myT.lines.length(), { text : prompt("text")}); 
          });
          */
        };

        /**
         * @param float str
         * @param float cmdList
         */
        _myTrait_.runToString = function (str, cmdList) {

          if (!cmdList || typeof str == "undefined") {
            return "";
          }
          str = str + "";

          var lines = str.split("\n");

          cmdList.forEach(function (cmd) {
            var row = cmd[1],
                col = cmd[2],
                endRow = cmd[3],
                endCol = cmd[4];
            if (cmd[0] == 1) {
              if (cmd[5] == "\n") {
                // add the newline can be a bit tricky
                var line = lines[row] || "";
                lines[row] = line.slice(0, col);
                var newLine = line.slice(col) || "";
                lines.splice(row + 1, 0, newLine);
              } else {
                var line = lines[row] || "";
                lines[row] = line.slice(0, col) + cmd[5] + line.slice(col);
              }
            }
            if (cmd[0] == 2) {
              if (cmd[5] == "\n") {
                // removing the newline can be a bit tricky
                // lines[row]
                var thisLine = lines[row] || "",
                    nextLine = lines[row + 1] || "";
                lines[row] = thisLine + nextLine;
                lines.splice(row + 1, 1); // remove the line...
              } else {
                var line = lines[row] || "";
                // str.slice(0, 4) + str.slice(5, str.length))
                lines[row] = line.slice(0, col) + line.slice(endCol);
              }
            }
            if (cmd[0] == 3) {
              var cnt = endRow - row;
              for (var i = 0; i < cnt; i++) {
                lines.splice(row + i, 0, cmd[5][i]);
              }
            }
            if (cmd[0] == 4) {
              var cnt = endRow - row;
              for (var i = 0; i < cnt; i++) {
                lines.splice(row, 1);
              }
            }
          });

          return lines.join("\n");
        };

        /**
         * @param array cmdList
         */
        _myTrait_.simplify = function (cmdList) {

          // [[1,0,0,0,1,"a"],[1,0,1,0,2,"b"],[1,0,2,0,3,"c"],[1,0,3,0,4,"e"],[1,0,4,0,5,"d"],
          // [1,0,5,0,6,"e"],[1,0,6,0,7,"f"],[1,0,7,0,8,"g"]]
          var newList = [],
              lastCmd,
              lastCol,
              lastRow,
              collect = null;

          cmdList.forEach(function (cmd) {

            if (lastCmd && cmd[0] == 1 && lastCmd[0] == 1 && cmd[3] == cmd[1] && lastCmd[1] == cmd[1] && lastCmd[3] == cmd[3] && lastCmd[4] == cmd[2]) {
              if (!collect) {
                collect = [];
                collect[0] = 1;
                collect[1] = lastCmd[1];
                collect[2] = lastCmd[2];
                collect[3] = cmd[3];
                collect[4] = cmd[4];
                collect[5] = lastCmd[5] + cmd[5];
              } else {
                collect[3] = cmd[3];
                collect[4] = cmd[4];
                collect[5] = collect[5] + cmd[5];
              }
            } else {
              if (collect) {
                newList.push(collect);
                collect = null;
              }
              if (cmd[0] == 1) {
                collect = cmd.slice();
              } else {
                newList.push(cmd);
              }
            }
            lastCmd = cmd;
          });
          if (collect) newList.push(collect);
          return newList;
        };
      })(this);
    };

    var aceCmdConvert = function aceCmdConvert(a, b, c, d, e, f, g, h) {
      var m = this,
          res;
      if (m instanceof aceCmdConvert) {
        var args = [a, b, c, d, e, f, g, h];
        if (m.__factoryClass) {
          m.__factoryClass.forEach(function (initF) {
            res = initF.apply(m, args);
          });
          if (typeof res == "function") {
            if (res._classInfo.name != aceCmdConvert._classInfo.name) return new res(a, b, c, d, e, f, g, h);
          } else {
            if (res) return res;
          }
        }
        if (m.__traitInit) {
          m.__traitInit.forEach(function (initF) {
            initF.apply(m, args);
          });
        } else {
          if (typeof m.init == "function") m.init.apply(m, args);
        }
      } else return new aceCmdConvert(a, b, c, d, e, f, g, h);
    };
    // inheritance is here

    aceCmdConvert._classInfo = {
      name: "aceCmdConvert"
    };
    aceCmdConvert.prototype = new aceCmdConvert_prototype();

    // the subclass definition comes around here then

    // The class definition is here...
    var _channelData_prototype = function _channelData_prototype() {
      // Then create the traits and subclasses for this class here...

      // trait comes here...

      (function (_myTrait_) {

        // Initialize static variables here...

        /**
         * @param string objId
         * @param float prevId
         * @param float parentId
         * @param float nextId
         */
        _myTrait_._posChange = function (objId, prevId, parentId, nextId) {

          var obj = this._find(objId);
          if (!obj) return;

          var newPrev = this._find(prevId);
          var newNext = this._find(nextId);
          var newParent = this._find(parentId);

          var from = [],
              to = [];

          // the object becomes the new first child of it's parent
          if (newParent && !newPrev && newParent._fc != obj.__id) {
            from.push([newParent.__id, 3, newParent._fc]);
            to.push([newParent.__id, 3, obj.__id]);
          }

          // if parent changes, check that the object is not the current first child
          if (obj.__p && obj.__p != parentId) {
            var oldParent = this._find(obj.__p);
            if (oldParent._fc == objId) {
              from.push([obj.__p, 3, objId]);
              to.push([obj.__p, 3, obj._n]);
            }
          }

          // if object has previous and it changes, then the next of this becomes next of prev
          if (obj._p && prevId != obj._p) {
            from.push([obj._p, 2, objId]);
            to.push([obj._p, 2, obj._n]);
          }
          if (newPrev && newPrev._n != obj.__id) {
            from.push([prevId, 2, newPrev._n]);
            to.push([prevId, 2, objId]);
          }

          if (newNext && newNext._p != obj.__id) {
            from.push([nextId, 0, newNext._p]);
            to.push([nextId, 0, objId]);
          }

          // if the object's next changes, then prev of object becomes prev of current next
          if (obj._n && nextId != obj._n) {
            from.push([obj._n, 0, objId]);
            to.push([obj._n, 0, obj._p]);
          }

          if (obj._n != nextId) {
            from.push([objId, 2, obj._n]);
            to.push([objId, 2, nextId]);
          }

          if (obj._p != prevId) {
            from.push([objId, 0, obj._p]);
            to.push([objId, 0, prevId]);
          }

          if (obj.__p != parentId) {
            from.push([objId, 1, obj.__p]);
            to.push([objId, 1, parentId]);
          }

          return [22, to, from, 0, objId];
        };

        /**
         * @param float t
         */
        _myTrait_.guid = function (t) {
          return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        };

        /**
         * @param float t
         */
        _myTrait_.isArray = function (t) {
          return t instanceof Array;
        };

        /**
         * @param float fn
         */
        _myTrait_.isFunction = function (fn) {
          return Object.prototype.toString.call(fn) == "[object Function]";
        };

        /**
         * @param float t
         */
        _myTrait_.isObject = function (t) {
          return t === Object(t);
        };

        /**
         * @param string objId
         */
        _myTrait_.moveDown = function (objId) {

          var obj = this._find(objId);
          if (!obj) return;

          var prevObj = this._find(obj._p);

          if (!prevObj) return;

          var undefined_val;
          var cmd = this._posChange(objId, prevObj._p, obj.__p, prevObj.__id);
          this.execCmd(cmd);
        };

        /**
         * @param float objId
         */
        _myTrait_.moveUp = function (objId) {

          var obj = this._find(objId);
          if (!obj) return;

          var nextObj = this._find(obj._n);

          if (!nextObj) return;

          var undefined_val;
          var cmd = this._posChange(objId, nextObj.__id, obj.__p, nextObj._n);
          this.execCmd(cmd);
        };

        /**
         * @param string objId
         * @param float insertObjId
         */
        _myTrait_.push = function (objId, insertObjId) {
          /*
          // the command structure 
          [ 22,
          [
          ["myId",   1, "newParent"],
          ["myId",   0, "prevId"],
          ["prevId", 2, "myId"],
          ["myId",   2, "nextId"],
          ["nextId", 0, "myId"],        
          ["parentId, 3, "myId"] 
          ], 
          [
          ["myId", 1],
          ["myId",   0],
          ["prevId", 2, "nextId"],    
          ["myId",   2],
          ["nextId", 0, "prevId"],    
          ["parentId, 3, "oldFirstChild"] 
          ], 
          0, 
          id ]  
          */
          var obj = this._find(objId);
          var insObj = this._find(insertObjId);
          if (!obj || !insObj) return;
          var undefined_val;
          if (obj._fc) {
            var after_id = obj._fc;
            var after = this._find(after_id);
            while (after._n) after = this._find(after._n);

            var cmd = this._posChange(insertObjId, after.__id, objId, undefined_val);
            this.execCmd(cmd);
          } else {

            var cmd = this._posChange(insertObjId, undefined_val, objId, undefined_val);
            console.log(cmd);
            this.execCmd(cmd);
          }
        };

        /**
         * @param float objId
         */
        _myTrait_.remove = function (objId) {

          var obj = this._find(objId);
          if (!obj) return;
          var undefined_val;
          var cmd = this._posChange(objId, undefined_val, undefined_val, undefined_val);
          this.execCmd(cmd);
        };
      })(this);

      // trait comes here...

      (function (_myTrait_) {
        var _listeners;
        var _execInfo;
        var _doingRemote;
        var _cmds;
        var _reverseCmds;
        var _classes;
        var _deltaPatchMeta;

        // Initialize static variables here...

        /**
         * @param float a
         * @param float isRemote
         */
        _myTrait_._cmd_aceCmd = function (a, isRemote) {
          var obj = this._find(a[4]),
              prop = a[1];

          if (!obj || !prop) return false;
          if (typeof obj.data[prop] != "string") return false;

          var conv = aceCmdConvert();
          obj.data[prop] = conv.runToString(obj.data[prop], a[2]);

          _doingRemote = isRemote;

          var tmpCmd = [4, prop, obj.data[prop], null, a[4]];
          this._cmd(tmpCmd, obj, null);

          if (!isRemote) {
            this.writeCommand(a);
          } else {
            this._cmd(a, obj, null);
          }
          _doingRemote = false;
          this._fireListener(obj, prop);

          return true;
        };

        /**
         * @param float a
         * @param float isRemote
         */
        _myTrait_._cmd_createArray = function (a, isRemote) {
          var objId = a[1];
          if (!objId) return false;

          var hash = this._getObjectHash();
          if (hash[objId]) return false;

          // can any object be array or object?

          // This is the data right
          // plain array object
          var newObj = {
            data: {},
            //    _n  : null,
            //    _p  : null,
            //    _fc : null,
            __id: objId,
            __p: null
          };

          hash[newObj.__id] = newObj;

          this._data.__objects.push(newObj);

          if (!isRemote) {
            this.writeCommand(a, newObj);
          }
          return true;
        };

        /**
         * @param float a
         * @param float isRemote
         */
        _myTrait_._cmd_createObject = function (a, isRemote) {
          var objId = a[1];
          if (!objId) return false;

          var hash = this._getObjectHash();
          if (hash[objId]) return false;

          // plain array object
          var newObj = {
            data: {},
            //    _n  : null,
            //    _p  : null,
            //    _fc : null,
            __id: objId,
            __p: null
          };

          if (a[2]) newObj._class = a[2];

          hash[newObj.__id] = newObj;

          this._data.__objects.push(newObj);

          if (!isRemote) {
            this.writeCommand(a, newObj);
          }
          return true;
        };

        /**
         * @param float a
         * @param float isRemote
         */
        _myTrait_._cmd_moveToIndex = function (a, isRemote) {
          var obj = this._find(a[4]),
              prop = "*",
              len = obj.data.length,
              targetObj,
              i = 0;

          if (!obj) return false;

          var oldIndex = null;

          for (i = 0; i < len; i++) {
            var m = obj.data[i];
            if (m.__id == a[1]) {
              targetObj = m;
              oldIndex = i;
              break;
            }
          }

          if (oldIndex != a[3] || !targetObj) {
            return false;
          }

          // Questions here:
          // - should we move command list only on the parent object, not the child
          //  =>  this._moveCmdListToParent(targetObj); could be
          //      this._moveCmdListToParent(obj);
          // That is... where the command is really saved???
          // is the command actually written anywhere???
          //  - where is the writeCommand?
          //
          // Moving the object in the array

          var targetIndex = parseInt(a[2]);
          if (isNaN(targetIndex)) return false;

          if (obj.data.length <= i) return false;

          _execInfo.fromIndex = i;

          obj.data.splice(i, 1);
          obj.data.splice(targetIndex, 0, targetObj);
          this._cmd(a, obj, targetObj);

          if (!(isRemote || _isRemoteUpdate)) {
            this.writeCommand(a);
          }
          return true;
        };

        /**
         * @param float a
         * @param float isRemote
         * @param float noWorkers
         * @param float deltaObj
         */
        _myTrait_._cmd_position = function (a, isRemote, noWorkers, deltaObj) {
          /*
          // the command structure 
          [ 21, [newP, newN, newParent], [oldP, oldN, oldParent], 0, id ]  
          */

          if (!deltaObj) deltaObj = this._delta;

          var obj_id = a[4];
          var from = a[2],
              to = a[1],
              obj = this._find(a[4]);

          var oldParent = this._find(from[2]),
              newParent = this._find(to[2]);

          // check that current position is valid so that the command can be reversed propery
          if ((obj._p || from[0]) && from[0] != obj._p) return false;
          if ((obj._n || from[1]) && from[1] != obj._n) return false;
          if ((obj.__p || from[2]) && from[2] != obj.__p) return false;

          if (newParent && newParent.__id == obj.__id) return false;

          // already there...
          if ((obj._p || to[0]) && to[0] == obj._p) return false;
          if ((obj._n || to[1]) && to[1] == obj._n) return false;

          var newPrev = this._find(to[0]); // the new previous obj
          var newNext = this._find(to[1]); // the next next obj
          var newParent = this._find(to[2]); // the next next obj

          if (newPrev) {
            // the position is incorrect
            if (newNext && newNext._p != newPrev.__id) return false;
            // the don't have the same parent
            if (newNext && newNext.__p != newPrev.__p) return false;
            // if newNext object does not exist then the prev should not have next pointer
            if (!newNext && newPrev._n) return false;
          } else {
            // the next should not have previous currently
            if (newNext && newNext._p) return false;
            // the object should be under the same parent
            if (newNext && newNext.__p != newParent.__id) return false;

            if (!newNext) {
              if (newParent && newParent._fc) return false; // the object should not have first child
            }
          }

          // the other objects must be also updated, if you remove the object or do any other
          // changes to the next / previous values
          if (obj._p) {
            var oldPrev = this._find(obj._p); // there will be a change for this object too
            var oldNext = this._find(obj._n); // the next for the previous
            if (oldNext) {
              oldPrev._n = oldNext.__id;
              oldNext._p = oldPrev.__id;
              if (deltaObj) {
                this._deltaPatchMeta(deltaObj, oldPrev.__id, "_n", oldNext.__id);
                this._deltaPatchMeta(deltaObj, oldNext.__id, "_p", oldPrev.__id);
              }
            } else {
              oldPrev._n = null; // the oldPrev
              if (deltaObj) {
                this._deltaPatchMeta(deltaObj, oldPrev.__id, "_n", null);
              }
            }
          } else {
            // if no previous, the object is the first child of the array
            var parent = this._find(obj.__p);
            var oldNext = this._find(obj._n); // the next for the previous

            if (parent && oldNext) {
              parent._fc = oldNext.__id;
              if (deltaObj) {
                this._deltaPatchMeta(deltaObj, parent.__id, "_fc", oldNext.__id);
              }
            }
            if (parent && !oldNext) {
              parent._fc = null;
              if (deltaObj) {
                this._deltaPatchMeta(deltaObj, parent.__id, "_fc", null);
              }
            }
            if (oldNext) {
              oldNext._p = null;
              if (deltaObj) {
                this._deltaPatchMeta(deltaObj, oldNext.__id, "_p", null);
              }
            }
          }

          // moving the object is as simple as this
          obj._p = to[0];
          obj._n = to[1];
          obj.__p = to[2];

          if (deltaObj) {
            if (!deltaObj[obj_id]) deltaObj[obj_id] = {
              data: {}
            };
            var dd = deltaObj[obj_id];
            dd._p = obj._p;
            dd._n = obj._n;
            dd.__p = obj.__p;
          }

          // then update the objects around this object
          if (newPrev) {
            var oldNext = this._find(newPrev._n); // there will be a change for this object too
            if (oldNext) {
              newPrev._n = obj.__id;
              oldNext._p = obj.__id;
              if (deltaObj) {
                this._deltaPatchMeta(deltaObj, newNext.__id, "_n", obj.__id);
                this._deltaPatchMeta(deltaObj, oldNext.__id, "_p", obj.__id);
              }
            } else {
              newPrev._n = obj.__id;
              if (deltaObj) {
                this._deltaPatchMeta(deltaObj, newPrev.__id, "_n", obj.__id);
              }
            }
          } else {
            // if there is not previous, we are also the new firstchild of the parent
            var parent = this._find(obj.__p);
            if (parent) {
              parent._fc = obj.__id;
              if (deltaObj) {
                this._deltaPatchMeta(deltaObj, parent.__id, "_fc", obj.__id);
              }
            }
            if (newNext) {
              newNext._p = obj.__id;
              if (deltaObj) {
                this._deltaPatchMeta(deltaObj, newNext.__id, "_p", obj.__id);
              }
            }
          }

          if (!noWorkers) this._cmd(a);
          if (!isRemote) this.writeCommand(a);

          return true;
        };

        /**
         * @param float a
         * @param float isRemote
         * @param float noWorkers
         */
        _myTrait_._cmd_position2 = function (a, isRemote, noWorkers) {
          /*
          // the command structure 
          [ 22,
          [
          ["myId",   1, "newParent"],
          ["myId",   0, "prevId"],
          ["prevId", 2, "myId"],
          ["myId",   2, "nextId"],
          ["nextId", 0, "myId"],        
          ["parentId, 3, "myId"] 
          ], 
          [
          ["myId", 1],
          ["myId",   0],
          ["prevId", 2, "nextId"],    
          ["myId",   2],
          ["nextId", 0, "prevId"],    
          ["parentId, 3, "oldFirstChild"] 
          ], 
          ]  
          */

          var obj_id = a[4];
          var from = a[2],
              to = a[1];

          var len = from.length;

          // first, check that all values are correct
          for (var i = 0; i < len; i++) {
            var f = from[i];
            var t = to[i];
            var obj = this._find(f[0]);
            if (f[1] == 0) {
              if (obj._p != f[2]) return false;
            }
            if (f[1] == 1) {
              if (obj.__p != f[2]) return false;
            }
            if (f[1] == 2) {
              if (obj._n != f[2]) return false;
            }
            if (f[1] == 3) {
              if (obj._fc != f[2]) return false;
            }
          }

          // Then, we can go on setting the values..
          for (var i = 0; i < len; i++) {
            var f = from[i];
            var t = to[i];
            var obj = this._find(f[0]);
            if (f[1] == 0) {
              obj._p = t[2];
            }
            if (f[1] == 1) {
              obj.__p = t[2];
            }
            if (f[1] == 2) {
              obj._n = t[2];
            }
            if (f[1] == 3) {
              obj._fc = t[2];
            }
          }

          return true;
        };

        /**
         * @param float a
         * @param float isRemote
         */
        _myTrait_._cmd_pushToArray = function (a, isRemote) {
          /*
          The command structure is here now a bit different me thinks
          // if there is a position change, it is just a value change.
          [ [7, [next, prev]] ]
          // the command 
          [ 22, [newP, newN, newParent], [oldP, oldN, oldParent] ]  
          */

          var parentObj = this._find(a[4]),
              insertedObj = this._find(a[2]),
              toIndex = parseInt(a[1]),
              oldPos = a[3],
              // old position can also be "null"
          prop = "*",
              index = parentObj.data.length; // might check if valid...

          if (!parentObj || !insertedObj) return false;

          // NOTE: deny inserting object which already has been inserted
          if (insertedObj.__p) return false;
          if (isNaN(toIndex)) return false;
          if (!this.isArray(parentObj.data)) return;
          if (toIndex > parentObj.data.length) {
            return false;
          }

          parentObj.data.splice(toIndex, 0, insertedObj);

          insertedObj.__p = parentObj.__id;
          this._cmd(a, parentObj, insertedObj);

          this._moveCmdListToParent(insertedObj);

          // Saving the write to root document
          if (!isRemote) {
            this.writeCommand(a);
          }

          return true;
        };

        /**
         * @param float a
         * @param float isRemote
         */
        _myTrait_._cmd_removeObject = function (a, isRemote) {

          var parentObj = this._find(a[4]),
              removedItem = this._find(a[2]),
              oldPosition = parseInt(a[1]),
              prop = "*";

          if (!parentObj || !removedItem) return false;

          // NOTE: deny inserting object which already has been inserted
          if (!removedItem.__p) return false;

          var index = parentObj.data.indexOf(removedItem); // might check if valid...
          if (isNaN(oldPosition)) return false;
          if (oldPosition != index) {
            return false;
          }

          // now the object is in the array...
          parentObj.data.splice(index, 1);

          // removed at should not be necessary because journal has the data
          // removedItem.__removedAt = index;

          this._cmd(a, parentObj, removedItem);
          removedItem.__p = null; // must be set to null...

          // Saving the write to root document
          if (!isRemote) {
            this.writeCommand(a);
          }

          return true;
        };

        /**
         * @param float a
         * @param float isRemote
         */
        _myTrait_._cmd_setMeta = function (a, isRemote) {
          var obj = this._find(a[4]),
              prop = a[1];

          if (!prop) return false;

          if (prop == "data") return false;
          if (prop == "__id") return false;

          if (obj) {

            if (obj[prop] == a[2]) return false;

            obj[prop] = a[2]; // value is now set...
            this._cmd(a, obj, null);

            // Saving the write to root document
            if (!isRemote) {
              this.writeCommand(a);
            }
            return true;
          } else {
            return false;
          }
        };

        /**
         * @param float a
         * @param float isRemote
         * @param float noWorkers
         * @param float deltaObj
         */
        _myTrait_._cmd_setProperty = function (a, isRemote, noWorkers, deltaObj) {
          var obj_id = a[4];
          var obj = this._find(obj_id),
              prop = a[1];

          if (!obj || !prop) return false;

          var oldValue = obj.data[prop];

          if (oldValue == a[2]) return false;

          if (typeof oldValue != "undefined") {
            if (oldValue != a[3]) return false;
          } else {
            if (this.isObject(oldValue) || this.isArray(oldValue)) return false;
          }

          if (!deltaObj) deltaObj = this._delta;

          if (obj._class) {
            var c = _classes[obj._class];
            if (c) {
              if (c.validateSet) {
                if (!c.validateSet.apply(obj, [prop, a[2], oldValue])) return false;
              }
            }
          }

          // _classes[name]

          obj.data[prop] = a[2]; // value is now set...

          if (deltaObj) {
            if (!deltaObj[obj_id]) deltaObj[obj_id] = {
              data: {}
            };
            deltaObj[obj_id].data[prop] = a[2];
          }

          if (!noWorkers) this._cmd(a);

          // Saving the write to root document
          if (!isRemote) {
            this.writeCommand(a);
          }

          return true;
        };

        /**
         * @param float a
         * @param float isRemote
         */
        _myTrait_._cmd_setPropertyObject = function (a, isRemote) {
          var obj = this._find(a[4]),
              prop = a[1],
              setObj = this._find(a[2]);

          if (!obj || !prop) return false;
          if (!setObj) return false;

          if (typeof obj.data[prop] != "undefined") return false;

          obj.data[prop] = setObj; // value is now set...
          setObj.__p = obj.__id; // The parent relationship
          this._cmd(a, obj, setObj);

          if (!isRemote) {
            this._moveCmdListToParent(setObj);
            this.writeCommand(a);
          }
          return true;
        };

        /**
         * @param float a
         * @param float isRemote
         */
        _myTrait_._cmd_unsetProperty = function (a, isRemote) {
          var obj = this._find(a[4]),
              prop = a[1];

          if (!obj || !prop) return false;

          if (!this.isObject(obj.data[prop])) return false;

          delete obj.data[prop];
          if (!isRemote) this.writeCommand(a);

          return true;
        };

        /**
         * @param float deltaObj
         * @param float obj_id
         * @param float varName
         * @param float varValue
         */
        _myTrait_._deltaPatch = function (deltaObj, obj_id, varName, varValue) {
          if (!deltaObj[obj_id]) deltaObj[obj_id] = {
            data: {}
          };
          deltaObj[obj_id].data[varName] = varValue;
        };

        /**
         * @param float deltaObj
         * @param float obj_id
         * @param float varName
         * @param float varValue
         */
        _myTrait_._deltaPatchMeta = function (deltaObj, obj_id, varName, varValue) {
          if (!deltaObj[obj_id]) deltaObj[obj_id] = {
            data: {}
          };
          deltaObj[obj_id][varName] = varValue;
        };

        /**
         * @param float obj
         * @param float prop
         */
        _myTrait_._fireListener = function (obj, prop) {
          if (_listeners) {
            var lName = obj.__id + "::" + prop,
                eList = _listeners[lName];
            if (eList) {
              eList.forEach(function (fn) {
                fn(obj, obj.data[prop]);
              });
            }
          }
        };

        /**
         * @param float t
         */
        _myTrait_._moveCmdListToParent = function (t) {};

        /**
         * @param float a
         */
        _myTrait_._reverse_aceCmd = function (a) {

          var obj = this._find(a[4]),
              prop = a[1];

          var conv = aceCmdConvert();

          var newCmds = conv.reverse(a[2]);

          var tmpCmd = [4, prop, obj.data[prop], null, a[4]];
          var tmpCmd2 = [13, prop, newCmds, null, a[4]];

          var s = conv.runToString(obj.data[prop], newCmds);
          obj.data[prop] = s;

          // TODO: check that these work, may not be good idea to do both
          this._cmd(tmpCmd);
          this._cmd(tmpCmd2);
        };

        /**
         * @param float a
         */
        _myTrait_._reverse_createObject = function (a) {
          var objId = a[1];
          var hash = this._getObjectHash();
          delete hash[objId];
        };

        /**
         * @param float a
         */
        _myTrait_._reverse_moveToIndex = function (a) {
          var obj = this._find(a[4]),
              prop = "*",
              len = obj.data.length,
              targetObj,
              i = 0;

          var oldIndex = null;

          for (i = 0; i < len; i++) {
            var m = obj.data[i];
            if (m.__id == a[1]) {
              targetObj = m;
              oldIndex = i;
              break;
            }
          }

          if (oldIndex != a[2]) {
            throw "_reverse_moveToIndex with invalid index value";
            return;
          }

          if (targetObj) {

            var targetIndex = parseInt(a[3]);

            obj.data.splice(i, 1);
            obj.data.splice(targetIndex, 0, targetObj);

            var tmpCmd = a.slice();
            tmpCmd[2] = targetIndex;
            tmpCmd[3] = a[2];

            this._cmd(tmpCmd);
          }
        };

        /**
         * @param float a
         */
        _myTrait_._reverse_position = function (a) {
          var newCmd = [21, a[2], a[1], 0, a[4]];
          return this._cmd_position(newCmd, true, true);
        };

        /**
         * @param float a
         */
        _myTrait_._reverse_position2 = function (a) {
          var newCmd = [22, a[2], a[1], 0, a[4]];
          return this._cmd_position2(newCmd, true, true);
        };

        /**
         * @param float a
         */
        _myTrait_._reverse_pushToArray = function (a) {
          var parentObj = this._find(a[4]),
              insertedObj = this._find(a[2]),
              prop = "*",
              index = parentObj.data.length;

          // Moving the object in the array
          if (parentObj && insertedObj) {

            var shouldBeAt = parentObj.data.length - 1;

            var item = parentObj.data[shouldBeAt];

            // old parent and old item id perhas should be also defined?
            if (item.__id == a[2]) {

              // the command which appears to be run, sent to the data listeners
              var tmpCmd = [8, shouldBeAt, item.__id, null, parentObj.__id];

              // too simple still...
              parentObj.data.splice(shouldBeAt, 1);

              this._cmd(tmpCmd);
            }
          }
        };

        /**
         * @param float a
         */
        _myTrait_._reverse_removeObject = function (a) {

          var parentObj = this._find(a[4]),
              removedItem = this._find(a[2]),
              oldPosition = a[1],
              prop = "*",
              index = parentObj.data.indexOf(removedItem); // might check if valid...

          // Moving the object in the array
          if (parentObj && removedItem) {

            // now the object is in the array...
            parentObj.data.splice(oldPosition, 0, removedItem);

            var tmpCmd = [7, oldPosition, a[2], null, a[4]];
            this._cmd(tmpCmd);

            removedItem.__p = a[4];
          }
        };

        /**
         * @param Array a
         */
        _myTrait_._reverse_setMeta = function (a) {
          var obj = this._find(a[4]),
              prop = a[1];

          if (obj) {
            var tmpCmd = [3, prop, a[3], a[2], a[4]];
            obj[prop] = a[3]; // the old value
            this._cmd(tmpCmd);
          }
        };

        /**
         * @param Array a
         */
        _myTrait_._reverse_setProperty = function (a) {
          var obj = this._find(a[4]),
              prop = a[1];

          if (obj) {
            var tmpCmd = [4, prop, a[3], a[2], a[4]];
            obj.data[prop] = a[3]; // the old value
            this._cmd(tmpCmd);
          }
        };

        /**
         * @param float a
         */
        _myTrait_._reverse_setPropertyObject = function (a) {

          var obj = this._find(a[4]),
              prop = a[1],
              setObj = this._find(a[2]);

          if (!obj) return;
          if (!setObj) return;

          delete obj.data[prop]; // removes the property object
          setObj.__p = null;

          var tmpCmd = [10, prop, null, null, a[4]];
          this._cmd(tmpCmd);
        };

        /**
         * @param Array a
         */
        _myTrait_._reverse_unsetProperty = function (a) {
          var obj = this._find(a[4]),
              removedObj = this._find(a[2]),
              prop = a[1];

          if (obj && prop && removedObj) {

            obj.data[prop] = removedObj;
            removedObj.__p = obj.__id; // The parent relationship

            var tmpCmd = [5, prop, removedObj.__id, 0, a[4]];
            this._cmd(tmpCmd);
          }
        };

        /**
         * @param Object obj
         */
        _myTrait_._setDelta = function (obj) {
          this._delta = obj;
        };

        /**
         * Applies list of commands to the client object
         * @param Array list
         */
        _myTrait_.apply = function (list) {

          var len = list.length;
          for (var i = 0; i < len; i++) {
            var a = list[i];
            this.execCmd(a, true);
          }
        };

        /**
         * This function will collect missing values from the reference diff based on array of commands.
         * @param Object deltaObj
         * @param float journal
         */
        _myTrait_.collectToDiff = function (deltaObj, journal) {

          var me = this;
          journal.forEach(function (cmd) {

            /*
            if(cmd[0]==1) {
            var obj_id = cmd[1];
            if(!deltaObj[obj_id]) deltaObj[obj_id] = { data : {} };    
                 return;
            //var obj = me._find( cmd[1] );
            //var prop = cmd[1];
            //if(obj) me._deltaPatch(deltaObj, cmd[4], prop, obj.data[prop]);
            //return;
            }
            */

            if (cmd[0] == 4) {
              var obj = me._find(cmd[4]);
              var prop = cmd[1];
              if (obj) me._deltaPatch(deltaObj, cmd[4], prop, obj.data[prop]);
              return;
            }
            if (cmd[0] == 21) {

              var obj_id = cmd[4];
              var obj = me._find(obj_id);
              if (obj) {
                if (!deltaObj[obj_id]) deltaObj[obj_id] = {
                  data: {}
                };
                var dd = deltaObj[obj_id];
                dd._p = obj._p;
                dd._n = obj._n;
                dd.__p = obj.__p;

                var parent = me._find(obj.__p);
                if (parent) {
                  if (!deltaObj[parent.__id]) deltaObj[parent.__id] = {
                    data: {}
                  };
                  deltaObj[parent.__id]._fc = parent._fc;
                }
              }
              return;
            }
          });
        };

        /**
         * @param Object dataObj
         * @param Array sentJournal
         * @param Array unsentJournal
         * @param float serverJournal
         */
        _myTrait_.conditionalRunner = function (dataObj, sentJournal, unsentJournal, serverJournal) {

          // The client Journal has been run to the dataObj, we want to test conditionally
          // if each server command does work and if not, reverse the client journal

          var clientJ = clientJournal.splice(); // create copy of the client journal

          /*
          1. reverse to orig
          2. apply server cmds
          3. try to apply client cmds
          - client may have sent the command already to the server, but does not know if it has gone trough
          - what if the server's command does not go through on the client?
          x = 380
          -------- start position, last server update -----
          x = 10  => to server   ... this change can not be changed anynore
          y = 50  => to server   .... this change can not be changed anymore
          -- then local change ---
          x = 20                 ... not sent, can be saved by fixing before sending
          ??? should we be having 2 data objects, server data and our local data ???
          localData.execCmd( ... );   // something...
          serverData.execCmd( ... );  // something...
          => obj.x = 20
          x = 400, 380  <= from server, server thinks the old value is 380 and now it should be 400
          y = 100, 120  <= from server, new y value should be 100
          -- we should reverse our local changes maybe then ---
          x = 10
          x = 380
          x = 400
          The Question is the what are the commands that will transform this Delta list
          compatible with the other Delta -list with possibly some new commands then.
          ==============================================================================
          [x,60]               [y,90]
                     [x,120]
          [x,120,60] => converts the lists compatible
          1. Delta set
          2. Server news
          3. Delta unsent
          [ 22,
          [
          ["myId",   1, "newParent"],
          ["myId",   0, "prevId"],
          ["prevId", 2, "myId"],
          ["myId",   2, "nextId"],
          ["nextId", 0, "myId"],        
          ["parentId, 3, "myId"] 
          ], 
          [
          ["myId", 1],
          ["myId",   0],
          ["prevId", 2, "nextId"],    
          ["myId",   2],
          ["nextId", 0, "prevId"],    
          ["parentId, 3, "oldFirstChild"] 
          ], 
          0, 
          id ]  
          */

          var collectSets = function collectSets(journal, obj) {
            journal.forEach(function (cmd) {
              if (cmd[0] != 4) return;
              var obj_id = cmd[4],
                  prop = cmd[1],
                  key = obj_id + ":" + prop;
              if (!obj[key]) obj[key] = {
                list: []
              };
              obj[key].list.push(cmd);
              obj[key].lastPrev = cmd[3];
              obj[key].lastValue = cmd[2];
            });
            return obj;
          };

          // affected position commands...
          var collectPositions = function collectPositions(journal, obj) {
            journal.forEach(function (cmd, i) {

              if (cmd[0] != 22) return;

              var from = cmd[2];
              var to = cmd[1];
              var len = from.length;

              for (var i = 0; i < len; i++) {

                var f = from[i],
                    t = to[i],
                    obj_id = f[0];

                if (!obj[obj_id]) obj[obj_id] = {
                  has: new Array(4),
                  sets: new Array(4),
                  froms: new Array(4),
                  firsts: new Array(4)
                };
                var dd = obj[obj_id];
                var ind = f[1];
                dd.sets[ind] = t[2]; // the last value
                dd.has[ind] = true; // indicates the property has been set
                if (typeof dd.firsts[ind] == "undefined") {
                  dd.firsts[ind] = t[2];
                  dd.froms[ind] = f[2]; // to re-build simplified version
                }
              }
              // obj[obj_id].list.push(cmd);
            });
            return obj;
          };

          var rebuildBuffer = function rebuildBuffer(changes) {

            var real_from = [],
                real_to = [];

            for (var id in changes) {
              if (changes.hasOwnProperty(id)) {
                var dd = changes[id];
                for (var p = 0; p <= 3; p++) {
                  if (dd.has[p]) {
                    real_from.push([id, p, dd.froms[p]]);
                    real_to.push([id, p, dd.sets[p]]);
                  }
                }
              }
            }
            return [22, real_to, real_from];
          };

          var new_unsent_journal = [];
          var active_commands = [];
          var handled_keys = {};

          var client_sets_sent, client_sets_unsent, server_sets;

          var client_pos_sent = collectPositions(sentJournal, {}),
              client_pos_unsent = collectPositions(unsentJournal, {}),
              server_pos = collectPositions(serverJournal, {});

          var real_from = [],
              real_to = [];

          var bReconstructLocal = false;

          var res = {};

          for (var i = 0; i < serverJournal.length; i++) {

            var cmd = serverJournal[i];

            /*
            if(cmd[0] == 4) {
            var obj_id = cmd[4],
            prop = cmd[1],
            key = obj_id+":"+prop;
            if(!handled_keys[key]) {
            // check if the client journal has changed this object
            if(!client_sets_unsent) client_sets_unsent = collectSets( unsentJournal, {} );
            
            var cv;
            if(cv = client_sets_unsent[key]) {
                 // server is setting a key, which client could still "save"
                 if(!server_sets) server_sets = collectSets( serverJournal, {} );
                 
                 // we can keep the value as it is, because we can create new journal entry at the position
                 var cJC = [4, prop, cv.lastValue, server_sets[key].lastValue, obj_id];
                 new_unsent_journal.push(cJC);
                 handled_keys[key] = true;
            } else {
                // We have to use the value server has sent...
                if(!server_sets) server_sets = collectSets( serverJournal, {} );
                var obj = dataObj._find(obj_id);
                var active = [4, prop, server_sets[key].lastValue, obj.data[prop], obj_id ];
                active_commands.push(active);
                handled_keys[key] = true;
                
            }
            }
            }
            */

            // changing the position can be quite tricky...
            if (cmd[0] == 22) {

              var obj_id = cmd[4];
              var from = cmd[2];
              var to = cmd[1];

              // looping simple value sets, like _p => some value
              // or __p => some value...
              for (var i = 0; i < len; i++) {

                var local_from, local_to;

                var f = from[i],
                    t = to[i],
                    oid = f[0];

                // check if there is some value we have sent to the server, which can be
                // mutated to new value locally
                var sent = client_pos_sent[oid];

                local_from = f.slice(); // this is the set from => to we are about to apply
                local_to = t.slice();

                // flag to indicate if the server command run is necessary
                var b_add = true;

                if (sent) {
                  var ind = t[1]; // index 0...3 = prev, parent, next, firstchild

                  if (sent.has[ind]) {
                    if (sent.sets[ind] != t[2]) {
                      // the last set of the sent journal was error
                      local_from[2] = sent.sets[ind];
                    } else {
                      // if the value has been locally already set to the value, then don't re-run the cmd
                      b_add = false;
                    }
                  }
                }

                // then check if the unsent has this
                var unsent = client_pos_unsent[oid];

                if (unsent) {
                  var ind = t[1]; // index 0...3 = prev, parent, next, firstchild
                  // if we have locally conflicting command, then don't execute the server command
                  // but restructure the unsent buffer so that it corresponds to the new situation
                  if (unsent.has[ind]) {
                    b_add = false; // don't add server command
                    // but the local journal must be modified...
                    // ?? how to remove the commands?

                    bReconstructLocal = true;
                    unsent.froms[ind] = local_to[2]; // the servers value
                  }
                }
                if (b_add) {
                  real_from.push(local_from);
                  real_to.push(local_to);
                }
              }
            }
          }

          res.bReconstructLocal = bReconstructLocal;
          if (bReconstructLocal) {
            res.unset_pos_rebuild = rebuildBuffer(unsent);
          }
          res.pos_changes = [22, real_to, real_from];

          return res;

          // the backup plan
          /*
          dataObj.undo( clientJournal.length );
          dataObj.apply( serverJournal );
          dataObj.apply( clientJournal );
          */
        };

        /**
         * Takes two delta -objects and creates a command list to transform state from 1 to 2. It is assumed that delta 1 has all the same values than the delta2, so if there is set of commands, then all the changed object properties are collected to both delta objects even if only one of them does actually modify the value. For example, if delta2 modifies x then delta1 must have the original x value also to make possible to create transition from old x =&gt; new x.
         * @param Object delta1  - Difference object 1
         * @param Object delta2  - Difference object 2
         */
        _myTrait_.deltaDiffToCmds = function (delta1, delta2) {

          var newCmds = [];
          for (var id in delta2) {

            if (delta2.hasOwnProperty(id)) {

              var obj2 = delta2[id];
              var obj1 = delta1[id];

              // just in-case, create the object if not existing...
              if (!obj1) {
                var cmd = [1, id, obj2._class];
                obj1 = delta1[id] = {
                  data: {},
                  __id: id
                };
                newCmds.push(cmd);
              }

              // detect position change
              if (typeof obj2._p != "undefined" && typeof obj2._n != "undefined") {
                if (!obj1 || (obj2._p != obj1._p || obj2._n != obj1._n || obj2.__p != obj1.__p)) {

                  // the cmd migt be something like this...
                  var cmd = [21, [obj2._p, obj2._n, obj2.__p], [obj1._p, obj1._n, obj1.__p], 0, id];
                  newCmds.push(cmd);
                }
              }

              for (var name in obj2.data) {
                if (obj2.data.hasOwnProperty(name)) {

                  if (obj1.data[name] != obj2.data[name]) {
                    var cmd = [4, name, obj2.data[name], obj1.data[name], id];
                    newCmds.push(cmd);
                  }
                }
              }
            }
          }
          return newCmds;
        };

        /**
         * @param float a
         * @param float isRemote
         * @param float isRedo
         * @param float deltaObj
         */
        _myTrait_.execCmd = function (a, isRemote, isRedo, deltaObj) {

          // now, the question is now, can you have a custom code here based on some
          // classes, which is run when the command is executed, for example if you
          // set x to some value [0,100] can you check here that the value is really
          // a valid value or not,
          try {
            if (!this.isArray(a)) return false;
            var c = _cmds[a[0]];
            if (c) {
              var rv = c.apply(this, [a, isRemote, false, deltaObj]);
              if (rv && !isRedo) this.writeLocalJournal(a);
              return rv;
            } else {
              return false;
            }
          } catch (e) {
            return false;
          }
        };

        /**
         * @param float t
         */
        _myTrait_.getJournalLine = function (t) {
          return this._journalPointer;
        };

        /**
         * @param float t
         */
        _myTrait_.getLocalJournal = function (t) {
          return this._journal;
        };

        if (_myTrait_.__traitInit && !_myTrait_.hasOwnProperty("__traitInit")) _myTrait_.__traitInit = _myTrait_.__traitInit.slice();
        if (!_myTrait_.__traitInit) _myTrait_.__traitInit = [];
        _myTrait_.__traitInit.push(function (t) {
          if (!_listeners) {
            _listeners = {};
            _execInfo = {};
          }

          if (!_cmds) {

            _reverseCmds = new Array(30);
            _cmds = new Array(30);

            _cmds[1] = this._cmd_createObject;
            _cmds[2] = this._cmd_createArray;
            _cmds[3] = this._cmd_setMeta;
            _cmds[4] = this._cmd_setProperty;
            _cmds[5] = this._cmd_setPropertyObject;
            _cmds[7] = this._cmd_pushToArray;
            _cmds[8] = this._cmd_removeObject;
            _cmds[10] = this._cmd_unsetProperty;
            _cmds[12] = this._cmd_moveToIndex;
            _cmds[13] = this._cmd_aceCmd;
            _cmds[22] = this._cmd_position2;

            _reverseCmds[3] = this._reverse_setMeta;
            _reverseCmds[4] = this._reverse_setProperty;
            _reverseCmds[5] = this._reverse_setPropertyObject;
            _reverseCmds[7] = this._reverse_pushToArray;
            _reverseCmds[8] = this._reverse_removeObject;
            _reverseCmds[10] = this._reverse_unsetProperty;
            _reverseCmds[12] = this._reverse_moveToIndex;
            _reverseCmds[13] = this._reverse_aceCmd;
            _reverseCmds[22] = this._reverse_position2;
            // _reverse_setPropertyObject
          }
        });

        /**
         * @param float n
         */
        _myTrait_.redo = function (n) {
          // if one line in buffer line == 1
          var line = this.getJournalLine();
          n = n || 1;
          while (n-- > 0) {

            var cmd = this._journal[line];
            if (!cmd) return;

            this.execCmd(cmd, false, true);
            line++;
            this._journalPointer++;
          }
        };

        /**
         * @param String name
         * @param float obj
         */
        _myTrait_.registerClass = function (name, obj) {

          if (!_classes) _classes = {};
          _classes[name] = obj;
        };

        /**
         * This function reverses a given command. There may be cases when the command parameters make the command itself non-reversable. It is the responsibility of the framework to make sure all commands remain reversable.
         * @param float a
         */
        _myTrait_.reverseCmd = function (a) {
          console.log("reversing command ", a);
          var c = _reverseCmds[a[0]];
          if (c) {
            var rv = c.apply(this, [a]);
            return rv;
          }
        };

        /**
         * @param int n
         */
        _myTrait_.reverseNLines = function (n) {
          // if one line in buffer line == 1
          var line = this.getJournalLine();

          while (line - 1 >= 0 && n-- > 0) {
            var cmd = this._journal[line - 1];
            this.reverseCmd(cmd);
            line--;
            this._journalPointer--;
          }
        };

        /**
         * 0 = reverse all commands, 1 = reverse to the first line etc.
         * @param int index
         */
        _myTrait_.reverseToLine = function (index) {
          // if one line in buffer line == 1
          var line = this.getJournalLine();

          while (line - 1 >= 0 && line > index) {
            var cmd = this._journal[line - 1];
            this.reverseCmd(cmd);
            line--;
            this._journalPointer--;
          }
        };

        /**
         * @param int n
         */
        _myTrait_.undo = function (n) {

          if (n === 0) return;
          if (typeof n == "undefined") n = 1;

          this.reverseNLines(n);
        };

        /**
         * @param Array cmd
         */
        _myTrait_.writeLocalJournal = function (cmd) {

          if (this._journal) {
            // truncate on write if length > journalPointer
            if (this._journal.length > this._journalPointer) {
              this._journal.length = this._journalPointer;
            }
            this._journal.push(cmd);
            this._journalPointer++;
          }
        };
      })(this);

      (function (_myTrait_) {
        var _instanceCache;
        var _workerCmds;

        // Initialize static variables here...

        /**
         * @param float data
         */
        _myTrait_._addToCache = function (data) {

          if (data && data.__id) {
            this._objectHash[data.__id] = data;
          }
        };

        if (!_myTrait_.hasOwnProperty("__factoryClass")) _myTrait_.__factoryClass = [];
        _myTrait_.__factoryClass.push(function (id) {

          if (!_instanceCache) _instanceCache = {};

          if (_instanceCache[id]) return _instanceCache[id];

          _instanceCache[id] = this;
        });

        /**
         * In the future can be used to initiate events, if required.
         * @param float cmd
         * @param float obj
         * @param float targetObj
         */
        _myTrait_._cmd = function (cmd, obj, targetObj) {

          var cmdIndex = cmd[0],
              UUID = cmd[4];

          if (!this._workers[cmdIndex]) return;
          if (!this._workers[cmdIndex][UUID]) return;

          var workers = this._workers[cmdIndex][UUID];
          var me = this;

          var propFilter = cmd[1];
          var allProps = workers["*"],
              thisProp = workers[propFilter];

          if (allProps) {
            allProps.forEach(function (w) {
              var id = w[0],
                  options = w[1];
              var worker = _workerCmds[id];
              if (worker) {
                worker(cmd, options);
              }
            });
          }
          if (thisProp) {
            thisProp.forEach(function (w) {
              var id = w[0],
                  options = w[1];
              var worker = _workerCmds[id];
              if (worker) {
                worker(cmd, options);
              }
            });
          }
        };

        /**
         * @param float obj
         * @param float parentObj
         * @param float intoList
         */
        _myTrait_._createModelCommands = function (obj, parentObj, intoList) {

          /*
          _cmdIndex = {}; 
          _cmdIndex["createObject"] = 1;
          _cmdIndex["createArray"]  = 2;
          _cmdIndex["initProp"]  = 3;
          _cmdIndex["set"]  = 4;
          _cmdIndex["setMember"]  = 5;
          _cmdIndex["push"]  = 6;
          _cmdIndex["pushObj"]  = 7;
          _cmdIndex["removeItem"]  = 8;
          // reserved 9 for optimizations
          _cmdIndex["last"]  = 9;
          _cmdIndex["removeProperty"]  = 10;
          _cmdIndex["insertObjectAt"]  = 11;
          _cmdIndex["moveToIndex"]  = 12;
          */

          if (!intoList) intoList = [];

          var data;

          if (obj.data && obj.__id) {
            data = obj.data;
          } else {
            data = obj;
          }

          if (this.isObject(data) || this.isArray(data)) {

            var newObj;

            if (obj.__id) {
              newObj = obj;
            } else {
              newObj = {
                data: data,
                __id: this.guid()
              };
            }

            if (this.isArray(data)) {
              var cmd = [2, newObj.__id, [], null, newObj.__id];
            } else {
              var cmd = [1, newObj.__id, {}, null, newObj.__id];
            }
            if (parentObj) {
              newObj.__p = parentObj.__id;
              // this._moveCmdListToParent( newObj );
            }
            intoList.push(cmd);

            // Then, check for the member variables...
            for (var n in data) {
              if (data.hasOwnProperty(n)) {
                var value = data[n];
                if (this.isObject(value) || this.isArray(value)) {
                  // Then create a new...
                  var oo = this._createModelCommands(value, newObj, intoList);
                  var cmd = [5, n, oo.__id, null, newObj.__id];
                  intoList.push(cmd);
                } else {
                  var cmd = [4, n, value, null, newObj.__id];
                  intoList.push(cmd);
                }
              }
            }

            return newObj;
          } else {}

          /*
          var newObj = {
          data : data,
          __id : this.guid()
          }
          */
        };

        /**
         * @param Object data
         * @param float parentObj
         */
        _myTrait_._createNewModel = function (data, parentObj) {

          /*
          _cmdIndex = {}; 
          _cmdIndex["createObject"] = 1;
          _cmdIndex["createArray"]  = 2;
          _cmdIndex["initProp"]  = 3;
          _cmdIndex["set"]  = 4;
          _cmdIndex["setMember"]  = 5;
          _cmdIndex["push"]  = 6;
          _cmdIndex["pushObj"]  = 7;
          _cmdIndex["removeItem"]  = 8;
          // reserved 9 for optimizations
          _cmdIndex["last"]  = 9;
          _cmdIndex["removeProperty"]  = 10;
          _cmdIndex["insertObjectAt"]  = 11;
          _cmdIndex["moveToIndex"]  = 12;
          */

          if (this.isObject(data) || this.isArray(data)) {

            var newObj = {
              data: data,
              __id: this.guid()
            };

            this._objectHash[newObj.__id] = newObj;

            if (this.isArray(data)) {
              var cmd = [2, newObj.__id, [], null, newObj.__id];
            } else {
              var cmd = [1, newObj.__id, {}, null, newObj.__id];
            }

            if (parentObj) {
              newObj.__p = parentObj.__id;
              // this._moveCmdListToParent( newObj );
            }
            this.writeCommand(cmd, newObj);

            // Then, check for the member variables...
            for (var n in data) {
              if (data.hasOwnProperty(n)) {
                var value = data[n];
                if (this.isObject(value) || this.isArray(value)) {
                  // Then create a new...
                  var oo = this._createNewModel(value, newObj);
                  newObj.data[n] = oo;
                  var cmd = [5, n, oo.__id, null, newObj.__id];
                  this.writeCommand(cmd, newObj);
                  this._moveCmdListToParent(oo);
                } else {
                  var cmd = [4, n, value, null, newObj.__id];
                  this.writeCommand(cmd, newObj);
                }
              }
            }

            return newObj;
          } else {}

          /*
          var newObj = {
          data : data,
          __id : this.guid()
          }
          */
        };

        /**
         * @param float id
         */
        _myTrait_._find = function (id) {
          return this._objectHash[id];
        };

        /**
         * @param float data
         * @param float parentId
         * @param float whenReady
         */
        _myTrait_._findObjects = function (data, parentId, whenReady) {

          if (!data) return null;
          if (!this.isObject(data)) return data;

          if (data.__objects) {
            var me = this;
            var setFn = function setFn(o) {
              me._objectHash[o.__id] = o;
            };
            data.__objects.forEach(setFn);
          }
          if (data.__id) {
            this._objectHash[data.__id] = data;
          }

          return data;
        };

        /**
         * @param float t
         */
        _myTrait_._getObjectHash = function (t) {
          return this._objectHash;
        };

        /**
         * @param Object data
         */
        _myTrait_._prepareData = function (data) {
          var d = this._wrapData(data);
          if (!this._objectHash[d.__id]) {
            d = this._findObjects(d);
          }
          return d;
        };

        /**
         * @param float data
         * @param float parent
         */
        _myTrait_._wrapData = function (data, parent) {

          // if instance of this object...
          if (data && data._wrapData) {
            // we can use the same pointer to this data
            return data._data;
          }

          // if the data is "well formed"
          if (data.__id && data.data) return data;

          // if new data, then we must create a new object and return it

          var newObj = this._createNewModel(data);
          /*
          var newObj = {
          data : data,
          __id : this.guid()
          }
          */
          return newObj;
        };

        /**
         * @param string workerID
         * @param Array cmdFilter
         * @param Object workerOptions
         */
        _myTrait_.createWorker = function (workerID, cmdFilter, workerOptions) {

          // cmdFilter could be something like this:
          // [ 4, 'x', null, null, 'GUID' ]
          // [ 8, null, null, null, 'GUID' ]

          var cmdIndex = cmdFilter[0],
              UUID = cmdFilter[4];

          if (!this._workers[cmdIndex]) {
            this._workers[cmdIndex] = {};
          }

          if (!this._workers[cmdIndex][UUID]) this._workers[cmdIndex][UUID] = {};

          var workers = this._workers[cmdIndex][UUID];

          var propFilter = cmdFilter[1];
          if (!propFilter) propFilter = "*";

          if (!workers[propFilter]) workers[propFilter] = [];

          workers[propFilter].push([workerID, workerOptions]);

          // The original worker implementation was something like this:

          // The worker has
          // 1. the Data item ID
          // 2. property name
          // 3. the worker function
          // 4. the view information
          // 5. extra params ( 4. and 5. could be simplified to options)

          /*
          var w = _dataLink._createWorker( 
          dataItem.__id, 
          vName, 
          _workers().fetch(9), 
          subTplDOM, {
           modelid : dataItem.__id,
           compiler : me,
           view : myView
          });
          */
        };

        /**
         * @param float t
         */
        _myTrait_.getData = function (t) {
          return this._data;
        };

        /**
         * @param float t
         */
        _myTrait_.getJournal = function (t) {
          return this._journal;
        };

        /**
         * @param float item
         */
        _myTrait_.indexOf = function (item) {

          if (!item) item = this._data;

          if (!this.isObject(item)) {
            item = this._find(item);
          }
          if (!item) return;

          var parent = this._find(item.__p);

          if (!parent) return;
          if (!this.isArray(parent.data)) return;

          return parent.data.indexOf(item);
        };

        if (_myTrait_.__traitInit && !_myTrait_.hasOwnProperty("__traitInit")) _myTrait_.__traitInit = _myTrait_.__traitInit.slice();
        if (!_myTrait_.__traitInit) _myTrait_.__traitInit = [];
        _myTrait_.__traitInit.push(function (channelId, mainData, journalCmds) {

          // if no mainData defined, exit immediately
          if (!mainData) return;
          /*
          The format of the main data is as follows : 
          {
          data : {
          key : value,
          subObject : {
            data : {}
            __id : "subGuid"
          }
          },
          __id : "someGuid"
          }
          */
          if (!this._objectHash) {
            this._objectHash = {};
          }

          if (!mainData.__objects) {
            mainData.__objects = [];
          }

          var me = this;
          this._channelId = channelId;
          this._data = mainData;
          this._workers = {};
          this._journal = journalCmds || [];
          this._journalPointer = this._journal.length;

          var newData = this._findObjects(mainData);
          if (newData != mainData) this._data = newData;

          // Then, the journal commands should be run on the object

          if (journalCmds && this.isArray(journalCmds)) {
            journalCmds.forEach(function (c) {
              me.execCmd(c, true);
            });
          }
        });

        /**
         * Notice that all channels are using the same commands.
         * @param Object cmdObject
         */
        _myTrait_.setWorkerCommands = function (cmdObject) {

          if (!_workerCmds) _workerCmds = {};

          for (var i in cmdObject) {
            if (cmdObject.hasOwnProperty(i)) {
              _workerCmds[i] = cmdObject[i];
            }
          }
          // _workerCmds
        };

        /**
         * @param float obj
         */
        _myTrait_.toPlainData = function (obj) {

          if (typeof obj == "undefined") obj = this._data;

          if (!this.isObject(obj)) return obj;

          var plain;

          if (this.isArray(obj.data)) {
            plain = [];
            var len = obj.data.length;
            for (var i = 0; i < len; i++) {
              plain[i] = this.toPlainData(obj.data[i]);
            }
          } else {
            plain = {};
            for (var n in obj.data) {
              if (obj.data.hasOwnProperty(n)) {
                plain[n] = this.toPlainData(obj.data[n]);
              }
            }
          }

          return plain;
        };

        /**
         * @param float a
         */
        _myTrait_.writeCommand = function (a) {
          if (!this._cmdBuffer) this._cmdBuffer = [];
          this._cmdBuffer.push(a);
        };
      })(this);
    };

    var _channelData = function _channelData(a, b, c, d, e, f, g, h) {
      var m = this,
          res;
      if (m instanceof _channelData) {
        var args = [a, b, c, d, e, f, g, h];
        if (m.__factoryClass) {
          m.__factoryClass.forEach(function (initF) {
            res = initF.apply(m, args);
          });
          if (typeof res == "function") {
            if (res._classInfo.name != _channelData._classInfo.name) return new res(a, b, c, d, e, f, g, h);
          } else {
            if (res) return res;
          }
        }
        if (m.__traitInit) {
          m.__traitInit.forEach(function (initF) {
            initF.apply(m, args);
          });
        } else {
          if (typeof m.init == "function") m.init.apply(m, args);
        }
      } else return new _channelData(a, b, c, d, e, f, g, h);
    };
    // inheritance is here

    _channelData._classInfo = {
      name: "_channelData"
    };
    _channelData.prototype = new _channelData_prototype();

    (function () {
      if (typeof define !== "undefined" && define !== null && define.amd != null) {
        __amdDefs__["_channelData"] = _channelData;
        this._channelData = _channelData;
      } else if (typeof module !== "undefined" && module !== null && module.exports != null) {
        module.exports["_channelData"] = _channelData;
      } else {
        this._channelData = _channelData;
      }
    }).call(new Function("return this")());

    (function (_myTrait_) {

      // Initialize static variables here...

      if (_myTrait_.__traitInit && !_myTrait_.hasOwnProperty("__traitInit")) _myTrait_.__traitInit = _myTrait_.__traitInit.slice();
      if (!_myTrait_.__traitInit) _myTrait_.__traitInit = [];
      _myTrait_.__traitInit.push(function (options) {});
    })(this);
  };

  var channelObjects = function channelObjects(a, b, c, d, e, f, g, h) {
    var m = this,
        res;
    if (m instanceof channelObjects) {
      var args = [a, b, c, d, e, f, g, h];
      if (m.__factoryClass) {
        m.__factoryClass.forEach(function (initF) {
          res = initF.apply(m, args);
        });
        if (typeof res == "function") {
          if (res._classInfo.name != channelObjects._classInfo.name) return new res(a, b, c, d, e, f, g, h);
        } else {
          if (res) return res;
        }
      }
      if (m.__traitInit) {
        m.__traitInit.forEach(function (initF) {
          initF.apply(m, args);
        });
      } else {
        if (typeof m.init == "function") m.init.apply(m, args);
      }
    } else return new channelObjects(a, b, c, d, e, f, g, h);
  };
  // inheritance is here

  channelObjects._classInfo = {
    name: "channelObjects"
  };
  channelObjects.prototype = new channelObjects_prototype();

  if (typeof define !== "undefined" && define !== null && define.amd != null) {
    define(__amdDefs__);
  }
}).call(new Function("return this")());