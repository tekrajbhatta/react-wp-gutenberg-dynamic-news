<?php

defined('ABSPATH') || exit;

/**
 * Sub-Teaser Init
 */
function vdplug_dynamic_news_init()
{
    register_block_type(
        VDPLUG_DIR . 'build/blocks/dynamic-news'
    );
}
add_action('init', 'vdplug_dynamic_news_init');
