/**
 * iRents Site Machine — Frontend JS
 * Version: 1.0.0
 *
 * Features:
 *  - FAQ accordion
 *  - Smooth scroll for same-page anchor links
 *
 * No jQuery dependency — vanilla ES2017+.
 */

( function () {
  'use strict';

  /* ================================================================
     FAQ Accordion
     Expects markup:
       .irents-faq
         .irents-faq__item
           button.irents-faq__question[aria-expanded]
             .irents-faq__icon (optional chevron)
           .irents-faq__answer
     ================================================================ */
  function initFaqAccordion() {
    var faqSections = document.querySelectorAll( '.irents-faq' );

    if ( ! faqSections.length ) {
      return;
    }

    faqSections.forEach( function ( section ) {
      // Auto-discover question buttons inside this section.
      var questions = section.querySelectorAll( '.irents-faq__question' );

      questions.forEach( function ( btn ) {
        // Ensure proper ARIA state on load.
        if ( ! btn.hasAttribute( 'aria-expanded' ) ) {
          btn.setAttribute( 'aria-expanded', 'false' );
        }

        // Add icon if absent.
        if ( ! btn.querySelector( '.irents-faq__icon' ) ) {
          var icon = document.createElement( 'span' );
          icon.className = 'irents-faq__icon';
          icon.setAttribute( 'aria-hidden', 'true' );
          icon.innerHTML = '&#9660;'; // ▼
          btn.appendChild( icon );
        }

        btn.addEventListener( 'click', function () {
          var expanded = btn.getAttribute( 'aria-expanded' ) === 'true';
          var answer   = btn.nextElementSibling;

          // Close all other items in the same section (accordion behaviour).
          questions.forEach( function ( otherBtn ) {
            if ( otherBtn !== btn ) {
              otherBtn.setAttribute( 'aria-expanded', 'false' );
              var otherAnswer = otherBtn.nextElementSibling;
              if ( otherAnswer && otherAnswer.classList.contains( 'irents-faq__answer' ) ) {
                otherAnswer.classList.remove( 'is-open' );
              }
            }
          } );

          // Toggle current item.
          btn.setAttribute( 'aria-expanded', String( ! expanded ) );

          if ( answer && answer.classList.contains( 'irents-faq__answer' ) ) {
            if ( expanded ) {
              answer.classList.remove( 'is-open' );
            } else {
              answer.classList.add( 'is-open' );
            }
          }
        } );
      } );
    } );
  }

  /* ================================================================
     Smooth Scroll
     Intercepts click on anchor links that point to an ID on the same
     page. Falls back gracefully if the target element doesn't exist.
     ================================================================ */
  function initSmoothScroll() {
    document.addEventListener( 'click', function ( event ) {
      var target = event.target.closest( 'a[href]' );

      if ( ! target ) {
        return;
      }

      var href = target.getAttribute( 'href' );

      // Only same-page hash links.
      if ( ! href || ! href.startsWith( '#' ) ) {
        return;
      }

      var id = href.slice( 1 );

      if ( ! id ) {
        return;
      }

      var el = document.getElementById( id );

      if ( ! el ) {
        return;
      }

      event.preventDefault();

      el.scrollIntoView( { behavior: 'smooth', block: 'start' } );

      // Update URL hash without jumping.
      if ( history.pushState ) {
        history.pushState( null, null, href );
      }

      // Move focus for accessibility.
      if ( ! el.hasAttribute( 'tabindex' ) ) {
        el.setAttribute( 'tabindex', '-1' );
      }
      el.focus( { preventScroll: true } );
    } );
  }

  /* ================================================================
     Phone number click tracking (stub — hook up analytics here)
     ================================================================ */
  function initPhoneTracking() {
    var phoneLinks = document.querySelectorAll( 'a[href^="tel:"]' );

    phoneLinks.forEach( function ( link ) {
      link.addEventListener( 'click', function () {
        // Dispatch a custom event so analytics tags can listen.
        var event = new CustomEvent( 'irents:phone_click', {
          detail: { href: link.href },
          bubbles: true,
        } );
        document.dispatchEvent( event );
      } );
    } );
  }

  /* ================================================================
     Bootstrap
     ================================================================ */
  function init() {
    initFaqAccordion();
    initSmoothScroll();
    initPhoneTracking();
  }

  if ( document.readyState === 'loading' ) {
    document.addEventListener( 'DOMContentLoaded', init );
  } else {
    init();
  }
} )();
