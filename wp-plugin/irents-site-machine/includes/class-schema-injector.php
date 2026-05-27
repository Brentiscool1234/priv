<?php
/**
 * ISM_Schema_Injector — outputs JSON-LD schema markup in <head>.
 *
 * Reads the _irents_schema post meta (stored as a JSON string) and emits
 * one or more <script type="application/ld+json"> blocks.
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

class ISM_Schema_Injector {

	/**
	 * Register the wp_head hook.
	 */
	public function init(): void {
		add_action( 'wp_head', [ $this, 'output_schema' ], 10 );
	}

	/**
	 * Emit JSON-LD for the current singular post/page.
	 */
	public static function output_schema(): void {
		if ( ! is_singular() ) {
			return;
		}

		$schema_raw = get_post_meta( get_the_ID(), '_irents_schema', true );

		if ( empty( $schema_raw ) ) {
			return;
		}

		// Decode to validate.
		$decoded = json_decode( $schema_raw, true );

		if ( null === $decoded || json_last_error() !== JSON_ERROR_NONE ) {
			return;
		}

		// Normalise: allow a single schema object or an array of objects.
		if ( isset( $decoded['@type'] ) ) {
			$schemas = [ $decoded ];
		} elseif ( is_array( $decoded ) ) {
			$schemas = $decoded;
		} else {
			return;
		}

		foreach ( $schemas as $schema ) {
			if ( ! is_array( $schema ) ) {
				continue;
			}
			// Output each schema object as its own <script> block so that
			// validators can parse them independently.
			echo '<script type="application/ld+json">' . "\n";
			echo wp_json_encode( $schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT );
			echo "\n" . '</script>' . "\n";
		}
	}
}
