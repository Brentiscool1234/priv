<?php
/**
 * ISM_Sitemap_Handler — sitemap integration and fallback endpoint.
 *
 * - Adds a filter so Yoast SEO and RankMath include all published iRents pages.
 * - Provides get_sitemap_entries() used by the REST /sitemap endpoint.
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

class ISM_Sitemap_Handler {

	/**
	 * Register hooks.
	 */
	public function init(): void {
		// Yoast SEO: add iRents pages to the post sitemap.
		add_filter( 'wpseo_sitemap_entry', [ $this, 'yoast_sitemap_entry' ], 10, 3 );

		// RankMath: ensure pages managed by iRents are indexed.
		add_filter( 'rank_math/sitemap/entry', [ $this, 'rankmath_sitemap_entry' ], 10, 3 );

		// WordPress core sitemap (WP 5.5+).
		add_filter( 'wp_sitemaps_posts_query_args', [ $this, 'core_sitemap_query_args' ], 10, 2 );
	}

	/**
	 * Yoast: ensure the entry is included (return as-is; Yoast already includes pages).
	 *
	 * @param array  $url      Sitemap URL data.
	 * @param string $type     Object type.
	 * @param object $object   Post object.
	 * @return array
	 */
	public function yoast_sitemap_entry( array $url, string $type, $object ): array {
		return $url; // No filtering needed — pages are included by default.
	}

	/**
	 * RankMath: include iRents pages.
	 *
	 * @param array  $entry  Sitemap entry.
	 * @param string $type   Object type.
	 * @param object $object Post object.
	 * @return array
	 */
	public function rankmath_sitemap_entry( array $entry, string $type, $object ): array {
		return $entry;
	}

	/**
	 * WordPress core sitemap: make sure the query fetches all published pages.
	 *
	 * @param array  $args      WP_Query args.
	 * @param string $post_type Post type.
	 * @return array
	 */
	public function core_sitemap_query_args( array $args, string $post_type ): array {
		if ( 'page' === $post_type ) {
			// No modifications needed; WP already returns all published pages.
		}
		return $args;
	}

	/**
	 * Build sitemap entries for the REST /sitemap endpoint.
	 *
	 * Returns an array of objects: { id, slug, title, url, modified, page_type }
	 *
	 * @return array
	 */
	public function get_sitemap_entries(): array {
		$query = new WP_Query( [
			'post_type'              => 'page',
			'post_status'            => 'publish',
			'posts_per_page'         => -1,
			'no_found_rows'          => true,
			'update_post_term_cache' => false,
		] );

		$entries = [];

		foreach ( $query->posts as $post ) {
			$entries[] = [
				'id'        => (int) $post->ID,
				'slug'      => $post->post_name,
				'title'     => $post->post_title,
				'url'       => get_permalink( $post ),
				'modified'  => get_post_modified_time( 'c', true, $post ),
				'page_type' => get_post_meta( $post->ID, '_irents_page_type', true ),
				'locale'    => get_post_meta( $post->ID, '_irents_locale', true ),
			];
		}

		return $entries;
	}
}
