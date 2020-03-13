// @flow strict
import React from 'react';
import styles from './Content.module.scss';
import {
    FacebookShareButton,
    TwitterShareButton,
    LinkedinShareButton,
    WhatsappShareButton,
    FacebookIcon,
    TwitterIcon,
    LinkedinIcon,
    WhatsappIcon,
} from 'react-share';

type Props = {
  body: string,
  title: string,
  url: string
};

const Content = ({ body, title, url }: Props) => (
  <div className={styles['content']}>
    <h1 className={styles['content__title']}>{title}</h1>
    <div className={styles['content__body']} dangerouslySetInnerHTML={{ __html: body }} />
    <div className={styles['content__body']}>
        <div className={styles['Content-share']}></div>
        <p>
            <TwitterShareButton
            url={url}
            title={title}
            className={styles['Content-share-button']}
            >
                <TwitterIcon size={28} round />
            </TwitterShareButton>
            <FacebookShareButton
                url={url}
                quote={title}
                className={styles['Content-share-button']}
            >
                <FacebookIcon size={28} round />
            </FacebookShareButton>
            <LinkedinShareButton 
                url={url} 
                className={styles['Content-share-button']}
            >
                <LinkedinIcon size={28} round />
            </LinkedinShareButton>
            <WhatsappShareButton
                url={url}
                title={title}
                separator=":: "
                className={styles['Content-share-button']}
            >
                <WhatsappIcon size={28} round />
            </WhatsappShareButton>
       </p>
    </div>
  </div>
);

export default Content;
