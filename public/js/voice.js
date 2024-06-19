$(document).ready(function() {
    startVoiceRecognition();
});

function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript.trim().toLowerCase();

        switch(transcript) {
            case "saltar descanso":
                omitRest();
                break;
            case "siguiente ejercicio":
                $.getJSON("./json/" + $currentRoutine + ".json", function (data) {
                    var playList = data.playList;
                    loadNextExercise(playList);
                });
                break;
            case "play":
            case "inicia":
                playVideo();
                break;
            case "pausa":
            case "para":
                pauseVideo();
                break;
            case "mostrar músculos":
                $("#muscles-nav-item a").click();
                break;
            case "mostrar descripción":
                $("#description-nav-item a").click();
                break;
            case "mostrar entrenador":
                $("#trainer-nav-item a").click();
                break;
            case "personalizar rutina":
                $("#custom-nav-item a").click();
                break;
            case "mostrar rutinas":
                $("#routines-nav-item a").click();
                break;
            case "ocultar rutinas":
                $("#arrow-up").click();
                break;
            case "mostrar información de calidades":
            case "ocultar información de calidades":
                $("#btn-debug").click();
                break;
        }
    };

    recognition.onend = function() {
        recognition.start(); // Reinicia el reconocimiento para continuar escuchando
    };

    recognition.start();
}