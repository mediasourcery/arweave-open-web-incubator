import * as React from 'react';
import styles from './TextField.scss';


interface IProps {
  disabled?: boolean;
  label?: string;
  name: string;
  onChange?(event: React.FormEvent<HTMLInputElement>): void;
  options?: IOption[];
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'date' | 'password';
  value?: string;
}

interface IOption {
  text: string;
  value: string;
}

export const TextField = React.forwardRef<HTMLInputElement, IProps>(
  (props, forwardedRef) => {
    const { name, label } = props;

    return (
      <div className={styles.container}>
        <label className={styles.label} htmlFor={name}>
          {label}
        </label>
        <input className={styles.input} name={name} ref={forwardedRef} {...props} />
      </div>
    )
  }
);
