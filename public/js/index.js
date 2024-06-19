$(document).ready(function () {

    // GET ELEMENTS
    $indexContainer = $('#index-container');
    $descriptionContainer = $('#description-container');
    $videoContainer = $('#video-container');

    $(window).resize(function () {
        updateMaxHeight();
    });

});

function updateMaxHeight() {
    var videoHeight = $($videoPlayer).height();
    // Update containers max-height except for small devices
    // TO DO: Adjust width conditions
    if ($(window).width() > 600) {
        $indexContainer.css('height', videoHeight + 'px');
        $descriptionContainer.css('height', videoHeight + 'px');
        $videoContainer.css('height', videoHeight + 'px');
    }

    $('.muscle-img').css('height', (videoHeight * 0.33) + 'px');
}