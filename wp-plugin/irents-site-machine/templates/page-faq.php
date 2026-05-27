<?php
/**
 * Template Name: iRents — FAQ
 *
 * Renders an accordion FAQ. Content from the_content() is expected to
 * contain .irents-faq__item elements, but this template also renders a
 * native accordion structure so the JS can handle it regardless.
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

get_header();

$post_id = get_the_ID();
$h1      = get_post_meta( $post_id, '_irents_h1', true );
$project = get_option( 'irents_project_data', [] );
?>

<main class="irents-page irents-page--faq" id="irents-main">

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

	<section class="irents-hero irents-hero--faq">
		<div class="irents-container">
			<h1 class="irents-h1">
				<?php echo $h1 ? esc_html( $h1 ) : esc_html( get_the_title() ); ?>
			</h1>
		</div>
	</section>

	<section class="irents-faq" id="irents-faq" aria-label="<?php esc_attr_e( 'Frequently Asked Questions', 'irents-site-machine' ); ?>">
		<div class="irents-container">
			<?php the_content(); ?>
		</div>
	</section>

	<section class="irents-cta irents-cta--faq">
		<div class="irents-container">
			<h2 class="irents-cta__heading"><?php esc_html_e( 'Still have questions? Call us!', 'irents-site-machine' ); ?></h2>
			<?php if ( ! empty( $project['phone'] ) ) : ?>
				<a class="irents-cta-button irents-cta-button--phone" href="tel:<?php echo esc_attr( preg_replace( '/\D/', '', $project['phone'] ) ); ?>">
					<?php echo esc_html( $project['phone'] ); ?>
				</a>
			<?php endif; ?>
		</div>
	</section>

</main>

<?php get_footer(); ?>
