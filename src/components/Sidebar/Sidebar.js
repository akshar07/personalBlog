// @flow strict
import React, { useState } from 'react';
import Author from './Author';
import Contacts from './Contacts';
import Copyright from './Copyright';
import Menu from './Menu';
import SubscribeForm from './Subscribe';
import styles from './Sidebar.module.scss';
import { useSiteMetadata } from '../../hooks';

type Props = {
  isIndex?: boolean,
};

const Sidebar = ({ isIndex }: Props) => {
  const { author, copyright, menu } = useSiteMetadata();

  return (
    <div className={styles['sidebar']}>
      <div className={styles['sidebar__inner']}>
        <Author author={author} isIndex={isIndex} />
        <Menu menu={menu} />
        <Contacts contacts={author.contacts} />
        <Copyright copyright={copyright} />
       <SubscribeForm />
      </div>
    </div>
  );
};

export default Sidebar;
