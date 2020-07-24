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

export const TextField: React.FC<IProps> = ({
  disabled = false,
  label = '',
  name = '',
  onChange = () => {},
  placeholder = '',
  required = false,
  type = 'text',
  value = ''
}) => (
  <div className={styles.container}>
    <label className={styles.label} htmlFor={name}>
      {label}
    </label>
    <input
      className={styles.input}
      disabled={disabled}
      id={name}
      name={name}
      placeholder={placeholder}
      required={required}
      onChange={onChange}
      type={type}
      value={value}
    />
  </div>
);
