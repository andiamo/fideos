document.getElementById('shareBtn').onclick = function() {
    FB.ui({
        method: 'share',
        display: 'popup',
        quote: "¡Únete a mi tablero y creemos un dibujo juntos!",
        href: window.location.href,
    }, function(response){});
}