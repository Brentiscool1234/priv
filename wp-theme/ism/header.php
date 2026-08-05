<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="ism-skip" href="#ism-main">Skip to main content</a>

<nav class="ism-nav" id="ism-nav" aria-label="Primary">
	<div class="ism-nav__inner">

		<a class="ism-nav__logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( ism_get_business_name() ); ?> — home">
			<?php echo ism_get_logo_html(); ?>
		</a>

		<?php
		if ( has_nav_menu( 'primary' ) ) {
			wp_nav_menu( [
				'theme_location' => 'primary',
				'menu_id'        => 'ism-primary-menu',
				'menu_class'     => 'ism-nav__menu',
				'container'      => false,
				'depth'          => 2,
				'fallback_cb'    => false,
			] );
		} else {
			ism_nav_fallback();
		}
		?>

		<div class="ism-nav__actions">
			<?php $phone = ism_get_phone(); if ( $phone ) : ?>
			<a class="ism-nav__phone" href="tel:<?php echo esc_attr( preg_replace( '/[^0-9+]/', '', $phone ) ); ?>" aria-label="Call <?php echo esc_attr( ism_get_business_name() ); ?>">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.77 12 19.79 19.79 0 0 1 1.7 3.35 2 2 0 0 1 3.68 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
				<span><?php echo esc_html( $phone ); ?></span>
			</a>
			<?php endif; ?>
			<a class="ism-btn ism-btn--primary ism-nav__cta" href="<?php echo esc_url( ism_get_cta_url() ); ?>">
				<?php echo esc_html( ism_get_cta_label() ); ?>
			</a>
		</div>

		<button class="ism-nav__toggle" aria-label="Toggle menu" aria-controls="ism-primary-menu" aria-expanded="false">
			<span class="ism-nav__toggle-bar"></span>
			<span class="ism-nav__toggle-bar"></span>
			<span class="ism-nav__toggle-bar"></span>
		</button>

	</div>
</nav>

<main id="ism-main">
