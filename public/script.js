(function () {
    var canvas = $("#canvas");
    var button = $("#submit");
    var inputSig = $("#signature");

    var ctx = canvas[0].getContext("2d");

    canvas.on("mousedown", function (event) {
        var startLeft = event.clientX - canvas.offset().left;
        var startTop = event.clientY - canvas.offset().top;
        ctx.strokeStyle = "black";
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
        });
    }

    button.on("click", function () {
        var dataUrl = canvas[0].toDataURL("image/jpeg", 0.5);
        inputSig.val(dataUrl);
    });
})();
