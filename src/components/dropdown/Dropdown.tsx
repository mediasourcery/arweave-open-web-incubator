import * as React from 'react';
import styles from './Dropdown.scss';


interface IProps {
  options: string[];
  name: string;
  className?: string;
  onChange?: (e) => void;
}

export const Dropdown = React.forwardRef<HTMLSelectElement, IProps>(
  (props, forwardedRef) => {
    const { name, options, className, onChange } = props;

    return (
      <select
        className={className ? className : styles.input}
        name={name}
        ref={forwardedRef}
        onChange={onChange}
        {...props}
      >
        {options.map(value => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    )
  }
);