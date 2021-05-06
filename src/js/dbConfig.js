const dbConfig = () => {
  let instance = $('.dbConfig__form__name input');
  let instance_description = $('.dbConfig__form__description textarea');
  let location_name = $('.dbConfig__form__locationName input');
  let location_mail = $('.dbConfig__form__locationMail input');
  let sender = $('.dbConfig__form__senderLabel input');
  let smtp_user = $('.dbConfig__form__smtpUserLabel input');
  let smtp_host = $('.dbConfig__form__smtpHostLabel input');
  let smtp_passwd = $('.dbConfig__form__smtpPasswdLabel input');

  $('.dbConfig__form').submit(event => {
    event.preventDefault();

    socket.emit('append settings', {
      instance: instance.val(),
      instance_description: instance_description.val(),
      location_name: location_name.val(),
      location_mail: location_mail.val(),
      sender: sender.val(),
      smtp_user: smtp_user.val(),
      smtp_host: smtp_host.val(),
      smtp_passwd: smtp_passwd.val()
    });
  });

  socket.on('settings import', success => {
    if (success) {
      $('.home__mainTitle').text(`${instance.val()} - ${locales.config.first_admin}`);
      hideMenu('dbConfig');
      showMenu('register');
    }
  });

  if (window.location.pathname === '/login') {
    socket.emit('get locations');

    socket.on(`locations retrieved`, location => {
      if (location !== null) {
        // Empty the select tag to avoid duplicates and truncated values
        $('.register__form__location select option').each(function() {
          if ($(this).val() === '') $(this).remove();
        });

        const option = $('<option>')
          .val(location.location_id)
          .text(location.location_name);

        $('.register__form__location select').append(option);
      }
    });

    socket.on('first user added', () => {
      window.location.reload();
    });
  }
}

dbConfig();
