<?php
/**
 * ISM_Menu_Builder — creates WordPress navigation menus from API payloads.
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

class ISM_Menu_Builder {

	/**
	 * Create (or update) a navigation menu.
	 *
	 * @param string $name     Menu display name.
	 * @param array  $items    Array of menu item definitions.
	 * @param string $location Theme location slug to assign the menu to.
	 * @return int|WP_Error    Menu term ID on success.
	 */
	public function create_menu( string $name, array $items = [], string $location = '' ) {
		// Check if a menu with this name already exists.
		$existing = wp_get_nav_menu_object( $name );

		if ( $existing ) {
			$menu_id = (int) $existing->term_id;

			// Clear existing items so we can rebuild cleanly.
			$existing_items = wp_get_nav_menu_items( $menu_id );
			if ( is_array( $existing_items ) ) {
				foreach ( $existing_items as $item ) {
					wp_delete_post( $item->ID, true );
				}
			}
		} else {
			$menu_id = wp_create_nav_menu( $name );

			if ( is_wp_error( $menu_id ) ) {
				return $menu_id;
			}
		}

		// Add items.
		$item_id_map = []; // key: external 'id', value: WP menu item ID (for parent tracking)

		foreach ( $items as $item ) {
			$result = $this->add_menu_item( $menu_id, $item, $item_id_map );
			if ( ! is_wp_error( $result ) && ! empty( $item['id'] ) ) {
				$item_id_map[ $item['id'] ] = $result;
			}
		}

		// Assign to theme location if requested.
		if ( ! empty( $location ) ) {
			$this->assign_location( $menu_id, sanitize_key( $location ) );
		}

		return $menu_id;
	}

	/**
	 * Add a single item to a menu.
	 *
	 * Supported item fields:
	 *   title    (string, required)
	 *   url      (string) — for custom-link items
	 *   page_id  (int)    — for page items
	 *   target   (string) — '_blank' etc.
	 *   order    (int)
	 *   parent   (string) — external 'id' of parent item
	 *   classes  (string) — space-separated CSS classes
	 *
	 * @param int    $menu_id     WP nav menu term ID.
	 * @param array  $item        Item definition.
	 * @param array  $item_id_map Map from external item IDs to WP menu item IDs.
	 * @return int|WP_Error
	 */
	private function add_menu_item( int $menu_id, array $item, array $item_id_map = [] ) {
		$args = [
			'menu-item-title'     => sanitize_text_field( $item['title'] ?? '' ),
			'menu-item-status'    => 'publish',
			'menu-item-position'  => absint( $item['order'] ?? 0 ),
		];

		if ( ! empty( $item['page_id'] ) ) {
			// Link to an existing page.
			$page_id = absint( $item['page_id'] );
			$args['menu-item-object']    = 'page';
			$args['menu-item-object-id'] = $page_id;
			$args['menu-item-type']      = 'post_type';
			$args['menu-item-url']       = get_permalink( $page_id );
		} else {
			// Custom link.
			$args['menu-item-url']    = esc_url_raw( $item['url'] ?? '#' );
			$args['menu-item-type']   = 'custom';
			$args['menu-item-object'] = 'custom';
		}

		if ( ! empty( $item['target'] ) && '_blank' === $item['target'] ) {
			$args['menu-item-target'] = '_blank';
		}

		if ( ! empty( $item['classes'] ) ) {
			$args['menu-item-classes'] = sanitize_text_field( $item['classes'] );
		}

		// Resolve parent.
		if ( ! empty( $item['parent'] ) && isset( $item_id_map[ $item['parent'] ] ) ) {
			$args['menu-item-parent-id'] = $item_id_map[ $item['parent'] ];
		}

		return wp_update_nav_menu_item( $menu_id, 0, $args );
	}

	/**
	 * Assign a menu to a registered theme location.
	 *
	 * @param int    $menu_id  Nav menu term ID.
	 * @param string $location Theme location slug.
	 */
	private function assign_location( int $menu_id, string $location ): void {
		$locations = get_registered_nav_menus();

		if ( ! array_key_exists( $location, $locations ) ) {
			// Location not registered — silently skip.
			return;
		}

		$assignments = get_theme_mod( 'nav_menu_locations', [] );
		$assignments[ $location ] = $menu_id;
		set_theme_mod( 'nav_menu_locations', $assignments );
	}
}
