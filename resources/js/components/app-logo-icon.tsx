import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="4" r="2.5" />
            <path d="M15 8H9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1l-2 8h2l1.5-6h1l1.5 6h2l-2-8h1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1Z" />
        </svg>
    );
}
