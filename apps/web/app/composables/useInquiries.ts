export type FileMeta = { name: string; size: number; type: string; url?: string }
export type Inquiry = {
    id?: number
    center: string
    type: string
    source: string
    title: string
    content: string
    files: FileMeta[]
    answered: boolean
    createdAt: string
}

const LIST_KEY = 'inquiries-list'

export const useInquiries = () => {
    const api = useApi()

    const fetchList = () =>
        useAsyncData<Inquiry[]>(LIST_KEY, () =>
            api('/inquiries', { query: { _sort: 'id', _order: 'desc' } })
        )

    const create = (payload: Inquiry) =>
        api('/inquiries', { method: 'POST', body: payload })

    const refreshList = () => refreshNuxtData(LIST_KEY)

    return { fetchList, create, refreshList }
}
