import type { WPPageData, BulkResult, MenuItem, StatusResponse } from '../types';
export declare class WordPressClient {
    private readonly baseUrl;
    private readonly pluginKey;
    constructor(wpUrl: string, pluginKey: string);
    testConnection(): Promise<{
        success: boolean;
        message: string;
    }>;
    getDeploymentStatus(): Promise<StatusResponse>;
    createPage(data: WPPageData): Promise<{
        id: number;
        link: string;
    }>;
    updatePage(id: number, data: WPPageData): Promise<void>;
    bulkCreatePages(pages: WPPageData[]): Promise<BulkResult>;
    setPageMeta(pageId: number, meta: Record<string, string>): Promise<void>;
    createMenu(name: string, items: MenuItem[]): Promise<void>;
    private buildPagePayload;
    private request;
}
//# sourceMappingURL=client.d.ts.map