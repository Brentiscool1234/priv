<?php
/**
 * ISM_Hreflang — outputs hreflang link tags in <head>.
 *
 * Reads _irents_hreflang post meta (JSON array of {locale, url} objects)
 * and emits the corresponding <link rel="alternate" hreflang="..."> tags,
 * plus an x-default tag for the primary (first) locale.
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

class ISM_Hreflang {

	/**
	 * Register wp_head hook.
	 */
	public function init(): void {
		add_action( 'wp_head', [ $this, 'output_hreflang' ], 5 );
	}

	/**
	 * Output hreflang tags for the current singular post/page.
	 */
	public static function output_hreflang(): void {
		if ( ! is_singular() ) {
			return;
		}

		$raw = get_post_meta( get_the_ID(), '_irents_hreflang', true );

		if ( empty( $raw ) ) {
			return;
		}

		$entries = json_decode( $raw, true );

		if ( ! is_array( $entries ) || json_last_error() !== JSON_ERROR_NONE ) {
			return;
		}

		$x_default_emitted = false;

		foreach ( $entries as $index => $entry ) {
			if ( empty( $entry['locale'] ) || empty( $entry['url'] ) ) {
				continue;
			}

			$locale = esc_attr( sanitize_text_field( $entry['locale'] ) );
			$url    = esc_url( $entry['url'] );

			echo '<link rel="alternate" hreflang="' . $locale . '" href="' . $url . '">' . "\n";

			// Emit x-default for the first valid entry.
			if ( ! $x_default_emitted ) {
				echo '<link rel="alternate" hreflang="x-default" href="' . $url . '">' . "\n";
				$x_default_emitted = true;
			}
		}
	}
}
