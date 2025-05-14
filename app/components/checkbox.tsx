'use client'

import styles from './checkbox.module.css'

type CheckboxProps = {
  checked: boolean,
  onClick: React.MouseEventHandler<HTMLDivElement>
  className?: string
}

export default function Checkbox(
  {checked, onClick, className}: CheckboxProps
) {

  return (
    <div className={`${styles.checkbox} ${className}`} onClick={onClick}>
      <input type='checkbox' checked={checked} hidden/>
      <span className={styles.checkmark}/>
    </div>
  )
}
