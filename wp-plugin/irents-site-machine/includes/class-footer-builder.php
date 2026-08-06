<?php
/**
 * ISM_Footer_Builder — renders a custom branded footer via wp_footer hook.
 *
 * Fires after the theme's native footer (priority 999), which is hidden by
 * irents-frontend.css whenever an ISM theme body-class is active.
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

class ISM_Footer_Builder {

	public static function init(): void {
		add_action( 'wp_footer', array( __CLASS__, 'render_footer' ), 999 );
	}

	public static function render_footer(): void {
		// Only render when an ISM theme is active (i.e. after first Deploy).
		$theme_name = get_option( 'irents_theme_name', '' );
		if ( ! $theme_name ) {
			return;
		}

		$project  = get_option( 'irents_project_data', array() );
		$biz_name = isset( $project['business_name'] ) ? esc_html( $project['business_name'] ) : esc_html( get_bloginfo( 'name' ) );

		// Don't render an empty shell with no business identity.
		if ( ! $biz_name ) {
			return;
		}

		$phone   = isset( $project['phone'] )   ? esc_html( $project['phone'] )   : '';
		$email   = isset( $project['email'] )   ? esc_html( $project['email'] )   : '';
		$tagline = isset( $project['tagline'] ) ? esc_html( $project['tagline'] ) : esc_html( get_bloginfo( 'description' ) );

		// Logo (set via Deploy → logo_attachment_id → custom_logo).
		$logo_id  = (int) get_option( 'irents_logo_id', 0 );
		$logo_url = $logo_id ? wp_get_attachment_image_url( $logo_id, array( 200, 60 ) ) : '';

		// Top-level nav links from 'Main Navigation' menu.
		$menu_items = wp_get_nav_menu_items( 'Main Navigation' );
		$nav_items  = array();
		if ( is_array( $menu_items ) ) {
			foreach ( $menu_items as $item ) {
				if ( 0 === (int) $item->menu_item_parent ) {
					$nav_items[] = $item;
				}
			}
		}

		$year = gmdate( 'Y' );
		?>
		<footer id="ism-site-footer" aria-label="Site footer">
			<div class="ism-footer__inner">

				<div class="ism-footer__brand">
					<?php if ( $logo_url ) : ?>
						<img src="<?php echo esc_url( $logo_url ); ?>"
						     alt="<?php echo esc_attr( $biz_name ); ?>"
						     class="ism-footer__logo"
						     loading="lazy">
					<?php else : ?>
						<span class="ism-footer__site-name"><?php echo $biz_name; ?></span>
					<?php endif; ?>

					<?php if ( $tagline ) : ?>
						<p class="ism-footer__tagline"><?php echo $tagline; ?></p>
					<?php endif; ?>

					<?php if ( $phone ) : ?>
						<p class="ism-footer__contact">
							<a href="tel:<?php echo esc_attr( preg_replace( '/[^\d+\-\(\) ]/', '', $phone ) ); ?>">
								<?php echo $phone; ?>
							</a>
						</p>
					<?php endif; ?>

					<?php if ( $email ) : ?>
						<p class="ism-footer__contact">
							<a href="mailto:<?php echo esc_attr( $email ); ?>">
								<?php echo $email; ?>
							</a>
						</p>
					<?php endif; ?>
				</div>

				<?php if ( ! empty( $nav_items ) ) : ?>
				<nav class="ism-footer__nav" aria-label="Footer navigation">
					<ul>
						<?php foreach ( $nav_items as $item ) : ?>
							<li>
								<a href="<?php echo esc_url( $item->url ); ?>"
								   <?php if ( '_blank' === $item->target ) echo 'target="_blank" rel="noopener"'; ?>>
									<?php echo esc_html( $item->title ); ?>
								</a>
							</li>
						<?php endforeach; ?>
					</ul>
				</nav>
				<?php endif; ?>

			</div>

			<div class="ism-footer__bottom">
				<p>&copy; <?php echo esc_html( $year ); ?> <?php echo $biz_name; ?>. All rights reserved.</p>
			</div>
		</footer>
		<?php
	}
}
