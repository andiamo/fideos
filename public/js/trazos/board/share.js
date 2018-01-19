document.getElementById('shareBtn').onclick = function() {
    FB.ui({
        method: 'share',
        display: 'popup',
        href: window.location.href,
    }, function(response){});
}