export function createHash(input: any): string {
    return fnv1a(stringify(input))
}

function fnv1a(str: string): string {
    let h = 2166136261; for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i); h = Math.imul(h, 16777619)
    }
    return (h >>> 0).toString(16)
}

export function stringify(obj: any): string {
    return JSON.stringify(obj, (_key: string, value: any) => {
        if (value == null || Array.isArray(value)) return value
        if (typeof value === 'object') {
            const sorted: any = {}, keys = Object.keys(value).sort()
            for (const k of keys) sorted[k] = value[k]
            return sorted
        }
        return value
    })
}
