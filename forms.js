/* Contact forms.
 *
 * Submits over fetch so the visitor stays on the page. Replaces a mailto:
 * handler that opened the visitor's mail client — which did nothing at all
 * for anyone on webmail, while still clearing the form and reporting success.
 *
 * SETUP: create a form at formspree.io and paste its endpoint below. Until a
 * real endpoint is set, the forms refuse to submit and say so, rather than
 * pretending to send.
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://formspree.io/f/REPLACE_WITH_FORM_ID';
  var CONFIGURED = ENDPOINT.indexOf('REPLACE_WITH_FORM_ID') === -1;

  var SUBJECTS = {
    attendance: 'Charleston Fashion & Design — ticket enquiry',
    sponsorship: 'Charleston Fashion & Design — partnership enquiry'
  };

  function setStatus(el, message, tone) {
    if (!el) return;
    el.textContent = message;
    el.style.color =
      tone === 'error' ? '#e0a3a3' : tone === 'ok' ? 'rgba(201,169,97,.95)' : '';
  }

  var forms = document.querySelectorAll('[data-contact-form]');

  Array.prototype.forEach.call(forms, function (form) {
    var status = document.getElementById(form.id + '-status');
    var button = form.querySelector('button[type="submit"]');
    var label = button ? button.textContent.trim() : '';

    form.setAttribute('action', ENDPOINT);
    form.setAttribute('method', 'POST');

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!CONFIGURED) {
        setStatus(
          status,
          'This form is not connected yet. Please email info@charlestonfd.com directly.',
          'error'
        );
        return;
      }

      var data = new FormData(form);
      data.append('_subject', SUBJECTS[form.dataset.contactForm] || 'Charleston Fashion & Design enquiry');

      if (button) {
        button.disabled = true;
        button.textContent = 'Sending…';
      }
      setStatus(status, '');

      fetch(ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            setStatus(status, 'Thank you — we have your enquiry and will be in touch.', 'ok');
          } else {
            return response.json().then(function (body) {
              var detail =
                body && body.errors && body.errors.length
                  ? body.errors.map(function (e) { return e.message; }).join(', ')
                  : 'Something went wrong.';
              setStatus(status, detail + ' Please email info@charlestonfd.com instead.', 'error');
            });
          }
        })
        .catch(function () {
          setStatus(
            status,
            'That did not send — please check your connection, or email info@charlestonfd.com.',
            'error'
          );
        })
        .then(function () {
          if (button) {
            button.disabled = false;
            button.textContent = label;
          }
        });
    });
  });
})();
