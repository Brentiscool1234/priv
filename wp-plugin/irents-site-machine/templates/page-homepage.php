<?php
/**
 * Template Name: iRents — Homepage
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

get_header();

$post_id     = get_the_ID();
$h1          = get_post_meta( $post_id, '_irents_h1', true );
$page_type   = get_post_meta( $post_id, '_irents_page_type', true );
$project     = get_option( 'irents_project_data', [] );
$business    = $project['business_name'] ?? get_bloginfo( 'name' );
?>

<main class="irents-page irents-page--homepage" id="irents-main">

	<section class="irents-hero irents-hero--homepage">
		<div class="irents-container">
			<h1 class="irents-h1">
				<?php echo $h1 ? esc_html( $h1 ) : esc_html( get_the_title() ); ?>
			</h1>
			<?php if ( ! empty( $project['tagline'] ) ) : ?>
				<p class="irents-hero__tagline"><?php echo esc_html( $project['tagline'] ); ?></p>
			<?php endif; ?>
			<div class="irents-cta irents-cta--hero">
				<a href="#irents-contact" class="irents-cta-button irents-cta-button--primary">
					<?php esc_html_e( 'Get a Free Quote', 'irents-site-machine' ); ?>
				</a>
			</div>
		</div>
	</section>

	<section class="irents-content irents-content--homepage">
		<div class="irents-container">
			<?php the_content(); ?>
		</div>
	</section>

	<section class="irents-cta irents-cta--bottom" id="irents-contact">
		<div class="irents-container">
			<h2 class="irents-cta__heading">
				<?php
				printf(
					/* translators: %s: business name */
					esc_html__( 'Ready to Book with %s?', 'irents-site-machine' ),
					esc_html( $business )
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
