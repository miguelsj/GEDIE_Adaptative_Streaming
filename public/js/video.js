var dashPlayer = null;
var hls = null;
$(document).ready(function () {
     
    // GET ELEMENTS
    $videoPlayer = $('#video-player').get(0);
    // $audioPlayer = $('#audio-player').get(0);
    $btnPlay = $('#btn-play');
    $btnPause = $('#btn-pause');
    $btnOmit = $('#btn-omit');
    $indexPlayList = -1;
    $currentRoutine = "home_routine"; // Default
    var textTrackSubtitles = $('#video-player').get(0).textTracks[2];
    
    
    // VIDEO PLAYER
    $($videoPlayer).on('loadedmetadata', function () {
        ClearAllTextTracks();
        updateMaxHeight();
        // loadChapters();
        loadSubtitles();
        textTrackSubtitles.mode = 'hidden';
        
        
    });

    $($videoPlayer).on('click', function () {
        $icon = $(this).siblings('.play-icon');

        $icon.show().animate({
            opacity: 0
        }, 500, function () {
            $icon.hide().css({ opacity: 1 });
        });

        if (this.paused) {
            this.play();
            $btnPlay.click();
            $icon.find('i').removeClass('fa-pause').addClass('fa-play');
        } else {
            this.pause();
            $btnPause.click();
            $icon.find('i').removeClass('fa-play').addClass('fa-pause');
        }
    });

    $($videoPlayer).on('play', function () {
        $('.muscle-container').show();
        loadDescriptions();
        loadMuscles()
    });

    // $($videoPlayer).on('ended', function () {
    //     $audioPlayer.pause();
    // });

    //AUDIO
    $('#volume-range').on('input', function () {
        var volumeValue = $(this).val();
        $videoPlayer.volume = volumeValue;
        // $audioPlayer.volume = volumeValue;

        if ($videoPlayer.volume == 0) {
            $('#btn-sound').hide();
            $('#btn-mute').show();
        } else {
            $('#btn-sound').show();
            $('#btn-mute').hide();
        }
    });

    $('.btn-volume').on('click', function () {
        if ($(this).attr('id') === "btn-mute") {
            // $audioPlayer.volume = 0.20;
            $videoPlayer.volume = 0.20;
            $('#volume-range').get(0).value = 0.20;
        } else {
            // $audioPlayer.volume = 0;
            $videoPlayer.volume = 0;
            $('#volume-range').get(0).value = 0;
        }
        $('.btn-volume').toggle();
    });


    // BUTTON PLAY & PAUSE
    $('.btn-video').on('click', function () {
        if ($(this).attr('id') == 'btn-play') {
            playVideo();

        } else {
            pauseVideo();
        }
    });

    //BUTTON RESOLUTION
    $('#resolution-select').change(function () {
        var x = 1;
        var resolution = $(this).val();

        if (resolution == "Auto") {
            if (Hls.isSupported() && x == 1) {
                $(this).find('option:selected').text("Auto: HLS" );
                $(this).addClass("hls-color");
                $(this).removeClass("dash-color");
                useHls();
                
            } 
            else {
                $(this).find('option:selected').text("Auto: DASH" );
                $(this).addClass("dash-color");
                $(this).removeClass("hls-color");
                useDash();
            }   
         } 
         
        //else {
        //     var $source = $($videoPlayer).find('source').eq(0);
        //     var $source2 = $($videoPlayer).find('source').eq(1);
        //     var currentSrc = $source.attr('src');
        //     var fileName = currentSrc.split('/').pop();
        //     var words = fileName.split('_'); // Dividir el nombre del archivo en palabras usando el guion bajo como separador
        //     var videoName = words.slice(0, -1).join('_'); // Obtener todas las palabras excepto la última (la extensión del archivo) 
    
        //     var wasPlaying = !$videoPlayer.paused;
        //     var tempTime = $videoPlayer.currentTime;
        //     var videoUrlmp4 = './video/mp4/' + resolution + '/' + videoName + '_' + resolution + '.mp4';
        //     var videoUrlwebm = './video/webm/' + resolution + '/' + videoName + '_' + resolution + '.webm';
        //     $source.attr('src', videoUrlmp4);
        //     $source2.attr('src', videoUrlwebm);
    
        //     $videoPlayer.load();
        //     $videoPlayer.currentTime = tempTime;
    
        //     if (wasPlaying) {
        //         $videoPlayer.play();
        //         // $audioPlayer.play();
        //     }
        // }
    })
    /* CAMBIAR CALIDAD HLS/DASH */

    $('#quality-select').change(function() {
        // Obtener el índice de la opción seleccionada
        var qualityIndex = $(this).prop('selectedIndex');
        changeQuality(qualityIndex)
        // Cambiar la calidad de reproducción
        
    });
    
    function changeQuality(qualityIndex) {
        var wasPlaying = !$videoPlayer.paused;
        cTime = $videoPlayer.currentTime;
                // Verificar si el índice de calidad es válido
                if ($UsingPlayer === "HLS"){
                if (qualityIndex <= 4) {
                    // Cambiar la calidad de reproducción
                    hls.currentLevel = qualityIndex;   
                } else {
                    hls.currentLevel = -1;
                }
            } else {
                if (qualityIndex <= 4) {
                    dashPlayer.updateSettings({streaming: {abr: {autoSwitchBitrate: {video: false}}}})
                    dashPlayer.setQualityFor('video', parseInt(qualityIndex), true);
                    console.log("Calidad cambiada a: " + qualityIndex); // Para depuración
                } else {
                    dashPlayer.updateSettings({streaming: {abr: {autoSwitchBitrate: {video: true}}}})
                }
            }
                $videoPlayer.currentTime = cTime;
                    if (wasPlaying) {
                        $videoPlayer.play();
                    }
        
    }

    // BUTTON OMIT
    $('#chapter-track').on('cuechange', showOmit);
    $($btnOmit).on('click', omitRest);

    //BUTTON CC
    $('#btn-cc').on('click', function () {
        if (textTrackSubtitles.mode === 'showing') {
            textTrackSubtitles.mode = 'hidden';
        } else if (textTrackSubtitles.mode === 'hidden') {
            textTrackSubtitles.mode = 'showing';
        }
    });

    // TIME BAR
    $($videoPlayer).on('timeupdate', updateTimeBar);

    $('#time-container').on('click', '.time-chapter', function (e) {
        var chapterDuration = $(this).data('end') - $(this).data('start');
        var portionClicked = (e.pageX - $(this).offset().left) / $(this).width();

        $videoPlayer.currentTime = $(this).data('start') + (chapterDuration * portionClicked);
        // $audioPlayer.currentTime = $videoPlayer.currentTime;

        $indexPlayList = $(this).data('index');
    });

    $('#time-container').on('mousemove', '.time-chapter', function (e) {
        var position = e.pageX - $(this).parent('#time-container').offset().left;
        $('#frame-img').attr('src', './img/miniaturas/' + $(this).data('exercise').toLowerCase() + '.png')

        var width = $('#frame-img').width();
        $('#frame-img').css('left', position - (width / 2)).show();
    });

    $('#time-container').on('mouseleave', function () {
        $('#frame-img').hide();
        $('#frame-img').attr('src', '');
    });

    // FULL SIZE
    $('#btn-full').on('click', function () {
        toggleFullScreen();
    });



    
    // Evento de clic para el botón "Debug"
    $('#btn-debug').click(function() {
        if ($("#debug-info").is(":visible")) {
            $("#debug-info").hide();
        } else {
            $("#debug-info").show();
            actualizarDebugInfo();
        }
        // Alternar la visibilidad del cuadro de información 
    });

    function actualizarDebugInfo() {
        var calidadActual;
        if ($UsingPlayer === "HLS") {
            if (Hls.isSupported()) {
                calidadActual = hls.currentLevel;
                $("#debug-info").html("REPRODUCTOR: <span class='blue-text'>" + $UsingPlayer + "</span> CALIDAD: " + calidadActual);
            }
        } else if ($UsingPlayer === "Dash") {
            var calidadIndex = dashPlayer.getQualityFor('video');
            //var calidad = dashPlayer.getBitrateInfoListFor($videoPlayer)[calidadIndex];
            $("#debug-info").html("REPRODUCTOR: <span class='green-text'>" + $UsingPlayer + "</span> CALIDAD: " + calidadIndex);

        }
        // Actualizar el cuadro de texto cada segundo (1000 milisegundos)
        setInterval(actualizarDebugInfo, 2000);
    }

    $('#resolution-select').val('Auto').change();
});

//#region Functions

function getCueByTime(track, time) {

    if (track.cues != undefined && track.cues.length > 0) {
        for (var i = 0; i < track.cues.length; i++) {
            var cue = track.cues[i];
            if (cue.startTime <= time && cue.endTime >= time) {
                return cue;
            }
        }
    }
}

function playVideo() {
    $videoPlayer.play();
    $btnPause.show();
    $btnPlay.hide();
    
    // $audioPlayer.play();
}

function pauseVideo() {
    $videoPlayer.pause();
    $btnPlay.show();
    $btnPause.hide();
    // $audioPlayer.pause();
}

function omitRest() {
    $.getJSON("./json/" + $currentRoutine + ".json", function (data) {
        var playList = data.playList;
        loadNextExercise(playList);
    });
}

function showOmit() {
    var cue = getCurrentCue('chapters');

    if (cue != undefined) {
        if (cue.text === "Descanso") {
            $btnOmit.show().animate({ opacity: 0.5 });
        } else {
            $btnOmit.hide().animate({ opacity: 0 });
        }
    }
}

function updateTimeBar() {
    var timeChapters = $('.time-chapter');
    var lapseFound = false;
    $.each(timeChapters, function (i, timeChapter) {
        endTime = $(this).data('end');

        if ($(this).data('index') < $indexPlayList) {
            $(this).children('.time-bar').css('width', '100%');
        }
        else if ($(this).data('index') > $indexPlayList) {
            $(this).children('.time-bar').css('width', '0%');
        } else {
            timeBarDuration = $(this).data('end') - $(this).data('start');
            timeBarLapse = $videoPlayer.currentTime - $(this).data('start');
            $(this).children('.time-bar').css('width', (timeBarLapse / timeBarDuration * 100) + '%');
            lapseFound = true;
        }
    });
}

function toggleFullScreen() {

    if (!document.fullscreenElement &&
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        if ($videoPlayer.requestFullscreen) {
            $videoPlayer.requestFullscreen();
        } else if ($videoPlayer.msRequestFullscreen) {
            $videoPlayer.msRequestFullscreen();
        } else if ($videoPlayer.mozRequestFullScreen) {
            $videoPlayer.mozRequestFullScreen();
        } else if ($videoPlayer.webkitRequestFullscreen) {
            $videoPlayer.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

function useHls() {
    $UsingPlayer = "HLS";
    const config = {
        startPosition: 60.01
    };   
    if (Hls.isSupported()) {
        hls = new Hls(config);
        hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            console.log('video and hls.js are now bound together !');
        });
        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        console.log('manifest loaded, found ' + data.levels.length + ' quality level',);
        console.log('Available levels:', data.levels);
        });
            
        hls.loadSource('./video/dash_hls+/master.m3u8');
        hls.attachMedia($videoPlayer);
        var currentQualityLevel = hls.currentLevel;
        console.log('Nivel de calidad actual:' + currentQualityLevel);

    } 
}

function useDash() {
    $UsingPlayer = "Dash";
    console.log('Using DASH');
    var manifestUrl = "./video/dash_hls+/master.mpd#t=60.01";

    // Inicializar dashPlayer solo si no se ha inicializado antes
        console.log("Creando...")
        dashPlayer = dashjs.MediaPlayer().create();
        dashPlayer.initialize($videoPlayer, manifestUrl, true);
        console.log("Inicializado")
 }



// function init(currentTime){
//         url = "./video/dash_hls/master.mpd#t=" + currentTime

//         video = document.querySelector("video");
//         player = dashjs.MediaPlayer().create();

//         player.initialize(video, url, true);
//         
    
// }
//#endregion