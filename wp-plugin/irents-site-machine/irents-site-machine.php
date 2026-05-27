<?php
/**
 * Plugin Name: iRents Site Machine Connector
 * Plugin URI: https://private
 * Description: Private connector plugin for iRents Site Machine. Receives content from the external app and manages pages, schema, menus, and sitemaps.
 * Version: 1.0.0
 * Author: iRents
 * Text Domain: irents-site-machine
 * License: Private
 */

defined( 'ABSPATH' ) || exit;

define( 'ISM_VERSION', '1.0.0' );
define( 'ISM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'ISM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// ---------------------------------------------------------------------------
// Load all classes
// ---------------------------------------------------------------------------
require_once ISM_PLUGIN_DIR . 'includes/class-logger.php';
require_once ISM_PLUGIN_DIR . 'includes/class-auth.php';
require_once ISM_PLUGIN_DIR . 'includes/class-page-builder.php';
require_once ISM_PLUGIN_DIR . 'includes/class-schema-injector.php';
require_once ISM_PLUGIN_DIR . 'includes/class-hreflang.php';
require_once ISM_PLUGIN_DIR . 'includes/class-menu-builder.php';
require_once ISM_PLUGIN_DIR . 'includes/class-sitemap-handler.php';
require_once ISM_PLUGIN_DIR . 'includes/class-template-manager.php';
require_once ISM_PLUGIN_DIR . 'includes/class-api-router.php';

// ---------------------------------------------------------------------------
// Activation / Deactivation hooks
// ---------------------------------------------------------------------------
register_activation_hook( __FILE__, 'ism_activate' );
register_deactivation_hook( __FILE__, 'ism_deactivate' );

function ism_activate() {
	// Generate plugin key if none exists.
	if ( ! get_option( 'irents_plugin_key' ) ) {
		update_option( 'irents_plugin_key', ISM_Auth::generate_key() );
	}

	// Seed empty deployment log.
	if ( ! get_option( 'irents_deployment_log' ) ) {
		update_option( 'irents_deployment_log', array() );
	}

	// Flush rewrite rules so REST routes are available immediately.
	flush_rewrite_rules();

	ISM_Logger::log( 'Plugin activated — version ' . ISM_VERSION );
}

function ism_deactivate() {
	flush_rewrite_rules();
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
add_action( 'rest_api_init', array( 'ISM_Api_Router', 'register_routes' ) );

// Front-end hooks.
add_action( 'wp_head', array( 'ISM_Schema_Injector', 'output_schema' ) );
add_action( 'wp_head', array( 'ISM_Hreflang', 'output_hreflang' ) );
add_action( 'wp_head', 'ism_output_meta_tags' );

// Enqueue front-end assets.
add_action( 'wp_enqueue_scripts', 'ism_enqueue_frontend_assets' );

// Template loader: map page-type meta to physical template files.
add_filter( 'template_include', array( 'ISM_Template_Manager', 'resolve_template' ) );

// Admin.
add_action( 'admin_menu', 'ism_register_admin_menu' );
add_action( 'admin_enqueue_scripts', 'ism_enqueue_admin_assets' );

// AJAX handlers for admin key actions.
add_action( 'wp_ajax_ism_reveal_key',      'ism_ajax_reveal_key' );
add_action( 'wp_ajax_ism_regenerate_key',  'ism_ajax_regenerate_key' );

// ---------------------------------------------------------------------------
// Front-end meta tags (description + canonical)
// ---------------------------------------------------------------------------
function ism_output_meta_tags() {
	if ( ! is_singular() ) {
		return;
	}

	$post_id     = get_the_ID();
	$meta_desc   = get_post_meta( $post_id, '_irents_meta_description', true );
	$canonical   = get_post_meta( $post_id, '_irents_canonical', true );

	if ( $meta_desc ) {
		echo '<meta name="description" content="' . esc_attr( $meta_desc ) . '">' . "\n";
	}
	if ( $canonical ) {
		echo '<link rel="canonical" href="' . esc_url( $canonical ) . '">' . "\n";
	}
}

// ---------------------------------------------------------------------------
// Front-end assets
// ---------------------------------------------------------------------------
function ism_enqueue_frontend_assets() {
	wp_enqueue_style(
		'irents-frontend',
		ISM_PLUGIN_URL . 'assets/css/irents-frontend.css',
		array(),
		ISM_VERSION
	);

	// Output brand colour CSS vars.
	$colors = get_option( 'irents_brand_colors', array() );
	if ( ! empty( $colors ) ) {
		$primary   = isset( $colors['primary'] )   ? sanitize_hex_color( $colors['primary'] )   : '#0073aa';
		$secondary = isset( $colors['secondary'] ) ? sanitize_hex_color( $colors['secondary'] ) : '#005a87';
		$accent    = isset( $colors['accent'] )    ? sanitize_hex_color( $colors['accent'] )    : '#f0a500';
		$inline_css = ":root{--irents-primary:{$primary};--irents-secondary:{$secondary};--irents-accent:{$accent};}";
		wp_add_inline_style( 'irents-frontend', $inline_css );
	}

	wp_enqueue_script(
		'irents-frontend',
		ISM_PLUGIN_URL . 'assets/js/irents-frontend.js',
		array(),
		ISM_VERSION,
		true
	);
}

// ---------------------------------------------------------------------------
// Admin menu
// ---------------------------------------------------------------------------
function ism_register_admin_menu() {
	add_menu_page(
		__( 'iRents Site Machine', 'irents-site-machine' ),
		__( 'iRents', 'irents-site-machine' ),
		'manage_options',
		'irents-site-machine',
		'ism_render_admin_page',
		'dashicons-networking',
		80
	);
}

function ism_render_admin_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to access this page.', 'irents-site-machine' ) );
	}
	require_once ISM_PLUGIN_DIR . 'admin/admin-page.php';
}

function ism_enqueue_admin_assets( $hook ) {
	if ( 'toplevel_page_irents-site-machine' !== $hook ) {
		return;
	}
	wp_enqueue_style(
		'irents-admin',
		ISM_PLUGIN_URL . 'admin/admin-styles.css',
		array(),
		ISM_VERSION
	);
}

// ---------------------------------------------------------------------------
// AJAX: reveal / regenerate plugin key
// ---------------------------------------------------------------------------
function ism_ajax_reveal_key() {
	check_ajax_referer( 'ism_admin_nonce', 'nonce' );
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( 'Forbidden', 403 );
	}
	wp_send_json_success( array( 'key' => get_option( 'irents_plugin_key', '' ) ) );
}

function ism_ajax_regenerate_key() {
	check_ajax_referer( 'ism_admin_nonce', 'nonce' );
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( 'Forbidden', 403 );
	}
	$new_key = ISM_Auth::generate_key();
	update_option( 'irents_plugin_key', $new_key );
	ISM_Logger::log( 'Plugin key regenerated by admin.' );
	wp_send_json_success( array( 'key' => $new_key ) );
}
