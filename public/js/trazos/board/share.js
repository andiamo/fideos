document.getElementById('shareBtn').onclick = function() {
    FB.ui({
        method: 'share',
        display: 'popup',
        quote: "¡Únete a mi tablero y creemos un dibujo juntos!",
        href: window.location.href,
    }, function(response){});
}

function createGif(){
    saveFrames("out", "png", 5, 10, function(data) {
        const urlSplit = window.location.href.split('/');
        const hostAndPort = urlSplit[0] + '//' + urlSplit[2] + '/';

        var r = canvas.width / canvas.height;
        var gifw = 500;
        var gifh = Math.round(gifw / r);

        var uploadToGiphy = function(data){
            return  $.ajax({
                type: "POST",
                url: 'http://upload.giphy.com/v1/gifs',
                data: {
                    'api_key':'phMDT8Jy1QVT2ftqfB8XKbRoaG0RDT7K',
                    'username':'trazosclub',
                    'source_image_url' : hostAndPort + data.filename,
                    'tags': 'trazos,trazosclub,processing,collaborative,drawing,draw'
                },
                success: function(data) {
                    console.log("Successful upload!");
                    console.log(data);
                },
                error: function(obj){
                    console.log("There was an error when uploading to Giphy");
                    console.log(data);
                },
                dataType: 'json'
            });

        };

        var images = []
        for (var i = 0; i < data.length; i++) {
            images.push(data[i].imageData);
        }

        gifshot.createGIF({'images': images,
            'gifWidth': gifw, 'gifHeight': gifh}, function(obj) {
            if(!obj.error) {
                var image = obj.image;
                // println("success :)");
                $.ajax({
                    type: "POST",
                    url: hostAndPort + 'files',
                    data: image,
                    success: function(data) {
                        uploadToGiphy(data).success(function () {

                        }).error(function () {

                        })
                        // console.log('Exported gif: ' + hostAndPort + data.filename);
                        // window.alert('Exported!');
                    },
                    error: function(obj){println("no luck...");println(obj);},
                    dataType: 'json'
                });
            } else {
                println("error :(");
            }

        });
    });
}

