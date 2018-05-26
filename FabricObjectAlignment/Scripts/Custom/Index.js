Idx = {
    jversion: null,
    canvas: null,    
    rectSettings: {
        width: 100,
        height: 100,
        color: null
    },
    init: function () { 
        Idx.jversion = jQuery.fn.jquery;
        $('#version').append(Idx.jversion);
        Idx.canvas = new fabric.Canvas('fabCanvas', { height: 500, width: 900 });
        //I have found having 5 object is good for testing
        Idx.canvas
            //top-left
            .add(new fabric.Rect(Idx.rectSettings).set({ 'fill': '#000' }))
            //bottom-left
            .add(new fabric.Rect(Idx.rectSettings).set({ 'fill': '#fc003c', 'top': Idx.canvas.get('height') - Idx.rectSettings.height }))
            //bottom-right
            .add(new fabric.Rect(Idx.rectSettings).set({
                'fill': '#620088',
                'top': Idx.canvas.get('height') - Idx.rectSettings.height,
                'left': Idx.canvas.get('width') - Idx.rectSettings.width
            }))
            //top-right
            .add(new fabric.Rect(Idx.rectSettings).set({ 'fill': '#2d18c7', 'left': Idx.canvas.get('width') - Idx.rectSettings.width }));
        //I want to center the last one.
        var r = new fabric.Rect(Idx.rectSettings).set('fill', '#008821');
        Idx.canvas.add(r);
        r.center();

        Idx.events.init();
    },
    events: {
        init: function () {
            //Idx.canvas.
        }
    }
};

$(Idx.init)