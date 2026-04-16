export function isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return a === b

    const ta = typeof a, tb = typeof b; if (ta !== tb) return false
    if (ta !== 'object') return a === b

    if (Array.isArray(a)) {
        if (!Array.isArray(b)) return false
        if (a.length !== b.length) return false
        for (let i = 0; i < a.length; i++) if (!isEqual(a[i], b[i])) return false
        return true
    }; if (Array.isArray(b)) return false

    const ak = Object.keys(a), bk = Object.keys(b); if (ak.length !== bk.length) return false
    for (const k of ak) {
        if (!Object.prototype.hasOwnProperty.call(b, k)) return false
        if (!isEqual(a[k], b[k])) return false
    }

    return true
}
