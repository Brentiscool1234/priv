import type { BusinessProfile, Deployment } from '../types';
export interface DeployOptions {
    page_ids?: string[];
    force?: boolean;
}
/**
 * Deploy generated pages to WordPress.
 * Returns the deployment record with status.
 */
export declare function deployPages(projectId: string, wpUrl: string, pluginKey: string, profile: BusinessProfile, opts?: DeployOptions): Promise<Deployment>;
//# sourceMappingURL=deployer.d.ts.map