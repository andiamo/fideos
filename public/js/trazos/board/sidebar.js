function initSidebar(){
    // Seteo el color en base al data-color de cada uno
    $(".color_button").each(function(index){
        $(this).css('background-color', $(this).data('color'));
    });

    // Setea el color cuando clickea
    $(".color_button").click(function(){
        // Esta es una variable local que esta en andiamo.js
        currColor = STROKE_COLORS[$(this).index()];
        // Cambio el color de la UI
        $(".sidebar_button_color").css('background-color', $(this).data('color'));
    });

    // Menú desplegable de color
    $(".sidebar_button_color").hover(function(){
        $(".drop_color").stop().fadeIn(200);
    },null,0);

    $(".sidebar_button_color").hover(null,function(){
        $(".drop_color").stop().fadeOut(200);
    },400);

    // Menú desplegable de color
    $(".sidebar_weight_button").hover(function(){
        $(".drop_weight").stop().fadeIn(200);
    },null,0);

    $(".sidebar_weight_button").hover(null,function(){
        $(".drop_weight").stop().fadeOut(200);
    },400);

    $(".weight_button_01").click(function(){
        RIBBON_WIDTH = RIBBON_WIDTHS[0];
        $(".weight_point").removeClass('weight_point_tam01 weight_point_tam02 weight_point_tam03 weight_point_tam04');
        $(".weight_point").addClass('weight_point_tam01');
    });

    $(".weight_button_02").click(function(){
        RIBBON_WIDTH = RIBBON_WIDTHS[1];
        $(".weight_point").removeClass('weight_point_tam01 weight_point_tam02 weight_point_tam03 weight_point_tam04');
        $(".weight_point").addClass('weight_point_tam02');
    });

    $(".weight_button_03").click(function(){
        RIBBON_WIDTH = RIBBON_WIDTHS[2];
        $(".weight_point").removeClass('weight_point_tam01 weight_point_tam02 weight_point_tam03 weight_point_tam04');
        $(".weight_point").addClass('weight_point_tam03');
    });

    $(".weight_button_04").click(function(){
        RIBBON_WIDTH = RIBBON_WIDTHS[3];
        $(".weight_point").removeClass('weight_point_tam01 weight_point_tam02 weight_point_tam03 weight_point_tam04');
        $(".weight_point").addClass('weight_point_tam04');
    });

    $(".delete-btn").click(function() {
        // for (var i = 0; i < layers.length; i++) {
        var i = currLayer;
        for (var j = layers[i].length - 1; j >= 0; j--) {
            layers[i][j].looping = false;
            layers[i][j].fadeOutFact = DELETE_FACTOR;
        }
        // }
        var del = {
            'layer': currLayer,
            'id': id
        }
        socket.emit("deleteEvent", del);
    });

    // Botones divididos
    $(".sidebar_button .clickUp, .sidebar_button .clickRight").on("mouseover", function() {
        $(this).parent().addClass("up");
    })
    $(".sidebar_button .clickDown, .sidebar_button .clickLeft").on("mouseover", function() {
        $(this).parent().addClass("down");
    })
    $(".sidebar_button .clickUp, .sidebar_button .clickRight").on("mouseleave", function() {
        $(this).parent().removeClass("up");
    })
    $(".sidebar_button .clickDown, .sidebar_button .clickLeft").on("mouseleave", function() {
        $(this).parent().removeClass("down");
    })
    $(".sidebar_button .wrapperDual").on("click", function() {
        var state = Number( $(this).attr("data-state") );

        if ( $(this).hasClass("down") ) {
            if ( state > 1 ) {
                state--;
                $(this).attr("data-state", state);

                var $img =  $(this).children("img");
                var name = $(this).attr("id");
                $img.attr("src", "../img/" + name + "_" + state + ".svg");
            }
        }
        if ( $(this).hasClass("up") ) {
            var maxState = Number( $(this).attr("data-max-state") );
            if ( state < maxState ) {
                state++;
                $(this).attr("data-state", state);

                var $img =  $(this).children("img");
                var name = $(this).attr("id");
                $img.attr("src", "../img/" + name + "_" + state + ".svg");

            }
        }

        if ( name == "velocidad" ) {
            if (state == 1) {
                fixed = true;
            } else {
                fixed = false;
                LOOP_MULTIPLIER = map(state, 2, 10, 5,0) ;
                console.log("Velocidad: " + LOOP_MULTIPLIER);
            }
        }
        if ( name == "mirar" ) {
            var ascale = map(state, 1,7,0,1);
            console.log("Alpha: " + ascale);
            // currAlpha = 255 * ascale;

            alphaScale[currLayer] = ascale
            for (var i = 0; i < layers[currLayer].length; i++) {
                var gesture = layers[currLayer][i];
                // var ascale = gesture.getAlphaScale();
                // ascale = constrain(ascale - 0.05, 0, 1);
                gesture.setAlphaScale(ascale);
            }


        }
    });
    //Boton loop
    $(".sidebar_button #loop").click(function() {
        if ( !$(this).hasClass("inactive") ) {
            $(this).addClass("inactive");
            var $img =  $(this).children("img");
            $img.attr("src", "../img/girar_2.svg");

            looping = false;
        } else {
            $(this).removeClass("inactive");
            var $img =  $(this).children("img");
            $img.attr("src", "../img/girar_1.svg");

            looping = true;
        }
    });
    // Botones de capa
    $(".wrapperCapa img").on("mouseover", function() {
        if ( !$(this).hasClass("active") ) {
            $(this).attr("src", "../img/capa_hover.svg");
        }
    });
    $(".wrapperCapa img").on("mouseleave", function() {
        if ( !$(this).hasClass("active") ) {
            $(this).attr("src", "../img/capa.svg");
        }
    });
    $(".wrapperCapa img").on("click", function() {
        var numeroCapa = this.className.split(" ")[1].substring(4,5);

        $(".wrapperCapa img").each(function() {
            $(this).attr("src","../img/capa.svg");
            $(this).removeClass("active");
        });
        $(this).attr("src","../img/capa_active.svg");
        $(this).addClass("active");

        var currLayer0 = currLayer;
        currLayer = Number(numeroCapa) - 1;
        if (currLayer0 != currLayer) {
            ascale = alphaScale[currLayer];
            var state = int(map(ascale, 0, 1, 1,7));

            // $(".sidebar_button .wrapperVertical img").each(function() {
            //     $(this).attr("src", "../img/mirar_" + state + ".svg");
            // });

            $(".sidebar_button .wrapperVertical img").attr("src", "../img/mirar_" + state + ".svg");
            $(".sidebar_button .wrapperVertical").attr("data-state", state);
        }
    });
    // Boton delete
    $(".delete-btn img").on("mousedown", function() {
        $(this).attr("src", "../img/tacho_click.svg");
    });
    $(".delete-btn img").on("mouseup", function() {
        setTimeout( function() {
            $(".delete-btn img").attr("src", "../img/tacho.svg");
        }, 600);
    });

    // Share button
    $(".share-btn").click(function(){
        $(".share-btn").prop('disabled', true);
        $(".share-btn img").attr("src","../img/share_click.svg");
        setTimeout( function() {
            $(".share-btn img").attr("src", "../img/share.svg");
            $(".share-btn").prop('disabled', false);
        }, 400);

        if($("#share-modal").is(':visible')){
            $("#share-modal").fadeOut();
            modals_open--;
        }else{
            $("#share-modal").fadeIn();
            modals_open++;
            $(".shareDialogInput").val(window.location.href);
            $(".shareDialogInput").focus();
            $(".shareDialogInput").select();
        }
    })

    $("#share-modal .fa-link").click(function (){
        $(".shareDialogInput").focus();
        $(".shareDialogInput").select();
    })

    $('#chat-slider').slideReveal({
        trigger: $(".chat-btn"),
        push:false,
        width:'40%',
        show: openChat,
        hide: hideChat
    });

    $('.login-form').submit(function(){
        if (chat.$usernameInput.val()) {
            setUsername();
        }
        return false;
    });

    $('.enter-chat').click(function(){
        if (chat.$usernameInput.val()) {
            setUsername();
        }
    });

    $('.chat-form').submit(function(){
        sendMessage();
        socket.emit('stop typing');
        typing = false;
        return false;
    });

    // Share social media
    $(".gif-btn").click(function(){
        gif.toggleModal();
    })

    // Share social media
    $(".onboarding-btn").click(function(){
        $("#onboarding-modal").fadeIn();   
    })

    // Close dialogs
    $(".chat-close-button").click(function(){
        $('#chat-slider').slideReveal("hide");
        $(".chat-slider").fadeOut();
    });

    $("#share-modal .close-button").click(function(){
        $("#share-modal").fadeOut();
        modals_open--;
    });

    $("#gif-modal .close-button").click(function(){
        $("#gif-modal").fadeOut();
        modals_open--;
    });

    $("#gif-modal").on('click','#regenerate', function (event) {
        gif.regenerateGif();
    });

    $("#gif-modal").on('click','#uploadGif', function (event) {
        gif.uploadGif();
    });

    $("#gif-modal").on('click','#link', function (event) {
        gif.copyLink();
    });

    $("#gif-modal").on('click','#download', function (event) {
        gif.download();
    });


    $(".shareLinkMailto").on('click', function (event) {
        event.preventDefault();
        var email = "";
        var subject = 'Invitación al tablero';
        var emailBody = 'Ingresa a este tablero: '+window.location.href;
        window.location = 'mailto:' + email + '?subject=' + subject + '&body=' +   emailBody;
    });

}