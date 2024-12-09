
<?php

$location_latitude = get_post_meta(get_the_ID(), 'vd_location_latitude', true);
$location_longitude = get_post_meta(get_the_ID(), 'vd_location_longitude', true);
$location_phone = get_post_meta(get_the_ID(), 'vd_location_phone', true);
$location_email = get_post_meta(get_the_ID(), 'vd_location_email', true);

$output .= '<article class="teaser">';

// POST THUMBNAIL
if ($attributes['displayFeaturedImage'] && has_post_thumbnail()) {
    $featured_image = get_the_post_thumbnail(
        null,
        $attributes['featuredImageSizeSlug']
    );
    $output .= '<figure class="wp-block-image">';
    $output .= $featured_image;
    $output .= '</figure>';
}

$output .= '<div class="teaser__inner">';

// TITLE
if ($attributes['postLayout'] === 'grid') {
    $output .= sprintf('<h4 class="teaser__title">%s</h4>', $linked_title);
} elseif ($attributes['postLayout'] === 'list') {
    $output .= sprintf('<h3 class="teaser__title">%s</h3>', $linked_title);
}

// EXCERPT or CONTENT
if ($attributes['displayPostContentRadio'] === 'excerpt') {
    $output .= '<div class="teaser__excerpt">' . get_the_excerpt() . '</div>';
}

// POSTMETA
$output .= '<ul class="listicons">';
$output .= '<li><svg aria-hidden="false" class="icon"><use href="/ico.svg#phone"></use></svg>';
$output .= '<a rel="noopener" href="tel:' . $location_phone . '" target="_blank">' . $location_phone . '</a></li>';

$output .= '<li><svg aria-hidden="false" class="icon"><use href="/ico.svg#mail"></use></svg>';
$output .= '<a rel="noopener" href="mailto:' . $location_email . '" target="_blank">' . $location_email . '</a></li>';

$output .= '<li><svg aria-hidden="false" class="icon"><use href="/ico.svg#location"></use></svg>';
$output .= '<a rel="noopener" href="https://maps.google.com/?q=' . $location_latitude . ',' . $location_longitude . '" target="_blank">' . __('How to find us') . '</a></li>';
$output .= '</ul>';

// READMORE
// if ($attributes['readmoreType'] != 'none') {
//     $output .= '<p class="readmore"><a href="' . get_the_permalink() . '">' . __('Read more') . '</a></p>';
// }

$output .= '</div>';
$output .= '</article>';
