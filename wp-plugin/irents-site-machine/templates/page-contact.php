<?php
/**
 * Template Name: iRents — Contact
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

get_header();

$post_id = get_the_ID();
$h1      = get_post_meta( $post_id, '_irents_h1', true );
$project = get_option( 'irents_project_data', [] );
?>

<main class="irents-page irents-page--contact" id="irents-main">

	<nav class="irents-breadcrumb" aria-label="<?php esc_attr_e( 'Breadcrumb', 'irents-site-machine' ); ?>">
		<div class="irents-container">
			<ol class="irents-breadcrumb__list">
				<li class="irents-breadcrumb__item">
					<a href="<?php echo esc_url( home_url( '/' ) ); ?>">
						<?php esc_html_e( 'Home', 'irents-site-machine' ); ?>
					</a>
				</li>
				<li class="irents-breadcrumb__item irents-breadcrumb__item--current" aria-current="page">
					<?php echo esc_html( get_the_title() ); ?>
				</li>
			</ol>
		</div>
	</nav>

	<section class="irents-hero irents-hero--contact">
		<div class="irents-container">
			<h1 class="irents-h1">
				<?php echo $h1 ? esc_html( $h1 ) : esc_html( get_the_title() ); ?>
			</h1>
		</div>
	</section>

	<section class="irents-content irents-content--contact">
		<div class="irents-container irents-contact-layout">

			<div class="irents-contact-info">
				<?php if ( ! empty( $project['business_name'] ) ) : ?>
					<h2 class="irents-contact-info__name"><?php echo esc_html( $project['business_name'] ); ?></h2>
				<?php endif; ?>

				<?php if ( ! empty( $project['phone'] ) ) : ?>
					<p class="irents-contact-info__item irents-contact-info__item--phone">
						<strong><?php esc_html_e( 'Phone:', 'irents-site-machine' ); ?></strong>
						<a href="tel:<?php echo esc_attr( preg_replace( '/\D/', '', $project['phone'] ) ); ?>">
							<?php echo esc_html( $project['phone'] ); ?>
						</a>
					</p>
				<?php endif; ?>

				<?php if ( ! empty( $project['email'] ) ) : ?>
					<p class="irents-contact-info__item irents-contact-info__item--email">
						<strong><?php esc_html_e( 'Email:', 'irents-site-machine' ); ?></strong>
						<a href="mailto:<?php echo esc_attr( $project['email'] ); ?>">
							<?php echo esc_html( $project['email'] ); ?>
						</a>
					</p>
				<?php endif; ?>

				<?php if ( ! empty( $project['city'] ) && ! empty( $project['state'] ) ) : ?>
					<p class="irents-contact-info__item irents-contact-info__item--location">
						<strong><?php esc_html_e( 'Serving:', 'irents-site-machine' ); ?></strong>
						<?php echo esc_html( $project['city'] . ', ' . $project['state'] ); ?>
					</p>
				<?php endif; ?>
			</div>

			<div class="irents-contact-content">
				<?php the_content(); ?>
			</div>

		</div>
	</section>

</main>

<?php get_footer(); ?>
