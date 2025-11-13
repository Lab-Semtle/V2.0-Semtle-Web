// =============================================
// 버전 코드 생성 유틸리티
// =============================================

/**
 * version_code 생성 규칙:
 * - 최신에서 파생: v{다음번호} (예: v2, v3)
 * - 과거 버전에서 분기: v{부모코드}-{분기순번} (예: v2-1, v3-2)
 */
export function generateVersionCode(
    parentVersionCode: string | null | undefined,
    parentVersionId: number | null | undefined,
    allVersions: Array<{ version_code: string; parent_version_id?: number | null }>,
    nextVersionNumber: number
): string {
    // 최초 버전
    if (!parentVersionCode && !parentVersionId) {
        return 'v1';
    }

    // 최신 버전에서 파생 (parent_version_id가 최신 버전을 가리킴)
    // 최신 버전은 version_number가 가장 큰 버전
    if (parentVersionId) {
        const parentVersion = allVersions.find(v => v.parent_version_id === parentVersionId);
        if (parentVersion) {
            // 과거 버전에서 분기: 같은 부모를 가진 버전들 중 가장 큰 분기 번호 찾기
            const siblings = allVersions.filter(
                v => v.parent_version_id === parentVersionId && v.version_code.startsWith(parentVersion.version_code + '-')
            );
            
            if (siblings.length > 0) {
                // 기존 분기가 있음: v{부모}-{다음분기번호}
                const maxBranchNum = siblings.reduce((max, v) => {
                    const match = v.version_code.match(/-(\d+)$/);
                    return match ? Math.max(max, parseInt(match[1])) : max;
                }, 0);
                return `${parentVersion.version_code}-${maxBranchNum + 1}`;
            } else {
                // 첫 번째 분기
                return `${parentVersion.version_code}-1`;
            }
        }
    }

    // 부모 버전 코드가 있고, 그것이 최신 버전인 경우 (직접적인 다음 버전)
    if (parentVersionCode) {
        // v1 -> v2, v2 -> v3 같은 경우
        const match = parentVersionCode.match(/^v(\d+)$/);
        if (match) {
            // 단순 증가
            const parentNum = parseInt(match[1]);
            return `v${parentNum + 1}`;
        } else {
            // 분기된 버전에서 또 분기: v2-1 -> v2-2
            const match2 = parentVersionCode.match(/^(.+)-(\d+)$/);
            if (match2) {
                const base = match2[1];
                const branchNum = parseInt(match2[2]);
                return `${base}-${branchNum + 1}`;
            }
        }
    }

    // 폴백: version_number 기반
    return `v${nextVersionNumber}`;
}

