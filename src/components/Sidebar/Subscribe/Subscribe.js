import React, { useState } from 'react';
import styles from './Subscribe.module.scss';

import addToMailchimp from 'gatsby-plugin-mailchimp'

const SubscribeForm = () => {
    const [email, setEmail] = useState('');
    const [subscribeResponse, setSubscribeResponse] = useState('')
  
    const _handleSubmit = e => {
        e.preventDefault()
        setEmail('')
      addToMailchimp(email) // listFields are optional if you are only capturing the email address.
      .then(data => {
         console.log(data)
          if(data.result === 'error') {
              if(data.msg.includes('already subscribed')) {
                setSubscribeResponse(`Yay! you are already subscribed`)
              } else {
                setSubscribeResponse('Avocados went bad! Sorry try again..')
              }
          }
          else { 
            setSubscribeResponse('You are all done! Look out for the next post')
          }
        // I recommend setting data to React state
        // but you can do whatever you want (including ignoring this `then()` altogether)
      })
      .catch((err) => {
          console.log(err)
          setEmail('')
         
        // unnecessary because Mailchimp only ever
        // returns a 200 status code
        // see below for how to handle errors
      })
    }
  
    const handleEmailChange = (e) => {
      const {name, value} = e.target;
      setEmail(value);
    }
    return(
        <div className={styles['Sidebar-subscribe']}>
            <p> <b>Subscribe to stay updated on latest posts</b></p>
            <input 
                type="text" 
                name="email" 
                className= {styles["Sidebar-subscribe-input"]} 
                onChange={handleEmailChange}
                placeholder="Enter your email"
                value={email}
            />
            <button type="button" disabled={!email} onClick={_handleSubmit}> Subscribe!</button>
            {subscribeResponse && <p className="Sidebar-subscribe-response">{subscribeResponse}</p>}
        </div>
      )
  }

  export default SubscribeForm;