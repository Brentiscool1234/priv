<?php
/**
 * ISM_Auth — Bearer-token authentication for REST endpoints.
 *
 * The plugin key is stored in wp_options as `irents_plugin_key`.
 * Every REST request to the irents/v1 namespace must include:
 *
 *   Authorization: Bearer <key>
 *
 * A 401 WP_Error is returned for missing or invalid tokens.
 */

defined( 'ABSPATH' ) || exit;

class ISM_Auth {

	const OPTION_KEY = 'irents_plugin_key';

	/**
	 * Generate a cryptographically random 32-character hex key.
	 *
	 * @return string
	 */
	public static function generate_key(): string {
		return bin2hex( random_bytes( 16 ) ); // 32 hex chars
	}

	/**
	 * Retrieve the stored plugin key.
	 *
	 * @return string
	 */
	public static function get_key(): string {
		return (string) get_option( self::OPTION_KEY, '' );
	}

	/**
	 * Validate the Authorization header on an incoming REST request.
	 *
	 * Returns true on success, WP_Error on failure.
	 *
	 * @param WP_REST_Request $request
	 * @return true|WP_Error
	 */
	public static function validate( WP_REST_Request $request ) {
		$stored_key = self::get_key();

		if ( empty( $stored_key ) ) {
			return new WP_Error(
				'ism_no_key',
				'Plugin key not configured.',
				array( 'status' => 500 )
			);
		}

		$auth_header = $request->get_header( 'Authorization' );

		if ( empty( $auth_header ) ) {
			// Some environments strip the Authorization header; try the server
			// variable directly.
			$auth_header = isset( $_SERVER['HTTP_AUTHORIZATION'] )
				? sanitize_text_field( wp_unslash( $_SERVER['HTTP_AUTHORIZATION'] ) )
				: '';
		}

		if ( empty( $auth_header ) ) {
			return new WP_Error(
				'ism_missing_token',
				'Authorization header is required.',
				array( 'status' => 401 )
			);
		}

		if ( ! preg_match( '/^Bearer\s+(\S+)$/i', $auth_header, $matches ) ) {
			return new WP_Error(
				'ism_invalid_token_format',
				'Authorization header must use Bearer scheme.',
				array( 'status' => 401 )
			);
		}

		$provided_key = $matches[1];

		// Use hash_equals to prevent timing attacks.
		if ( ! hash_equals( $stored_key, $provided_key ) ) {
			return new WP_Error(
				'ism_invalid_token',
				'Invalid Bearer token.',
				array( 'status' => 401 )
			);
		}

		return true;
	}

	/**
	 * Permission callback suitable for use with register_rest_route.
	 *
	 * @param WP_REST_Request $request
	 * @return true|WP_Error
	 */
	public static function permission_callback( WP_REST_Request $request ) {
		return self::validate( $request );
	}
}
