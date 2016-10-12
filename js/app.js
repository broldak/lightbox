// DOM manipulation helpers
(function(window) {
	window.utils = {
  	find: function(selector) {
    	var firstChar = selector.charAt(0);

      if (firstChar === '.') {
      	return document.getElementsByClassName(selector.slice(1));
      } else if (firstChar === '#') {
      	return document.getElementById(selector.slice(1));
      } else {
      	return document.getElementsByTagName(selector)
      }
    }
  }
}(this));

// Flickr API helper
(function(window) {
	var API_KEY = '0d0f6df1cd5e73df831dc1da03f15250';
	var url = 'https://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key=' + API_KEY + '&format=json&per_page=50&nojsoncallback=1';

	window.flickr = {
  	fetchPhotos: function() {
    	var fetchPromise = new Promise(function(resolve, reject) {
      	var request = new XMLHttpRequest();
        request.open('GET', url);

        request.onload = function() {
        	if (request.status === 200) {
          	resolve(request.response);
          } else {
          	reject(Error(request.statusText));
          }
        };

        request.onerror = function() {
        	reject(Error('Failed Request'));
        };

        request.send();
      });

      return fetchPromise;
    }
  }
}(this));

// Lightbox App
var LightBox = function() {
	var selectedPhoto;
	var utils = window.utils;
  var flickr = window.flickr;
  var photoUrls = [];

  // Object representing some ui element classes
  var ui = {
    photos: '.photos-container',
    lightBox: '.lightbox-container',
    lightboxModal: '.lightbox-modal',
    lightboxLayover: '.lightbox-layover',
    lightboxImg: '.lightbox-img'
  };

  // Object representing state of the app
  var state = {
  	openedPhoto: null,
    photoIndex: -1,
    isFetchingPhotos: false,
    photosPopulated: false,
    isLightboxOpen: false,
  };

  // Event handler for clicks on photos container
  function onPhotoClick(evt) {
    if (evt.target.tagName.toLowerCase() === 'img') {
      // find selected photo
      var clicked = photoUrls.filter(function(photo) {
      	return photo.id === evt.target.getAttribute('data-photo-id');
      })[0];

      state.openedPhoto = clicked;
      state.photoIndex = photoUrls.indexOf(clicked);

      showOpenedPhoto(false);
    }
  }

  // Event handler for keydown
  function onKeyDown(evt) {
    if (state.isLightboxOpen) {
      switch (evt.keyCode) {
        // Right arrow
        case 39:
          showNextPhoto();
          break;
        // Left arrow
        case 37:
          showPreviousPhoto();
          break;
        // Escape
        case 27:
          closeLightbox();
          break;
      }
    }
  }

  // Event handler for clicks in lightbox modal
  function onLightboxClick(evt) {
    if (evt.target.tagName.toLowerCase() === 'button') {
      var className = evt.target.className;

      // Close button
      if (className.includes('close-btn')) {
        closeLightbox();
      }

      // Back button
      if (className.includes('back-btn')) {
        showPreviousPhoto();
      }

      // Next button
      if (className.includes('next-btn')) {
        showNextPhoto();
      }
    }
  }

  // Take in array of photo objects and return array of photo urls
  function resolvePhotoUrls(photos) {
  	var photoUrls = photos.photo.map(function(photo) {
      var farm = photo.farm;
      var id = photo.id;
      var secret = photo.secret;
      var server = photo.server;

      return {
      	url: 'https://farm' + farm + '.staticflickr.com/' + server + '/' + id + '_' + secret + '.jpg',
        id: id
      };
    });

    return photoUrls;
  }

  // Take in array of photo urls and output array of img elements with src = photo urls
  function createPhotoTemplates(photoUrls) {
  	var photoTemplates = photoUrls.map(function(photo) {
      var img = new Image();
      img.src = photo.url;
      img.setAttribute('data-photo-id', photo.id)

      // Create wrapping element
      var div = document.createElement('div');
      div.className = 'photo-wrap';
      div.appendChild(img);

      return div;
    });

    return photoTemplates;
  }

  // Take in array of img elements and append each to the photos container
  function addPhotos(templates) {
  	var photosContainer = utils.find(ui.photos)[0];

    templates.forEach(function(template) {
      photosContainer.appendChild(template);
    });
  }

  // Close lightbox
  function closeLightbox() {
    var lightBox = utils.find(ui.lightboxLayover)[0];
    var modal = utils.find(ui.lightBox)[0];

    lightBox.className = 'lightbox-layover';
    modal.className = 'lightbox-container';
    state.isLightboxOpen = false;
  }

  // Decremenet photoIndex and display previous photo
  function showPreviousPhoto() {
    if (state.photoIndex - 1 >= 0) {
      state.photoIndex -= 1;
      state.openedPhoto = photoUrls[state.photoIndex];

      showOpenedPhoto(true);
    }
  }

  // Increase photoIndex and display next photo
  function showNextPhoto() {
    if (state.photoIndex + 1 < photoUrls.length) {
      state.photoIndex += 1;
      state.openedPhoto = photoUrls[state.photoIndex];

      showOpenedPhoto(true);
    }
  }

  // Show current opened photo
  function showOpenedPhoto(isUpdate) {
    var lightBox = utils.find(ui.lightboxLayover)[0];
    var modal = utils.find(ui.lightBox)[0];
    var modalImage = utils.find(ui.lightboxImg)[0];

    modalImage.src = state.openedPhoto.url;

    if (!isUpdate) {
      state.isLightboxOpen = true;
      lightBox.className += ' active';
      modal.className += ' active';
    }
  }

	return ({
  	init: function() {
      // Fetch photos then create templates then add them to container
    	flickr.fetchPhotos().then(function(response) {
      	return JSON.parse(response).photos;
      }).then(function(photos){
        // Resolve urls for photos
      	photoUrls = resolvePhotoUrls(photos);

        return createPhotoTemplates(photoUrls);
      }).then(addPhotos);

      // Add event listener to container for clicks on photos
      var photosContainer = utils.find(ui.photos)[0];
      var lightboxModal = utils.find(ui.lightboxModal)[0];

      photosContainer.addEventListener('click', onPhotoClick.bind(this));
      lightboxModal.addEventListener('click', onLightboxClick.bind(this));
      window.addEventListener('keydown', onKeyDown.bind(this));
    }
  });
}
