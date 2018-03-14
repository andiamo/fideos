document.getElementById('shareBtn').onclick = function() {
    FB.ui({
        method: 'share',
        display: 'popup',
        quote: "¡Únete a mi tablero y creemos un dibujo juntos!",
        href: window.location.href,
    }, function(response){});
}

var gif = (function(){
    const urlSplit = window.location.href.split('/');
    const hostAndPort = urlSplit[0] + '//' + urlSplit[2] + '/';

    var currentGif = null;
    var currentGiphyId = null;
    var giphyResponse = null;
    var $modal = $("#gif-modal");
    var $spinner = $("#gif-modal .trazos-spinner");
    var $msg = $("#gif-modal .msg");
    var $gif = $("#gif-modal .gif");
    var $buttons = $("#gif-modal .buttons");
    var toggleModal = function(){
        if($modal.is(':visible')){
            $modal.fadeOut();
            modals_open--;
        }else{
            $modal.fadeIn();
            currentGif = null;
            $gif.html("");
            $buttons.css("opacity",0);
            $msg.html("Generando GIF");
            $spinner.fadeIn();
            createGif(function (_gif) {
                if(!_gif.error) {
                    gif.currentGif = _gif.image;
                    showGif(gif.currentGif);
                    $msg.html("");
                    $spinner.fadeOut();
                    $buttons.css("opacity",0.9);
                    setInternalButtons();
                    console.log("Gif created successfuly")
                } else {
                    console.log("Error creating gif")
                }
            });
            modals_open++;
        }

    }

    var setInternalButtons = function(){
        $buttons.html('<button id="regenerate"><span class="fa fa-refresh" aria-hidden="true"></span>\n' +
            '                        <p class="note">Generar de nuevo</p></button>\n' +
            '                    <a id="uploadGif"><span class="fa fa-upload" aria-hidden="true"></span>\n' +
            '                        <p class="note">Subir a GIPHY y compartir</p> </a>')
    }

    var setGIPHYButtons = function(id){
        $buttons.html('<button id="link"><span class="fa fa-link" aria-hidden="true"></span>\n' +
            '                        <p class="note">Copiar link</p></button>\n' +
            '                    <a id="download" download><span class="fa fa-download" aria-hidden="true"></span>\n' +
            '                        <p class="note">Descargar</p> </a>')
    }

    var showGif = function(_gif){
        animatedImage = document.createElement('img');
        animatedImage.src = _gif;
        animatedImage.height = 200;
        $gif.html(animatedImage);
    }

    var regenerateGif = function(){
        $gif.html("");
        $buttons.css("opacity",0);
        $msg.html("Generando GIF");
        $spinner.fadeIn();
        createGif(function (_gif) {
            if(!_gif.error) {
                gif.currentGif = _gif.image;
                showGif(_gif.image);
                $msg.html("");
                $spinner.fadeOut();
                $buttons.css("opacity",0.9);
                console.log("Gif created successfuly")
            } else {
                console.log("Error creating gif")
            }
        });
    }

    var createGif = function(cb){
        var r = canvas.width / canvas.height;
        var gifw = 500;
        var gifh = Math.round(gifw / r);
        saveFrames("out", "png", 3, 7, function(data) {
            var images = []
            for (var i = 0; i < data.length; i++) {
                images.push(data[i].imageData);
            }
            var settings = {
                'images': images,
                'gifWidth': gifw,
                'gifHeight': gifh
            };
            gifshot.createGIF(settings, function(obj) {
                console.log("Success creating GIF");
                return cb(obj);
            });
        });
    }

    var uploadToServer = function(cb){
        $.ajax({
            type: "POST",
            url: hostAndPort + 'files',
            data: gif.currentGif,
            success: function(data) {
                console.log("Success uploading to server");
                cb(data)
            },
            error: function(obj){
                console.log("Error uploading to server");
                cb(obj);
            },
            dataType: 'json'
        });
    }

    var uploadToGiphy = function(data){
        $gif.html("");
        $buttons.css("opacity",0);
        $msg.html("Preparando GIF");
        $spinner.fadeIn();

        uploadToServer(function (data) {
            $msg.html("Subiendo GIF a GIPHY");
            $.ajax({
                type: "POST",
                url: 'http://upload.giphy.com/v1/gifs',
                data: {
                    'api_key':'phMDT8Jy1QVT2ftqfB8XKbRoaG0RDT7K',
                    'username':'trazosclub',
                    'source_image_url' : hostAndPort + data.filename,
                    'tags': 'trazos,trazosclub,processing,collaborative,drawing,draw'
                },
                success: function(data) {
                    showGif(gif.currentGif);
                    $msg.html("");
                    $spinner.fadeOut();
                    $buttons.css("opacity",0.9);
                    giphyResponse = data;
                    gif.currentGiphyId = giphyResponse.data.id;
                    setGIPHYButtons();
                    console.log("Success uploading to giphy");
                    console.log(data);
                },
                error: function(data){
                    showGif(gif.currentGif);
                    $msg.html("");
                    $spinner.fadeOut();
                    $buttons.css("opacity",0.9);
                    $msg.html("Algo salió mal subiendo el GIF, proba de nuevo!");
                    setInternalButtons();
                    setTimeout(function(){
                        $msg.html("");
                    },3000)
                    console.log("There was an error when uploading to Giphy");
                    console.log(data);
                },
                dataType: 'json'
            });
        });
    };

    var copyLink = function () {
        if(gif.currentGiphyId){
            $("#giphyLink").html("https://media.giphy.com/media/"+gif.currentGiphyId+"/giphy.gif");
            document.getElementById("giphyLink").select();
            document.execCommand("Copy");
            $msg.html("¡Copiado!");
            setTimeout(function(){
                $msg.html("");
            },1500)
        }else{
            $msg.html("Algo salió mal subiendo el GIF, proba de nuevo!");
            setTimeout(function(){
                $msg.html("");
            },3000)
        }

    };

    var download = function () {
        $("#download").attr("href","https://media.giphy.com/media/"+gif.currentGiphyId+"/giphy.mp4");
    };

    return {
        currentGif:currentGif,
        regenerateGif:regenerateGif,
        toggleModal:toggleModal,
        uploadGif:uploadToGiphy,
        copyLink:copyLink,
        download:download
    }
})();

