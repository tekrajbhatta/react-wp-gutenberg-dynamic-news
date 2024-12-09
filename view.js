import { loadMore } from "../../lib/loadmore"
import { inViewport, initDelay } from '../../lib/inViewport';

/**
 * Display more results
 *
 * @param {Array}       data
 * @param {HTMLElement} component
 */
function displayResults(data, component) {
    const container = component.querySelector('.pageteaser__columns')
    let markup = ''

    data.forEach(row => {
        const featuredMedia = row._embedded["wp:featuredmedia"][0]
        markup += `<a class="teaser is-layout-flow wp-block-group dynamic-news-block" href="${row.link}"><article>`
        markup += `<figure class="wp-block-image size-full is-style-hover-scale">`
        markup += `<img data-id="${featuredMedia.id}" src="${featuredMedia.media_details.sizes.medium_large.source_url}" loading="lazy">`
        markup += `</figure>`
        markup += `<div class="teaser__inner">`
        markup += `<h3 class="teaser__title">${row.title.rendered}</h3>`
        markup += `<p class="teaser__excerpt">${row.excerpt.rendered}</p>`
        markup += `</div>`
        markup += `</article></a>`
    })

    container.insertAdjacentHTML('beforeend', markup)
}

/**
 * Load more button handler
 *
 * @param {Event} ev - mouse or keyboard action
 */
function loadMoreHandler(ev) {
    const btn = ev.currentTarget;
    const component = btn.closest('.pageteaser');
    // Display data
    loadMore(btn).then((data) => displayResults(data, component));
}

/** ========== I N I T ========== */
window.addEventListener('DOMContentLoaded', function () {
    // load more button
    document.querySelectorAll('.pageteaser .loadmore').forEach(moreButton => {
        moreButton.addEventListener('click', loadMoreHandler)
    });

    // scroll in viewport animation
    if (document.querySelector('.pageteaser.is-style-scroll-anim')) {
        initDelay('.pageteaser.is-style-scroll-anim .teaser');
        inViewport('.pageteaser.is-style-scroll-anim .teaser');
    }

}, false)
