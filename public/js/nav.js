$(document).ready(function () {

    // GET ELEMENTS
    $bottomContainer = $('#bottom-container');
    initialNavHeight = $('#nav-container').height();

    // NAV CONTAINER
    setBottomContainerHeight(initialNavHeight, 'px');

    $('#nav-container .nav-link').on('click', function () {
        $('#routines-container, #custom-container').hide();

        $('#nav-container .nav-link').removeClass('active');
        $(this).addClass('active');

        var target = $(this).data('target');
        $('#' + target + '-container').show();

        expandBottomContainer();

        if (target == "custom" && $currentRoutine != "custom") {
            $indexPlayList = -1;
            $currentRoutine = "custom";
            $videoPlayer.currentTime = 0;
            console.log($('.delete-exercise'));
            pauseVideo();
            loadChapters();
        } else if (target != "custom" && $currentRoutine == "custom") {
            $indexPlayList = -1;
            $currentRoutine = "home_routine";
            $videoPlayer.currentTime = 0;
            pauseVideo();
            loadChapters();
        }
    });

    //DESC CONTAINER
    $('#description-container .nav-link').on('click', function () {
        $('#description-container > div').hide(); // Oculta todos los contenidos de descripción
        $('#description-container .nav-link').removeClass('active'); // Elimina la clase 'active' de todos los enlaces de navegación
    
        $(this).addClass('active'); // Agrega la clase 'active' al enlace de navegación que se ha seleccionado
    
        var target = $(this).data('target'); // Obtiene el valor del atributo 'data-target' del enlace seleccionado
        $('#' + target + '-container').show(); // Muestra el contenido de descripción correspondiente al 'data-target' del enlace seleccionado
    
         // Llama a una función para expandir el contenedor de descripción si es necesario
    });

    $(document).click(function (event) {
        if (!$(event.target).closest('#bottom-container').length) {
            collapseBottomContainer();
        }
    });

    // NAV OPTIONS
    $('.image-container').on('click', function () {
        var videoName = $(this).find('img').data('name');

        $('.muscle-view').hide();
        $indexPlayList = -1;
        $currentRoutine = videoName;
        $videoPlayer.currentTime = 0;
        pauseVideo();
        loadChapters();
    });

    // ARROW UP
    $('#arrow-up').on('click', function () {
        if ($(this).hasClass('fa-arrow-up')) {
            expandBottomContainer();
        } else {
            collapseBottomContainer();
        }
    });

});

//#region Functions

function setBottomContainerHeight(height, unit) {
    $bottomContainer.css('height', height + unit);
}

function collapseBottomContainer() {
    $('#arrow-up').removeClass('fa-arrow-down').addClass('fa-arrow-up');
    setBottomContainerHeight(initialNavHeight, 'px');
}

function expandBottomContainer() {
    $('#arrow-up').removeClass('fa-arrow-up').addClass('fa-arrow-down');
    setBottomContainerHeight('35', 'vh');
}

//#endregion