// web/components/Footer.tsx
import React from 'react';
import styles from '../styles/Footer.module.css';

const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <p>&copy; {new Date().getFullYear()} My Next.js Website. All rights reserved.</p>
        </footer>
    );
};

export default Footer;