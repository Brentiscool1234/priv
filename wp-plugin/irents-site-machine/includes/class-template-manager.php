<?php
/**
 * ISM_Template_Manager — resolves page templates for iRents pages.
 *
 * WordPress stores the template filename in the _wp_page_template post meta.
 * When the stored template corresponds to a file inside this plugin's
 * templates/ directory, we intercept template_include and load that file
 * instead of the theme's fallback.
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

class ISM_Template_Manager {

	/**
	 * Register the template_include filter.
	 */
	public function init(): void {
		add_filter( 'template_include', [ $this, 'resolve_template' ], 99 );
	}

	/**
	 * Map the requested page template to a plugin file if one exists.
	 *
	 * @param string $template Absolute path to the currently selected template.
	 * @return string
	 */
	public static function resolve_template( string $template ): string {
		if ( ! is_singular( 'page' ) ) {
			return $template;
		}

		$post_id       = get_the_ID();
		$stored        = get_post_meta( $post_id, '_wp_page_template', true );

		if ( empty( $stored ) || 'default' === $stored ) {
			return $template;
		}

		$filename      = sanitize_file_name( basename( $stored ) );
		$plugin_file   = ISM_PLUGIN_DIR . 'templates/' . $filename;

		if ( file_exists( $plugin_file ) ) {
			return $plugin_file;
		}

		return $template;
	}

	/**
	 * Return the list of templates provided by this plugin so WordPress can
	 * display them in the Page Attributes meta box.
	 *
	 * Hook: theme_page_templates
	 *
	 * @param array  $templates Existing template list (filename => label).
	 * @return array
	 */
	public static function get_plugin_templates( array $templates ): array {
		$plugin_templates = [
			'page-homepage.php'         => __( 'iRents — Homepage',         'irents-site-machine' ),
			'page-service.php'          => __( 'iRents — Service',          'irents-site-machine' ),
			'page-location.php'         => __( 'iRents — Location',         'irents-site-machine' ),
			'page-service-location.php' => __( 'iRents — Service + City',   'irents-site-machine' ),
			'page-about.php'            => __( 'iRents — About',            'irents-site-machine' ),
			'page-faq.php'              => __( 'iRents — FAQ',              'irents-site-machine' ),
			'page-contact.php'          => __( 'iRents — Contact',          'irents-site-machine' ),
		];

		return array_merge( $templates, $plugin_templates );
	}
}

// Register templates in the WP admin template selector.
add_filter( 'theme_page_templates', [ 'ISM_Template_Manager', 'get_plugin_templates' ] );
