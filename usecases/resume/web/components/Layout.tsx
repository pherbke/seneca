import React, { FC, PropsWithChildren } from 'react';
import BurgerMenu from './BurgerMenu';
import styles from '../styles/Layout.module.css';

const Layout: FC<PropsWithChildren> = ({ children }) => {
    return (
        <div className={styles.layout}>
            <BurgerMenu />
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
};

export default Layout;