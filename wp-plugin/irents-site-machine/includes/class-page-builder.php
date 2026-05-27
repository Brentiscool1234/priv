<?php
/**
 * ISM_Page_Builder — creates and updates WordPress pages from payload data.
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

class ISM_Page_Builder {

	/**
	 * Meta keys that are stored verbatim (sanitized as plain text).
	 */
	const TEXT_META_KEYS = [
		'_irents_meta_title',
		'_irents_meta_description',
		'_irents_h1',
		'_irents_primary_keyword',
		'_irents_page_type',
		'_irents_locale',
		'_irents_canonical',
	];

	/**
	 * Meta keys stored as-is (JSON strings — validated before saving).
	 */
	const JSON_META_KEYS = [
		'_irents_schema',
		'_irents_hreflang',
	];

	/**
	 * Create a single WordPress page.
	 *
	 * @param array $data Page payload from the external app.
	 * @return array|WP_Error  On success: ['id' => int, 'link' => string].
	 */
	public function create_page( array $data ) {
		$post_arr = $this->build_post_array( $data );

		$page_id = wp_insert_post( $post_arr, true );

		if ( is_wp_error( $page_id ) ) {
			return $page_id;
		}

		$this->save_meta( $page_id, $data );
		$this->set_template( $page_id, $data['template'] ?? '' );

		return [
			'id'   => $page_id,
			'link' => get_permalink( $page_id ),
			'slug' => $data['slug'] ?? '',
		];
	}

	/**
	 * Update an existing WordPress page.
	 *
	 * @param int   $page_id  WP post ID.
	 * @param array $data     Partial or full page payload.
	 * @return array|WP_Error On success: ['id' => int, 'link' => string].
	 */
	public function update_page( int $page_id, array $data ) {
		$existing = get_post( $page_id );

		if ( ! $existing || 'page' !== $existing->post_type ) {
			return new WP_Error(
				'ism_page_not_found',
				"Page ID {$page_id} does not exist.",
				[ 'status' => 404 ]
			);
		}

		$post_arr       = $this->build_post_array( $data );
		$post_arr['ID'] = $page_id;

		$result = wp_update_post( $post_arr, true );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$this->save_meta( $page_id, $data );

		if ( ! empty( $data['template'] ) ) {
			$this->set_template( $page_id, $data['template'] );
		}

		return [
			'id'   => $page_id,
			'link' => get_permalink( $page_id ),
		];
	}

	/**
	 * Bulk-create pages.
	 *
	 * @param array $pages Array of page payloads.
	 * @return array { created: array, failed: array, total: int }
	 */
	public function bulk_create( array $pages ): array {
		$created = [];
		$failed  = [];

		foreach ( $pages as $page_data ) {
			// If the slug already exists as a page, update rather than duplicate.
			if ( ! empty( $page_data['slug'] ) ) {
				$existing_id = $this->find_page_by_slug( sanitize_title( $page_data['slug'] ) );

				if ( $existing_id ) {
					$result = $this->update_page( $existing_id, $page_data );
					if ( is_wp_error( $result ) ) {
						$failed[] = [
							'slug'  => $page_data['slug'] ?? '',
							'error' => $result->get_error_message(),
						];
					} else {
						$result['action'] = 'updated';
						$created[]        = $result;
					}
					continue;
				}
			}

			$result = $this->create_page( $page_data );

			if ( is_wp_error( $result ) ) {
				$failed[] = [
					'slug'  => $page_data['slug'] ?? '',
					'error' => $result->get_error_message(),
				];
			} else {
				$result['action'] = 'created';
				$created[]        = $result;
			}
		}

		return [
			'created' => $created,
			'failed'  => $failed,
			'total'   => count( $pages ),
		];
	}

	// -------------------------------------------------------------------------
	// Private helpers
	// -------------------------------------------------------------------------

	/**
	 * Build the wp_insert_post / wp_update_post argument array.
	 */
	private function build_post_array( array $data ): array {
		$post_arr = [
			'post_type'    => 'page',
			'post_status'  => sanitize_key( $data['status'] ?? 'publish' ),
			'post_title'   => sanitize_text_field( $data['title'] ?? '' ),
			'post_content' => isset( $data['content'] ) ? wp_kses_post( $data['content'] ) : '',
		];

		if ( ! empty( $data['slug'] ) ) {
			$post_arr['post_name'] = sanitize_title( $data['slug'] );
		}

		// Parent page.
		if ( ! empty( $data['parent_id'] ) ) {
			$post_arr['post_parent'] = absint( $data['parent_id'] );
		} elseif ( ! empty( $data['parent_slug'] ) ) {
			$parent_id = $this->find_page_by_slug( sanitize_title( $data['parent_slug'] ) );
			if ( $parent_id ) {
				$post_arr['post_parent'] = $parent_id;
			}
		}

		// Menu order.
		if ( isset( $data['menu_order'] ) ) {
			$post_arr['menu_order'] = absint( $data['menu_order'] );
		}

		return $post_arr;
	}

	/**
	 * Save all _irents_* meta fields for a page.
	 */
	private function save_meta( int $page_id, array $data ): void {
		$meta = $data['meta'] ?? [];

		// Plain-text meta.
		foreach ( self::TEXT_META_KEYS as $key ) {
			if ( isset( $meta[ $key ] ) ) {
				update_post_meta( $page_id, $key, sanitize_text_field( $meta[ $key ] ) );
			}
		}

		// JSON meta — validate then store as string.
		foreach ( self::JSON_META_KEYS as $key ) {
			if ( isset( $meta[ $key ] ) ) {
				$value = $meta[ $key ];
				if ( is_array( $value ) ) {
					update_post_meta( $page_id, $key, wp_json_encode( $value ) );
				} elseif ( is_string( $value ) ) {
					json_decode( $value );
					if ( JSON_ERROR_NONE === json_last_error() ) {
						update_post_meta( $page_id, $key, $value );
					}
				}
			}
		}

		// Convenience: top-level locale / page_type also written to meta.
		if ( ! empty( $data['locale'] ) && empty( $meta['_irents_locale'] ) ) {
			update_post_meta( $page_id, '_irents_locale', sanitize_text_field( $data['locale'] ) );
		}
		if ( ! empty( $data['page_type'] ) && empty( $meta['_irents_page_type'] ) ) {
			update_post_meta( $page_id, '_irents_page_type', sanitize_key( $data['page_type'] ) );
		}
	}

	/**
	 * Assign a page template to the post.
	 *
	 * @param int    $page_id  Post ID.
	 * @param string $template Template filename, e.g. 'page-service-location.php'.
	 */
	private function set_template( int $page_id, string $template ): void {
		if ( empty( $template ) ) {
			return;
		}

		// Templates can live in the plugin's templates/ folder.
		// WordPress stores just the filename (relative to theme or plugin).
		$template = sanitize_file_name( $template );
		update_post_meta( $page_id, '_wp_page_template', $template );
	}

	/**
	 * Find a page post ID by its post_name (slug).
	 *
	 * @param string $slug URL-safe slug.
	 * @return int|null
	 */
	private function find_page_by_slug( string $slug ): ?int {
		$query = new WP_Query( [
			'post_type'              => 'page',
			'name'                   => $slug,
			'posts_per_page'         => 1,
			'no_found_rows'          => true,
			'update_post_term_cache' => false,
			'update_post_meta_cache' => false,
		] );

		if ( $query->have_posts() ) {
			return (int) $query->posts[0]->ID;
		}

		return null;
	}
}
