const errorNotification = (error, isImport) => {
  if (isImport) {
    $('.import__child__container__notification')
      .addClass('notificationFailure')
      .html(`
        ${locales.import.error} :
        <br>
        ${error}
        `);
  } else {
    $('.notification__icon').attr('src', './src/scss/icons/error.svg');
    $('.notification')
      .removeClass('notificationInfo notificationMail notificationSuccess')
      .addClass('notificationFailure');
    $('.notification__msg').text(`${locales.notification.failure}... 😱`);
  }
}

const successNotification = (isImport, usersNb) => {
  if (isImport) {
    if (usersNb === 0) {
      $('.import__child__container__notification').addClass('notificationFailure');
      errorNotification(`${locales.import.error_notification}`, isImport);
    } else {
      $('.import__child__container__notification').addClass('notificationSuccess');
      if (usersNb === 1) {
        $('.import__child__container__notification').text(`${usersNb} ${locales.import.success_single}`);
      } else {
        $('.import__child__container__notification').text(`${usersNb} ${locales.import.success_multiple}`);
      }
    }
  } else {
    $('.notification__icon').attr('src', './src/scss/icons/thumbs-up.svg');
    $('.notification')
      .removeClass('notificationInfo notificationMail notificationFailure')
      .addClass('notificationSuccess');
    $('.notification__msg').text(`${random(locales.notification.success)} ! 😉`);
  }
}

socket.on('notification', notification => {
  if (notification.isImport) {
    $('.import__child__container__notification')
      .removeClass('hidden')
      .addClass('flex');
  }

  if (notification.type === 'success') {
    successNotification(notification.isImport, notification.usersNb);
  } else if (notification.type === 'error') {
    errorNotification(notification.error, notification.isImport);
  } else if (notification.type === 'info') {
    $('.notification__icon').attr('src', './src/scss/icons/info.svg');
    $('.notification')
      .removeClass('notificationSuccess notificationMail notificationFailure')
      .addClass('notificationInfo');
    $('.notification__msg').text(locales.notification.notFound);
  } else if (notification.type === 'mail') {
    $('.notification__icon').attr('src', './src/scss/icons/mail.svg');
    $('.notification')
      .removeClass('notificationInfo notificationSuccess notificationFailure')
      .addClass('notificationMail');
    $('.notification__msg').text('Mail envoyé 😎');
  }

  if (!notification.isImport) {
    $('.notification')
      .removeClass('hidden')
      .addClass('flex');

    setTimeout(() => {
      $('.notification')
        .fadeOut(function() {
          $(this)
            .removeAttr('style')
            .removeClass('notificationSuccess notificationFailure notificationInfo flex')
            .addClass('hidden');
        });
    }, 5000);
  } else {
    setTimeout(() => {
      $('.import__child__container__notification')
        .removeClass('notificationFailure notificationSuccess flex')
        .addClass('hidden');
    }, 10000);
  }
});
