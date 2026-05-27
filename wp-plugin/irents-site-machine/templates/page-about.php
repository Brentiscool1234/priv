<?php
/**
 * Template Name: iRents — About
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

get_header();

$post_id = get_the_ID();
$h1      = get_post_meta( $post_id, '_irents_h1', true );
$project = get_option( 'irents_project_data', [] );
?>

<main class="irents-page irents-page--about" id="irents-main">

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

	<section class="irents-hero irents-hero--about">
		<div class="irents-container">
			<h1 class="irents-h1">
				<?php echo $h1 ? esc_html( $h1 ) : esc_html( get_the_title() ); ?>
			</h1>
		</div>
	</section>

	<section class="irents-content irents-content--about">
		<div class="irents-container">
			<?php the_content(); ?>
		</div>
	</section>

	<section class="irents-cta irents-cta--about">
		<div class="irents-container">
			<h2 class="irents-cta__heading">
				<?php
				printf(
					/* translators: %s: business name */
					esc_html__( 'Get in Touch with %s', 'irents-site-machine' ),
					esc_html( $project['business_name'] ?? get_bloginfo( 'name' ) )
				);
				?>
			</h2>
			<?php if ( ! empty( $project['phone'] ) ) : ?>
				<a class="irents-cta-button irents-cta-button--phone" href="tel:<?php echo esc_attr( preg_replace( '/\D/', '', $project['phone'] ) ); ?>">
					<?php echo esc_html( $project['phone'] ); ?>
				</a>
			<?php endif; ?>
		</div>
	</section>

</main>

<?php get_footer(); ?>
