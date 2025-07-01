// Re-export all custom hooks
export { useAsync } from './useAsync'
export { useForm } from './useForm'
export { useLocalStorage } from './useLocalStorage'
export { useDebounce, useDebouncedCallback } from './useDebounce'

// Hook collections for easy importing
export const hooks = {
  useAsync,
  useForm,
  useLocalStorage,
  useDebounce,
  useDebouncedCallback
}

export default hooks