<?php
/* TEMPLATE FOR Block "verdure/dynamic-news" */

$parent_page_id = get_the_ID();
$wquery = array(
    'post_type' => ["post"],
    'order' => $attributes['order'],
    'orderby' => $attributes['orderBy'],
    'posts_per_page' => $attributes['postsToShow']
);

$page_teaser = new WP_Query($wquery);

if ($page_teaser->have_posts()) :
    $output = '<div class="outermost-dynamic-news">';
    // $output .= '<div class="dynamic-news-header"><h1 class="dynamic-news-header-title">News & Press Release</h1><button class="dynamic-news-header-view-more" href="#">View More</button></div>';
    $output .= '<div class="pageteaser__layout">';

    $post_count = 0;  // Initialize a counter

    // Loop through posts
    while ($page_teaser->have_posts()) :
        $page_teaser->the_post();
        $post_count++;
        $post_title = get_the_title();
        $post_date = get_the_date('d, M Y');
        $post_content = wp_trim_words(get_the_content(), 20, '...');
        $post_thumbnail = get_the_post_thumbnail_url(get_the_ID(), 'large');

        if ($post_count == 1) {
            // First post (large, left side)
            $output .= '<div class="pageteaser__left">';
            $output .= '<div class="pageteaser__large">';
            
            // Display the image first
            if ($post_thumbnail) {
                $output .= '<img src="' . esc_url($post_thumbnail) . '" alt="' . esc_attr($post_title) . '" class="pageteaser__left-image">';
            }
        
            // Post meta data (publish date, title, and content)
            $output .= '<div class="post-meta">';
            $output .= '<span class="post-date">' . esc_html($post_date) . '</span>';
            // $output .= '<h2>' . esc_html($post_title) . '</h2>';
            $output .= '<h2><a href="' . esc_url(get_permalink()) . '">' . esc_html($post_title) . '</a></h2>';
            $output .= '<p>' . esc_html($post_content) . '</p>';
            $output .= '</div>'; // Close post-meta
            
            $output .= '</div>'; // Close pageteaser__large
            $output .= '</div>';  // Close pageteaser__left
        } elseif ($post_count <= 4) {
            // Posts 2, 3, and 4 (smaller, right side)
            if ($post_count == 2) {
                // Start right side column after the first post
                $output .= '<div class="pageteaser__right">';
            }
        
            $output .= '<div class="pageteaser__small">';
        
            // Display the image first
            if ($post_thumbnail) {
                $output .= '<img src="' . esc_url($post_thumbnail) . '" alt="' . esc_attr($post_title) . '" class="pageteaser__small-image">';
            }
        
            // Post meta data (publish date, title)
            $output .= '<div class="post-meta">';
            $output .= '<span class="post-date">' . esc_html($post_date) . '</span>';
            $output .= '<h3><a href="' . esc_url(get_permalink()) . '">' . esc_html($post_title) . '</a></h3>';
            $output .= '</div>'; // Close post-meta
        
            $output .= '</div>'; // Close pageteaser__small
        
            if ($post_count == 4) {
                $output .= '</div>';  // Close right side after the third small post
            }
        }        

    endwhile;

    $output .= '</div>'; 
    $output .= '</div>';  // Close layout container

    /* Restore original Post Data */
    wp_reset_postdata();
else :
    $output = '<div>There are no posts to display.</div>';
endif;

echo $output;
