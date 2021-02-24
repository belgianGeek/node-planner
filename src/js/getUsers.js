const manageUsers = () => {
  $('.usersLink').click(() => {
    $('.home, .returnIcon, .header__container__msg, .users').toggleClass('hidden flex');
    socket.emit('get users');
  });

  socket.on('users retrieved', users => {
    $('.users__container').empty(function() {
      $(this).fadeOut();
    });

    if (users[0] !== undefined) {
      let header = $('<span></span>')
        .addClass('users__container__header flex')
        .appendTo('.users__container');

      // Création du titre du tableau
      for (const [i, column] of Object.keys(users[0]).entries()) {
        let columnTitle = column;

        switch (column) {
          case 'name':
            columnTitle = 'Nom';
            break;
          case 'firstname':
            columnTitle = 'Prénom';
            break;
          case 'email':
            columnTitle = 'Adresse email';
            break;
          case 'location':
            columnTitle = 'Implantation';
            break;
          case 'password':
            columnTitle = 'Mot de passe';
            break;
          case 'type':
            columnTitle = 'Type de compte';
            break;
          default:
            columnTitle = '';
        }

        if (columnTitle !== '') {
          let title = $('<span></span>')
            .addClass('users__container__header__item')
            .text(columnTitle)
            .appendTo(header);
        }
      }

      // Ajout des résultats, ligne par ligne
      for (const [i, data] of users.entries()) {
        let row = $('<span></span>')
          .addClass(`users__container__row users__container__row--${i} flex`)
          .appendTo('.users__container');

        let name = $('<span></span>')
          .addClass('users__container__row__item users__container__row__item--name')
          .append(data.name.replace(/\'\'/g, "'"))
          .appendTo(row);

        let firstname = $('<span></span>')
          .addClass('users__container__row__item users__container__row__item--firstname')
          .append(data.firstname.replace(/\'\'/g, "'"))
          .appendTo(row);

        let email = $('<span></span>')
          .addClass('users__container__row__item users__container__row__item--email')
          .append(data.email)
          .appendTo(row);

        let location = $('<span></span>')
          .addClass('users__container__row__item users__container__row__item--location')
          .append(data.location_name)
          .appendTo(row);

        let locationID = $('<span></span>')
          .addClass('users__container__row__item users__container__row__item--location_id hidden')
          .append(data.location_id)
          .appendTo(row);

        let password = $('<input>')
          .attr('type', 'password')
          .addClass('users__container__row__item users__container__row__item--pwd input noInput')
          .val('12345678')
          .appendTo(row);

        let type = $('<span></span>')
          .addClass('users__container__row__item users__container__row__item--type')
          .append(data.type)
          .appendTo(row);
      }

      $('.users__container').fadeIn();

      // Only show the customized context menu is the user is admin
      if ($('.context').length) {
        $('.users__container__row').contextmenu(function(e) {
          $('.context')
            .css({
              left: `${e.pageX}px`,
              top: `${e.pageY}px`
            })
            .toggleClass('hidden flex');

          // Store the selected row in a variable
          parent = $(this).attr('class').split(' ')[1];

          e.preventDefault();

          // Hide the context menu on left-click to prevent displaying it indefinitely
          $('.users, .users *').click(function(e) {
            if (e.target === this) {
              $('.context')
                .removeClass('flex')
                .addClass('hidden');
            }
          });
        });

        $('.context__list__item').click(() => {
          $('.context')
            .removeClass('flex')
            .addClass('hidden');
        });

        $('.context__list__item--modify').click(function() {
          $('.users').addClass('blur');

          $('.register')
            .addClass('absolute zero flex')
            .removeClass('hidden');

          // Modify the title to mention the user
          $('.register__title').text(`Modification de l'utilisateur ${$(`.${parent} .users__container__row__item--firstname`).text()}
            ${$(`.${parent} .users__container__row__item--name`).text()}`);

          // Hide the gender option
          $('.register.absolute .register__form__gender').addClass('hidden');

          // Fill in all the fields with the selected record data
          $('.register.absolute .register__form__username input').val($(`.${parent} .users__container__row__item--name`).text());
          $('.register.absolute .register__form__userFirstName input').val($(`.${parent} .users__container__row__item--firstname`).text());
          $('.register.absolute .register__form__email input').val($(`.${parent} .users__container__row__item--email`).text());
          $('.register.absolute .register__form__location select').val($(`.${parent} .users__container__row__item--location_id`).text());
          $('.register.absolute .register__form__type select').val($(`.${parent} .users__container__row__item--type`).text());

          // The form submit is handled in the register function !
          $('.register.absolute .register__form__btnContainer__submit').click(() => {
            // Update the web interface with the changes
            $(`.${parent} .users__container__row__item--name`).text($('.register__form__username').val().replace(/\'\'/g, "'"));
            $(`.${parent} .users__container__row__item--firstname`).text($('.register__form__userFirstname').val().replace(/\'\'/g, "'"));
            $(`.${parent} .users__container__row__item--email`).text($('.register__form__email').val());
            $(`.${parent} .users__container__row__item--location`).text($('.register__form__location option:selected').text().replace(/\'\'/g, "'"));
            $(`.${parent} .users__container__row__item--type`).text($('.register__form__type option:selected').val());
          });

          // Hide the form on btn click
          $('.register.absolute .register__form__btnContainer__hide').click(function() {
            $('.register')
              .removeClass('absolute flex')
              .addClass('hidden');

            $('.users').removeClass('blur backgroundColor');

            // Hide the button to hide the form
            $(this).addClass('hidden');
          });
        });

        $('.context__list__item--del').click(function() {
          let record2delete = {
            key: $(`.${parent} .users__container__row__item--id`).text(),
            table: $('.search__container__select').val()
          };

          confirmation();

          // Hide the record from the interface
          $(`.${parent}`).toggleClass('hidden flex');

          recordDelTimeOut = setTimeout(() => {
            // Delete the record from the interface
            $(`.${parent}`).remove();
            confirmation();

            socket.emit('delete data', record2delete);

            // Reset the deletionKey
            record2delete = {};

          }, 5000);

          $('.confirmation__body__cancel').click(() => {
            clearTimeout(recordDelTimeOut);
            $(`.${parent}`)
              .removeClass('hidden')
              .addClass('flex');
            recordDelTimeOut = undefined;

            // Reset the deletionKey
            record2delete = {};
          });
        });
      }
    }
  });
}

manageUsers();
