import { registerBlockType } from '@wordpress/blocks';
import { ReactComponent as icon } from './icon.svg';
import metadata from './block.json';
import edit from './edit';
import './style.css';

registerBlockType(metadata, {
    icon,
    edit,
    // Render with PHP only
    save: () => null,
});
