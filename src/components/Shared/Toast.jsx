import { useContext, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { CheckCircle2, Info, X } from 'lucide-react'

const ToastCenter = () => {
  const { toasts, removeToast } = useContext(AppContext)

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        removeToast(toast.id)
      }, 3500),
    )

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [toasts, removeToast])

  if (!toasts.length) {
    return null
  }

  return (
    <div className="toast-wrapper">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card ${toast.type || 'success'}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
          </div>
          <div className="toast-body">
            <strong>{toast.type === 'success' ? 'Success' : toast.type === 'danger' ? 'Attention' : 'Notice'}</strong>
            <p>{toast.message}</p>
          </div>
          <button className="toast-close" type="button" onClick={() => removeToast(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastCenter
