import React, { useState, useEffect } from 'react';
import { slide as Menu } from 'react-burger-menu';
import styles from '../styles/BurgerMenu.module.css';

const BurgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleStateChange = (state: { isOpen: boolean }) => {
        setIsOpen(state.isOpen);
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        setIsOpen(false); // Close the menu on initial load
    }, []);

    return (
        <>
            <button className={styles.burgerButton} onClick={toggleMenu}>
                &#9776; {/* Unicode character for burger icon */}
            </button>
            <Menu isOpen={isOpen} onStateChange={handleStateChange} styles={{ bmMenuWrap: { left: '0px' } }}>
                <a id="home" className={styles.menuItem} href="/" onClick={toggleMenu}>Home</a>
                <a id="about" className={styles.menuItem} href="/about" onClick={toggleMenu}>About</a>
                <a id="contact" className={styles.menuItem} href="/contact" onClick={toggleMenu}>Contact</a>
                <a id="settings" className={styles.menuItem} href="/settings" onClick={toggleMenu}>Settings</a>
            </Menu>
        </>
    );
};

export default BurgerMenu