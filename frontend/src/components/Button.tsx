import React from 'react';

type ButtonProps = {
    label: string | JSX.Element; 
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    disabled?: boolean; 
};

export function Button({ label, onClick, disabled }: ButtonProps): JSX.Element {
    return (
        <div>
            <button
                type="button"
                onClick={onClick}
                disabled={disabled} 
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {label}
            </button>
        </div>
    );
}