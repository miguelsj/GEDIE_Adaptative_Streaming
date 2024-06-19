$(document).ready(function () {

    // VARIABLES
    let net;
    let modelLoaded = false;
    let videoLoaded = false;
    const TIME_PERIOD = 100;

    // GET ELEMENTS
    $userVideo = $('#user-video').get(0);
    $videoCanvas = $('#video-player-canvas').get(0);

    // ALLOW CAMERA RECORDING
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            $userVideo.srcObject = stream;
        })
        .catch(function (err) {
            console.error('Error accessing the camera: ', err);
        });

    // INITIALIZE VIDEO CONTAINERS
    $('#video-player').on('loadeddata', function () {
        $userVideo.width = $userVideo.offsetWidth;
        $userVideo.height = $userVideo.offsetHeight;
        $videoCanvas.width = $userVideo.width;
        $videoCanvas.height = $userVideo.height;
        videoLoaded = true;
        checkIfReady();
    });

    // LOAD POSE NET MODEL
    loadModel().then(() => {
        modelLoaded = true;
        checkIfReady();
    });

    $('#trainer-nav-item a').on('click', function() {
        $("#trainer-info").show();
    })

    $('#muscles-nav-item a').on('click', function() {
        $("#trainer-info").hide();
    })

    $('#description-nav-item a').on('click', function() {
        $("#trainer-info").hide();
    })
    
    
    //#region AI Functions

    async function loadModel() {
        net = await posenet.load();
        checkIfReady();
    }

    function checkIfReady() {
        if (modelLoaded && videoLoaded) {
            setInterval(updateFeedback, TIME_PERIOD);
        }
    }
 
    async function getUserPose() {
        const pose = await net.estimateSinglePose($userVideo, {
            flipHorizontal: false
        });
        return pose.keypoints;
    }

    async function getVideoPose() {
        const canvasContext = $videoCanvas.getContext('2d');
        canvasContext.drawImage($videoPlayer, 0, 0, $videoCanvas.width, $videoCanvas.height);

        const pose = await net.estimateSinglePose($videoCanvas, {
            flipHorizontal: false
        });
        return pose.keypoints;
    }

    function calculateSimilarity(userPose, videoPose, canvasWidth, canvasHeight) {
        let distAccumulated = 0;
        var metadata = getCurrentCue('metadata');

        var validKeyPoints = undefined;
        if (metadata != undefined) {
            metadata.mode = "hidden";
            var jsonObj = $.parseJSON(metadata.text);
            validKeyPoints = jsonObj.keyPoints;
        }

        for (let i = 0; i < userPose.length; i++) {

            if (validKeyPoints != undefined && !validKeyPoints.includes("all") && !validKeyPoints.includes(userPose[i].part)) {
                continue;
            }

            const dx = userPose[i].position.x - videoPose[i].position.x;
            const dy = userPose[i].position.y - videoPose[i].position.y;

            let distance = Math.sqrt(dx * dx + dy * dy);
            distance += distance * (1 - userPose[i].score)

            if (userPose[i].score <= 0.5) {
                distAccumulated += Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
            }
            else if (videoPose[i].score >= 0.7) {
                distAccumulated += distance; // Lower distance means higher similarity
            }

            /******************************************* TEMPORAL CODE ONLY FOR DEBUG ************************************/
            if (userPose[i].score >= 0.7) {
                drawRedRectangle(userPose[i].position.x, userPose[i].position.y, userPose[i].part, distance, "user-video");
            } else {
                removeRedRectangle(userPose[i].part);
            }

            // if (videoPose[i].score >= 0.7) {
            //     drawRedRectangle(videoPose[i].position.x, videoPose[i].position.y, videoPose[i].part + "_video", 100 - videoPose[i].score*100, "video-player");
            // } else {
            //     removeRedRectangle(videoPose[i].part + "_video");
            // }
            /*************************************************************************************************************/
        }

        var length = videoPose.length;
        if (validKeyPoints != undefined && validKeyPoints.length > 0){
            length = validKeyPoints.length
        }
        const maxScore = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight) * length;
        const similarity = (1 - (distAccumulated / maxScore)) * 100;
        return similarity;
    }

    async function updateFeedback() {
        
        var cue = getCurrentCue('chapters');
        if ($userVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && isTrainerModeActive() && cue != undefined && cue.text !== "Descanso") {
            const userPose = await getUserPose();
            const videoPose = await getVideoPose();

            const similarity = calculateSimilarity(userPose, videoPose, $videoCanvas.width, $videoCanvas.height);
            showFeedback(similarity.toFixed(2));
            console.log(`Similitud: ${similarity.toFixed(2)}%`);
        }
    }

    function showFeedback(score) {
        var trainerInfoDiv = $("#trainer-info");
        if (score >= 0 && score < 30) {
            trainerInfoDiv.addClass('fatal').text('😞 Fatal');
        } else if (score >= 30 && score < 50) {
            trainerInfoDiv.addClass('regular').text('😕 Regular');
        } else if (score >= 50 && score < 70) {
            trainerInfoDiv.addClass('bien').text('😊 Bien');
        } else if (score >= 70 && score < 90) {
            trainerInfoDiv.addClass('genial').text('😀 Genial');
        } else if (score >= 90 && score <= 100) {
            trainerInfoDiv.addClass('perfecto').text('🏆 Perfecto');
        }
    }

    function isTrainerModeActive() {
        var trainerMode = $('#trainer-nav-item a');
        return trainerMode.hasClass('active');
    }

    //#endregion
});




/******************************************* TEMPORAL CODE ONLY FOR DEBUG ************************************/
function drawRedRectangle(x, y, id, distance, container) {
    // Verificar si ya existe un elemento con el mismo ID y borrarlo si es necesario
    const existingRect = $('#' + id);
    if (existingRect.length > 0) {
        existingRect.remove();
    }

    // Obtener el offset del elemento '#user-video'
    const userVideoOffset = $("#" + container).offset();

    // Calcula las coordenadas X e Y relativas al vídeo
    const absoluteX = userVideoOffset.left + x - 15;
    const absoluteY = userVideoOffset.top + y + 35;

    // Creamos un nuevo elemento div para el rectángulo
    const rectangle = $('<div id="' + id + '">' + id + '</div>');

    let color = "red";
    if (distance <= 25) {
        color = "green";
    } else if (distance <= 50) {
        color = "orange";
    }

    // Aplicamos estilos CSS al rectángulo
    rectangle.css({
        position: 'absolute',
        left: absoluteX + 'px', // Posición X relativa al vídeo
        top: absoluteY + 'px', // Posición Y relativa al vídeo
        width: '30px', // Ancho del rectángulo (ajustar según sea necesario)
        height: '30px', // Altura del rectángulo (ajustar según sea necesario)
        border: '2px solid ' + color, // Borde rojo
        zIndex: '9999' // Para asegurarse de que esté encima de otros elementos
    });

    // Agregamos el rectángulo al body del documento
    $('body').append(rectangle);
}

function removeRedRectangle(id) {
    const existingRect = $('#' + id);
    if (existingRect.length > 0) {
        existingRect.remove();
    }
}
/*************************************************************************************************************/