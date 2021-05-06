// Websocket connection
const socket = io();

let data2send = {
  table: '',
  values: []
};

// Get locales
let locales;
$.ajax({
  url: `/locales/${window.navigator.language.split('-')[0]}.json`,
  method: 'GET',
  dataType: 'json'
}).done(res => {
  locales = res;
});

const random = array => array[Math.floor(Math.random() * array.length)];

let inRequestsReaderGender, recordDelTimeOut, recordUpdateTimeOut, inRequestsTimeOut;

const toggleSwitch = (input, slider, check) => {
  if (check) {
    $(input).prop('checked', true);
    $(slider)
      .removeClass('unchecked')
      .addClass('checked');
  } else {
    $(input).prop('checked', false);
    $(slider)
      .removeClass('checked')
      .addClass('unchecked');
  }
}

// Store the settings retrieved from the database into a global object
let globalSettings = {};
// Get settings from the server-side
socket.on('settings', settings => {
  // Update the global object with the retrieved settings
  globalSettings.allowpasswordupdate = settings.allowpasswordupdate;
  globalSettings.instance_name = settings.instance_name;
  globalSettings.instance_description = settings.instance_description;
  globalSettings.sendcc = settings.sendcc;
  globalSettings.sendmail = settings.sendmail;
  globalSettings.sendattachments = settings.sendattachments;
  globalSettings.mail_address = settings.mail_address;
  globalSettings.sender = settings.sender;
  globalSettings.smtp_user = settings.smtp_user;
  globalSettings.smtp_host = settings.smtp_host;
  globalSettings.smtp_passwd = settings.smtp_passwd;
  globalSettings.wallpaper = settings.wallpaper;

  if (settings.sendcc) {
    toggleSwitch('.toggleMailCc__Input', '.toggleMailCc__Slider', true);
  } else {
    toggleSwitch('.toggleMailCc__Input', '.toggleMailCc__Slider', false);
  }

  if (settings.sendmail) {
    toggleSwitch('.toggleMail__Input', '.toggleMail__Slider', true);
  } else {
    toggleSwitch('.toggleMail__Input', '.toggleMail__Slider', false);
  }

  if (settings.sendattachments) {
    toggleSwitch('.toggleAttachments__Input', '.toggleAttachments__Slider', true);
  } else {
    toggleSwitch('.toggleAttachments__Input', '.toggleAttachments__Slider', false);
  }

  if (settings.allowpasswordupdate) {
    toggleSwitch('.toggleUserPasswordUpdate__Input', '.toggleUserPasswordUpdate__Slider', true);
  } else {
    toggleSwitch('.toggleUserPasswordUpdate__Input', '.toggleUserPasswordUpdate__Slider', false);
  }

  $('.settings__child__instanceNameContainer__label__input').val(globalSettings.instance_name);
  $('.settings__child__descriptionContainer__label__textarea').text(globalSettings.instance_description);
  $('.settings__child__senderContainer__senderLabel__input').val(globalSettings.sender);
  $('.settings__child__mailContainer__smtpHostLabel__input').val(globalSettings.smtp_host);
  $('.settings__child__mailContainer__smtpUserLabel__input').val(globalSettings.smtp_user);
  $('.settings__child__mailContainer__smtpHostLabel__input').val(globalSettings.smtp_host);
});

socket.on('username', userData => {
  $('.inRequests__form__applicantInfo__name').val(userData.name);
  $('.inRequests__form__applicantInfo__firstname').val(userData.firstname);
});

const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

// Check if all the fomr fields are fullfilled before submit
let validationErr = false;

$('.returnIcon').click(() => {
  const backHome = step => {
    $(step)
      .removeClass('translateXbackwards')
      .toggleClass('translateXonwards hidden');
    $('.home').toggleClass('hidden flex');
    $('.returnIcon, .header__container__msg')
      .addClass('hidden')
      .removeClass('flex');

    setTimeout(() => {
      $(step).toggleClass('translateXonwards flex');
    }, 500);
  }

  const goBack = (elt1, elt2) => {
    if (elt1.match(/(step1|users|locations)/gi)) {
      if ($(elt1).is(':visible') && elt1.match(/inRequests__step1|users|locations/gi)) {
        backHome(elt1);
      }
    } else {
      if ($(elt1).is(':visible')) {
        $(elt1)
          .addClass('translateXonwards hidden')
          .removeClass('flex');

        $(elt2)
          .removeClass('translateXbackwards hidden')
          .addClass('flex');
      }
    }
  }

  goBack('.users');
  goBack('.locations');
  goBack('.inRequests__step1');
});

$('.menu__item').click(() => {
  // Hide the sidebar on item click if it is currently shown
  if ($('.header__menu__switch').prop('checked')) {
    $('.header__menu__switch').prop('checked', false);
  }
});
