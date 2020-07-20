(function () {
    var canvas = $("#canvas");
    var button = $("#submit");
    var inputSig = $("#signature");

    var ctx = canvas[0].getContext("2d");

    canvas.on("mousedown", function (event) {
        var startLeft = event.clientX - canvas.offset().left;
        var startTop = event.clientY - canvas.offset().top;
        ctx.strokeStyle = "#900c3f";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startLeft, startTop);
        sign();
    });

    function sign() {
        canvas.on("mousemove", function (event) {
            var left = event.clientX - canvas.offset().left;
            var top = event.clientY - canvas.offset().top;
            ctx.lineTo(left, top);
            ctx.stroke();
        });

        canvas.on("mouseup", function () {
            ctx.closePath();
            canvas.off("mousemove");
            button.on("click", function () {
                var dataUrl = canvas[0].toDataURL("image/png", 0.5);
                inputSig.val(dataUrl);
            });
        });
    }

    ///touch///

    canvas.on("touchstart", function (event) {
        event.preventDefault();
        var start = event.changedTouches[0];
        console.log("start: ", start);
        // var startLeft = start.offsetX;
        // var startTop = start.offsetY;
        var startLeft = start.pageX - canvas.offset().left;
        var startTop = start.pageY - canvas.offset().top;
        ctx.strokeStyle = "#900c3f";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startLeft, startTop);
        touchSign();
    });

    function touchSign() {
        canvas.on("touchmove", function (event) {
            event.preventDefault();
            var move = event.changedTouches[0];
            // var left = move.offsetX;
            // var top = move.offsetY;
            var left = move.pageX - canvas.offset().left;
            var top = move.pageY - canvas.offset().top;
            ctx.lineTo(left, top);
            ctx.stroke();
        });

        canvas.on("touchend", function () {
            ctx.closePath();
            canvas.off("touchmove");
            button.on("click", function () {
                var dataUrl = canvas[0].toDataURL("image/png", 0.5);
                inputSig.val(dataUrl);
            });
        });
    }
})();
