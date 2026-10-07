(function () {
  'use strict';
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function photoUrl(url) {
    try { var parsed = new URL(url, window.location.href); return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null; } catch (_) { return null; }
  }
  window.ESTReviewView = {
    card: function (review, t) {
      var article = el('article', 'testimonial-card');
      article.appendChild(el('span', 'testimonial-quote-icon', '“'));
      article.firstChild.setAttribute('aria-hidden', 'true');
      var stars = el('div', 'testimonial-stars');
      var rating = Math.min(5, Math.max(1, Number(review.rating) || 1));
      stars.setAttribute('role', 'img');
      stars.setAttribute('aria-label', rating + ' / 5');
      for (var i = 0; i < 5; i++) {
        var filled = i < rating;
        var star = el('span', 'testimonial-star ' + (filled ? 'testimonial-star--filled' : 'testimonial-star--empty'), filled ? '★' : '☆');
        star.setAttribute('aria-hidden', 'true'); stars.appendChild(star);
      }
      var score = el('span', 'testimonial-rating-value', rating + '/5');
      score.setAttribute('aria-hidden', 'true'); stars.appendChild(score);
      article.appendChild(stars);
      article.appendChild(el('p', 'testimonial-comment', review.comment));
      var details = el('div');
      if (review.photos && review.photos.length) {
        var gallery = el('details', 'review-photo-gallery');
        gallery.appendChild(el('summary', 'testimonial-photo-badge', review.photos.length + ' · ' + t('testimonials.photos')));
        var images = el('div', 'review-photo-grid');
        review.photos.forEach(function (photo, index) {
          var url = photoUrl(photo.url); if (!url) return;
          var link = el('a'); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
          var image = el('img'); image.src = url; image.alt = t('testimonials.photos') + ' ' + (index + 1); image.loading = 'lazy';
          link.appendChild(image); images.appendChild(link);
        });
        gallery.appendChild(images); details.appendChild(gallery);
      }
      var name = review.author && review.author.name || '';
      var parts = name.trim().split(/\s+/);
      var initials = parts.length > 1 ? (parts[0][0] || '') + (parts[parts.length - 1][0] || '') : name.slice(0, 2);
      var meta = el('div', 'testimonial-author-meta');
      var avatar = el('div', 'testimonial-avatar-fallback', initials.toUpperCase()); avatar.setAttribute('aria-hidden', 'true');
      meta.appendChild(avatar);
      var author = el('div'); author.appendChild(el('h4', 'testimonial-author-name', name));
      if (review.author && review.author.country) author.appendChild(el('div', 'testimonial-author-country', review.author.country));
      details.appendChild(meta); meta.appendChild(author); article.appendChild(details);
      return article;
    }
  };
})();
