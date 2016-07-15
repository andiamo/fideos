$( function() {
    $('#fullpage').fullpage({
        sectionSelector : "section",
        // anchors : [ "intro", "quienesSomos", "dondeVenimos", "contacto" ],
        afterLoad : function(anchorLink, index) {
            $("nav a").removeClass("active");

            switch ( index ) {
                case 2:
                    $("nav a").eq(0).addClass("active");
                    break;
                case 3: // de donde venimos y a donde vamos deben activarse los dos
                    $("nav a").eq(1).addClass("active");
                    $("nav a").eq(2).addClass("active");
                    break;
                case 4:
                    $("nav a").eq(3).addClass("active");
                    break;
            }
        },
        onLeave: function(index, nextIndex, direction) {
            if ( nextIndex == 4 ) {
                $("header").addClass("hide")
            } else {
                $("header").removeClass("hide")
            }
        }
    });

    $("#btnEnviar").click(function() {
        var url = $("form").attr("action");
        $this = $(this);
        $this.attr("disabled", true);
        $this.text("enviando...");

        $.post(url, $("form").serialize(), function() {
            $this.text("Enviado! Muchas gracias.");
            $this.addClass("enviado");
        });
        // alert("funciona");
    });
});
