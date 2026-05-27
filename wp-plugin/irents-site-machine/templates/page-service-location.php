<?php
/**
 * Template Name: iRents — Service + City
 *
 * Combined service-in-city landing page template.
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

get_header();

$post_id   = get_the_ID();
$h1        = get_post_meta( $post_id, '_irents_h1', true );
$kw        = get_post_meta( $post_id, '_irents_primary_keyword', true );
$project   = get_option( 'irents_project_data', [] );
?>

<main class="irents-page irents-page--service-location" id="irents-main">

	<nav class="irents-breadcrumb" aria-label="<?php esc_attr_e( 'Breadcrumb', 'irents-site-machine' ); ?>">
		<div class="irents-container">
			<ol class="irents-breadcrumb__list">
				<li class="irents-breadcrumb__item">
					<a href="<?php echo esc_url( home_url( '/' ) ); ?>">
						<?php esc_html_e( 'Home', 'irents-site-machine' ); ?>
					</a>
				</li>
				<?php
				$parent_id = wp_get_post_parent_id( $post_id );
				if ( $parent_id ) :
				?>
					<li class="irents-breadcrumb__item">
						<a href="<?php echo esc_url( get_permalink( $parent_id ) ); ?>">
							<?php echo esc_html( get_the_title( $parent_id ) ); ?>
						</a>
					</li>
				<?php endif; ?>
				<li class="irents-breadcrumb__item irents-breadcrumb__item--current" aria-current="page">
					<?php echo esc_html( get_the_title() ); ?>
				</li>
			</ol>
		</div>
	</nav>

	<section class="irents-hero irents-hero--service-location">
		<div class="irents-container">
			<h1 class="irents-h1">
				<?php echo $h1 ? esc_html( $h1 ) : esc_html( get_the_title() ); ?>
			</h1>
			<?php if ( ! empty( $project['phone'] ) ) : ?>
				<a class="irents-hero__cta-button irents-cta-button irents-cta-button--primary"
				   href="tel:<?php echo esc_attr( preg_replace( '/\D/', '', $project['phone'] ) ); ?>">
					<?php echo esc_html( $project['phone'] ); ?>
				</a>
			<?php endif; ?>
		</div>
	</section>

	<section class="irents-content irents-content--service-location">
		<div class="irents-container">
			<?php the_content(); ?>
		</div>
	</section>

	<section class="irents-services">
		<div class="irents-container">
			<?php
			// Show sibling pages as service cards.
			$sibling_pages = get_pages( [
				'parent'      => wp_get_post_parent_id( $post_id ) ?: 0,
				'post_status' => 'publish',
				'sort_column' => 'menu_order',
				'exclude'     => [ $post_id ],
			] );

			if ( $sibling_pages ) : ?>
				<h2 class="irents-services__heading"><?php esc_html_e( 'Related Services', 'irents-site-machine' ); ?></h2>
				<div class="irents-services__grid">
					<?php foreach ( $sibling_pages as $sibling ) : ?>
						<a class="irents-service-card" href="<?php echo esc_url( get_permalink( $sibling ) ); ?>">
							<span class="irents-service-card__title"><?php echo esc_html( $sibling->post_title ); ?></span>
							<span class="irents-service-card__arrow" aria-hidden="true">&rarr;</span>
						</a>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
		</div>
	</section>

	<section class="irents-cta irents-cta--service-location">
		<div class="irents-container">
			<h2 class="irents-cta__heading">
				<?php
				if ( $kw ) {
					printf(
						/* translators: %s: primary keyword */
						esc_html__( 'Need %s? Call us today!', 'irents-site-machine' ),
						esc_html( $kw )
					);
				} else {
					esc_html_e( 'Ready to Book? Contact Us Today!', 'irents-site-machine' );
				}
				?>
			</h2>
			<?php if ( ! empty( $project['phone'] ) ) : ?>
				<a class="irents-cta-button irents-cta-button--phone" href="tel:<?php echo esc_attr( preg_replace( '/\D/', '', $project['phone'] ) ); ?>">
					<?php echo esc_html( $project['phone'] ); ?>
				</a>
			<?php endif; ?>
			<?php if ( ! empty( $project['email'] ) ) : ?>
				<a class="irents-cta-button irents-cta-button--email" href="mailto:<?php echo esc_attr( $project['email'] ); ?>">
					<?php echo esc_html( $project['email'] ); ?>
				</a>
			<?php endif; ?>
		</div>
	</section>

</main>

<?php get_footer(); ?>
