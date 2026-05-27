<?php
/**
 * ISM_Logger — lightweight deployment / activity logger.
 *
 * Entries are stored as a JSON array in the wp_options row
 * `irents_deployment_log`.  Only the most recent 100 entries are
 * kept to avoid unbounded growth.
 */

defined( 'ABSPATH' ) || exit;

class ISM_Logger {

	const OPTION_KEY  = 'irents_deployment_log';
	const MAX_ENTRIES = 100;

	/**
	 * Append a message to the deployment log.
	 *
	 * @param string $message  Human-readable log message.
	 * @param string $level    'info' | 'warning' | 'error'
	 */
	public static function log( string $message, string $level = 'info' ): void {
		$log = get_option( self::OPTION_KEY, array() );

		if ( ! is_array( $log ) ) {
			$log = array();
		}

		$entry = array(
			'timestamp' => current_time( 'mysql' ),
			'level'     => sanitize_key( $level ),
			'message'   => sanitize_text_field( $message ),
		);

		array_unshift( $log, $entry ); // newest first

		// Trim to max entries.
		if ( count( $log ) > self::MAX_ENTRIES ) {
			$log = array_slice( $log, 0, self::MAX_ENTRIES );
		}

		update_option( self::OPTION_KEY, $log );
	}

	/**
	 * Return recent log entries.
	 *
	 * @param int $limit Max number of entries to return.
	 * @return array
	 */
	public static function get_log( int $limit = 20 ): array {
		$log = get_option( self::OPTION_KEY, array() );

		if ( ! is_array( $log ) ) {
			return array();
		}

		return array_slice( $log, 0, $limit );
	}

	/**
	 * Clear the entire log.
	 */
	public static function clear(): void {
		update_option( self::OPTION_KEY, array() );
	}
}
