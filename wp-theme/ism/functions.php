<?php
defined( 'ABSPATH' ) || exit;

define( 'ISM_VERSION', '1.0.0' );
define( 'ISM_DIR', get_template_directory() );
define( 'ISM_URI', get_template_directory_uri() );

// ─── Theme Setup ──────────────────────────────────────────────────────────────

function ism_setup(): void {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ] );
	add_theme_support( 'custom-logo', [
		'height'      => 80,
		'width'       => 240,
		'flex-height' => true,
		'flex-width'  => true,
	] );
	add_theme_support( 'customize-selective-refresh-widgets' );

	register_nav_menus( [
		'primary' => __( 'Primary Navigation', 'ism' ),
		'footer'  => __( 'Footer Navigation', 'ism' ),
	] );
}
add_action( 'after_setup_theme', 'ism_setup' );

// ─── Enqueue Assets ───────────────────────────────────────────────────────────

function ism_enqueue_assets(): void {
	$variant = ism_get_variant();

	// Google Fonts based on variant
	$font_url = match( $variant ) {
		'authority' => 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap',
		'local'     => 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
		default     => 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
	};

	wp_enqueue_style( 'ism-fonts', $font_url, [], null );
	wp_enqueue_style( 'ism-main', ISM_URI . '/assets/css/ism.css', [ 'ism-fonts' ], ISM_VERSION );
	wp_enqueue_script( 'ism-js', ISM_URI . '/assets/js/ism.js', [], ISM_VERSION, true );

	// Pass business data to JS
	wp_localize_script( 'ism-js', 'ISM', [
		'variant' => $variant,
		'phone'   => ism_get_option( 'phone' ),
		'ctaUrl'  => ism_get_option( 'booking_url', '#contact' ),
	] );
}
add_action( 'wp_enqueue_scripts', 'ism_enqueue_assets' );

// ─── Body Class ───────────────────────────────────────────────────────────────

function ism_body_classes( array $classes ): array {
	$variant   = ism_get_variant();
	$classes[] = 'ism-theme';
	$classes[] = 'ism-' . $variant;
	return $classes;
}
add_filter( 'body_class', 'ism_body_classes' );

// ─── Schema JSON-LD ───────────────────────────────────────────────────────────

function ism_inject_schema(): void {
	global $post;
	if ( ! is_singular() || empty( $post ) ) return;

	$schema_raw = get_post_meta( $post->ID, '_irents_schema', true );
	if ( ! $schema_raw ) return;

	$schemas = json_decode( $schema_raw, true );
	if ( ! is_array( $schemas ) || empty( $schemas ) ) return;

	foreach ( $schemas as $schema ) {
		echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "</script>\n";
	}
}
add_action( 'wp_head', 'ism_inject_schema' );

// ─── SEO Meta ─────────────────────────────────────────────────────────────────

function ism_inject_meta(): void {
	global $post;
	if ( ! is_singular() || empty( $post ) ) return;

	$meta_title = get_post_meta( $post->ID, '_ism_meta_title', true );
	$meta_desc  = get_post_meta( $post->ID, '_ism_meta_desc', true );

	if ( $meta_title ) {
		echo '<meta name="title" content="' . esc_attr( $meta_title ) . '">\n';
	}
	if ( $meta_desc ) {
		echo '<meta name="description" content="' . esc_attr( $meta_desc ) . '">\n';
	}
}
add_action( 'wp_head', 'ism_inject_meta', 1 );

// ─── Title Tag ────────────────────────────────────────────────────────────────

add_filter( 'document_title_parts', function( $parts ) {
	global $post;
	if ( ! is_singular() || empty( $post ) ) return $parts;
	$meta_title = get_post_meta( $post->ID, '_ism_meta_title', true );
	if ( $meta_title ) $parts['title'] = $meta_title;
	return $parts;
} );

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ism_get_variant(): string {
	$variant = get_option( 'irents_theme_name', 'horizon' );
	return in_array( $variant, [ 'horizon', 'authority', 'local' ], true ) ? $variant : 'horizon';
}

function ism_get_option( string $key, string $fallback = '' ): string {
	$data = get_option( 'irents_project_data', [] );
	return isset( $data[ $key ] ) ? (string) $data[ $key ] : $fallback;
}

function ism_get_phone(): string {
	return ism_get_option( 'phone', '' );
}

function ism_get_business_name(): string {
	return ism_get_option( 'business_name', get_bloginfo( 'name' ) );
}

function ism_get_cta_url(): string {
	return ism_get_option( 'booking_url', '#contact' );
}

function ism_get_cta_label(): string {
	return ism_get_option( 'cta_label', 'Get a Free Quote' );
}

function ism_get_logo_html(): string {
	if ( has_custom_logo() ) {
		return get_custom_logo();
	}
	$name = ism_get_business_name();
	return '<span class="ism-nav__wordmark">' . esc_html( $name ) . '</span>';
}

function ism_nav_fallback(): void {
	$pages = get_pages( [ 'sort_column' => 'menu_order', 'number' => 10 ] );
	echo '<ul class="ism-nav__menu" id="ism-primary-menu">';
	foreach ( $pages as $page ) {
		echo '<li><a href="' . esc_url( get_permalink( $page ) ) . '">' . esc_html( $page->post_title ) . '</a></li>';
	}
	echo '</ul>';
}

// Remove WP default styles that conflict
function ism_remove_wp_bloat(): void {
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'classic-theme-styles' );
}
add_action( 'wp_enqueue_scripts', 'ism_remove_wp_bloat', 100 );
