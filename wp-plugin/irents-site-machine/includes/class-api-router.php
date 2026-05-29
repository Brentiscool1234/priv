<?php
/**
 * ISM_Api_Router — registers all REST API endpoints under irents/v1.
 */

defined( 'ABSPATH' ) || exit;

class ISM_Api_Router {

	const NAMESPACE = 'irents/v1';

	public static function register_routes(): void {
		$ns = self::NAMESPACE;
		$cb = array( 'ISM_Auth', 'permission_callback' );

		// POST /irents/v1/connect
		register_rest_route( $ns, '/connect', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( __CLASS__, 'handle_connect' ),
			'permission_callback' => $cb,
		) );

		// GET /irents/v1/status
		register_rest_route( $ns, '/status', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( __CLASS__, 'handle_status' ),
			'permission_callback' => $cb,
		) );

		// POST /irents/v1/project
		register_rest_route( $ns, '/project', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( __CLASS__, 'handle_project' ),
			'permission_callback' => $cb,
		) );

		// POST /irents/v1/pages/bulk-create
		register_rest_route( $ns, '/pages/bulk-create', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( __CLASS__, 'handle_bulk_create' ),
			'permission_callback' => $cb,
		) );

		// POST /irents/v1/pages/bulk-update
		register_rest_route( $ns, '/pages/bulk-update', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( __CLASS__, 'handle_bulk_update' ),
			'permission_callback' => $cb,
		) );

		// POST /irents/v1/pages/{id}/schema
		register_rest_route( $ns, '/pages/(?P<id>\d+)/schema', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( __CLASS__, 'handle_page_schema' ),
			'permission_callback' => $cb,
			'args'                => array(
				'id' => array(
					'required'          => true,
					'validate_callback' => function( $param ) {
						return is_numeric( $param ) && (int) $param > 0;
					},
					'sanitize_callback' => 'absint',
				),
			),
		) );

		// POST /irents/v1/menus
		register_rest_route( $ns, '/menus', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( __CLASS__, 'handle_menus' ),
			'permission_callback' => $cb,
		) );

		// POST /irents/v1/settings
		register_rest_route( $ns, '/settings', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( __CLASS__, 'handle_settings' ),
			'permission_callback' => $cb,
		) );

		// GET /irents/v1/sitemap
		register_rest_route( $ns, '/sitemap', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( __CLASS__, 'handle_sitemap' ),
			'permission_callback' => $cb,
		) );
	}

	// -------------------------------------------------------------------------
	// Handlers
	// -------------------------------------------------------------------------

	/**
	 * POST /connect — handshake / connection test.
	 */
	public static function handle_connect( WP_REST_Request $request ): WP_REST_Response {
		global $wp_version;

		ISM_Logger::log( 'Connection test from remote app.' );

		return new WP_REST_Response( array(
			'success'    => true,
			'wp_version' => $wp_version,
			'site_url'   => get_site_url(),
			'site_name'  => get_bloginfo( 'name' ),
			'ism_version'=> ISM_VERSION,
			'timezone'   => wp_timezone_string(),
		), 200 );
	}

	/**
	 * GET /status — site and plugin status.
	 */
	public static function handle_status( WP_REST_Request $request ): WP_REST_Response {
		global $wp_version;

		$pages_count = (int) wp_count_posts( 'page' )->publish;
		$menus       = wp_get_nav_menus();
		$menus_count = is_array( $menus ) ? count( $menus ) : 0;

		$active_plugins = array();
		$all_plugins    = get_option( 'active_plugins', array() );
		foreach ( $all_plugins as $plugin ) {
			$active_plugins[] = sanitize_text_field( $plugin );
		}

		return new WP_REST_Response( array(
			'status'         => 'ok',
			'wp_version'     => $wp_version,
			'ism_version'    => ISM_VERSION,
			'plugins_active' => $active_plugins,
			'pages_count'    => $pages_count,
			'menus_count'    => $menus_count,
		), 200 );
	}

	/**
	 * POST /project — store project-level metadata.
	 */
	public static function handle_project( WP_REST_Request $request ): WP_REST_Response {
		$body = $request->get_json_params();

		if ( empty( $body ) ) {
			return new WP_REST_Response( array( 'error' => 'Empty request body.' ), 400 );
		}

		$allowed_keys = array(
			'business_name', 'locale', 'base_url', 'niche',
			'city', 'state', 'phone', 'email', 'tagline',
		);

		$sanitized = array();
		foreach ( $allowed_keys as $key ) {
			if ( isset( $body[ $key ] ) ) {
				$sanitized[ $key ] = sanitize_text_field( $body[ $key ] );
			}
		}

		update_option( 'irents_project_data', $sanitized );
		ISM_Logger::log( 'Project data updated: ' . ( $sanitized['business_name'] ?? 'unknown' ) );

		return new WP_REST_Response( array(
			'success' => true,
			'stored'  => $sanitized,
		), 200 );
	}

	/**
	 * POST /pages/bulk-create
	 */
	public static function handle_bulk_create( WP_REST_Request $request ): WP_REST_Response {
		$body = $request->get_json_params();

		if ( empty( $body['pages'] ) || ! is_array( $body['pages'] ) ) {
			return new WP_REST_Response( array( 'error' => 'pages array is required.' ), 400 );
		}

		$builder = new ISM_Page_Builder();
		$result  = $builder->bulk_create( $body['pages'] );

		ISM_Logger::log(
			sprintf(
				'Bulk create: %d created, %d failed out of %d total.',
				count( $result['created'] ),
				count( $result['failed'] ),
				$result['total']
			)
		);

		return new WP_REST_Response( $result, 200 );
	}

	/**
	 * POST /pages/bulk-update
	 */
	public static function handle_bulk_update( WP_REST_Request $request ): WP_REST_Response {
		$body = $request->get_json_params();

		if ( empty( $body['pages'] ) || ! is_array( $body['pages'] ) ) {
			return new WP_REST_Response( array( 'error' => 'pages array is required.' ), 400 );
		}

		$builder = new ISM_Page_Builder();
		$updated = array();
		$failed  = array();

		foreach ( $body['pages'] as $page_data ) {
			if ( empty( $page_data['wp_page_id'] ) ) {
				$failed[] = array( 'data' => $page_data, 'error' => 'wp_page_id is required.' );
				continue;
			}

			$page_id = absint( $page_data['wp_page_id'] );
			$result  = $builder->update_page( $page_id, $page_data );

			if ( is_wp_error( $result ) ) {
				$failed[] = array( 'wp_page_id' => $page_id, 'error' => $result->get_error_message() );
			} else {
				$updated[] = $result;
			}
		}

		ISM_Logger::log( sprintf( 'Bulk update: %d updated, %d failed.', count( $updated ), count( $failed ) ) );

		return new WP_REST_Response( array(
			'updated' => $updated,
			'failed'  => $failed,
			'total'   => count( $body['pages'] ),
		), 200 );
	}

	/**
	 * POST /pages/{id}/schema
	 */
	public static function handle_page_schema( WP_REST_Request $request ): WP_REST_Response {
		$page_id = $request->get_param( 'id' );
		$body    = $request->get_json_params();

		if ( ! get_post( $page_id ) ) {
			return new WP_REST_Response( array( 'error' => 'Page not found.' ), 404 );
		}

		if ( empty( $body['schema'] ) ) {
			return new WP_REST_Response( array( 'error' => 'schema field is required.' ), 400 );
		}

		$schema_raw = $body['schema'];

		// Accept array or JSON string.
		if ( is_array( $schema_raw ) ) {
			$schema_json = wp_json_encode( $schema_raw );
		} else {
			// Validate it is JSON.
			json_decode( $schema_raw );
			if ( json_last_error() !== JSON_ERROR_NONE ) {
				return new WP_REST_Response( array( 'error' => 'schema must be valid JSON.' ), 400 );
			}
			$schema_json = $schema_raw;
		}

		update_post_meta( $page_id, '_irents_schema', $schema_json );
		ISM_Logger::log( "Schema updated for page ID {$page_id}." );

		return new WP_REST_Response( array(
			'success' => true,
			'page_id' => $page_id,
		), 200 );
	}

	/**
	 * POST /menus
	 */
	public static function handle_menus( WP_REST_Request $request ): WP_REST_Response {
		$body = $request->get_json_params();

		if ( empty( $body['name'] ) ) {
			return new WP_REST_Response( array( 'error' => 'Menu name is required.' ), 400 );
		}

		$menu_builder = new ISM_Menu_Builder();
		$result       = $menu_builder->create_menu(
			sanitize_text_field( $body['name'] ),
			$body['items']       ?? array(),
			$body['location']    ?? ''
		);

		if ( is_wp_error( $result ) ) {
			return new WP_REST_Response( array( 'error' => $result->get_error_message() ), 500 );
		}

		ISM_Logger::log( 'Menu created: ' . sanitize_text_field( $body['name'] ) );

		return new WP_REST_Response( array(
			'success' => true,
			'menu_id' => $result,
		), 200 );
	}

	/**
	 * POST /settings
	 */
	public static function handle_settings( WP_REST_Request $request ): WP_REST_Response {
		$body = $request->get_json_params();

		if ( isset( $body['site_title'] ) ) {
			update_option( 'blogname', sanitize_text_field( $body['site_title'] ) );
		}

		if ( isset( $body['tagline'] ) ) {
			update_option( 'blogdescription', sanitize_text_field( $body['tagline'] ) );
		}

		if ( isset( $body['brand_colors'] ) && is_array( $body['brand_colors'] ) ) {
			$colors = array(
				'primary'   => sanitize_hex_color( $body['brand_colors']['primary']   ?? '#0073aa' ),
				'secondary' => sanitize_hex_color( $body['brand_colors']['secondary'] ?? '#005a87' ),
				'accent'    => sanitize_hex_color( $body['brand_colors']['accent']    ?? '#f0a500' ),
			);
			update_option( 'irents_brand_colors', $colors );
		}

		// Theme name — adds body class so CSS can target the whole site.
		if ( isset( $body['theme_name'] ) && is_string( $body['theme_name'] ) ) {
			$allowed_themes = array( 'horizon', 'authority', 'local' );
			if ( in_array( $body['theme_name'], $allowed_themes, true ) ) {
				update_option( 'irents_theme_name', $body['theme_name'] );
			}
		}

		// Theme CSS — injected globally on the front-end for all generated pages.
		if ( isset( $body['theme_css'] ) && is_string( $body['theme_css'] ) ) {
			// Store raw CSS (trusted source — authenticated via plugin key).
			update_option( 'irents_theme_css', $body['theme_css'] );
		}

		// Logo: expects an attachment ID or URL.
		if ( ! empty( $body['logo_attachment_id'] ) ) {
			$logo_id = absint( $body['logo_attachment_id'] );
			if ( $logo_id && wp_attachment_is_image( $logo_id ) ) {
				update_option( 'irents_logo_id', $logo_id );

				// Set as custom_logo if the theme supports it.
				if ( get_theme_support( 'custom-logo' ) ) {
					set_theme_mod( 'custom_logo', $logo_id );
				}
			}
		}

		ISM_Logger::log( 'Site settings updated via API.' );

		return new WP_REST_Response( array( 'success' => true ), 200 );
	}

	/**
	 * GET /sitemap
	 */
	public static function handle_sitemap( WP_REST_Request $request ): WP_REST_Response {
		$handler = new ISM_Sitemap_Handler();
		$entries = $handler->get_sitemap_entries();

		return new WP_REST_Response( array(
			'success' => true,
			'total'   => count( $entries ),
			'entries' => $entries,
		), 200 );
	}
}
