export const useApi = () => {
    const { public : {apiBase} } = useRuntimeConfig()
    return (path:string, opts?:any) => $fetch(path, { baseURL: apiBase, ...opts })
}