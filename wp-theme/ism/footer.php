</main><!-- #ism-main -->

<?php
$phone    = ism_get_phone();
$biz_name = ism_get_business_name();
$cta_url  = ism_get_cta_url();
$cta_label = ism_get_cta_label();
$data     = get_option( 'irents_project_data', [] );
$email    = $data['email'] ?? '';
$address  = $data['address'] ?? '';
$hours    = $data['hours'] ?? 'Mon–Fri 8am–6pm';
?>

<footer class="ism-footer" aria-label="Site footer">
	<div class="ism-container ism-container--wide">
		<div class="ism-footer__inner">

			<div class="ism-footer__brand">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="ism-footer__logo">
					<?php echo ism_get_logo_html(); ?>
				</a>
				<p class="ism-footer__tagline"><?php echo esc_html( get_bloginfo( 'description' ) ?: 'Professional services you can trust.' ); ?></p>

				<?php if ( $phone || $email ) : ?>
				<div class="ism-footer__contact">
					<?php if ( $phone ) : ?>
					<a href="tel:<?php echo esc_attr( preg_replace( '/[^0-9+]/', '', $phone ) ); ?>" class="ism-footer__contact-item">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.77 12 19.79 19.79 0 0 1 1.7 3.35 2 2 0 0 1 3.68 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
						<?php echo esc_html( $phone ); ?>
					</a>
					<?php endif; ?>
					<?php if ( $email ) : ?>
					<a href="mailto:<?php echo esc_attr( $email ); ?>" class="ism-footer__contact-item">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
						<?php echo esc_html( $email ); ?>
					</a>
					<?php endif; ?>
					<?php if ( $address ) : ?>
					<span class="ism-footer__contact-item ism-footer__contact-item--address">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
						<?php echo esc_html( $address ); ?>
					</span>
					<?php endif; ?>
					<?php if ( $hours ) : ?>
					<span class="ism-footer__contact-item ism-footer__contact-item--hours">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
						<?php echo esc_html( $hours ); ?>
					</span>
					<?php endif; ?>
				</div>
				<?php endif; ?>
			</div>

			<div class="ism-footer__nav">
				<?php if ( has_nav_menu( 'footer' ) ) : ?>
				<div class="ism-footer__col">
					<h5 class="ism-footer__col-title">Quick Links</h5>
					<?php wp_nav_menu( [
						'theme_location' => 'footer',
						'menu_class'     => 'ism-footer__links',
						'container'      => false,
						'depth'          => 1,
						'fallback_cb'    => false,
					] ); ?>
				</div>
				<?php endif; ?>
			</div>

			<div class="ism-footer__cta-col">
				<p class="ism-footer__cta-headline">Ready to get started?</p>
				<a class="ism-btn ism-btn--primary" href="<?php echo esc_url( $cta_url ); ?>">
					<?php echo esc_html( $cta_label ); ?> <span aria-hidden="true">→</span>
				</a>
				<?php if ( $phone ) : ?>
				<p class="ism-footer__or">or call <a href="tel:<?php echo esc_attr( preg_replace( '/[^0-9+]/', '', $phone ) ); ?>"><?php echo esc_html( $phone ); ?></a></p>
				<?php endif; ?>
			</div>

		</div>

		<div class="ism-footer__bottom">
			<span>&copy; <?php echo date( 'Y' ); ?> <?php echo esc_html( $biz_name ); ?>. All rights reserved.</span>
			<span>
				<?php
				$privacy = get_page_by_path( 'privacy-policy' );
				if ( $privacy ) {
					echo '<a href="' . esc_url( get_permalink( $privacy ) ) . '">Privacy Policy</a>';
				}
				?>
			</span>
		</div>
	</div>
</footer>

<?php if ( $phone ) : ?>
<div class="ism-mobile-cta" role="complementary" aria-label="Quick contact">
	<a class="ism-mobile-cta__call" href="tel:<?php echo esc_attr( preg_replace( '/[^0-9+]/', '', $phone ) ); ?>">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.77 12 19.79 19.79 0 0 1 1.7 3.35 2 2 0 0 1 3.68 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
		Call Now
	</a>
	<a class="ism-mobile-cta__quote" href="<?php echo esc_url( $cta_url ); ?>">
		<?php echo esc_html( $cta_label ); ?>
	</a>
</div>
<?php endif; ?>

<?php wp_footer(); ?>
</body>
</html>
