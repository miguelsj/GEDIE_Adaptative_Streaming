$(document).ready(function () {

    $('.carousel-arrow').on('click', function () {
        var hideImg = $(this).siblings('.d-none').get(0);
        var activeImg = $(this).siblings('.image-container:not(.d-none)').get(0);

        $(activeImg).addClass('d-none');
        $(hideImg).removeClass('d-none');
    });

    $('.carousel-arrow-custom').on('click', function () {
        var activeImg = $(this).siblings('.custom-container:not(.d-none)').get(0);

        if ($(this).hasClass('fa-arrow-right')) {
            var hideImg = $(activeImg).next('.custom-container');
    
            if(hideImg == undefined || hideImg.length == 0) {
                hideImg = $('.custom-container').first();
            }
        }
        else {
            var hideImg = $(activeImg).prev('.custom-container');
    
            if(hideImg == undefined || hideImg.length == 0) {
                hideImg = $('.custom-container').last();
            }
        }

        $(activeImg).addClass('d-none');
        $(hideImg).removeClass('d-none');
    });

    $('.custom-container').on('click', function(){
        var routine = $(this).children('.routine-img');
        var exercise = routine.data('exercise');

        if (exercise != undefined) 
        {
            var newExercise = {
                "key": exercise.charAt(0).toUpperCase() + exercise.slice(1)
            };

            $.ajax({
                url: '/update-custom',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({newExercise: newExercise}),
                success: function(response) {
                    console.log('Nodo agregado exitosamente', response);
                    loadChapters();
                },
                error: function(xhr, status, error) {
                    console.error('Error al agregar el nodo:', error);
                }
            });
        }
    });

});