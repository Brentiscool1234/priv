export interface QACheckResult {
    check_name: string;
    status: 'pass' | 'warn' | 'fail';
    message?: string;
}
export declare function runQAChecks(page: any, allSlugs: string[], allPages: any[]): QACheckResult[];
//# sourceMappingURL=checks.d.ts.map