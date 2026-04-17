import { defineMessageHandler, useMemo, useState, useAsync } from "../../src/lib"

type Data = {
    userId: number
    id: number
    title: string
    completed: boolean
}[]

export default defineMessageHandler(async () => {
    const pageSize = 10

    const data = useAsync<Data>(() => fetch('https://jsonplaceholder.typicode.com/todos').then(res => res.json()))
    const [page, setPage] = useState(1)
    const slice = useMemo(() => data.value?.slice((page - 1) * pageSize, page * pageSize), [data.value, page])
    const [first, last] = useMemo(() => {
        const total = data.value?.length ?? 0, pages = Math.ceil(total / pageSize)
        return [page === 1, page === pages || pages === 0]
    }, [data.value, page])
    return <>
        {data.pending || !slice ? 'Loading...' : <>
            {slice.map(item => <b>
                {JSON.stringify(item)}<br/><br/>
            </b>)}
            <h>Page: {page} / {Math.ceil(data.value?.length ?? 0 / pageSize)}</h><br />
            {!first ? <button onClick={() => setPage(page - 1)}>{'<'}</button> : null}
            {!last ? <button onClick={() => setPage(page + 1)}>{'>'}</button> : null}
        </>}
    </>
})
