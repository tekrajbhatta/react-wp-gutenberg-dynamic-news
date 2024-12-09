import { __ } from '@wordpress/i18n';
import { get, pickBy, invoke, includes } from 'lodash';
import classnames from 'classnames';
import {
    Placeholder,
    PanelBody,
    Spinner,
    RangeControl,
    ToggleControl,
    RadioControl,
    SelectControl,
    QueryControls,
    ToolbarGroup,
} from '@wordpress/components';
import { dateI18n, format, getSettings } from '@wordpress/date';
import {
    InspectorControls,
    BlockControls,
    useBlockProps,
    __experimentalImageSizeControl as ImageSizeControl,
    store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { list, grid } from '@wordpress/icons';
import { store as coreStore } from '@wordpress/core-data';
import { registerEndpoint as registerEndpointMPT } from '../../rest';
 
/**
* Internal dependencies
*/
import {
    MIN_EXCERPT_LENGTH,
    MAX_EXCERPT_LENGTH,
    MAX_POSTS_COLUMNS,
} from './constants';
 
/**
* Register custom rest endpoint
*/
registerEndpointMPT();
 
const CATEGORIES_LIST_QUERY = {
    per_page: -1,
    context: "view",
};
 
/**
* Recieve featured media
*
* @param {Object} post
* @param {number} size
* @return {{url: string, alt: string}} Object with url and alt
*/
function getFeaturedImageDetails(post, size) {
    const image = get(post, ['_embedded', 'wp:featuredmedia', '0']);
 
    return {
        url:
            image?.media_details?.sizes?.[size]?.source_url ??
            image?.source_url,
        alt: image?.alt_text,
    };
}
 
function Edit({ attributes, setAttributes, context, isSelected }) {
    const postId = context.postId;
    const {
        showSubpages,
        postType,
        postsToShow,
        order,
        orderBy,
        categories,
        displayFeaturedImage,
        displayPostDate,
        excerptLength,
        displayPostContent,
        displayPostContentRadio,
        featuredImageSizeSlug,
        featuredImageSizeWidth,
        featuredImageSizeHeight,
        postLayout,
        readmoreType,
        displayLoadmore,
        columns,
    } = attributes;
    const {
        imageSizes,
        pageTeasers,
        defaultImageWidth,
        defaultImageHeight,
        categoriesList
    } = useSelect(
        (select) => {
            const postTypesQuery = select('core').getPostTypes({
                public: true,
                // _fields: 'name, slug, rest_base'
            });
            const { getEntityRecords } = select(coreStore);
            const settings = select(blockEditorStore).getSettings();
            const catIds =
                categories && categories.length > 0
                    ? categories.map((cat) => cat.id)
                    : [];
 
            const pageTeasersQuery = (showSubpages) ?
                pickBy(
                    {
                        parent: postId,
                        type: [select('core/editor').getCurrentPostType()],
                        status: 'publish',
                        context: 'edit',
                        order,
                        orderby: orderBy,
                        per_page: postsToShow,
                        _embed: 'wp:featuredmedia,wp:term',
                    },
                    (value) => typeof value !== 'undefined'
                ) :
                pickBy(
                    {
 
                        page_category: catIds,
                        type: ['posts'],
                        context: 'edit',
                        order,
                        orderby: orderBy,
                        per_page: postsToShow,
                        _embed: 'wp:featuredmedia,wp:term',
                    },
                    (value) => typeof value !== 'undefined'
                );
 
            return {
                defaultImageWidth: get(
                    settings.imageDimensions,
                    [featuredImageSizeSlug, 'width'],
                    0
                ),
                defaultImageHeight: get(
                    settings.imageDimensions,
                    [featuredImageSizeSlug, 'height'],
                    0
                ),
                imageSizes: settings.imageSizes,
                postTypes: postTypesQuery,
                pageTeasers: getEntityRecords(
                    'wp/v2',
                    'multiple-post-type',
                    pageTeasersQuery
                ),
                categoriesList: getEntityRecords(
                    "taxonomy",
                    "page_category",
                    CATEGORIES_LIST_QUERY
                )
            };
        },
        [postId, categories, postsToShow, featuredImageSizeSlug, order, orderBy, showSubpages]
    );
 
    const categorySuggestions =
        categoriesList?.reduce(
            (accumulator, category) => ({
                ...accumulator,
                [category.name]: category,
            }),
            {}
        ) ?? {};
 
    const selectCategories = (tokens) => {
        const hasNoSuggestion = tokens.some(
            (token) => typeof token === "string" && !categorySuggestions[token]
        );
        if (hasNoSuggestion) {
            return;
        }
        // Categories that are already will be objects, while new additions will be strings (the name).
        // allCategories nomalizes the array so that they are all objects.
        const allCategories = tokens.map((token) => {
            return typeof token === "string"
                ? categorySuggestions[token]
                : token;
        });
        // We do nothing if the category is not selected
        // from suggestions.
        if (includes(allCategories, null)) {
            return false;
        }
        setAttributes({ categories: allCategories });
    };
 
    const hasPosts = !!pageTeasers?.length;
    const blockProps = useBlockProps({
        className: 'pageteaser',
    });
 
    const imageSizeOptions = imageSizes
        .filter(({ slug }) => slug !== 'full')
        .map(({ name, slug }) => ({
            value: slug,
            label: name,
        }));
 
    const inspectorControls = (
        <InspectorControls>
            <PanelBody title={__('Post content settings')}>
                <ToggleControl
                    label={__('Show only sub pages')}
                    checked={showSubpages}
                    onChange={(value) =>
                        setAttributes({ showSubpages: value })
                    }
                />
                <ToggleControl
                    label={__('Post content')}
                    checked={displayPostContent}
                    onChange={(value) =>
                        setAttributes({ displayPostContent: value })
                    }
                />
 
                {displayPostContent && (
                    <RadioControl
                        label={__('Show:')}
                        selected={displayPostContentRadio}
                        options={[
                            {
                                label: __('Excerpt'),
                                value: 'excerpt'
                            },
                            {
                                label: __('Full post'),
                                value: 'full_post',
                            },
                        ]}
                        onChange={(value) =>
                            setAttributes({
                                displayPostContentRadio: value,
                            })
                        }
                    />
                )}
                {displayPostContent &&
                    displayPostContentRadio === 'excerpt' && (
                    <RangeControl
                        label={__('Max number of words in excerpt')}
                        value={excerptLength}
                        onChange={(value) =>
                            setAttributes({ excerptLength: value })
                        }
                        min={MIN_EXCERPT_LENGTH}
                        max={MAX_EXCERPT_LENGTH}
                    />
                )}
                <SelectControl
                    label={__('Readmore Type', 'vdplug')}
                    value={readmoreType}
                    onChange={(value) => setAttributes({ readmoreType: value })}
                    options={[
                        {
                            value: 'readmore',
                            label: __('Readmore', 'vdplug'),
                        },
                        {
                            value: 'title',
                            label: __('Title', 'vdplug'),
                        },
                        {
                            value: 'none',
                            label: __('None', 'vdplug'),
                        },
                    ]}
                />
 
                <ToggleControl
                    label={__('Show Loadmore')}
                    checked={displayLoadmore}
                    onChange={(value) =>
                        setAttributes({ displayLoadmore: value })
                    }
                />
            </PanelBody>
 
            <PanelBody title={__('Post meta settings')}>
                <ToggleControl
                    label={__('Display post date')}
                    checked={displayPostDate}
                    onChange={(value) =>
                        setAttributes({ displayPostDate: value })
                    }
                />
            </PanelBody>
 
            <PanelBody title={__('Featured image settings')}>
                <ToggleControl
                    label={__('Display featured image')}
                    checked={displayFeaturedImage}
                    onChange={(value) =>
                        setAttributes({ displayFeaturedImage: value })
                    }
                />
                {displayFeaturedImage && (
                    <>
                        <ImageSizeControl
                            onChange={(value) => {
                                const newAttrs = {};
                                if (value.hasOwnProperty('width')) {
                                    newAttrs.featuredImageSizeWidth =
                                        value.width;
                                }
                                if (value.hasOwnProperty('height')) {
                                    newAttrs.featuredImageSizeHeight =
                                        value.height;
                                }
                                setAttributes(newAttrs);
                            }}
                            slug={featuredImageSizeSlug}
                            width={featuredImageSizeWidth}
                            height={featuredImageSizeHeight}
                            imageWidth={defaultImageWidth}
                            imageHeight={defaultImageHeight}
                            imageSizeOptions={imageSizeOptions}
                            onChangeImage={(value) =>
                                setAttributes({
                                    featuredImageSizeSlug: value,
                                    featuredImageSizeWidth: undefined,
                                    featuredImageSizeHeight: undefined,
                                })
                            }
                        />
                    </>
                )}
            </PanelBody>
 
            <PanelBody title={__('Sorting and filtering')}>
                <QueryControls
                    {...{ order, orderBy }}
                    numberOfItems={postsToShow}
                    onOrderChange={(value) => setAttributes({ order: value })}
                    onOrderByChange={(value) =>
                        setAttributes({ orderBy: value })
                    }
                    onNumberOfItemsChange={(value) =>
                        setAttributes({ postsToShow: value })
                    }
                    categorySuggestions={categorySuggestions}
                    onCategoryChange={selectCategories}
                    selectedCategories={categories}
                />
 
                {postLayout === 'grid' && (
                    <RangeControl
                        label={__('Columns')}
                        value={columns}
                        onChange={(value) => setAttributes({ columns: value })}
                        min={2}
                        max={
                            !hasPosts
                                ? MAX_POSTS_COLUMNS
                                : Math.min(MAX_POSTS_COLUMNS, pageTeasers.length)
                        }
                        required
                    />
                )}
            </PanelBody>
        </InspectorControls>
    );
 
    const layoutControls = [
        {
            icon: list,
            title: __('List view'),
            onClick: () => setAttributes({ postLayout: 'list' }),
            isActive: postLayout === 'list',
        },
        {
            icon: grid,
            title: __('Grid view'),
            onClick: () => setAttributes({ postLayout: 'grid' }),
            isActive: postLayout === 'grid',
        },
    ];
 
    if (!hasPosts) {
        return (
            <>
                {isSelected && <>
                    {inspectorControls}
                    <BlockControls>
                        <ToolbarGroup controls={layoutControls} />
                    </BlockControls>
                </>}
 
                <div {...blockProps}>
                    <Placeholder label={__('Loading Page-Teasers')}>
                        {!Array.isArray(pageTeasers) ? (
                            <Spinner />
                        ) :
                            /* translators: output post type name */
                            `No posts for posttype "${postType}" found.`
                        }
                    </Placeholder>
                </div>
            </>
        );
    }
 
    const dateFormat = getSettings().formats.date;
 
    // Removing posts from display should be instant.
    const displayPosts =
        pageTeasers.length > postsToShow
            ? pageTeasers.slice(0, postsToShow)
            : pageTeasers;
 
    return (
        <>
            {isSelected && <>
                {inspectorControls}
                <BlockControls>
                    <ToolbarGroup controls={layoutControls} />
                </BlockControls>
            </>}
            <div {...blockProps}>
                {/* BEGIN LAYOUT Container */}
                <div className="pageteaser__layout edit-page">
                    {/* First Column: Display only 1 post */}
                    <div className="pageteaser__left">
                        {displayPosts.slice(0, 1).map((post) => {
                            const titleTrimmed = invoke(post, ['title', 'rendered', 'trim']);
                            
                            let excerpt = post.excerpt.rendered;
                            const excerptElement = document.createElement('div');
                            excerptElement.innerHTML = excerpt;
                            excerpt = excerptElement.textContent || excerptElement.innerText || '';
            
                            const { url: imageSourceUrl, alt: featuredImageAlt } = getFeaturedImageDetails(post, featuredImageSizeSlug);
            
                            const needsReadMore = excerptLength < excerpt.trim().split(' ').length && post.excerpt.raw === '';
            
                            const postExcerpt = needsReadMore ? (
                                <>
                                    {excerpt.trim().split(' ', excerptLength).join(' ')}
                                    {/* translators: excerpt truncation character, default … */}
                                    {__(' … ')}
                                    <span>{__('Read more')}</span>
                                </>
                            ) : (
                                excerpt
                            );
            
                            // Read taxonomy "page_categories"
                            let pageCategory = '';
                            try {
                                pageCategory = post?._embedded['wp:term'][0][0]?.name;
                            } catch {}
            
                            return (
                                <div className="teaser" key={`teaser-${post.id}`}>
                                    <article>
                                        {(displayFeaturedImage && imageSourceUrl) && (
                                            <figure className="wp-block-image size-full is-style-hover-scale">
                                                <img src={imageSourceUrl} alt={featuredImageAlt} className="page-teaser__featured" />
                                            </figure>
                                        )}
                                        <div className="teaser__inner">
                                            {post.page_category && <div className='teaser__info'>{pageCategory}</div>}
                                            {displayPostDate && post.date_gmt && (
                                                <time dateTime={format('c', post.date_gmt)} className="teaser__post-date">
                                                    {dateI18n(dateFormat, post.date_gmt)}
                                                </time>
                                            )}
                                            <h4 className="teaser__title" dangerouslySetInnerHTML={{ __html: titleTrimmed }} />
                                        
                                            {displayPostContent && displayPostContentRadio === 'excerpt' && postExcerpt > 0 && (
                                                <div className="teaser__excerpt">
                                                    {postExcerpt}
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                </div>
                            );
                        })}
                    </div>
            
                    {/* Second Column: Display remaining posts */}
                    <div className="pageteaser__right">
                        {displayPosts.slice(1).map((post) => {
                            // Same rendering logic for remaining posts
                            const titleTrimmed = invoke(post, ['title', 'rendered', 'trim']);
                            
                            let excerpt = post.excerpt.rendered;
                            const excerptElement = document.createElement('div');
                            excerptElement.innerHTML = excerpt;
                            excerpt = excerptElement.textContent || excerptElement.innerText || '';
            
                            const { url: imageSourceUrl, alt: featuredImageAlt } = getFeaturedImageDetails(post, featuredImageSizeSlug);
            
                            const needsReadMore = excerptLength < excerpt.trim().split(' ').length && post.excerpt.raw === '';
            
                            const postExcerpt = needsReadMore ? (
                                <>
                                    {excerpt.trim().split(' ', excerptLength).join(' ')}
                                    {/* translators: excerpt truncation character, default … */}
                                    {__(' … ')}
                                    <span>{__('Read more')}</span>
                                </>
                            ) : (
                                excerpt
                            );
            
                            let pageCategory = '';
                            try {
                                pageCategory = post?._embedded['wp:term'][0][0]?.name;
                            } catch {}
            
                            return (
                                <div className="teaser" key={`teaser-${post.id}`}>
                                    <article>
                                        {(displayFeaturedImage && imageSourceUrl) && (
                                            <figure className="wp-block-image size-full is-style-hover-scale">
                                                <img src={imageSourceUrl} alt={featuredImageAlt} className="page-teaser__featured" />
                                            </figure>
                                        )}
                                        <div className="teaser__inner">
                                            {post.page_category && <div className='teaser__info'>{pageCategory}</div>}
                                            {displayPostDate && post.date_gmt && (
                                                <time dateTime={format('c', post.date_gmt)} className="post-date">
                                                    {dateI18n(dateFormat, post.date_gmt)}
                                                </time>
                                            )}
                                            <h4 className="teaser__title" dangerouslySetInnerHTML={{ __html: titleTrimmed }} />
                                        
                                            {displayPostContent && displayPostContentRadio === 'excerpt' && postExcerpt > 0 && (
                                                <div className="teaser__excerpt">
                                                    {postExcerpt}
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* END LAYOUT Container */}
 
    {/* Load more */}
    {displayLoadmore && (
        <div className="pageteaser__footer">
            <button className="loadmore wp-block-button__link wp-element-button" type="button">Load more</button>
        </div>
    )}
</div>
 
        </>
    );
}
 
export default Edit;
