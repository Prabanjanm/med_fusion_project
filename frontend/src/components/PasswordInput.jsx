import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/PasswordInput.css';

/**
 * Reusable Password Input Component with Eye Toggle
 * @param {Object} props - Component props
 * @param {string} props.value - Password value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Required field
 * @param {string} props.name - Input name
 * @param {string} props.id - Input ID
 * @param {string} props.className - Additional CSS classes
 */
const PasswordInput = ({
    value,
    onChange,
    placeholder = "Password",
    required = false,
    name = "password",
    id,
    className = "",
    ...rest
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="password-input-wrapper">
            <input
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                name={name}
                id={id || name}
                className={`password-input ${className}`}
                {...rest}
            />
            <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
            >
                {showPassword ? (
                    <EyeOff size={18} className="eye-icon" />
                ) : (
                    <Eye size={18} className="eye-icon" />
                )}
            </button>
        </div>
    );
};

export default PasswordInput;
