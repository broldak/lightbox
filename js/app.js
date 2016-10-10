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

(function(window) {
	var API_KEY = '0d0f6df1cd5e73df831dc1da03f15250';
	var url = 'https://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key=' + API_KEY + '&format=json&per_page=10&nojsoncallback=1';

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

var LightBox = function() {
	var selectedPhoto;
	var utils = window.utils;
  var flickr = window.flickr;
  var photoUrls = [];
  var state = {
  	openedPhoto: null,
    isFetchingPhotos: false,
    photosPopulated: false,
  };

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

      return img;
    });

    return photoTemplates;
  }

  // Take in array of img elements and append each to the photos container
  function addPhotos(templates) {
  	var photosContainer = utils.find('.photos-container')[0];

    templates.forEach(function(template) {
      photosContainer.appendChild(template);
    });
  }

  function onPhotoClick(evt) {
  	console.log(evt);
    debugger;

    if (evt.target.tagName.toLowerCase() === 'img') {
    	debugger;

      // find selected photo
      var clicked = photoUrls.filter(function(photo) {
      	return photo.id === evt.target.getAttribute('data-photo-id');
      })[0];

      state.openedPhoto = clicked;

      showOpenedPhoto();

      debugger;
    }
  }

  function onLightboxClick(evt) {
  	console.log(evt);
    debugger;

    if (evt.target.tagName.toLowerCase() === 'button') {
    	debugger;

      var lightBox = utils.find('.lightbox-layover')[0];
      var modal = utils.find('.lightbox-container')[0];

      lightBox.className = 'lightbox-layover';
      modal.className = 'lightbox-container';

      debugger;
    }
  }

  function showOpenedPhoto() {
  	debugger;
    console.log(state);

    var lightBox = utils.find('.lightbox-layover')[0];
    var modal = utils.find('.lightbox-container')[0];
    var modalImage = utils.find('.lightbox-img')[0];

    modalImage.src = state.openedPhoto.url;

    lightBox.className += ' active';
    modal.className += ' active';

    debugger;
  }

	return ({
  	init: function() {
     debugger;
      var ui = {
      	photos: '.photos-container',
        lightBox: '.lightbox-container'
      };

      // Fetch photos then create templates then add them to container
    	flickr.fetchPhotos().then(function(response) {
      	var photos = JSON.parse(response).photos;
        debugger;
        return photos;
      }).then(function(photos){
      	photoUrls = resolvePhotoUrls(photos);

        return createPhotoTemplates(photoUrls);
      }).then(addPhotos);

      // Add event listener to container for clicks on photos
      var photosContainer = utils.find(ui.photos)[0];
      var lightboxModal = utils.find('.lightbox-modal')[0];
      debugger;
      photosContainer.addEventListener('click', onPhotoClick.bind(this));
      lightboxModal.addEventListener('click', onLightboxClick.bind(this));
    }
  });
}

var lb = LightBox();

lb.init();