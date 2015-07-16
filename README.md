# Data command runner - version 2

The first run-down of the command runner. When sending arbitary object data over network in socket.io channels the journal data must be deconstructed into journal commands which are sent over the channel to the receivers. 

The main file and journal are ment to be used together with (Channels)[https://github.com/terotests/_channels] which make possible forking the data into separate branches.

# Limitations

1. moving objects from one subtree to other is not allowed. The object must be removed first and then inserted to other subtree. This is to make client side view MVC code easier to implement.

# Object 

Channel data can change only objects or arrays, individual values are always accessed through the object properties.

Example of an object representing SVG entity might be something like this:

```javascript
{
  data : {
      x : 100,
      y : 100,
      fill : "red",
      type : "rect",
  },
  __id : "m6cq0z12pckp4zb5psbvfvlp4l"
}
```

This corresponds plain JS object:

```javascript
{ x : 100, y : 100, fill : "red", type : "rect" }
```

Each nested object structure will always have the wrapper structure included, for example JavaScript object

```javascript
{ x : 100, y : 200, subObject : { x : 150 } }
```

Would be represented as:

```javascript
{
  data : {
      x : 100,
      y : 200,
      subObject : {  // Object or Array has always the __id and data
            data : {
              x : 150
            },
            __id : "l2f2e887u6u3207oekk3mxcz93",
            __p  : "m6cq0z12pckp4zb5psbvfvlp4l" // <-- parent id
      }
  },
  __id : "m6cq0z12pckp4zb5psbvfvlp4l"
}
```


To change the value of the object a `command` must be run. The purpose of the command
is 
 
  1. to record the action performed to the journal
  2. create events for workers listening to the action
  3. to abstract the object interface over the network

Creating actions as commands gives also the benefit of the command history thus creates history ready to be used for undo / redo actions.


# Commands 

Command is intent to change the value of the object into something else. Command data looks like this:

```javascript
[4, "x", 120, 100, "m6cq0z12pckp4zb5psbvfvlp4l"]
```

The `4` represents the action code for "setProperty". Currently supported commands are:

( copied from the actual source code )

```javascript
    _cmds[1] = this._cmd_createObject;
    _cmds[2] = this._cmd_createArray;
    _cmds[4] = this._cmd_setProperty;
    _cmds[5] = this._cmd_setPropertyObject;
    _cmds[7] = this._cmd_pushToArray;
    _cmds[8] = this._cmd_removeObject;
    _cmds[10] = this._cmd_unsetProperty;
    _cmds[12] = this._cmd_moveToIndex;
    _cmds[13] = this._cmd_aceCmd;
```

## Executing a command

To run a command

 1. get a reference to _channelData -object
 2. run `execCmd` to the object with the array filled with command
 3. check from the return values if the command was succesfull
 
Here is an example of command -run. This command will be success, because the previous value of the "x" is set correctly

```javascript
var dataTest = _channelData( "channel1", { data : { x : 100 }, __id : "myguid" }, [] );
if( dataTest.execCmd([4, "x", 120, 100, "myguid"]) ) {
   // The command was succesfull
} else {
   // The command failed
}
```


## Reversing a command 

Immediately after the command was successfully run you can call

```javascript
dataTest.undo(); // reverses the last succesfull command
```

If you know the last command, you can run 
```javascript
dataTest.reverseCmd([4, "x", 120, 100, "myguid"]) 
```

# List of Commands

## Create Object 

Creates a new Object in the channels object cache. This object can then be added into arrays or set into properties of objects.

Parameters:

1. `1`
2. GUID of the object to be created

```javascript
[1, "<GUID>", "", " ", ""]
```

## Create Array 

Parameters:

1. `2`
2. GUID of the array to be created

```javascript
[2, "<GUID>", "", " ", ""]
```


## Set value property of object

This command sets a value property (integer or string) to Object

Parameters:

1. `4`
2. the property name
3. new value
4. old value
5. GUID of the Object to be modified

```javascript
[4, "x", 120, 100, "<GUID>"]
```

## Set property to Object value

This command sets a property of an object to `Object` value. It will update the parent pointer at the object.

Parameters:

1. `4`
2. the property name
3. GUID of the Object to be added to the property
4. -
5. GUID of the Object to be modified

```javascript
 [5, "propObj", "<GUID>", 0, "<ParentGUID>"]
```

## Push item to array

Array can only have object values, because scalar values can not be reliably identified in the Array structure.

Parameters:

1. `7`
2. index to push the object
3. GUID of the Object to be pushed
4. -
5. GUID of the Array to be modified

```javascript
 [7, 4, "<GUID>", 0, "<ParentGUID>"]
```

## Remove item from Array

Array can only have object values, because scalar values can not be reliably identified in the Array structure.

Parameters:

1. `8`
2. -
3. GUID of the Object to be removed
4. -
5. GUID of the Array to be modified

```javascript
 [8, 0, "<GUID>", 0, "<ParentGUID>"]
```

## Move item in Array

Moves object item in the array

Parameters:

1. `12`
2. GUID of the Object to be removed
3. New index inside the array
4. -
5. GUID of the Array to be modified

```javascript
   [12, "<GUID>", 3, 0, "<ParentGUID>"]
```

## Run ACE editor command to string value

Runs optimized ACE editor "like" commands to string. The values are compressed using
class `aceCmdConvert` 

Parameters:

1. `13`
2. GUID of the Object to be removed
3. New index inside the array
4. -
5. GUID of the Array to be modified

```javascript
var aceCmds = [[1,0,0,0,1,"a"],[1,0,1,0,2,"b"],[1,0,2,0,3,"c"],[1,0,3,0,4,"d"],[1,0,4,0,5,"e"],
               [1,0,5,0,6,"f"],[1,0,6,0,7,"g"],[1,0,7,0,8,"h"]];

data.execCmd( [13, "aceData", aceCmds, "", "<GUID>"], true);
// the value will be "abcdefgh"
```

# Setting up a test channel data

The `_channelData` constructor accepts the channel ID, main Data and journal commands 

```javascript
var dataTest = _channelData( "channel1", 
                        { 
                            data : {
                                myName : "John",
                                subObj : {
                                   data : {
                                        myName : "Jane"  
                                   },
                                   __id : "id124" 
                                },
                                subArray : {
                                   data : [],
                                   __id : "array1" 
                                }
                            },
                            __id : "id123"
                        }, [] );
```

After setup you can run commands against the channel:

```javascript
dataTest.execCmd( [4, "myName", "Mark", "John", "id124"], true);
```

## Getting the plain JSON data out

```javascript
dataTest.getData();         // returns data with __id values
dataTest.toPlainData();     // returns data as regular JavaScript object with no __id values
```

# Reversing Actions 

Testing reverse with workers demo : http://jsfiddle.net/dcvo269d/

Actions in the journal must be reversable. This means that each command should have enought information to reverse the operation it has created.

Reversing commands can be done using either `undo` or `redo`  

```javascript
dataTest.undo();  // undo 1 command 
dataTest.redo();  // redo 1 command

dataTest.undo(4);  // undo 4 commands
dataTest.redo(4);  // redo 4 commands
```

Each reverse command is run in reverse[sic] order - that is the last command will be ran first and so on.

The workers will receive commands which create the opposite action to created action.


# Workers

A demo of workers

http://jsfiddle.net/dcvo269d/

The workers are created to save memory and organize all the functions which are modifying the Object data in a single place.

1. Workers save memory because they create no closures allocated for event handlers
2. When object gets de-allocated, the event handlers can be cleared from a single place
3. Only basic JavaScript datatypes are used to manage the interactions, thus no need for event handling code in the objects

Workers can execute tasks when the value of Objects change. They are similar to callback functions, but different in the sence that the workers are run by the command names, not by callback functions.

This means that instead of allocating a function closure like this:

```javascript
obj.on("change", function() {
     // do something
 });
```

You will create a set of operations based on which data-command like remove, set property or re-oders is actually performed and then create a context variable which is given to the context runner.

For example, you might create a command `1` which will set the value of the property set command to the `options.target.value`.

```javascript
// we specify worker ID = 1 here
dataTest.setWorkerCommands({
    "set_input" : function(cmd, options) {        
        options.target.value = cmd[2];
    }
});
```

Each worker is a function, which gets the current command `cmd` and the options specified when creating the worker.

What is the  `options.target.value` ? When you create a worker, you specify the command filter, command ID and options.

```javascript
dataTest.createWorker(<workerID>, <filter>, <options>);
```

The params are:

1. Filter, which is of format `[<command>, <property|null>, null, null, <GUID>]`
2. Worker ID which is one of the properties of `setWorkerCommands` 
3. Options, which gives the context for the worker to run with.

```javascript
var myInput = document.getElementById("someInput");
dataTest.createWorker("set_input",                        // worker ID
                      [4, "name", null, null, "<GUID>"],  // filter
                      { target : myInput});               // options
```





















   

 


   
#### Class channelObjects





   
    
    
    
    


   
      
            
#### Class aceCmdConvert


- [fromAce](README.md#aceCmdConvert_fromAce)
- [reverse](README.md#aceCmdConvert_reverse)
- [runToAce](README.md#aceCmdConvert_runToAce)
- [runToLineObj](README.md#aceCmdConvert_runToLineObj)
- [runToString](README.md#aceCmdConvert_runToString)
- [simplify](README.md#aceCmdConvert_simplify)



   


   



      
    
      
            
#### Class _channelData


- [_addToCache](README.md#_channelData__addToCache)
- [_classFactory](README.md#_channelData__classFactory)
- [_cmd](README.md#_channelData__cmd)
- [_createModelCommands](README.md#_channelData__createModelCommands)
- [_createNewModel](README.md#_channelData__createNewModel)
- [_find](README.md#_channelData__find)
- [_findObjects](README.md#_channelData__findObjects)
- [_getObjectHash](README.md#_channelData__getObjectHash)
- [_prepareData](README.md#_channelData__prepareData)
- [_wrapData](README.md#_channelData__wrapData)
- [createWorker](README.md#_channelData_createWorker)
- [getData](README.md#_channelData_getData)
- [indexOf](README.md#_channelData_indexOf)
- [setWorkerCommands](README.md#_channelData_setWorkerCommands)
- [toPlainData](README.md#_channelData_toPlainData)
- [writeCommand](README.md#_channelData_writeCommand)



   
    
##### trait _dataTrait

- [guid](README.md#_dataTrait_guid)
- [isArray](README.md#_dataTrait_isArray)
- [isFunction](README.md#_dataTrait_isFunction)
- [isObject](README.md#_dataTrait_isObject)


    
    
    
##### trait commad_trait

- [_cmd_aceCmd](README.md#commad_trait__cmd_aceCmd)
- [_cmd_createArray](README.md#commad_trait__cmd_createArray)
- [_cmd_createObject](README.md#commad_trait__cmd_createObject)
- [_cmd_moveToIndex](README.md#commad_trait__cmd_moveToIndex)
- [_cmd_position](README.md#commad_trait__cmd_position)
- [_cmd_pushToArray](README.md#commad_trait__cmd_pushToArray)
- [_cmd_removeObject](README.md#commad_trait__cmd_removeObject)
- [_cmd_setMeta](README.md#commad_trait__cmd_setMeta)
- [_cmd_setProperty](README.md#commad_trait__cmd_setProperty)
- [_cmd_setPropertyObject](README.md#commad_trait__cmd_setPropertyObject)
- [_cmd_unsetProperty](README.md#commad_trait__cmd_unsetProperty)
- [_fireListener](README.md#commad_trait__fireListener)
- [_moveCmdListToParent](README.md#commad_trait__moveCmdListToParent)
- [_reverse_aceCmd](README.md#commad_trait__reverse_aceCmd)
- [_reverse_createObject](README.md#commad_trait__reverse_createObject)
- [_reverse_moveToIndex](README.md#commad_trait__reverse_moveToIndex)
- [_reverse_position](README.md#commad_trait__reverse_position)
- [_reverse_pushToArray](README.md#commad_trait__reverse_pushToArray)
- [_reverse_removeObject](README.md#commad_trait__reverse_removeObject)
- [_reverse_setMeta](README.md#commad_trait__reverse_setMeta)
- [_reverse_setProperty](README.md#commad_trait__reverse_setProperty)
- [_reverse_setPropertyObject](README.md#commad_trait__reverse_setPropertyObject)
- [_reverse_unsetProperty](README.md#commad_trait__reverse_unsetProperty)
- [execCmd](README.md#commad_trait_execCmd)
- [getJournalLine](README.md#commad_trait_getJournalLine)
- [getLocalJournal](README.md#commad_trait_getLocalJournal)
- [redo](README.md#commad_trait_redo)
- [reverseCmd](README.md#commad_trait_reverseCmd)
- [reverseNLines](README.md#commad_trait_reverseNLines)
- [reverseToLine](README.md#commad_trait_reverseToLine)
- [undo](README.md#commad_trait_undo)
- [writeLocalJournal](README.md#commad_trait_writeLocalJournal)


    
    


   
      
    
      
    



      
    





   
# Class channelObjects


The class has following internal singleton variables:
        
        
### channelObjects::constructor( options )

```javascript

```
        


   
    
    
    
    


   
      
            
# Class aceCmdConvert


The class has following internal singleton variables:
        
        
### <a name="aceCmdConvert_fromAce"></a>aceCmdConvert::fromAce(cmdList)


```javascript


var newList = [];

cmdList.forEach( function(cmd) {
    
    var range = cmd.range;
    if(cmd.action=="insertText") {
        newList.push([
                1, 
                range.start.row,
                range.start.column,
                range.end.row,
                range.end.column,
                cmd.text
            ])
    }
    if(cmd.action=="removeText") {
        newList.push([
                2, 
                range.start.row,
                range.start.column,
                range.end.row,
                range.end.column,
                cmd.text
            ])
    }
    if(cmd.action=="insertLines") {
        newList.push([
                3, 
                range.start.row,
                range.start.column,
                range.end.row,
                range.end.column,
                cmd.lines
            ])
    }
    if(cmd.action=="removeLines") {
        newList.push([
                4, 
                range.start.row,
                range.start.column,
                range.end.row,
                range.end.column,
                cmd.lines,
                cmd.nl
            ])
    }
    
    
});

return newList;

/*
{"action":"insertText","range":{"start":{"row":0,"column":0},
    "end":{"row":0,"column":1}},"text":"d"}
*/
```

### aceCmdConvert::constructor( onFulfilled, onRejected )

```javascript

```
        
### <a name="aceCmdConvert_reverse"></a>aceCmdConvert::reverse(cmdList)


```javascript

var newList = [];

cmdList.forEach( function(oldCmd) {
    
    var cmd = oldCmd.slice(); // create a copy of the old command
    
    var row = cmd[1],
        col = cmd[2],
        endRow = cmd[3],
        endCol = cmd[4];
        
    // add characters...
    if(cmd[0]==1) {
        cmd[0] = 2;
        newList.unshift( cmd );
        return; // this simple ???
    }
    if(cmd[0]==2) {
        cmd[0] = 1;
        newList.unshift( cmd );
        return; // this simple ???
    }    
    if(cmd[0]==3) {
        cmd[0] = 4;
        newList.unshift( cmd );
        return; // this simple ???      
        /*
        var cnt = endRow - row;
        for(var i=0; i<cnt; i++) {
            lines.splice(row+i, 0, cmd[5][i]);
        } 
        */
    }
    if(cmd[0]==4) {
        cmd[0] = 3;
        newList.unshift( cmd );
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
```

### <a name="aceCmdConvert_runToAce"></a>aceCmdConvert::runToAce(cmdList)


```javascript


var newList = [],
    _convert = ["",
        "insertText","removeText","insertLines", "removeLines"
    ];

cmdList.forEach( function(cmd) {
    
    var c ={
            action : _convert[cmd[0]],
            range : {
                start : { row : cmd[1], column : cmd[2]},
                end   : { row : cmd[3], column : cmd[4]}
            }
        };
    if(cmd[0]<3) {
        c.text = cmd[5];
    } else {
        c.lines = cmd[5];
    }
    if(cmd[0]==4) c.nl = cmd[6] || "\n";
    newList.push(c);
    
});

return newList;

/*
{"action":"insertText","range":{"start":{"row":0,"column":0},
    "end":{"row":0,"column":1}},"text":"d"}
*/
```

### <a name="aceCmdConvert_runToLineObj"></a>aceCmdConvert::runToLineObj(lines, cmdList)


```javascript

cmdList.forEach( function(cmd) {
    var row = cmd[1],
        col = cmd[2],
        endRow = cmd[3],
        endCol = cmd[4];
    if(cmd[0]==1) {
        if(cmd[5]=="\n") {
            // add the newline can be a bit tricky
            var line = lines.item(row);
            if(!line) {
                lines.insertAt(row, { text : "" });
                lines.insertAt(row+1, { text : "" });
            } else {
                var txt = line.text();
                line.text( txt.slice(0,col) );
                var newLine = {
                    text : txt.slice(col) || ""
                };
                lines.insertAt(row+1, newLine);
            }
            //lines[row] = line.slice(0,col);
            //var newLine = line.slice(col) || "";
            //lines.splice(row+1, 0, newLine);
        } else {
            var line = lines.item(row);
            if(!line) {
                lines.insertAt(row, { text : cmd[5] });
            } else {
                var txt = line.text();
                line.text( txt.slice(0, col) + cmd[5] + txt.slice(col) );
                // lines[row] = line.slice(0, col) + cmd[5] + line.slice(col);
            }
        }
    }
    if(cmd[0]==2) {
        if(cmd[5]=="\n") {
            // removing the newline can be a bit tricky
            // lines[row]
            var thisLine = lines.item(row),
                nextLine = lines.item( row+1 );
            
            // lines[row] = thisLine + nextLine;
            // lines.splice(row+1, 1); // remove the line...
            var txt1 = "", txt2 = "";
            if(thisLine) txt1 = thisLine.text();
            if(nextLine) txt2 = nextLine.text();
            if(!thisLine) {
                lines.insertAt(row, { text : "" });
            } else {
                thisLine.text( txt1 + txt2 );
            }
            if(nextLine) nextLine.remove();
        } else {
            var line = lines.item(row),
                txt = line.text();
            line.text( txt.slice(0, col) + txt.slice(endCol) );
            //  str.slice(0, 4) + str.slice(5, str.length))
            // lines[row] = line.slice(0, col) + line.slice(endCol);
        }
    }    
    if(cmd[0]==3) {
        var cnt = endRow - row;
        for(var i=0; i<cnt; i++) {
            // var line = lines.item(row+i);
            lines.insertAt(row+i, { text : cmd[5][i] });
            // lines.splice(row+i, 0, cmd[5][i]);
        }         
    }
    if(cmd[0]==4) {
        var cnt = endRow - row;
        for(var i=0; i<cnt; i++) {
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

```

### <a name="aceCmdConvert_runToString"></a>aceCmdConvert::runToString(str, cmdList)


```javascript

if( !cmdList || ( typeof(str)=="undefined")) {
    return "";
}
str = str+"";

var lines = str.split("\n");

cmdList.forEach( function(cmd) {
    var row = cmd[1],
        col = cmd[2],
        endRow = cmd[3],
        endCol = cmd[4];
    if(cmd[0]==1) {
        if(cmd[5]=="\n") {
            // add the newline can be a bit tricky
            var line = lines[row] || "";
            lines[row] = line.slice(0,col);
            var newLine = line.slice(col) || "";
            lines.splice(row+1, 0, newLine);
        } else {
            var line = lines[row] || "";
            lines[row] = line.slice(0, col) + cmd[5] + line.slice(col);
        }
    }
    if(cmd[0]==2) {
        if(cmd[5]=="\n") {
            // removing the newline can be a bit tricky
            // lines[row]
            var thisLine = lines[row] || "",
                nextLine = lines[row+1] || "";
            lines[row] = thisLine + nextLine;
            lines.splice(row+1, 1); // remove the line...
        } else {
            var line = lines[row] || "";
            // str.slice(0, 4) + str.slice(5, str.length))
            lines[row] = line.slice(0, col) + line.slice(endCol);
        }
    }    
    if(cmd[0]==3) {
        var cnt = endRow - row;
        for(var i=0; i<cnt; i++) {
            lines.splice(row+i, 0, cmd[5][i]);
        }         
    }
    if(cmd[0]==4) {
        var cnt = endRow - row;
        for(var i=0; i<cnt; i++) {
            lines.splice(row, 1);
        }       
    }    
    
});

return lines.join("\n");
```

### <a name="aceCmdConvert_simplify"></a>aceCmdConvert::simplify(cmdList)


```javascript

// [[1,0,0,0,1,"a"],[1,0,1,0,2,"b"],[1,0,2,0,3,"c"],[1,0,3,0,4,"e"],[1,0,4,0,5,"d"],
// [1,0,5,0,6,"e"],[1,0,6,0,7,"f"],[1,0,7,0,8,"g"]]
var newList = [],
    lastCmd,
    lastCol,
    lastRow,
    collect = null;

cmdList.forEach( function(cmd) {
    
    if(lastCmd && (cmd[0]==1) && (lastCmd[0]==1) && (cmd[3]==cmd[1]) && (lastCmd[1]==cmd[1]) && (lastCmd[3]==cmd[3]) && (lastCmd[4]==cmd[2]) ) {
        if(!collect) {
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
        if(collect) {
            newList.push(collect);
            collect = null;
        } 
        if(cmd[0]==1) {
            collect = cmd.slice();
        } else {
            newList.push(cmd);
        }
    }
    lastCmd = cmd;
});
if(collect) newList.push(collect);
return newList;
```



   


   



      
    
      
            
# Class _channelData


The class has following internal singleton variables:
        
* _instanceCache
        
* _workerCmds
        
        
### <a name="_channelData__addToCache"></a>_channelData::_addToCache(data)


```javascript

if(data && data.__id) {
    this._objectHash[data.__id] = data;
}
```

### <a name="_channelData__classFactory"></a>_channelData::_classFactory(id)


```javascript

if(!_instanceCache) _instanceCache = {};

if(_instanceCache[id]) return _instanceCache[id];

_instanceCache[id] = this;
```

### <a name="_channelData__cmd"></a>_channelData::_cmd(cmd, obj, targetObj)

In the future can be used to initiate events, if required.
```javascript

var cmdIndex = cmd[0],
    UUID = cmd[4];
    
if(!this._workers[cmdIndex]) return;
if(!this._workers[cmdIndex][UUID]) return;
    
var workers = this._workers[cmdIndex][UUID];
var me = this;

var propFilter = cmd[1];
var allProps = workers["*"],
    thisProp = workers[propFilter];

if(allProps) {
    allProps.forEach( function(w) {
        var id = w[0],
            options = w[1];
        var worker = _workerCmds[id];
        if(worker) {
            worker( cmd, options );
        }
    });
}
if(thisProp) {
    thisProp.forEach( function(w) {
        var id = w[0],
            options = w[1];
        var worker = _workerCmds[id];
        if(worker) {
            worker( cmd, options );
        }
    });
}

```

### <a name="_channelData__createModelCommands"></a>_channelData::_createModelCommands(obj, parentObj, intoList)


```javascript

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

if(!intoList) intoList = [];

var data;

if(obj.data && obj.__id ) {
    data = obj.data;
} else {
    data = obj;
}

if(this.isObject(data) || this.isArray(data)) {
    
    var newObj;
    
    if(obj.__id) {
        newObj = obj;
    } else {
        newObj = {
            data : data,
            __id : this.guid()
        }
    }
    
    if(this.isArray(data)) {
        var cmd = [2, newObj.__id, [], null, newObj.__id];
    } else {
        var cmd = [1, newObj.__id, {}, null, newObj.__id];
    }
    if(parentObj) {
        newObj.__p = parentObj.__id;
        // this._moveCmdListToParent( newObj );
    }
    intoList.push( cmd );

    // Then, check for the member variables...
    for(var n in data) {
        if(data.hasOwnProperty(n)) {
            var value = data[n];
            if(this.isObject(value) || this.isArray(value)) {
                // Then create a new...
                var oo = this._createModelCommands( value, newObj, intoList );
                var cmd = [5, n, oo.__id, null, newObj.__id];
                intoList.push( cmd );
            } else {
                var cmd = [4, n, value, null, newObj.__id];
                intoList.push( cmd );
            }
        }
    }
    
    return newObj;
} else {
    
}



/*
var newObj = {
    data : data,
    __id : this.guid()
}
*/
```

### <a name="_channelData__createNewModel"></a>_channelData::_createNewModel(data, parentObj)


```javascript

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

if(this.isObject(data) || this.isArray(data)) {
    
    var newObj = {
        data : data,
        __id : this.guid()
    }
    
    this._objectHash[newObj.__id] = newObj;
    
    if(this.isArray(data)) {
        var cmd = [2, newObj.__id, [], null, newObj.__id];
    } else {
        var cmd = [1, newObj.__id, {}, null, newObj.__id];
    }

    if(parentObj) {
        newObj.__p = parentObj.__id;
        // this._moveCmdListToParent( newObj );
    }
    this.writeCommand(cmd, newObj);
    
    // Then, check for the member variables...
    for(var n in data) {
        if(data.hasOwnProperty(n)) {
            var value = data[n];
            if(this.isObject(value) || this.isArray(value)) {
                // Then create a new...
                var oo = this._createNewModel( value, newObj );
                newObj.data[n] = oo;
                var cmd = [5, n, oo.__id, null, newObj.__id];
                this.writeCommand(cmd, newObj);
                this._moveCmdListToParent( oo );
            } else {
                var cmd = [4, n, value, null, newObj.__id];
                this.writeCommand(cmd, newObj);
            }
        }
    }
    
    return newObj;
    
} else {
    
}


/*
var newObj = {
    data : data,
    __id : this.guid()
}
*/
```

### <a name="_channelData__find"></a>_channelData::_find(id)


```javascript
return this._objectHash[id];
```

### <a name="_channelData__findObjects"></a>_channelData::_findObjects(data, parentId, whenReady)


```javascript

if(!data) return null;
if(!this.isObject(data)) return data;

if(data.__objects) {
    var me = this;
    var setFn = function(o) {
        me._objectHash[o.__id] = o;
    }
    data.__objects.forEach(setFn);
}
if(data.__id) {
    this._objectHash[data.__id] = data;
}

return data;
```

### <a name="_channelData__getObjectHash"></a>_channelData::_getObjectHash(t)


```javascript
return this._objectHash;
```

### <a name="_channelData__prepareData"></a>_channelData::_prepareData(data)


```javascript
var d = this._wrapData( data );
if(!this._objectHash[d.__id]) {
    d = this._findObjects( d );
}
return d;
```

### <a name="_channelData__wrapData"></a>_channelData::_wrapData(data, parent)


```javascript

// if instance of this object...
if(data && data._wrapData) {
    // we can use the same pointer to this data
    return data._data;
}

// if the data is "well formed"
if(data.__id && data.data) return data;

// if new data, then we must create a new object and return it

var newObj = this._createNewModel( data );
/*
var newObj = {
    data : data,
    __id : this.guid()
}
*/
return newObj;
```

### <a name="_channelData_createWorker"></a>_channelData::createWorker(workerID, cmdFilter, workerOptions)


```javascript

// cmdFilter could be something like this:
// [ 4, 'x', null, null, 'GUID' ]
// [ 8, null, null, null, 'GUID' ]

var cmdIndex = cmdFilter[0],
    UUID = cmdFilter[4];

if(!this._workers[cmdIndex]) {
    this._workers[cmdIndex] = {};
}

if(!this._workers[cmdIndex][UUID]) 
    this._workers[cmdIndex][UUID] = {};

var workers = this._workers[cmdIndex][UUID];

var propFilter = cmdFilter[1];
if(!propFilter) propFilter = "*";

if(!workers[propFilter]) workers[propFilter] = [];

workers[propFilter].push( [workerID, workerOptions ] );




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
```

### <a name="_channelData_getData"></a>_channelData::getData(t)


```javascript
return this._data;
```

### <a name="_channelData_indexOf"></a>_channelData::indexOf(item)


```javascript

if(!item) item = this._data;

if(!this.isObject(item)) {
    item = this._find( item );
}
if(!item) return;

var parent = this._find( item.__p);

if(!parent) return;
if(!this.isArray( parent.data)) return;

return parent.data.indexOf( item );

```

### _channelData::constructor( channelId, mainData, journalCmds )

```javascript

// if no mainData defined, exit immediately
if(!mainData) return;
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
if(!this._objectHash) {
    this._objectHash = {};
}

if(!mainData.__objects) {
    mainData.__objects = [];
}

var me = this;
this._channelId = channelId;
this._data = mainData;
this._workers = {};
this._journal = journalCmds || [];
this._journalPointer = this._journal.length;

var newData = this._findObjects(mainData);
if(newData != mainData ) this._data = newData;

// Then, the journal commands should be run on the object

if(journalCmds && this.isArray(journalCmds)) {
    journalCmds.forEach( function(c) {
        me.execCmd( c, true );
    });
}


```
        
### <a name="_channelData_setWorkerCommands"></a>_channelData::setWorkerCommands(cmdObject)

Notice that all channels are using the same commands.
```javascript

if(!_workerCmds) _workerCmds = {};


for(var i in cmdObject) {
    if(cmdObject.hasOwnProperty(i)) {
        _workerCmds[i] = cmdObject[i];
    }
}
// _workerCmds



```

### <a name="_channelData_toPlainData"></a>_channelData::toPlainData(obj)


```javascript

if(typeof( obj ) == "undefined" ) obj = this._data;

if(!this.isObject(obj)) return obj;

var plain;


if(this.isArray(obj.data)) {
    plain = [];
    var len = obj.data.length;
    for(var i=0; i<len; i++) {
        plain[i] = this.toPlainData( obj.data[i] );
    }
} else {
    plain = {};
    for( var n in obj.data) {
        if(obj.data.hasOwnProperty(n)) {
            plain[n] = this.toPlainData(obj.data[n]);
        }
    }
}

return plain;
```

### <a name="_channelData_writeCommand"></a>_channelData::writeCommand(a)


```javascript
if(!this._cmdBuffer) this._cmdBuffer = [];
this._cmdBuffer.push(a);

```



   
    
## trait _dataTrait

The class has following internal singleton variables:
        
        
### <a name="_dataTrait_guid"></a>_dataTrait::guid(t)


```javascript
return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

```

### <a name="_dataTrait_isArray"></a>_dataTrait::isArray(t)


```javascript
return t instanceof Array;
```

### <a name="_dataTrait_isFunction"></a>_dataTrait::isFunction(fn)


```javascript
return Object.prototype.toString.call(fn) == '[object Function]';
```

### <a name="_dataTrait_isObject"></a>_dataTrait::isObject(t)


```javascript
return t === Object(t);
```


    
    
    
## trait commad_trait

The class has following internal singleton variables:
        
* _listeners
        
* _execInfo
        
* _doingRemote
        
* _cmds
        
* _reverseCmds
        
        
### <a name="commad_trait__cmd_aceCmd"></a>commad_trait::_cmd_aceCmd(a, isRemote)


```javascript
var obj = this._find( a[4] ),
    prop = a[1];
    
if(!obj || !prop) return false;
if(typeof( obj.data[prop] )  != "string" ) return false;

var conv = aceCmdConvert();
obj.data[prop] = conv.runToString( obj.data[prop], a[2]);

_doingRemote = isRemote;

var tmpCmd = [4, prop, obj.data[prop], null, a[4] ];
this._cmd(tmpCmd, obj, null);      

if(!isRemote) {
    this.writeCommand(a); 
} else {
    this._cmd(a, obj, null);
}
_doingRemote = false;
this._fireListener(obj, prop);

return true;

```

### <a name="commad_trait__cmd_createArray"></a>commad_trait::_cmd_createArray(a, isRemote)


```javascript
var objId = a[1];
if(!objId) return false;

var hash = this._getObjectHash();
if(hash[objId]) return false;

// can any object be array or object?

// This is the data right
// plain array object
var newObj = {
    data : {},
//    _n  : null,
//    _p  : null,
//    _fc : null,
    __id : objId,
    __p  : null
};

hash[newObj.__id] = newObj;

this._data.__objects.push( newObj );

if(!(isRemote)) {
    this.writeCommand(a, newObj);
} 
return true;
```

### <a name="commad_trait__cmd_createObject"></a>commad_trait::_cmd_createObject(a, isRemote)


```javascript
var objId = a[1];
if(!objId) return false;

var hash = this._getObjectHash();
if(hash[objId]) return false;

// plain array object
var newObj = {
    data : {},
//    _n  : null,
//    _p  : null,
//    _fc : null,
    __id : objId,
    __p  : null
};

hash[newObj.__id] = newObj;

this._data.__objects.push( newObj );

if(!(isRemote)) {
    this.writeCommand(a, newObj);
} 
return true;
```

### <a name="commad_trait__cmd_moveToIndex"></a>commad_trait::_cmd_moveToIndex(a, isRemote)


```javascript
var obj = this._find( a[4] ),
    prop = "*",
    len = obj.data.length,
    targetObj,
    i = 0;

if(!obj) return false;

var oldIndex = null;

for(i=0; i< len; i++) {
    var m = obj.data[i];
    if(m.__id == a[1]) {
        targetObj = m;
        oldIndex = i;
        break;
    }
}

if(oldIndex != a[3]  ||!targetObj  ) {
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
if(isNaN(targetIndex)) return false;

if(obj.data.length <= i) return false;

_execInfo.fromIndex = i;

obj.data.splice(i, 1);
obj.data.splice(targetIndex, 0, targetObj);
this._cmd(a, obj, targetObj);

if(!(isRemote || _isRemoteUpdate)) {
    this.writeCommand(a);
}           
return true;


```

### <a name="commad_trait__cmd_position"></a>commad_trait::_cmd_position(a, isRemote, noWorkers)


```javascript
/*
The command structure is here now a bit different me thinks

// if there is a position change, it is just a value change.
[ [7, [next, prev]] ]

// the command structure might be
[ 21, [newP, newN, newParent], [oldP, oldN, oldParent], 0, id ]  
obj.set();

// do we create something like command "next" - as a worker command
[ 26, newNext, oldNext, 0, id ]  

*/

var from = a[2],
    to   = a[1],
    obj  = this._find(a[4]);

var oldParent   = this._find( from[2] ),
    newParent   = this._find( to[2] );

// check that current position is valid so that the command can be reversed propery
if((obj._p || from[0])  && ( from[0] != obj._p )) return false;
if((obj._n || from[1])  && ( from[1] != obj._n )) return false;
if((obj.__p || from[2]) && ( from[2] != obj.__p )) return false;

var newPrev = this._find( to[0] );      // the new previous obj
var newNext = this._find( to[1] );      // the next next obj
var newParent = this._find( to[2] );      // the next next obj

if(newPrev) {
    // the position is incorrect
    if(newNext && (newNext._p != newPrev.__id)) return false;
    // the don't have the same parent
    if(newNext && (newNext.__p != newPrev.__p)) return false;
    // if newNext object does not exist then the prev should not have next pointer
    if(!newNext && (newPrev._n)) return false; 
} else {
    // the next should not have previous currently
    if(newNext && (newNext._p)) return false;
    // the object should be under the same parent
    if(newNext && (newNext.__p != newParent.__id)) return false;
    
    if(!newNext) {
        if(newParent && newParent._fc) return false; // the object should not have first child
    }
}

// the other objects must be also updated, if you remove the object or do any other
// changes to the next / previous values
if(obj._p) {
    var oldPrev = this._find( obj._p );  // there will be a change for this object too
    var oldNext = this._find( obj._n );      // the next for the previous
    if(oldNext) {
        oldPrev._n = oldNext.__id;
        oldNext._p = oldPrev.__id;
    } else {
        oldPrev._n = null;               // the oldPrev
    }
} else {
    // if no previous, the object is the first child of the array 
    var parent = this._find( obj.__p); 
    var oldNext = this._find( obj._n );      // the next for the previous
    
    if(parent && oldNext) parent._fc = oldNext.__id;
    if(parent && !oldNext) parent._fc = null;
    if(oldNext) oldNext._p = null;
}

// moving the object is as simple as this
obj._p  = to[0];
obj._n  = to[1];
obj.__p = to[2];

// then update the objects around this object
if(newPrev) {
    var oldNext = this._find( newPrev._n );      // there will be a change for this object too
    if(oldNext) {
        newPrev._n = obj.__id;
        oldNext._p = obj.__id;
    } else {
        newPrev._n = obj.__id;  
    }
} else {
    // if there is not previous, we are also the new firstchild of the parent
    var parent = this._find( obj.__p); 
    if(parent) parent._fc = obj.__id;
    if(newNext) {
        newNext._p = obj.__id;
    } 
}

if(!noWorkers) this._cmd(a);
if(!isRemote)  this.writeCommand(a);


return true;
```

### <a name="commad_trait__cmd_pushToArray"></a>commad_trait::_cmd_pushToArray(a, isRemote)


```javascript
/*
The command structure is here now a bit different me thinks

// if there is a position change, it is just a value change.
[ [7, [next, prev]] ]

// the command 
[ 22, [newP, newN, newParent], [oldP, oldN, oldParent] ]  

*/

var parentObj = this._find( a[4] ),
    insertedObj = this._find( a[2] ),
    toIndex = parseInt( a[1] ),
    oldPos  = a[3],  // old position can also be "null"
    prop = "*",
    index = parentObj.data.length; // might check if valid...


if(!parentObj || !insertedObj) return false;

// NOTE: deny inserting object which already has been inserted
if(insertedObj.__p) return false;
if(isNaN(toIndex)) return false;
if(!this.isArray( parentObj.data )) return;
if( toIndex > parentObj.data.length ) {
    return false;
}

parentObj.data.splice( toIndex, 0, insertedObj );

insertedObj.__p = parentObj.__id;
this._cmd(a, parentObj, insertedObj);

this._moveCmdListToParent(insertedObj);

// Saving the write to root document
if(!isRemote) {
    this.writeCommand(a);
}  

return true;
```

### <a name="commad_trait__cmd_removeObject"></a>commad_trait::_cmd_removeObject(a, isRemote)


```javascript

var parentObj = this._find( a[4] ),
    removedItem = this._find( a[2] ),
    oldPosition = parseInt( a[1] ),
    prop = "*";
    

if(!parentObj || !removedItem) return false;

// NOTE: deny inserting object which already has been inserted
if(!removedItem.__p) return false;

var index = parentObj.data.indexOf( removedItem ); // might check if valid...
if(isNaN(oldPosition)) return false;
if( oldPosition  != index ) {
    return false;
}

// now the object is in the array...
parentObj.data.splice( index, 1 );

// removed at should not be necessary because journal has the data
// removedItem.__removedAt = index;

this._cmd(a, parentObj, removedItem);
removedItem.__p = null; // must be set to null...

// Saving the write to root document
if(!isRemote) {
    this.writeCommand(a);
}        

return true;

```

### <a name="commad_trait__cmd_setMeta"></a>commad_trait::_cmd_setMeta(a, isRemote)


```javascript
var obj = this._find( a[4] ),
    prop = a[1];

if(!prop) return false;

if(prop == "data") return false;
if(prop == "__id") return false;

if(obj) {
    
    if( obj[prop] == a[2] ) return false;

    obj[prop] = a[2]; // value is now set...
    this._cmd(a, obj, null);
    
    // Saving the write to root document
    if(!isRemote) {
        this.writeCommand(a);
    } 
    return true;
} else {
    return false;
}
```

### <a name="commad_trait__cmd_setProperty"></a>commad_trait::_cmd_setProperty(a, isRemote, noWorkers)


```javascript
var obj = this._find( a[4] ),
    prop = a[1];

if(!obj || !prop) return false;

var oldValue = obj.data[prop];

if( oldValue == a[2] ) return false;

if(typeof( oldValue ) != "undefined") {
    if( oldValue != a[3] ) return false;
} else {
    if( this.isObject(oldValue) || this.isArray(oldValue) ) return false;
}

obj.data[prop] = a[2]; // value is now set...

if(!noWorkers) this._cmd(a);

// Saving the write to root document
if(!isRemote) {
    this.writeCommand(a);
} 

return true;

```

### <a name="commad_trait__cmd_setPropertyObject"></a>commad_trait::_cmd_setPropertyObject(a, isRemote)


```javascript
var obj = this._find( a[4] ),
    prop = a[1],
    setObj = this._find( a[2] );

if(!obj || !prop)   return false;
if(!setObj)         return false; 

if(typeof( obj.data[prop]) != "undefined" )  return false;

obj.data[prop] = setObj; // value is now set...
setObj.__p = obj.__id; // The parent relationship
this._cmd(a, obj, setObj);

if(!isRemote) {
    this._moveCmdListToParent(setObj);
    this.writeCommand(a);
} 
return true;
```

### <a name="commad_trait__cmd_unsetProperty"></a>commad_trait::_cmd_unsetProperty(a, isRemote)


```javascript
var obj = this._find( a[4] ),
    prop = a[1];
    
if(!obj || !prop) return false;

if(!this.isObject( obj.data[prop] ) ) return false;

delete obj.data[prop];
if(!isRemote) this.writeCommand(a);
         

return true;
       
```

### <a name="commad_trait__fireListener"></a>commad_trait::_fireListener(obj, prop)


```javascript
if(_listeners) {
    var lName = obj.__id+"::"+prop,
        eList = _listeners[lName];
    if(eList) {
        eList.forEach( function(fn) {
            fn( obj, obj.data[prop] );
        })
    }
}
```

### <a name="commad_trait__moveCmdListToParent"></a>commad_trait::_moveCmdListToParent(t)


```javascript

```

### <a name="commad_trait__reverse_aceCmd"></a>commad_trait::_reverse_aceCmd(a)


```javascript


var obj = this._find( a[4] ),
    prop = a[1];

var conv = aceCmdConvert();

var newCmds = conv.reverse( a[2] );

var tmpCmd = [4, prop, obj.data[prop], null, a[4] ];
var tmpCmd2 = [13, prop, newCmds, null, a[4] ];

var s = conv.runToString( obj.data[prop], newCmds );
obj.data[prop] = s;

// TODO: check that these work, may not be good idea to do both
this._cmd(tmpCmd);      
this._cmd(tmpCmd2);

```

### <a name="commad_trait__reverse_createObject"></a>commad_trait::_reverse_createObject(a)


```javascript
var objId =  a[1];
var hash = this._getObjectHash();
delete hash[objId];

```

### <a name="commad_trait__reverse_moveToIndex"></a>commad_trait::_reverse_moveToIndex(a)


```javascript
var obj = this._find( a[4] ),
    prop = "*",
    len = obj.data.length,
    targetObj,
    i = 0;

var oldIndex = null;

for(i=0; i< len; i++) {
    var m = obj.data[i];
    if(m.__id == a[1]) {
        targetObj = m;
        oldIndex = i;
        break;
    }
}

if(oldIndex != a[2]) {
    throw "_reverse_moveToIndex with invalid index value";
    return;
}

if(targetObj) {
    
    var targetIndex = parseInt(a[3]);
    
    obj.data.splice(i, 1);
    obj.data.splice(targetIndex, 0, targetObj);
    
    var tmpCmd = a.slice();
    tmpCmd[2] = targetIndex;
    tmpCmd[3] = a[2];
    
    this._cmd(tmpCmd);

}
```

### <a name="commad_trait__reverse_position"></a>commad_trait::_reverse_position(a)


```javascript
var newCmd = [22, a[2], a[1],0, a[4]];
return this._cmd_position(newCmd, true, true);

```

### <a name="commad_trait__reverse_pushToArray"></a>commad_trait::_reverse_pushToArray(a)


```javascript
var parentObj = this._find( a[4] ),
    insertedObj = this._find( a[2] ),
    prop = "*",
    index = parentObj.data.length; 
    
// Moving the object in the array
if( parentObj && insertedObj) {
    
    var shouldBeAt = parentObj.data.length - 1;
    
    var item = parentObj.data[shouldBeAt];
    
    // old parent and old item id perhas should be also defined?
    if(item.__id == a[2]) {
        
        // the command which appears to be run, sent to the data listeners
        var tmpCmd = [ 8, shouldBeAt, item.__id,  null,  parentObj.__id  ];
        
        // too simple still...
        parentObj.data.splice( shouldBeAt, 1 ); 
        
        this._cmd(tmpCmd);
    }

}
```

### <a name="commad_trait__reverse_removeObject"></a>commad_trait::_reverse_removeObject(a)


```javascript

var parentObj = this._find( a[4] ),
    removedItem = this._find( a[2] ),
    oldPosition = a[1],
    prop = "*",
    index = parentObj.data.indexOf( removedItem ); // might check if valid...

// Moving the object in the array
if( parentObj && removedItem) {

    // now the object is in the array...
    parentObj.data.splice( oldPosition, 0, removedItem );
    
    var tmpCmd = [7, oldPosition, a[2], null, a[4]];
    this._cmd(tmpCmd);
    
    removedItem.__p = a[4];
}
```

### <a name="commad_trait__reverse_setMeta"></a>commad_trait::_reverse_setMeta(a)


```javascript
var obj = this._find( a[4] ),
    prop = a[1];

if(obj) {
    var tmpCmd = [3, prop, a[3], a[2], a[4] ];
    obj[prop] = a[3];  // the old value
    this._cmd(tmpCmd);
}
```

### <a name="commad_trait__reverse_setProperty"></a>commad_trait::_reverse_setProperty(a)


```javascript
var obj = this._find( a[4] ),
    prop = a[1];

if(obj) {
    var tmpCmd = [4, prop, a[3], a[2], a[4] ];
    obj.data[prop] = a[3];  // the old value
    this._cmd(tmpCmd);
}
```

### <a name="commad_trait__reverse_setPropertyObject"></a>commad_trait::_reverse_setPropertyObject(a)


```javascript

var obj = this._find( a[4] ),
    prop = a[1],
    setObj = this._find( a[2] );

if(!obj) return;
if(!setObj) return;        

delete obj.data[prop];   // removes the property object
setObj.__p = null;

var tmpCmd = [ 10, prop, null, null, a[4] ];
this._cmd(tmpCmd);

```

### <a name="commad_trait__reverse_unsetProperty"></a>commad_trait::_reverse_unsetProperty(a)


```javascript
var obj = this._find( a[4] ),
    removedObj = this._find( a[2] ),
    prop = a[1];

if(obj && prop && removedObj) {


    obj.data[prop] = removedObj;
    removedObj.__p = obj.__id; // The parent relationship
    
    var tmpCmd = [5, prop, removedObj.__id, 0, a[4] ];
    this._cmd(tmpCmd);

}      
```

### <a name="commad_trait_execCmd"></a>commad_trait::execCmd(a, isRemote, isRedo)


```javascript

try {
    if(!this.isArray(a)) return false;
    var c = _cmds[a[0]];
    if(c) {
        var rv =  c.apply(this, [a, isRemote]);
        if(rv && !isRedo) this.writeLocalJournal( a );
        return rv;
    } else {
        return false;
    }
} catch(e) {
    return false;
}
```

### <a name="commad_trait_getJournalLine"></a>commad_trait::getJournalLine(t)


```javascript
return this._journalPointer;
```

### <a name="commad_trait_getLocalJournal"></a>commad_trait::getLocalJournal(t)


```javascript
return this._journal;
```

### commad_trait::constructor( t )

```javascript
if(!_listeners) {
    _listeners = {};
    _execInfo = {};
}


if(!_cmds) {
    
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
    _cmds[21] = this._cmd_position;
    
    _reverseCmds[3] = this._reverse_setMeta;
    _reverseCmds[4] = this._reverse_setProperty;
    _reverseCmds[5] = this._reverse_setPropertyObject;
    _reverseCmds[7] = this._reverse_pushToArray;
    _reverseCmds[8] = this._reverse_removeObject;
    _reverseCmds[10] = this._reverse_unsetProperty;
    _reverseCmds[12] = this._reverse_moveToIndex;
    _reverseCmds[13] = this._reverse_aceCmd;
    _reverseCmds[21] = this._reverse_position;
    // _reverse_setPropertyObject
    
}
```
        
### <a name="commad_trait_redo"></a>commad_trait::redo(n)


```javascript
// if one line in buffer line == 1
var line = this.getJournalLine(); 
n = n || 1;
while( (n--) > 0 ) {
    
    var cmd = this._journal[line];
    if(!cmd) return;
    
    this.execCmd( cmd, false, true );
    line++;
    this._journalPointer++;
}
```

### <a name="commad_trait_reverseCmd"></a>commad_trait::reverseCmd(a)

This function reverses a given command. There may be cases when the command parameters make the command itself non-reversable. It is the responsibility of the framework to make sure all commands remain reversable.
```javascript
console.log("reversing command ", a);
var c = _reverseCmds[a[0]];
if(c) {
    var rv =  c.apply(this, [a]);
    return rv;
}
```

### <a name="commad_trait_reverseNLines"></a>commad_trait::reverseNLines(n)


```javascript
// if one line in buffer line == 1
var line = this.getJournalLine(); 

while( ( line - 1 )  >= 0 &&  ( (n--) > 0 )) {
    var cmd = this._journal[line-1];
    this.reverseCmd( cmd );
    line--;
    this._journalPointer--;
}
```

### <a name="commad_trait_reverseToLine"></a>commad_trait::reverseToLine(index)

0 = reverse all commands, 1 = reverse to the first line etc.
```javascript
// if one line in buffer line == 1
var line = this.getJournalLine(); 

while( ( line - 1 )  >= 0 &&  line > ( index  ) ) {
    var cmd = this._journal[line-1];
    this.reverseCmd( cmd );
    line--;
    this._journalPointer--;
}
```

### <a name="commad_trait_undo"></a>commad_trait::undo(n)


```javascript

if(n===0) return;
if(typeof(n)=="undefined") n = 1;

this.reverseNLines( n );

```

### <a name="commad_trait_writeLocalJournal"></a>commad_trait::writeLocalJournal(cmd)


```javascript

if(this._journal) {
    // truncate on write if length > journalPointer
    if(this._journal.length > this._journalPointer) {
        this._journal.length = this._journalPointer;
    }
    this._journal.push(cmd);
    this._journalPointer++;
}
```


    
    


   
      
    
      
    



      
    




