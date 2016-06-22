$( function() {
    $('#fullpage').fullpage({
        sectionSelector : "section",
        // anchors : [ "intro", "quienesSomos", "dondeVenimos", "contacto" ],
        afterLoad : function(anchorLink, index) {
            $("nav a").removeClass("active");
            if ( index >= 2 ) {
                $("nav a").eq(index - 2).addClass("active");
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
        // var url = $("form").attr("action");
        // $(this).attr("enabled", false);
        // $(this).text("enviando...");
        //
        // $.post(url, $("form").serialize(), function() {
        //     alert("cool");
        //     $(this).text("Enviado!");
        // });
        alert("funciona");
    });
});
