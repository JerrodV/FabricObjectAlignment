var Idx = {
    //I will put an instance of the fabric canvas here
    canvas: null,

    //This is just a little helper object so I don't have to repeat it in setup
    rectSettings: {
        width: 100,
        height: 100
    },

    //Called to set up the page
    init: function () {
        //Create the fabric canvas
        Idx.canvas = new fabric.Canvas('fabCanvas', {
            height: 500,
            width: 900
        });

        //I have found having 5 object is good for testing
        Idx.canvas
            //top-left
            .add(new fabric.Rect(Idx.rectSettings).set({
                'fill': '#000'
            }))
            //bottom-left
            .add(new fabric.Rect(Idx.rectSettings).set({
                'fill': '#fc003c',
                'top': Idx.canvas.get('height') - Idx.rectSettings.height
            }))
            //bottom-right
            .add(new fabric.Rect(Idx.rectSettings).set({
                'fill': '#620088',
                'top': Idx.canvas.get('height') - Idx.rectSettings.height,
                'left': Idx.canvas.get('width') - Idx.rectSettings.width
            }))
            //top-right
            .add(new fabric.Rect(Idx.rectSettings).set({
                'fill': '#2d18c7',
                'left': Idx.canvas.get('width') - Idx.rectSettings.width
            }));

        //I want to center the last one.
        var r = new fabric.Rect(Idx.rectSettings).set('fill', '#008821');
        Idx.canvas.add(r);
        r.center();

        //Set up the object alignment object
        AlignObject.setContext(Idx.canvas);

        //Set up the event handlers for this page
        Idx.canvas
            .on('object:moving', Idx.handlers.objectMoving)
            .on('selection:created', Idx.handlers.selectionCreated)
            .on('selection:cleared', Idx.handlers.selectionCleared);

        //Set up the checkboxes that handle the different types 
        $('fieldset#settings').find('input[type="checkbox"]').on('click', Idx.handlers.settingChanged);
    },

    //functions that handle events
    handlers: {
        objectMoving: function (e) {
            //Tell the AlignObject it's time to see if anything lines up.
            AlignObject.updateLines();

            //Update the UI with some info about the object.
            $('#alignChecksMade').html(AlignObject.details.alignmentCheckCount);
            $('#linesDrawn').html(AlignObject.details.linesDrawn);
            $('#linesRemoved').html(AlignObject.details.linesRemoved);
        },
        selectionCreated: function (e) {
            //Tell the AlignObject it's time to see if anything lines up.
            AlignObject.updateLines();
        },
        selectionCleared: function (e) {
            //Tell the AlignObject to clean up till something is selected again.
            AlignObject.removeAllLines();
        },
        settingChanged: function (e) {
            //Set the AlignObject.settings property that matches the ID on the checkbox to its checked state
            var $elem = $(e.target);
            if ($elem) {                
                AlignObject.settings.set($elem.prop('id'), $elem.is(':checked'));
            }
        }
    }
};

//Initialize the page object
$(Idx.init);