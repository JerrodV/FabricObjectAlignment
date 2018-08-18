var AlignObject = {
    //This will hold the fabric canvas
    _ctx: null,
    //These next two are used repeatedly
    _topSet: false,
    _leftSet: false,
    _ignoreSnap: false,//For Debug Only
    _drawBounds: false,//True to draw bounding lines around selected object being rotated    
    alignTolerance: 6 * 1,//We may want to cover canvas scaling. If that is the case, the 1 can be set to a variable for manipulation
    details: {
        alignmentCheckCount: 0,
        linesDrawn: 0,
        linesRemoved: 0
    },
    lines: {
        //This object represents the possible lines we might draw
        //The matches sub-object lets me keep track of lines that need to be removed. I may change this later.
        //Box Lines
        top: null,
        left: null,
        right: null,
        bottom: null,
            //Box Origin -- This is used when both Box and Origin are on 
            //It will tell the ui to match the bounds to the object being manipulated to the origins of other objects 
            topToMiddle: null,
            bottomToMiddle: null,
            leftToCenter: null,
            rightToCenter:null,
        //Origin
        center: null,
        middle: null,
        //Outer
        topToBottom: null,
        leftToRight: null,
        rightToLeft: null,
        bottomToTop: null,
            //Outer Origin -- This is used when both Outer and Origin are on 
            middleToTop: null,
            middleToBottom: null,
            centerToLeft: null,
            centerToRight:null,

        matches: {
            //Box
            top: false,
            left: false,
            right: false,
            bottom: false,
            topToMiddle: false,
            bottomToMiddle: false,
            leftToCenter: false,
            rightToCenter: false,
            //Origin
            center: false,
            middle: false,
            //Outer
            topToBottom: false,
            leftToRight: false,
            rightToLeft: false,
            bottomToTop: false,
            middleToTop: false,
            middleToBottom: false,
            centerToLeft: false,
            centerToRight: false
        }
    },
    settings: {
        align: true,
        box: true,
        outer: true,
        origin: true,
        set: function (name, value) {
            AlignObject.settings[name] = value;
            AlignObject.settings.settingsChanged();
        },
        settingsChanged: function () {
            AlignObject.removeAllLines();
            var obj = AlignObject._ctx.getActiveObject();
            if (obj) {
                AlignObject.updateLines();
            }
        }
    },      
    setContext: function (fabricCanvas) {
        AlignObject._ctx = fabricCanvas;
    },
    updateLines: function (skewing) {
        
        var obj = AlignObject._ctx.getActiveObject();        
        
        if (!AlignObject.settings.align || !obj) {
            AlignObject.removeAllLines();            
            return;
        }

        AlignObject._leftSet = false;
        AlignObject._topSet = false;

        //Set up an object representing its current position           
        var curPos = new Pos(obj);
        //$('#curObj').html(JSON.stringify(curPos, null, '\t'));
        //Set up an object that will let us be able to keep track of newly created lines
        for (var _m in AlignObject.lines.matches) { AlignObject.lines.matches[_m] = false; }
        var objects = AlignObject._ctx.getObjects();
        //For each object
        for (var i in objects) {
            
            var thisObj = objects[i];
            
            var groupContainsObj = obj.contains && obj.contains(thisObj) || false;


            //If the object we are looking at is a line or the object being manipulated, skip it
            if (thisObj === obj || thisObj.get('type') === 'line' || groupContainsObj || thisObj.elementType === 'pageNumber') { continue; }

            //Set up an object representing the position of the canvas objects                
            var objPos = new Pos(thisObj);

            //I added this to smooth out the snapping. It was a little twitchy without it.
            var topSet = false, leftSet = false;

            //Look at all sides and the origins of the object and see if the object being manipulated aligns.            
            ///*//Box////////////////////////////////////
            if (AlignObject.settings.box) {                
                ///*//Top////////////////////////////////////
                if (AlignObject.inRange(objPos.top, curPos.top)) {
                    //We match. If we don't already have a line on that side, add one.
                    if (!AlignObject.lines.top) {
                        AlignObject.drawLine('top', objPos.top);
                        //Snap the object to the line
                        if (skewing) { /*coming soon*/ }
                        else {                            
                            !curPos.hasAngle && !skewing && AlignObject.snap('top', objPos.top+.5);
                        }                        
                    }
                }
                //*/
                
                ///*//Left////////////////////////////////////
                if (AlignObject.inRange(objPos.left, curPos.left)) {
                    if (!AlignObject.lines.left) {
                        AlignObject.drawLine('left', objPos.left);
                        if (skewing) { /*coming soon*/ }
                        else {
                            !curPos.hasAngle && AlignObject.snap('left', objPos.left+.5);
                        }                        
                    }
                }
                //*/
                
                ///*//Right////////////////////////////////////
                if (AlignObject.inRange(objPos.right, curPos.right)) {
                    if (!AlignObject.lines.right) {
                        AlignObject.drawLine('right', objPos.right);
                        if (skewing) { /*coming soon*/ }
                        else {
                            !curPos.hasAngle && AlignObject.snap('left', (objPos.right - curPos.width));
                        }
                    }
                }
                //*/
                ///*//Bottom////////////////////////////////////
                if (AlignObject.inRange(objPos.bottom, curPos.bottom)) {
                    if (!AlignObject.lines.bottom) {
                        AlignObject.drawLine('bottom', objPos.bottom);
                        if (skewing) { /*coming soon*/ }
                        else {
                            !curPos.hasAngle && AlignObject.snap('top', (objPos.bottom - curPos.height)+.75);
                        }
                    }
                }
                
                ///*//Box Origin////////////////////////////////////
                if (settings.origin) {
                    //*/
                    ///*//Origin: Top to Middle////////////////////////////////////
                    if (AlignObject.inRange(objPos.middle, curPos.top)) {
                        if (!AlignObject.lines.topToMiddle) {
                            AlignObject.drawLine('topToMiddle', objPos.middle);
                            if (skewing) { /*coming soon*/ }
                            else {
                                !curPos.hasAngle &&  AlignObject.snap('top', objPos.middle);
                            }
                        }
                    }
                    AlignObject.details.alignmentCheckCount++;
                    //*/
                    ///*//Origin: Bottom to Middle////////////////////////////////////
                    if (AlignObject.inRange(objPos.middle, curPos.bottom)) {
                        if (!AlignObject.lines.bottomToMiddle) {
                            AlignObject.drawLine('bottomToMiddle', objPos.middle);
                            if (skewing) { /*coming soon*/ }
                            else {
                                !curPos.hasAngle && AlignObject.snap('top', objPos.middle - curPos.height);
                            }
                        }
                    }
                    AlignObject.details.alignmentCheckCount++;
                    //*/
                    ///*//Origin: Left to Center////////////////////////////////////
                    if (AlignObject.inRange(objPos.center, curPos.left)) {
                        if (!AlignObject.lines.leftToCenter) {
                            AlignObject.drawLine('leftToCenter', objPos.center);
                            if (skewing) { /*coming soon*/ }
                            else {
                                !curPos.hasAngle && AlignObject.snap('left', objPos.center);
                            }
                        }
                    }
                    AlignObject.details.alignmentCheckCount++;
                    //*/
                    ///*//Origin: Right to Center////////////////////////////////////
                    if (AlignObject.inRange(objPos.center, curPos.right)) {
                        if (!AlignObject.lines.rightToCenter) {
                            AlignObject.drawLine('rightToCenter', objPos.center);
                            if (skewing) { /*coming soon*/ }
                            else {
                                !curPos.hasAngle && AlignObject.snap('left', objPos.center - curPos.width);
                            }
                        }
                    }
                    AlignObject.details.alignmentCheckCount++;
                    //*/
                }
                //*/
            }
            //*/

            ///*//Origin////////////////////////////////////
            if (AlignObject.settings.origin) {
                AlignObject.details.alignmentCheckCount++;
                ///*//Center////////////////////////////////////
                if (AlignObject.inRange(objPos.center, curPos.center)) {
                    if (!AlignObject.lines.center) {
                        AlignObject.drawLine('center', objPos.center);
                        if (skewing) { /*coming soon*/ }
                        else {
                            !curPos.hasAngle && AlignObject.snap('left', objPos.center - parseInt(curPos.width / 2));
                        }
                    }
                }
                //*/
                AlignObject.details.alignmentCheckCount++;
                ///*//Middle////////////////////////////////////
                if (AlignObject.inRange(objPos.middle, curPos.middle)) {
                    if (!AlignObject.lines.middle) {
                        AlignObject.drawLine('middle', objPos.middle);
                        if (skewing) { /*coming soon*/ }
                        else {
                            !curPos.hasAngle && AlignObject.snap('top', objPos.middle - parseInt(curPos.height / 2));
                        }   
                    }
                }
                //*/
                AlignObject.details.alignmentCheckCount++;
            }
            //*/

            ///*//Outer////////////////////////////////////
            if (AlignObject.settings.outer) {

                ///*//Top To Bottom
                if (AlignObject.inRange(objPos.bottom, curPos.top)) {
                    if (!AlignObject.lines.topToBottom) {
                        AlignObject.drawLine('topToBottom', objPos.bottom);
                        if (skewing) { /*coming soon*/ }
                        else {
                            !curPos.hasAngle && AlignObject.snap('top', objPos.bottom);
                        }  
                    }
                }
                //*/
                ///*//Left To Right
                if (AlignObject.inRange(objPos.right, curPos.left)) {
                    if (!AlignObject.lines.leftToRight) {
                        AlignObject.drawLine('leftToRight', objPos.right);
                        if (skewing) { /*coming soon*/ }
                        else {
                            !curPos.hasAngle && AlignObject.snap('left', objPos.right);
                        }
                    }
                }
                //*/
                ///*//Right To Left
                if (AlignObject.inRange(objPos.left, curPos.right)) {
                    if (!AlignObject.lines.rightToLeft) {
                        AlignObject.drawLine('rightToLeft', objPos.left);
                        if (skewing) { /*coming soon*/ }
                        else {
                            !curPos.hasAngle && AlignObject.snap('left', objPos.left - curPos.width);
                        }
                    }
                }
                //*/
                ///*//Bottom to Top
                if (AlignObject.inRange(objPos.top, curPos.bottom)) {
                    if (!AlignObject.lines.bottomToTop) {
                        AlignObject.drawLine('bottomToTop', objPos.top);
                        if (skewing) { /*coming soon*/ }
                        else {
                            !curPos.hasAngle && AlignObject.snap('top', objPos.top - curPos.height);
                        }
                    }
                }
                //*/

                ///*//Outer Origin 
                if (settings.origin) {
                    ///*//Middle to Top
                    if (AlignObject.inRange(objPos.top, curPos.middle)) {
                        if (!AlignObject.lines.middleToTop) {
                            AlignObject.drawLine('middleToTop', objPos.top);                            
                            if (skewing) { /*coming soon*/ }
                            else {
                                !curPos.hasAngle && AlignObject.snap('top', objPos.top - parseInt(curPos.height / 2));
                            }
                        }
                    }
                    //*/
                    ///*//Middle to Bottom
                    if (AlignObject.inRange(objPos.bottom, curPos.middle)) {
                        if (!AlignObject.lines.middleToBottom) {
                            AlignObject.drawLine('middleToBottom', objPos.bottom);                            
                            if (skewing) { /*coming soon*/ }
                            else {
                                !curPos.hasAngle && AlignObject.snap('top', objPos.bottom - parseInt(curPos.height / 2));
                            }
                        }
                    }
                    //*/
                    ///*//Center to Left
                    if (AlignObject.inRange(objPos.left, curPos.center)) {
                        if (!AlignObject.lines.centerToLeft) {
                            AlignObject.drawLine('centerToLeft', objPos.left);                            
                            if (skewing) { /*coming soon*/ }
                            else {
                                !curPos.hasAngle && AlignObject.snap('left', objPos.left - parseInt(curPos.width / 2));
                            }
                        }
                    }
                    //*/
                    ///*//Center to Right
                    if (AlignObject.inRange(objPos.right, curPos.center)) {
                        if (!AlignObject.lines.centerToRight) {
                            AlignObject.drawLine('centerToRight', objPos.right);                           
                            if (skewing) { /*coming soon*/ }
                            else {
                                !curPos.hasAngle && AlignObject.snap('left', objPos.right - parseInt(curPos.width / 2));
                            }
                        }
                    }
                    //*/
                }
                //*/
            }
            //*/

            ///*//Look at the side we match on. If we did not match, and we have a line, remove the line.
            for (var j in AlignObject.lines.matches) {
                var m = AlignObject.lines.matches[j];
                var line = AlignObject.lines[j];
                if (!m && line) {
                    AlignObject._ctx.remove(line);
                    AlignObject.details.linesRemoved++;
                    AlignObject.lines[j] = null;
                }

            }
        }
        AlignObject._ctx.renderAll();
    },
    drawLine: function (side, pos) {
        AlignObject.details.linesDrawn++;
        var ln = null;        
        if (!AlignObject._ctx) { return; }
        var cDims = {
            height: AlignObject._ctx.height,
            width: AlignObject._ctx.width
        };

        //I made some false assumptions when I started this. It probably does not need to be in a switch
        switch (side) {
            //Horizontal
            case 'top':
            case 'bottom':
            case 'middle':
            case 'topToBottom':
            case 'bottomToTop':
            case 'topToMiddle':
            case 'bottomToMiddle':
            case 'middleToTop':
            case 'middleToBottom':            
                ln = new fabric.Line([cDims.width, 0, 0, 0], {
                    left: 0,
                    top: pos,
                    strokeDashArray: [1, 2],
                    stroke: 'rgb(178, 207, 255)',
                    selectable: false
                });
                break;
            //Vertical
            case 'left':
            case 'right':
            case 'center':   
            case 'leftToRight':
            case 'rightToLeft':
            case 'leftToCenter':
            case 'rightToCenter': 
            case 'centerToLeft':
            case 'centerToRight':
                ln = new fabric.Line([0, cDims.height, 0, 0], {
                    left: pos,
                    top: 0,
                    strokeDashArray: [1, 2],
                    stroke: 'rgb(178, 207, 255)',
                    selectable:false
                });                
                break;
        }
        AlignObject.lines[side] = ln;
        AlignObject.lines.matches[side] = true;
        AlignObject._ctx.add(ln).renderAll();
    },
    removeAllLines: function () {
        for (var i in AlignObject.lines) {
            if (AlignObject.lines[i]) {
                AlignObject._ctx.remove(AlignObject.lines[i]);     
                AlignObject.details.linesRemoved++;
            }
        }
        AlignObject._ctx.renderAll();
    },    
    inRange: function (val1, val2) {
        AlignObject.details.alignmentCheckCount++;
        return Math.max(val1, val2) - Math.min(val1, val2) <= AlignObject.alignTolerance;
    },
    snap: function (side, pos) {
        var obj = AlignObject._ctx.getActiveObject();
        if (obj) {            
            if (AlignObject._ignoreSnap || AlignObject._leftSet && side === 'left' || AlignObject._topSet && side === 'top') { return; }
            obj.set(side, Math.floor(pos)).setCoords();
            AlignObject['_' + side] = true;
        }
    }, 
    skewTo: function (side, pos) {
        //My client chose not to add a snap when scaling
    },
    drawBounds: function (obj) {
        obj = obj || AlignObject._ctx.getActiveObject();
        //Don't log anything in this function or you will hate it        
        if (!obj || !AlignObject._drawBounds) { return; }
        obj.setCoords();
        var bounds = obj.getBoundingRect();
        obj.canvas.contextContainer.strokeStyle = '#555';
        obj.canvas.contextContainer.strokeRect(
            bounds.left,
            bounds.top,
            bounds.width,
            bounds.height
        );
    },
    originToTopLeft: function (obj) {
        obj.setCoords();
        var width = obj.get('width');
        var height = obj.get('height');

        var newLeft = obj.get('left') - width / 2;
        obj.set("left", newLeft);

        var newTop = obj.get('top') - height / 2;
        obj.set("top", newTop);

        obj.set("originX", "left").set("originY", "top");

        obj.setCoords();

    },
    originToCenter: function (obj) {
        obj.setCoords();
        var width = obj.get('width');
        var height = obj.get('height');

        var newLeft = obj.get('left') + width / 2;
        obj.set("left", newLeft);

        var newTop = obj.get('top') + height / 2;
        obj.set("top", newTop);

        obj.set("originX", "center");
        obj.set("originY", "center");

        obj.setCoords();
    }    
};

///This little object was really helpful in keeping track of what I was trying to line up.
var Pos = function (fabobj) {
    var originCoords = fabobj.getPointByOrigin();    
    this.hasAngle = fabobj.get('angle') !== 0;
    this.bounds = fabobj.getBoundingRect();
    this.top = parseInt(this.hasAngle ? this.bounds.top : fabobj.get('top'));
    this.left = parseInt(this.hasAngle ? this.bounds.left : fabobj.get('left'));
    this.height = parseInt(this.hasAngle ? this.bounds.height : fabobj.get('height') - 1);
    this.width = parseInt(this.hasAngle ? this.bounds.width : fabobj.get('width') - 1);
    this.right = parseInt(this.left + this.width);
    this.bottom = parseInt(this.top + this.height);
    this.center = parseInt(originCoords.x);
    this.middle = parseInt(originCoords.y);    
};
