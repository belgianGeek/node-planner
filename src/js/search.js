const search = () => {
  let updatedRecord = {};
  let searchData = {
    table: '',
    applicant_name: '',
    getApplicant: false
  };

  const wrapperBlur = () => $('.wrapper').toggleClass('blur');

  $('.search__container').submit(event => {
    event.preventDefault();
    searchData.getApplicant = false;

    if ($('.search__container__select').val() !== 'default') {
      searchData.location = $('.search__container__select').val();

      if ($('.search__container__readerInput').val() !== '') {
        searchData.applicant_name = $('.search__container__readerInput').val().replace(/\'/g, "''");
        searchData.getApplicant = true;
      }

      socket.emit('search', searchData);

      searchData.location = searchData.applicant_name = '';
      searchData.getApplicant = false;
    }
  });

  socket.on('search results', results => {
    let parent;

    $('.search__results__container').empty(function() {
      $(this).fadeOut();
    });

    if (results[0] !== undefined) {
      let header = $('<span></span>')
        .addClass('search__results__container__header flex')
        .appendTo('.search__results__container');

      // Création du titre du tableau
      for (const [i, column] of Object.keys(results[0]).entries()) {
        let columnTitle = column;

        switch (column) {
          case 'attachment':
            // Hide the attachments column is attachments sending is forbidden
            if (globalSettings.sendattachments) {
              columnTitle = locales.search.attachment;
            } else {
              columnTitle = '';
            }
            break;
          case 'task_id':
            columnTitle = locales.search.request_number;
            break;
          case 'applicant_name':
            columnTitle = locales.request.applicant_name;
            break;
          case 'applicant_firstname':
            columnTitle = locales.request.applicant_firstname;
            break;
          case 'request_date':
            columnTitle = 'Date';
            break;
          case 'comment':
            columnTitle = locales.search.request_content;
            break;
          case 'status':
            columnTitle = locales.search.status;
            break;
          case 'user_fk':
            columnTitle = locales.search.assignment;
            break;
          default:
            columnTitle = '';
        }

        if (columnTitle !== '') {
          let title = $('<span></span>')
            .addClass('search__results__container__header__item')
            .text(columnTitle)
            .appendTo(header);
        }
      }

      // Ajout des résultats, ligne par ligne
      for (const [i, data] of results.entries()) {
        let row = $('<span></span>')
          .addClass(`search__results__container__row search__results__container__row--${i} flex`)
          .appendTo('.search__results__container');

        let id = $('<span></span>')
          .addClass('search__results__container__row__item  rowItem search__results__container__row__item--id')
          .append(data.task_id)
          .appendTo(row);

        let applicantName = $('<span></span>')
          .addClass('search__results__container__row__item  rowItem search__results__container__row__item--name')
          .append(data.applicant_name.replace(/\'\'/g, "'"))
          .appendTo(row);

        let applicantFirstname = $('<span></span>')
          .addClass('search__results__container__row__item  rowItem search__results__container__row__item--firstname')
          .append(data.applicant_firstname.replace(/\'\'/g, "'"))
          .appendTo(row);

        let date = $('<span></span>').addClass('search__results__container__row__item  rowItem search__results__container__row__item--date');
        let timestamp = $('<span></span>').addClass('search__results__container__row__item  rowItem search__results__container__row__item--timestamp hidden');

        if (data.request_date !== null) {
          date.append(new Date(data.request_date).toLocaleDateString());
          timestamp.append(data.request_date.split('T')[0]);
        } else {
          date.append(locales.search.display_error);
        }

        timestamp.appendTo(row);
        date.appendTo(row);

        let assignedWorker = $('<span></span>')
          .addClass('search__results__container__row__item  rowItem search__results__container__row__item--aw')
          .appendTo(row);

        let commentMatches = {
          "\'\'": "\'",
          '\n': '<br>'
        };

        let comment = $('<span></span>')
          .addClass('search__results__container__row__item  rowItem search__results__container__row__item--body')
          .append(data.comment.replace(/\n|\'\'/g, matched => {
            return commentMatches[matched];
          }))
          .appendTo(row);

        if (data.user_fk !== undefined && data.user_fk !== null) {
          assignedWorker.append(`${data.name.toUpperCase()}, ${data.firstname}`);

          let assignedWorkerID = $('<span></span>')
            .addClass('search__results__container__row__item--awid hidden')
            .append(data.user_fk)
            .appendTo(row);

        } else if (data.user_fk === null) assignedWorker.append(locales.request.status_waiting);
        else {
          assignedWorker.append(locales.search.display_error);
          console.trace(`Assigned worker for task n°${data.task_id} : ${data.name.toUpperCase()}, ${data.firstname}`);
        }

        let status = $('\
      <svg xmlns="http://www.w3.org/2000/svg">\
        <circle cx="50%" cy="50%" r="5"/>\
        <title class="status__title"></title>\
      </svg>\
      ').addClass('search__results__container__row__item  search__results__container__row__item--status')
          .attr('viewBox', '0 0 75 10')
          .appendTo(row);

        if (data.status === 'waiting') {
          status
            .removeClass('done wip')
            .addClass('waiting');

          $(`.${status.attr('class').split(' ').join('.')} .status__title`).text(locales.search.status_title.waiting);
        } else if (data.status === 'done') {
          status
            .removeClass('waiting wip')
            .addClass('done');

          $(`.${status.attr('class').split(' ').join('.')} .status__title`).text(locales.search.status_title.done);
        } else {
          status
            .removeClass('done waiting')
            .addClass('wip');

          $(`.${status.attr('class').split(' ').join('.')} .status__title`).text(locales.search.status_title.wip);
        }

        // Same comment as in the switch up ahead
        if (globalSettings.sendattachments) {
          let attachment = $('<span></span>').addClass('search__results__container__row__item search__results__container__row__item--file');
          if (data.attachment) {
            attachment.append('📎');

            let attachmentSrc = $('<span></span>')
              .addClass('search__results__container__row__item search__results__container__row__item--fileSrc hidden')
              .append(data.attachment_src)
              .appendTo(row);
          }

          attachment.appendTo(row);
        }
      }

      $('.search__results__container').fadeIn();

      // Only show the customized context menu is the user is admin
      if ($('.context').length) {
        $('.search__results__container__row').contextmenu(function(e) {
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
          $('.search__results, .search__results *').click(function(e) {
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
          // Format the date to be year, Month (0-indexed) and the day
          let date = $(`.${parent} .search__results__container__row__item--timestamp`).text();

          $('.wrapper').addClass('blur');

          $('.inRequests')
            .addClass('absolute flex')
            .removeClass('hidden');

          // Block all the user-related fields to prevent modifications
          $('.inRequests.absolute .inRequests__form__applicantInfo__name, .inRequests.absolute .inRequests__form__applicantInfo__firstname, .inRequests.absolute .inRequests__form__requestInfo__row1__requestDate').attr('disabled', true);

          // Append the attachment if any
          if ($(`.${parent} .search__results__container__row__item--fileSrc`).length) {
            $('.inRequests img').attr('src', $(`.${parent} .search__results__container__row__item--fileSrc`).text());
          } else {
            $('.inRequests img').addClass('hidden');
          }

          // Fill in all the fields with the selected record data
          $('.inRequests.absolute .inRequests__id').text($(`.${parent} .search__results__container__row__item--id`).text());
          $('.inRequests.absolute .inRequests__form__applicantInfo__location').val($(`.search__container__select`).val());
          $('.inRequests.absolute .inRequests__form__applicantInfo__name').val($(`.${parent} .search__results__container__row__item--name`).text());
          $('.inRequests.absolute .inRequests__form__applicantInfo__firstname').val($(`.${parent} .search__results__container__row__item--firstname`).text());
          $('.inRequests.absolute .inRequests__form__requestInfo__row1__requestDate').val(date);
          $('.inRequests.absolute .inRequests__form__requestInfo__comment').val($(`.${parent} .search__results__container__row__item--body`).html().replace(/<br>/g, '\n\n'));

          // Check if the assigned worker ID is defined
          if ($(`${parent} .search__results__container__row__item--awid`).length) {
            $('.inRequests.absolute .inRequests__form__requestInfo__row1__assignedWorker option:selected').val($(`.${parent} .search__results__container__row__item--awid`).text());
          }

          // Request status
          if ($(`.${parent} .search__results__container__row__item--status`).hasClass('wip')) $('.inRequests.absolute .inRequests__form__requestInfo__row1__status').val('wip');
          else if ($(`.${parent} .search__results__container__row__item--status`).hasClass('waiting')) $('.inRequests.absolute .inRequests__form__requestInfo__row1__status').val('waiting');
          else $('.inRequests.absolute .inRequests__form__requestInfo__row1__status').val('done');

          // The form submit is handled in the inRequests function !
          $('.inRequests.absolute .inRequests__form__btnContainer__submit').click(() => {
            // Update the web interface with the changes
            $(`.${parent} .search__results__container__row__item--name`).text($('.inRequests__form__applicantInfo__name').val().replace(/\'\'/g, "'"));
            $(`.${parent} .search__results__container__row__item--firstname`).text($('.inRequests__form__applicantInfo__firstname').val().replace(/\'\'/g, "'"));
            $(`.${parent} .search__results__container__row__item--date`).text(new Date($('.inRequests__form__requestInfo__row1__requestDate').val()).toLocaleDateString());
            $(`.${parent} .search__results__container__row__item--location`).text($('.inRequests__form__applicantInfo__location option:selected').text().replace(/\'\'/g, "'"));
            $(`.${parent} .search__results__container__row__item--body`).html($('.inRequests__form__requestInfo__comment').val().replace(/\n\n/g, '<br>'));

            // Check for default values
            if ($('.inRequests__form__requestInfo__row1__assignedWorker option:selected').val() !== 'default') {
              $(`.${parent} .search__results__container__row__item--aw`).text($('.inRequests__form__requestInfo__row1__assignedWorker option:selected').text().replace(/\'\'/g, "'"));
            } else {
              $(`.${parent} .search__results__container__row__item--aw`).text(locales.request.status_waiting);
            }

            $(`.${parent} .search__results__container__row__item--status`)
              .removeClass('waiting wip done')
              .addClass($('.inRequests.absolute .inRequests__form__requestInfo__row1__status').val());
          });

          // Hide the form on btn click
          $('.inRequests.absolute .inRequests__form__btnContainer__hide').click(function() {
            $('.inRequests')
              .removeClass('absolute flex')
              .addClass('hidden');

            $('.wrapper').removeClass('blur backgroundColor');

            // Hide the button to hide the form
            $(this).addClass('hidden');

            $('.inRequests img').removeClass('hidden');
          });
        });

        $('.context__list__item--del').click(function() {
          let record2delete = {
            key: $(`.${parent} .search__results__container__row__item--id`).text(),
            table: 'tasks'
          };

          confirmation();

          wrapperBlur();

          // Hide the record from the interface
          $(`.${parent}`).toggleClass('hidden flex');

          recordDelTimeOut = setTimeout(() => {
            // Delete the record from the interface
            $(`.${parent}`).remove();
            confirmation();

            socket.emit('delete data', record2delete);

            // Reset the deletionKey
            record2delete = {};

            wrapperBlur();
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

search();
