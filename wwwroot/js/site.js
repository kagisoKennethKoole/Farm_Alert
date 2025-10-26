// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

document.addEventListener("DOMContentLoaded", () => {

    // reusable modal
    const modalHTML = `
      <div class="modal fade" id="youtubeModal" tabindex="-1" aria-labelledby="youtubeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content bg-dark text-white border-0">
            <div class="modal-header border-0">
              <h5 class="modal-title" id="youtubeModalLabel">Video Demo</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
              <div class="ratio ratio-16x9">
                <iframe id="youtubeModalIframe"
                        src=""
                        title="YouTube video"
                        frameborder="0"
                        allow="autoplay; encrypted-media"
                        allowfullscreen>
                </iframe>
              </div>
            </div>
          </div>
        </div>
      </div>`;


    // loading the modal to html 
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Initialize Bootstrap modal
    const youtubeModal = document.getElementById('youtubeModal');
    const youtubeIframe = document.getElementById('youtubeModalIframe');

    youtubeModal.addEventListener('show.bs.modal', event => {
        const button = event.relatedTarget;
        const videoUrl = button.getAttribute('data-video');
        youtubeIframe.src = `https://www.youtube.com/embed/${getYouTubeID(videoUrl)}?autoplay=1`;
    });

    youtubeModal.addEventListener('hidden.bs.modal', () => {
        youtubeIframe.src = '';
    });

    // extract YouTube video ID from full URL
    function getYouTubeID(url) {
        const match = url.match(/(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&]+)/);
        return match ? match[1] : null;
    }


});

