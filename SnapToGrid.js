AlignObject = {    
    _topSet: false,
    _leftSet: false,
    _ignoreSnap: false,//For Debug Only
    _drawBounds: false,//True to draw bounding lines around selected object being rotated
    lines: {
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
        //We no longer need to get these from the UI. I've set the previously null values above.
        //get: function () {
        //    AlignObject.settings.align = true;//If false, this code is a brick.
        //    AlignObject.settings.box = true;
        //    AlignObject.settings.outer = true;
        //    AlignObject.settings.origin = true;            
        //    return AlignObject.settings;
        //},
        settingsChanged: function () {
            AlignObject.removeAllLines();
            AlignObject.settings.get();
            var ao = project.editor.selectedObject.cur;
            if (ao) {
                AlignObject.updateLines();
            }
        }
    },      
    updateLines: function (skewing) {
        //console.info('updating lines');
        var obj = project.editor.selectedObject.cur;
        var canvas = null;
        if (obj && obj.isType('group')) {
            if (obj.item(0)) {
                canvas = obj.item(0).canvas;
            }
        }
        else {
            canvas = obj.canvas;
        }

        if (!canvas) { return; }

        if (!AlignObject.settings.align || !obj) {
            AlignObject.removeAllLines(canvas);            
            return;
        }

        AlignObject._leftSet = false;
        AlignObject._topSet = false;
        //This is to compensate for a staking issue in fabric.
        //To see the bug; Comment the next line and stack all of the objects by center origin. 
        //The last one you try to stack will be dragged behind the previous one.           
        //canvas.bringToFront(obj);

        //Set up an object representing its current position           
        var curPos = new Pos(obj);
        //$('#curObj').html(JSON.stringify(curPos, null, '\t'));
        //Set up an object that will let us be able to keep track of newly created lines
        for (var _m in AlignObject.lines.matches) { AlignObject.lines.matches[_m] = false; }

        //Get the objects from the canvas
        var objects = canvas.getObjects();

        var settings = AlignObject.settings;

        //For each object
        for (var i in objects) {
            
            var thisObj = objects[i];
            
            var groupContainsObj = obj.contains && obj.contains(objects[i]) || false;


            //If the object we are looking at is a line or the object being manipulated, skip it
            if (thisObj === obj || thisObj.get('type') === 'line' || groupContainsObj || thisObj.elementType == 'pageNumber') { continue; }

            //Set up an object representing the position of the canvas objects                
            var objPos = new Pos(thisObj);
            //$('#compObj').html(JSON.stringify(objPos, null, '\t'));
            //thisObj.set({ originX: 'left', originY: 'top' }).setCoords();

            //I added this to smooth out the snapping. It was a little twitchy without it.
            var topSet = false, leftSet = false;


            //Look at all sides and the origins of the object and see if the object being manipulated aligns.            
            ///*//Box////////////////////////////////////
            if (settings.box) {

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
                    //*/
                }
                //*/

            }
            //*/

            ///*//Origin////////////////////////////////////
            if (settings.origin) {
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
            }
            //*/

            ///*//Outer////////////////////////////////////
            if (settings.outer) {

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
                    canvas.remove(line);
                    AlignObject.lines[j] = null;
                }

            }
        }
        canvas.renderAll();
    },
    drawLine: function (side, pos) {
        var ln = null;        
        if (!project.editor.selectedObject.cur.canvas) { return; }
        var cDims = {
            height: project.editor.selectedObject.cur.canvas.height,
            width: project.editor.selectedObject.cur.canvas.width
        };

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
        project.editor.selectedObject.cur.canvas.add(ln).renderAll();
    },
    removeAllLines: function (canvas) {
        for (var i in AlignObject.lines) {
            if (AlignObject.lines[i]) {
                project.editor.selectedObject.cur.canvas.remove(AlignObject.lines[i]);               
            }
        }
        bloprojectssom.editor.selectedObject.cur.canvas.renderAll();
    },
    alignTolerance: 6 * project.canvasScale,
    inRange: function (val1, val2) {
        return Math.max(val1, val2) - Math.min(val1, val2) <= AlignObject.alignTolerance;
    },
    snap: function (side, pos) {
        if (project.editor.selectedObject.cur) {
            AlignObject.originToTopLeft(project.editor.selectedObject.cur);
            if (AlignObject._ignoreSnap || AlignObject._leftSet && side === 'left' || AlignObject._topSet && side === 'top') { return; }
            project.editor.selectedObject.cur.set(side, Math.floor(pos)).setCoords();
            AlignObject['_' + side] = true;            
            AlignObject.originToCenter(project.editor.selectedObject.cur);
        }
    }, 
    skewTo: function (side, pos) {

    },
    drawBounds: function (obj) {
        var obj = project.editor.selectedObject.cur;
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
        var width = obj.getWidth();
        var height = obj.getHeight();

        var newLeft = obj.getLeft() - (width / 2);
        obj.set("left", newLeft);

        var newTop = obj.getTop() - (height / 2);
        obj.set("top", newTop);

        obj.set("originX", "left").set("originY", "top");

        obj.setCoords();

    },
    originToCenter: function (obj) {
        obj.setCoords();
        var width = obj.getWidth();
        var height = obj.getHeight();

        var newLeft = obj.getLeft() + (width / 2);
        obj.set("left", newLeft);

        var newTop = obj.getTop() + (height / 2);
        obj.set("top", newTop);

        obj.set("originX", "center");
        obj.set("originY", "center");

        obj.setCoords();
    }
    
};

///This little object was really helpful in keeping track of what I was trying to line up.
var Pos = function (fabobj) {
    var originCoords = fabobj.getPointByOrigin();
    AlignObject.originToTopLeft(fabobj);
    this.hasAngle = fabobj.get('angle') != 0;
    this.bounds = fabobj.getBoundingRect();
    this.top = parseInt(this.hasAngle ? this.bounds.top : fabobj.getTop());
    this.left = parseInt(this.hasAngle ? this.bounds.left : fabobj.getLeft());
    this.height = parseInt(this.hasAngle ? this.bounds.height : fabobj.getHeight() - 1);
    this.width = parseInt(this.hasAngle ? this.bounds.width : fabobj.getWidth() - 1);
    this.right = parseInt(this.left + this.width);
    this.bottom = parseInt(this.top + this.height);
    this.center = parseInt(originCoords.x);
    this.middle = parseInt(originCoords.y);
    AlignObject.originToCenter(fabobj);
};
