'use client'

import { useEffect } from 'react'
import ReactDOM from 'react-dom'
import styles from './modal.module.css'

type ModalProps = {
  state: [boolean, (v: boolean) => void]
  title?: string
  children: React.ReactNode
}

export default function Modal({ state, title, children }: ModalProps) {
  const [isOpen, setIsOpen] = state

  useEffect(() => {
    document.body.style.overflow = isOpen? 'hidden': 'auto'

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if(!isOpen) {return null}

  return ReactDOM.createPortal(
    <div className={styles.modal} onClick={() => setIsOpen(false)}>
      <div className={styles.main} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>
          {title}
        </div>
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
    , document.body
  )
}
