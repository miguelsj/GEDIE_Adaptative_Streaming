$(document).ready(function () {

    $('#video-player').on('ended', function () {
        loadDescriptions();
        loadMuscles()
    });

    $($videoPlayer).on('timeupdate', updateCurrentTime);

    $('#chapter-track').on('cuechange', function () {
        loadDescriptions();
        loadMuscles()
    });
});

//#region Functions

function updateCurrentTime() {
    
    // console.log("CT:" + $videoPlayer.currentTime);
    $.getJSON("./json/" + $currentRoutine + ".json", function (data) {
        var playList = data.playList;

        if ($indexPlayList == -1) {
            
            
            loadNextExercise(playList);
        }
        else {
            var currentExercise = playList[$indexPlayList];
            var startTime = getStartTime(currentExercise.key);
            var endTime = getEndTime(currentExercise.key);

            if ($videoPlayer.currentTime >= endTime || $videoPlayer.currentTime < startTime) {
                
                loadNextExercise(playList);
            }
        }

        
    });
    
        
    
    
}

function loadNextExercise(playList) {
    if ((playList.length - 1) > $indexPlayList) {
        var nextExercise = playList[++$indexPlayList];
        playExercise(nextExercise.key)
    } else {
        $videoPlayer.pause(); // End of the video
    }
}

function playExercise(exercise) {
    var cue = getChapterByName(exercise);

    if (cue != undefined) {
        $videoPlayer.currentTime = cue.startTime;
    }
}

function getChapterByName(exercise) {
    var chapterTrack = getTrackByKind('chapters');
    chapterTrack.mode = "hidden";

    var chapterCue;
    $.each(chapterTrack.cues, function (i, cue) {
        if (exercise.toLowerCase() == cue.text.toLowerCase()) {
            chapterCue = cue;
        }
    });

    return chapterCue;
}

function loadChapters() {
    $indexContainer.empty();
    $indexContainer.append('<h2><span class="icon">Indice</span></h2>');

    var chapterTrack = getTrackByKind('chapters');

    chapterTrack.mode = "hidden";

    var cues = chapterTrack.cues;

    if (cues.length == 0) return false;

    $.getJSON("./json/" + $currentRoutine + ".json", function (data) {
        var playList = data.playList;
        addCuesToMenu(playList);
    });
}

function addCuesToMenu(cues) {
    var counter = 1;
    var time = 0;
    $.each(cues, function (i, cue) {
        var hidden = "";
        if (cue.key == "Descanso") {
            hidden = "hidden";
            counter--;
        }
   
        var $fila = $('<div class="d-flex align-items-center ' + hidden + '"><span class="col-10">' + (counter++) + ' - ' + cue.key + ' (' + new Date(time * 1000).toISOString().slice(11, 19) + ')</div>');
        var start = getStartTime(cue.key);
        var end = getEndTime(cue.key);
        time += (end - start);
        
        $fila.on({
            click: function () {
                $videoPlayer.currentTime = start;
                // $audioPlayer.currentTime = start;
                $indexPlayList = i;
                $videoPlayer.play();
            }
        });
        
        if ($currentRoutine == "custom") {
            var $deleteIcon = $('</span><i class="col-2 fa-solid fa-trash-can delete-icon"></i>');

            $deleteIcon.on({
                click: function() {
                    $.ajax({
                        url: '/delete-custom',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({i: i}),
                        success: function(response) {
                            console.log('Nodo eliminado exitosamente', response);
                            $indexPlayList = -1;
                            loadChapters();
                        },
                        error: function(xhr, status, error) {
                            console.error('Error al borrar el nodo:', error);
                        }
                    });
                }
            });

            $fila.append($deleteIcon);
        }
        $indexContainer.append($fila);
    });

    loadTimebar(cues);
}

function getStartTime(exercise) {
    var chapterTrack = getTrackByKind('chapters');
    chapterTrack.mode = "hidden";
    var cues = chapterTrack.cues;
    var startTime;
    $.each(cues, function (i, cue) {
        if (cue.text.toLowerCase() == exercise.toLowerCase()) {
            startTime = cue.startTime;
        }
    });
    return startTime;
}

function getEndTime(exercise) {
    var chapterTrack = getTrackByKind('chapters');

    chapterTrack.mode = "hidden";

    var cues = chapterTrack.cues;
    var endTime;
    $.each(cues, function (i, cue) {
        if (cue.text.toLowerCase() == exercise.toLowerCase()) {
            endTime = cue.endTime;
        }
    });
    return endTime;
}

function loadMuscles() {
    var metadata = getCurrentCue('metadata');

    if (metadata != undefined) {
        metadata.mode = "hidden";

        var jsonObj = $.parseJSON(metadata.text);
        if (jsonObj.muscle != undefined) {
            $('#muscle-front').attr('src', './img/muscle/' + jsonObj.muscle + '_front.png').show();
            $('#muscle-back').attr('src', './img/muscle/' + jsonObj.muscle + '_back.png').show();
        } else {
            $('#muscle-front').attr('src', '').hide();
            $('#muscle-back').attr('src', '').hide();
        }
    }
}

function loadTimebar(cues) {
    $('#time-container').empty();

    var duration = getVideoDuration(cues);

    $.each(cues, function (i, cue) {
        var startTime = getStartTime(cue.key);
        var endTime = getEndTime(cue.key);

        var $fila = $('<div class="time-chapter btn-config" data-index="' + i + '" data-exercise="' + cue.key + '" data-start="' + startTime + '" data-end="' + endTime + '"><div class="time-bar"></div></div>');

        $fila.css('width', (endTime - startTime) / duration * 100 + '%');

        $('#time-container').append($fila);
    });
}

function getVideoDuration(cues) {
    var duration = 0;
    $.each(cues, function (i, cue) {
        duration += getEndTime(cue.key) - getStartTime(cue.key);
    });
    return duration;
}


function loadTracks(videoName) {
    var chapterTrackSrc = './vtt/chapters/' + videoName + '.vtt';
    var descriptionTrackSrc = './vtt/descriptions/' + videoName + '.vtt';
    var subtitlesTrackSrc = './vtt/subtitles/' + videoName + '.vtt'
    var metadataTrackSrc = './vtt/metadata/' + videoName + '.vtt'

    $('#chapter-track').attr('src', chapterTrackSrc);
    $('#description-track').attr('src', descriptionTrackSrc);
    $('#subtitle-track').attr('src', subtitlesTrackSrc)
    $('#metadata-track').attr('src', metadataTrackSrc)

    $videoPlayer.load();
}

function getCurrentCue(textTrackKind) {
    var track = getTrackByKind(textTrackKind);
    track.mode = 'hidden';

    if (track.cues != undefined && track.cues.length > 0) {
        for (var i = 0; i < track.cues.length; i++) {
            var cue = track.cues[i];
            if (cue.startTime <= $videoPlayer.currentTime && cue.endTime >= $videoPlayer.currentTime) {
                return cue;
            }
        }
    }
}

function getTrackByKind(kind) {
    var textTracks = $videoPlayer.textTracks;

    for (let i = 0; i < textTracks.length; i++) {
        if (textTracks[i].kind === kind) {
            return textTracks[i];
        }
    }
    return null;
}

function loadDescriptions() {
    var tiempoActual = $videoPlayer.currentTime;

    var descriptionTrack = getTrackByKind('descriptions');
    descriptionTrack.mode = "hidden"; // Ocultar la pista de descripciones por defecto

    var cueActual = null; // la cue inicial es null

    for (var i = 0; i < descriptionTrack.cues.length; i++) { //miramos todas las cues
        var cue = descriptionTrack.cues[i];
        if (cue.startTime <= tiempoActual && cue.endTime >= tiempoActual) {
            cueActual = cue;
            break;//salimos de la iteracion cuando encontramos la cue actual
        }
    }
    if (cueActual) {
        $('#exercise-description-container').text(cueActual.text);
    } else {
        $('#exercise-description-container').empty();
    }
}

function loadSubtitles() {
    var subtitlesTrack = getTrackByKind('subtitles');
    subtitlesTrack.mode = 'showing';
}

function ClearAllTextTracks() {
    for (var i = 0; i < 3; i++) {
        var track = $('#video-player').get(0).textTracks[i];
        track.mode = 'disabled';
    }
}

//#endregion
