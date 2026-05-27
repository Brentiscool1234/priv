<?php
/**
 * Template Name: iRents — Location
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

get_header();

$post_id = get_the_ID();
$h1      = get_post_meta( $post_id, '_irents_h1', true );
$project = get_option( 'irents_project_data', [] );
?>

<main class="irents-page irents-page--location" id="irents-main">

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

	<section class="irents-hero irents-hero--location">
		<div class="irents-container">
			<h1 class="irents-h1">
				<?php echo $h1 ? esc_html( $h1 ) : esc_html( get_the_title() ); ?>
			</h1>
			<?php if ( ! empty( $project['city'] ) && ! empty( $project['state'] ) ) : ?>
				<p class="irents-hero__location-tag">
					<?php
					printf(
						/* translators: 1: city, 2: state */
						esc_html__( 'Serving %1$s, %2$s and surrounding areas', 'irents-site-machine' ),
						esc_html( $project['city'] ),
						esc_html( $project['state'] )
					);
					?>
				</p>
			<?php endif; ?>
		</div>
	</section>

	<section class="irents-content irents-content--location">
		<div class="irents-container">
			<?php the_content(); ?>
		</div>
	</section>

	<section class="irents-locations">
		<div class="irents-container">
			<h2 class="irents-locations__heading"><?php esc_html_e( 'Areas We Serve', 'irents-site-machine' ); ?></h2>
			<div class="irents-locations__grid">
				<?php
				// Render child pages as area links.
				$child_pages = get_pages( [
					'parent'      => $post_id,
					'post_status' => 'publish',
					'sort_column' => 'post_title',
				] );
				foreach ( $child_pages as $child ) :
				?>
					<a class="irents-location-link" href="<?php echo esc_url( get_permalink( $child ) ); ?>">
						<?php echo esc_html( $child->post_title ); ?>
					</a>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<section class="irents-cta irents-cta--location">
		<div class="irents-container">
			<h2 class="irents-cta__heading"><?php esc_html_e( 'Book Your Event Today', 'irents-site-machine' ); ?></h2>
			<?php if ( ! empty( $project['phone'] ) ) : ?>
				<a class="irents-cta-button irents-cta-button--phone" href="tel:<?php echo esc_attr( preg_replace( '/\D/', '', $project['phone'] ) ); ?>">
					<?php echo esc_html( $project['phone'] ); ?>
				</a>
			<?php endif; ?>
		</div>
	</section>

</main>

<?php get_footer(); ?>
