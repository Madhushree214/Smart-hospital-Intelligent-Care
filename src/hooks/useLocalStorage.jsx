import { useEffect, useState } from 'react'

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored !== null) {
        return JSON.parse(stored)
      }
      return typeof initialValue === 'function' ? initialValue() : initialValue
    } catch (error) {
      console.error('useLocalStorage parse error', error)
      return typeof initialValue === 'function' ? initialValue() : initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('useLocalStorage save error', error)
    }
  }, [key, value])

  return [value, setValue]
}
