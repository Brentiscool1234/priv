<?php
/**
 * Template Name: iRents — Full Width
 *
 * Renders generated page content with no sidebar, spanning the full container.
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="irents-main" class="irents-page irents-page--full-width" style="width:100%;max-width:100%;padding:0;margin:0;">
	<?php while ( have_posts() ) : the_post(); ?>
		<?php the_content(); ?>
	<?php endwhile; ?>
</main>
<?php get_footer(); ?>
