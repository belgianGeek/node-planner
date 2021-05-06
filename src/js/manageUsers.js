let iDataRow = 0;
let parent;
function userTypeSwitch(inputValue) {
  let returnValue = '';

  switch (inputValue) {
    case 'guest':
      returnValue = locales.account_type.guest;
      break;
    case 'user':
      returnValue = locales.account_type.user;
      break;
    case 'admin':
      returnValue = locales.account_type.admin;
      break;
    default:
      inputValue;
  }

  return returnValue;
}

const appendUserRow = (i, data) => {
  let row = $('<span></span>')
    .addClass(`users__container__row users__container__row--${i} flex`)
    .appendTo('.users__container');

  let id = $('<span></span>')
    .addClass(`users__container__row__item users__container__row__item--id hidden`)
    .append(data.user_id)
    .appendTo(row);

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
    .appendTo(row);

  if (data.location_name !== null) {
    location.append(data.location_name);
  } else {
    location.append('Aucune');
  }

  let locationID = $('<span></span>')
    .addClass('users__container__row__item users__container__row__item--location_id hidden')
    .append(data.location_id)
    .appendTo(row);

  let gender = $('<span></span>')
    .addClass('users__container__row__item users__container__row__item--gender hidden')
    .append(data.gender)
    .appendTo(row);

  let password = $('<input>')
    .attr('type', 'password')
    .addClass('users__container__row__item users__container__row__item--pwd input noInput')
    .val('12345678')
    .appendTo(row);

  // Translate the user type shown in the interface
  let typeDisplayed = $('<span></span>')
    .addClass('users__container__row__item users__container__row__item--type')
    .append(userTypeSwitch(data.type))
    .appendTo(row);

  // Keep the original version to fill the management forms
  let type = $('<span></span>')
    .addClass('users__container__row__item users__container__row__item--hiddenType hidden')
    .append(data.type)
    .appendTo(row);
}

const appendLocationRow = (i, data) => {
  let row = $('<span></span>')
    .addClass(`locations__container__row locations__container__row--${i} flex`)
    .appendTo('.locations__container');

  let id = $('<span></span>')
    .addClass(`locations__container__row__item locations__container__row__item--id hidden`)
    .append(data.location_id)
    .appendTo(row);

  let name = $('<span></span>')
    .addClass('locations__container__row__item locations__container__row__item--name')
    .append(data.location_name.replace(/\'\'/g, "'"))
    .appendTo(row);

  let email = $('<span></span>')
    .addClass('locations__container__row__item locations__container__row__item--email')
    .append(data.location_mail)
    .appendTo(row);
}

const manageUsers = () => {
  // Hide the form on btn click
  const hideForm = (parentElt, childElt) => {
    $(`.${parentElt}.absolute .${parentElt}__form__btnContainer__hide`).ready(function() {
      $(`.${parentElt}.absolute .${parentElt}__form__btnContainer__hide`).click(function() {
        $(`.${parentElt}`)
          .removeClass('absolute zero flex')
          .addClass('hidden');

        $(`.${childElt}, .header`).removeClass('blur backgroundColor');

        // Hide the button to hide the form
        $(this).addClass('hidden');
      });
    });
  }

  const handleAdding = (parentMenuClassname, childMenuClassname) => {
    $(`.${childMenuClassname}__header__addBtn`).click(function() {
      $(`.${childMenuClassname}, .header`).addClass('blur backgroundColor');

      // Set all the input fields to their default value
      $(`.${parentMenuClassname} input`).not('.radio').val('');
      $('.register select').val('default');

      // Make sure the title is correct
      if (childMenuClassname === 'users') {
        $('.register__title').text(locales.users.add_title);
        $('.register__title').addClass('addUserTitle');
      } else {
        $('.addLocation__title').text(locales.locations.add_title);
        $('.addLocation__title').addClass('newLocationTitle');
      }

      $(`.${parentMenuClassname}`)
        .addClass('absolute zero flex')
        .removeClass('hidden');
    });

    $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__btnContainer__submit`).click(function() {
      $(`.${parentMenuClassname}`)
        .removeClass('absolute zero flex')
        .addClass('hidden');
    });
  }

  const handleData = (data, parentMenuClassname, childMenuClassname) => {
    $(`.${childMenuClassname}__container`).empty(function() {
      $(this).fadeOut();
    });

    if (data[0] !== undefined) {
      let header = $('<span></span>')
        .addClass(`${childMenuClassname}__container__header flex`)
        .appendTo(`.${childMenuClassname}__container`);

      // Création du titre du tableau
      for (const [i, column] of Object.keys(data[0]).entries()) {
        let columnTitle = column;

        if (childMenuClassname === 'users') {
          switch (column) {
            // Users rows
            case 'name':
              columnTitle = locales.form.name_generic;
              break;
            case 'firstname':
              columnTitle = locales.form.firstname_generic;
              break;
            case 'email':
              columnTitle = locales.form.mail_generic;
              break;
            case 'location':
              columnTitle = locales.form.location_generic;
              break;
            case 'password':
              columnTitle = locales.login.passwd;
              break;
            case 'type':
              columnTitle = locales.register.account_type;
              break;
            default:
              columnTitle = '';
          }
        } else {
          switch (column) {
            // Locations rows
            case 'location_name':
              columnTitle = locales.form.name_generic;
              break;
            case 'location_mail':
              columnTitle = locales.form.mail_generic;
              break;
            default:
              columnTitle = '';
          }
        }

        if (columnTitle !== '') {
          let title = $('<span></span>')
            .addClass(`${childMenuClassname}__container__header__item`)
            .text(columnTitle)
            .appendTo(header);
        }
      }

      // Ajout des résultats, ligne par ligne
      for (const [i, info] of data.entries()) {
        if (childMenuClassname === 'users') {
          appendUserRow(i, info);
        } else {
          appendLocationRow(i, info);
        }

        if (i === data.length - 1) {
          iDataRow = i + 1;
        }
      }

      $(`.${childMenuClassname}__container`).fadeIn();

      // Only show the customized context menu is the user is admin
      if ($('.context').length) {
        $(`.${childMenuClassname}__container__row`).contextmenu(function(e) {
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
          $(`.${childMenuClassname}, .${childMenuClassname} *`).click(function(e) {
            if (e.target === this) {
              $('.context')
                .removeClass('flex')
                .addClass('hidden');
            }
          });
        });

        $('.context__list__item--modify').click(function() {
          if ($('.users').hasClass('flex')) {
            $(`.register`)
              .addClass('absolute zero flex')
              .removeClass('hidden');

            // Update the password field placeholder
            $('.register.absolute .register__form__password input').attr('placeholder', locales.form.passwd_empty);

            $('.users, .header').addClass('blur backgroundColor');
          } else if ($('.locations').hasClass('flex')) {
            $(`.addLocation`)
              .addClass('absolute zero flex')
              .removeClass('hidden');

            $('.locations, .header').addClass('blur backgroundColor');
          }

          // Modify the title
          let sectionTitle, sectionClass;
          if (childMenuClassname === 'users') {
            sectionTitle = locales.users.modify_title;
            sectionClass = 'updateUserTitle';
          } else {
            sectionTitle = locales.locations.modify_title;
            sectionClass = 'updateLocationTitle';
          }

          $(`.${parentMenuClassname}__title`)
            .text(`${sectionTitle} ${$(`.${parent} .${childMenuClassname}__container__row__item--firstname`).text()}
            ${$(`.${parent} .${childMenuClassname}__container__row__item--name`).text()}`)
            .addClass(sectionClass);

          // Fill in all the fields with the selected record data
          $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__userID`).val($(`.${parent} .${childMenuClassname}__container__row__item--id`).text());
          $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__name input`).val($(`.${parent} .${childMenuClassname}__container__row__item--name`).text());
          $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__email input`).val($(`.${parent} .${childMenuClassname}__container__row__item--email`).text());

          if (childMenuClassname === 'users') {
            $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__userFirstName input`).val($(`.${parent} .${childMenuClassname}__container__row__item--firstname`).text());
            $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__location select`).val($(`.${parent} .${childMenuClassname}__container__row__item--location_id`).text());
            $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__type select`).val($(`.${parent} .${childMenuClassname}__container__row__item--hiddenType`).text());

            // Fill in the user's gender
            if ($(`.${parent} .${childMenuClassname}__container__row__item--gender`).text() === 'm') {
              $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__male input`).attr('checked', true);
            } else {
              $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__female input`).attr('checked', true);
            }
          }

          // The users form submit is handled in the register function !
          $(`.${parentMenuClassname}.absolute .${parentMenuClassname}__form__btnContainer__submit`).click(() => {
            // Update the web interface with the changes
            $(`.${parent} .${childMenuClassname}__container__row__item--name`).text($(`.${parentMenuClassname}__form__name input`).val().replace(/\'\'/g, "'"));
            $(`.${parent} .${childMenuClassname}__container__row__item--email`).text($(`.${parentMenuClassname}__form__email input`).val());

            if (childMenuClassname === 'users') {
              // Update the password field placeholder
              $('.register.absolute .register__form__password input').attr('placeholder', locales.form.passwd_generic);

              $(`.${parent} .${childMenuClassname}__container__row__item--firstname`).text($(`.${parentMenuClassname}__form__userFirstName input`).val().replace(/\'\'/g, "'"));
              $(`.${parent} .${childMenuClassname}__container__row__item--location`).text($(`.${parentMenuClassname}__form__location option:selected`).text().replace(/\'\'/g, "'"));
              $(`.${parent} .${childMenuClassname}__container__row__item--hiddenType`).text($(`.${parentMenuClassname}__form__type option:selected`).val());

              $(`.${parent} .${childMenuClassname}__container__row__item--type`).text(userTypeSwitch($(`.${parentMenuClassname}__form__type option:selected`).val()));
            }
          });
        });

        $('.context__list__item--del').click(function() {
          let record2delete = {};

          if (parent.match('users')) {
            record2delete.key = $(`.${parent} .users__container__row__item--id`).text();
            record2delete.table = 'users';
          } else if (parent.match('locations')) {
            record2delete.key = $(`.${parent} .locations__container__row__item--id`).text();
            record2delete.table = 'locations';
          }

          confirmation();

          recordDelTimeOut = setTimeout(() => {
            // Hide the record from the interface
            $(`.${parent}`)
              .removeClass('flex')
              .addClass('hidden');

            confirmation();
            socket.emit('delete data', record2delete);

            // Reset the deletionKey
            record2delete = {};

          }, 5000);
        });
      }
    }
  }

  // Show the right menu if the user click on another link of the sidebar while the other menu is visible
  const displayManagementMenu = (elt1, elt2) => {
    $(`.${elt1}Link`).click(() => {
      hideMenu('inRequests');
      hideMenu(elt2);
      showMenu(elt1);

      socket.emit(`get ${elt1}`);
    });
  }

  displayManagementMenu('users', 'locations');
  displayManagementMenu('locations', 'users');

  $(`.locationsLink, .usersLink`).click(function() {
    if ($(`.locations`).hasClass('hidden') || $('.users').hasClass('hidden')) {
      $(`.home`)
        .removeClass('flex')
        .addClass('hidden');
    }

    showMenu('returnIcon');
    showMenu('header__container__msg');
  });

  socket.on(`users retrieved`, data => {
    handleData(data, 'register', 'users');
  });

  socket.on(`locations retrieved`, data => {
    // Avoid conflicts on other routes than the homepage
    if (window.location.pathname === '/') {
      handleData(data, 'addLocation', 'locations');
    }
  });

  $('.context__list__item').click(() => {
    $('.context')
      .removeClass('flex')
      .addClass('hidden');
  });

  $('.context__list__item--modify, .locations__header__addBtn, .users__header__addBtn').click(() => {
    hideForm('register', 'users');
    hideForm('addLocation', 'locations');
  });

  $('.confirmation__body__cancel').click(() => {
    clearTimeout(recordDelTimeOut);

    $(`.${parent}`)
      .removeClass('hidden')
      .addClass('flex');

    recordDelTimeOut = undefined;

    // Reset the deletionKey
    record2delete = {};
  });

  // Add data
  handleAdding('register', 'users');
  handleAdding('addLocation', 'locations');
};

manageUsers();
