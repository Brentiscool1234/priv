<?php
/**
 * Admin settings page for iRents Site Machine.
 *
 * Rendered by ism_render_admin_page() in the main plugin file.
 * Current user capability is already verified before this file is included.
 *
 * @package iRents_Site_Machine
 */

defined( 'ABSPATH' ) || exit;

// Handle POST: clear log.
if (
	isset( $_POST['ism_clear_log'] ) &&
	check_admin_referer( 'ism_admin_action', 'ism_nonce' )
) {
	ISM_Logger::clear();
	add_settings_error( 'irents_site_machine', 'log_cleared', __( 'Log cleared.', 'irents-site-machine' ), 'updated' );
}

// Gather data for display.
$plugin_key    = get_option( 'irents_plugin_key', '' );
$project_data  = get_option( 'irents_project_data', [] );
$brand_colors  = get_option( 'irents_brand_colors', [] );
$pages_count   = (int) wp_count_posts( 'page' )->publish;
$log_entries   = ISM_Logger::get_log( 20 );
$rest_base_url = get_rest_url( null, 'irents/v1' );
$admin_nonce   = wp_create_nonce( 'ism_admin_action' );
$ajax_nonce    = wp_create_nonce( 'ism_admin_nonce' );

settings_errors( 'irents_site_machine' );
?>

<div class="wrap ism-wrap">

	<h1 class="ism-page-title">
		<span class="dashicons dashicons-networking" aria-hidden="true"></span>
		<?php esc_html_e( 'iRents Site Machine', 'irents-site-machine' ); ?>
		<span class="ism-version">v<?php echo esc_html( ISM_VERSION ); ?></span>
	</h1>

	<!-- ============================================================
	     Dashboard Cards
	     ============================================================ -->
	<div class="ism-cards">

		<div class="ism-card ism-card--stat">
			<h3><?php esc_html_e( 'Published Pages', 'irents-site-machine' ); ?></h3>
			<p class="ism-stat"><?php echo esc_html( number_format_i18n( $pages_count ) ); ?></p>
		</div>

		<div class="ism-card ism-card--stat">
			<h3><?php esc_html_e( 'Project', 'irents-site-machine' ); ?></h3>
			<p class="ism-stat ism-stat--text">
				<?php echo ! empty( $project_data['business_name'] ) ? esc_html( $project_data['business_name'] ) : '—'; ?>
			</p>
		</div>

		<div class="ism-card ism-card--stat">
			<h3><?php esc_html_e( 'Log Entries', 'irents-site-machine' ); ?></h3>
			<p class="ism-stat"><?php echo esc_html( count( get_option( 'irents_deployment_log', [] ) ) ); ?></p>
		</div>

	</div>

	<!-- ============================================================
	     API Key
	     ============================================================ -->
	<div class="ism-card ism-card--key">
		<h2><?php esc_html_e( 'API Key', 'irents-site-machine' ); ?></h2>
		<p class="ism-help">
			<?php esc_html_e( 'Include this key in all requests as: Authorization: Bearer {key}', 'irents-site-machine' ); ?>
		</p>

		<div class="ism-key-row">
			<input
				type="password"
				id="ism-plugin-key"
				class="ism-key-input"
				value="<?php echo esc_attr( $plugin_key ); ?>"
				readonly
				aria-label="<?php esc_attr_e( 'Plugin API key', 'irents-site-machine' ); ?>"
			>
			<button type="button" class="button" id="ism-reveal-key" data-nonce="<?php echo esc_attr( $ajax_nonce ); ?>">
				<?php esc_html_e( 'Reveal', 'irents-site-machine' ); ?>
			</button>
			<button type="button" class="button button-secondary" id="ism-copy-key">
				<?php esc_html_e( 'Copy', 'irents-site-machine' ); ?>
			</button>
			<button type="button" class="button button-link-delete" id="ism-regenerate-key" data-nonce="<?php echo esc_attr( $ajax_nonce ); ?>">
				<?php esc_html_e( 'Regenerate', 'irents-site-machine' ); ?>
			</button>
		</div>
		<p id="ism-key-message" class="ism-key-message" aria-live="polite"></p>
	</div>

	<!-- ============================================================
	     REST Endpoints Reference
	     ============================================================ -->
	<div class="ism-card">
		<h2><?php esc_html_e( 'REST API Endpoints', 'irents-site-machine' ); ?></h2>
		<p class="ism-help"><?php esc_html_e( 'Base URL:', 'irents-site-machine' ); ?> <code><?php echo esc_html( $rest_base_url ); ?></code></p>

		<table class="ism-endpoints-table widefat striped">
			<thead>
				<tr>
					<th><?php esc_html_e( 'Method', 'irents-site-machine' ); ?></th>
					<th><?php esc_html_e( 'Endpoint', 'irents-site-machine' ); ?></th>
					<th><?php esc_html_e( 'Description', 'irents-site-machine' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php
				$endpoints = [
					[ 'POST', '/connect',            __( 'Test connection & return site info', 'irents-site-machine' ) ],
					[ 'GET',  '/status',             __( 'Return site and plugin status', 'irents-site-machine' ) ],
					[ 'POST', '/project',            __( 'Store project metadata', 'irents-site-machine' ) ],
					[ 'POST', '/pages/bulk-create',  __( 'Create multiple pages at once', 'irents-site-machine' ) ],
					[ 'POST', '/pages/bulk-update',  __( 'Update multiple existing pages', 'irents-site-machine' ) ],
					[ 'POST', '/pages/{id}/schema',  __( 'Update schema for a single page', 'irents-site-machine' ) ],
					[ 'POST', '/menus',              __( 'Create / update a navigation menu', 'irents-site-machine' ) ],
					[ 'POST', '/settings',           __( 'Update site settings & brand colours', 'irents-site-machine' ) ],
					[ 'GET',  '/sitemap',            __( 'Return published pages sitemap data', 'irents-site-machine' ) ],
				];
				foreach ( $endpoints as $ep ) :
				?>
					<tr>
						<td><code class="ism-method ism-method--<?php echo esc_attr( strtolower( $ep[0] ) ); ?>"><?php echo esc_html( $ep[0] ); ?></code></td>
						<td><code><?php echo esc_html( 'irents/v1' . $ep[1] ); ?></code></td>
						<td><?php echo esc_html( $ep[2] ); ?></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>

	<!-- ============================================================
	     Project Info
	     ============================================================ -->
	<?php if ( ! empty( $project_data ) ) : ?>
	<div class="ism-card">
		<h2><?php esc_html_e( 'Current Project', 'irents-site-machine' ); ?></h2>
		<table class="widefat striped">
			<tbody>
				<?php foreach ( $project_data as $key => $value ) : ?>
					<tr>
						<th scope="row"><?php echo esc_html( $key ); ?></th>
						<td><?php echo esc_html( $value ); ?></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
	<?php endif; ?>

	<!-- ============================================================
	     Brand Colours
	     ============================================================ -->
	<?php if ( ! empty( $brand_colors ) ) : ?>
	<div class="ism-card">
		<h2><?php esc_html_e( 'Brand Colours', 'irents-site-machine' ); ?></h2>
		<div class="ism-color-swatches">
			<?php foreach ( $brand_colors as $role => $hex ) : ?>
				<div class="ism-swatch">
					<span class="ism-swatch__block" style="background:<?php echo esc_attr( sanitize_hex_color( $hex ) ?: '#ccc' ); ?>;"></span>
					<span class="ism-swatch__label">
						<?php echo esc_html( ucfirst( $role ) ); ?><br>
						<code><?php echo esc_html( $hex ); ?></code>
					</span>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
	<?php endif; ?>

	<!-- ============================================================
	     Deployment Log
	     ============================================================ -->
	<div class="ism-card">
		<h2>
			<?php esc_html_e( 'Deployment Log', 'irents-site-machine' ); ?>
			<span class="ism-log-count">(<?php echo esc_html( count( $log_entries ) ); ?> <?php esc_html_e( 'recent entries', 'irents-site-machine' ); ?>)</span>
		</h2>

		<?php if ( ! empty( $log_entries ) ) : ?>

			<div class="ism-log-table-wrap">
				<table class="widefat striped ism-log-table">
					<thead>
						<tr>
							<th><?php esc_html_e( 'Time', 'irents-site-machine' ); ?></th>
							<th><?php esc_html_e( 'Level', 'irents-site-machine' ); ?></th>
							<th><?php esc_html_e( 'Message', 'irents-site-machine' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $log_entries as $entry ) : ?>
							<tr class="ism-log-row ism-log-row--<?php echo esc_attr( $entry['level'] ?? 'info' ); ?>">
								<td class="ism-log-time"><?php echo esc_html( $entry['timestamp'] ?? '' ); ?></td>
								<td><span class="ism-badge ism-badge--<?php echo esc_attr( $entry['level'] ?? 'info' ); ?>"><?php echo esc_html( strtoupper( $entry['level'] ?? 'INFO' ) ); ?></span></td>
								<td><?php echo esc_html( $entry['message'] ?? '' ); ?></td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			</div>

			<form method="post" class="ism-clear-log-form">
				<?php wp_nonce_field( 'ism_admin_action', 'ism_nonce' ); ?>
				<button type="submit" name="ism_clear_log" value="1" class="button button-secondary">
					<?php esc_html_e( 'Clear Log', 'irents-site-machine' ); ?>
				</button>
			</form>

		<?php else : ?>
			<p class="ism-empty"><?php esc_html_e( 'No log entries yet.', 'irents-site-machine' ); ?></p>
		<?php endif; ?>
	</div>

</div><!-- .ism-wrap -->

<script>
( function () {
	'use strict';

	var ajaxUrl  = '<?php echo esc_js( admin_url( 'admin-ajax.php' ) ); ?>';
	var keyInput = document.getElementById( 'ism-plugin-key' );
	var message  = document.getElementById( 'ism-key-message' );

	function showMessage( text, isError ) {
		message.textContent = text;
		message.className   = 'ism-key-message ' + ( isError ? 'ism-key-message--error' : 'ism-key-message--ok' );
		setTimeout( function () { message.textContent = ''; message.className = 'ism-key-message'; }, 4000 );
	}

	// Reveal / hide key.
	document.getElementById( 'ism-reveal-key' ).addEventListener( 'click', function () {
		if ( keyInput.type === 'password' ) {
			keyInput.type     = 'text';
			this.textContent  = '<?php echo esc_js( __( 'Hide', 'irents-site-machine' ) ); ?>';
		} else {
			keyInput.type     = 'password';
			this.textContent  = '<?php echo esc_js( __( 'Reveal', 'irents-site-machine' ) ); ?>';
		}
	} );

	// Copy key to clipboard.
	document.getElementById( 'ism-copy-key' ).addEventListener( 'click', function () {
		if ( ! keyInput.value ) { return; }
		navigator.clipboard.writeText( keyInput.value ).then( function () {
			showMessage( '<?php echo esc_js( __( 'Key copied to clipboard.', 'irents-site-machine' ) ); ?>', false );
		} ).catch( function () {
			showMessage( '<?php echo esc_js( __( 'Copy failed — please copy manually.', 'irents-site-machine' ) ); ?>', true );
		} );
	} );

	// Regenerate key via AJAX.
	document.getElementById( 'ism-regenerate-key' ).addEventListener( 'click', function () {
		if ( ! confirm( '<?php echo esc_js( __( 'Regenerate the API key? The external app will need updating.', 'irents-site-machine' ) ); ?>' ) ) {
			return;
		}

		var self  = this;
		var nonce = self.dataset.nonce;

		self.disabled = true;
		self.textContent = '<?php echo esc_js( __( 'Regenerating…', 'irents-site-machine' ) ); ?>';

		var fd = new FormData();
		fd.append( 'action', 'ism_regenerate_key' );
		fd.append( 'nonce',  nonce );

		fetch( ajaxUrl, { method: 'POST', body: fd, credentials: 'same-origin' } )
			.then( function ( r ) { return r.json(); } )
			.then( function ( data ) {
				if ( data.success ) {
					keyInput.value = data.data.key;
					keyInput.type  = 'text';
					showMessage( '<?php echo esc_js( __( 'Key regenerated successfully.', 'irents-site-machine' ) ); ?>', false );
					document.getElementById( 'ism-reveal-key' ).textContent = '<?php echo esc_js( __( 'Hide', 'irents-site-machine' ) ); ?>';
				} else {
					showMessage( '<?php echo esc_js( __( 'Regeneration failed.', 'irents-site-machine' ) ); ?>', true );
				}
			} )
			.catch( function () {
				showMessage( '<?php echo esc_js( __( 'Network error.', 'irents-site-machine' ) ); ?>', true );
			} )
			.finally( function () {
				self.disabled    = false;
				self.textContent = '<?php echo esc_js( __( 'Regenerate', 'irents-site-machine' ) ); ?>';
			} );
	} );
} )();
</script>
