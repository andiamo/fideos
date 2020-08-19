var firstGesture = false;

function setFirstGesture(){
    firstGesture = true;
    $(".first-gesture").fadeIn();
    $("#onboarding-modal button.next").addClass("active");
}

function initOnboarding(runIntro = false){
    
    $("#onboarding-modal button.next").on("click",function(index){
        var intro = introJs();
        intro.setOption("exitOnOverlayClick", "false");
        intro.setOption("showBullets", false);
        intro.setOption("nextLabel", "Siguiente");
        intro.setOption("prevLabel", "Anterior");
        intro.setOption("skipLabel", "Cerrar");
        intro.setOption("doneLabel", "Terminar");
        intro.start();
        $("#onboarding-modal").fadeOut();   
    });

    $("#onboarding-modal button.close").on("click",function(index){
        $("#onboarding-modal").fadeOut();   
    });

    if(runIntro){
        $("#onboarding-modal").fadeIn();   
    }
}